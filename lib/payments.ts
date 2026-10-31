import "server-only";
import crypto from "node:crypto";
import { all, get, parseJson, run } from "./db";
import { paidPlan } from "./plans";
import { getSetting } from "./access";
import { notify } from "./progress";

// Integração com a Kiwify via webhook.
// Docs: https://docs.kiwify.com.br/api-reference/webhooks/receiving.md
//       https://docs.kiwify.com.br/api-reference/webhooks/subscription-events.md

export type ProductMapping = { ref: string; plan: string; label: string };

/** A Kiwify assina o corpo bruto com HMAC-SHA1 (hex) usando o token do webhook e envia em ?signature=. */
export function verifyKiwifySignature(rawBody: string, signature: string | null, token: string) {
  if (!signature || !/^[0-9a-f]{40}$/i.test(signature)) return false;
  const expected = crypto.createHmac("sha1", token).update(rawBody, "utf8").digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature.toLowerCase(), "hex"));
}

export async function productMappings(): Promise<ProductMapping[]> {
  return parseJson<ProductMapping[]>(await getSetting("kiwify.product_map", "[]"), []);
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});
const text = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : "");

function isoOrNull(v: unknown) {
  const s = text(v);
  if (!s) return null;
  // Datas dentro de Subscription vêm em UTC; sem fuso explícito, tratamos como UTC.
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Extrai os dados relevantes do payload, tolerando variações de maiúsculas nos objetos. */
export function parseKiwifyPayload(body: Obj) {
  const customer = obj(body.Customer ?? body.customer);
  const product = obj(body.Product ?? body.product);
  const subscription = obj(body.Subscription ?? body.subscription);
  const plan = obj(subscription.plan);
  const access = obj(subscription.customer_access);
  return {
    event: text(body.webhook_event_type),
    orderStatus: text(body.order_status),
    orderId: text(body.order_id),
    subscriptionId: text(body.subscription_id) || text(subscription.id),
    email: text(customer.email).trim().toLowerCase(),
    name: text(customer.full_name ?? customer.name),
    productRefs: [text(product.product_id), text(product.id), text(plan.id)].filter(Boolean),
    productName: text(product.product_name ?? product.name) || text(plan.name),
    hasAccess: typeof access.has_access === "boolean" ? (access.has_access as boolean) : null,
    accessUntil: isoOrNull(access.access_until) ?? isoOrNull(subscription.next_payment),
  };
}

const GRANT_EVENTS = new Set(["order_approved", "subscription_renewed"]);
const REVOKE_EVENTS = new Set(["order_refunded", "chargeback"]);

/** Aplica um evento da Kiwify e devolve uma descrição do que foi feito (para o registro do admin). */
export async function applyKiwifyEvent(body: Obj): Promise<string> {
  const p = parseKiwifyPayload(body);
  const ref = p.subscriptionId || p.orderId;
  let result: string;

  if (!p.event) result = "Ignorado: evento sem tipo (ex.: carrinho abandonado).";
  else if (!p.email) result = "Ignorado: e-mail do comprador ausente.";
  else if (!ref) result = "Ignorado: pedido sem identificador.";
  else {
    const mappings = await productMappings();
    const match = mappings.find((m) => p.productRefs.includes(m.ref));
    // Cada produto da Kiwify precisa estar vinculado a um plano. Para eventos de uma assinatura já
    // registrada (renovação, cancelamento, reembolso), vale o plano gravado nela.
    const existing = await get<{ plan: string }>("SELECT plan FROM external_subscriptions WHERE provider = 'kiwify' AND ref = ?", ref);
    const plan = match?.plan ?? existing?.plan ?? null;
    const planName = plan ? (paidPlan(plan)?.name ?? plan) : "";

    if (!plan) {
      result = `Ignorado: produto não vinculado a nenhum plano (${p.productRefs.join(", ") || "sem ID"}${p.productName ? ` · ${p.productName}` : ""}).`;
      if (GRANT_EVENTS.has(p.event) && p.orderStatus === "paid") {
        // Avisa os administradores: há um comprador esperando acesso.
        const admins = await all<{ id: number }>("SELECT id FROM users WHERE role = 'admin'");
        for (const a of admins) {
          await notify(a.id, "sistema", "Venda sem plano vinculado", `${p.email} comprou "${p.productName || p.productRefs[0] || "produto"}". Vincule o produto a um plano em Admin → Pagamentos e libere o acesso em Admin → Usuários.`, "/admin/pagamentos");
        }
      }
    } else if (GRANT_EVENTS.has(p.event) && p.orderStatus === "paid") {
      await upsert(ref, p.email, plan, "active", p.accessUntil);
      result = `Acesso liberado: plano ${planName}${p.accessUntil ? ` até ${p.accessUntil.slice(0, 10)}` : ""}.`;
      const user = await get<{ id: number }>("SELECT id FROM users WHERE email = ?", p.email);
      if (user && p.event === "order_approved") {
        await notify(user.id, "sistema", `Plano ${planName} liberado`, "Pagamento confirmado. Refaça seu plano de 30 dias para incluir o novo conteúdo.", "/onboarding");
      }
    } else if (REVOKE_EVENTS.has(p.event)) {
      await upsert(ref, p.email, plan, "revoked", new Date().toISOString());
      result = p.event === "chargeback" ? "Acesso removido (chargeback)." : "Acesso removido (reembolso).";
    } else if (p.event === "subscription_canceled") {
      if (p.hasAccess === false || !p.accessUntil) {
        await upsert(ref, p.email, plan, "revoked", new Date().toISOString());
        result = "Assinatura cancelada: acesso removido.";
      } else {
        await upsert(ref, p.email, plan, "canceled", p.accessUntil);
        result = `Assinatura cancelada: acesso mantido até ${p.accessUntil.slice(0, 10)}.`;
      }
    } else if (p.event === "subscription_late") {
      // A Kiwify mantém o período já pago; atualizamos só a data limite, se vier.
      if (p.accessUntil) {
        await run(
          "UPDATE external_subscriptions SET access_until = ?, updated_at = datetime('now') WHERE provider = 'kiwify' AND ref = ? AND status = 'active'",
          p.accessUntil,
          ref,
        );
      }
      result = "Renovação recusada: acesso mantido até o fim do período pago.";
    } else {
      result = `Registrado sem alteração de acesso (${p.event}).`;
    }
  }

  await run(
    "INSERT INTO payment_events (provider, event_type, email, product_ref, result, raw) VALUES ('kiwify', ?, ?, ?, ?, ?)",
    p.event,
    p.email,
    p.productRefs.join(", "),
    result,
    JSON.stringify(body).slice(0, 20000),
  );
  // Mantém apenas os 300 eventos mais recentes.
  await run("DELETE FROM payment_events WHERE id NOT IN (SELECT id FROM payment_events ORDER BY id DESC LIMIT 300)");
  return result;
}

async function upsert(ref: string, email: string, plan: string, status: string, accessUntil: string | null) {
  await run(
    `INSERT INTO external_subscriptions (provider, ref, email, plan, status, access_until, updated_at)
     VALUES ('kiwify', ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(provider, ref) DO UPDATE SET email = excluded.email, plan = excluded.plan, status = excluded.status,
       access_until = excluded.access_until, updated_at = excluded.updated_at`,
    ref,
    email,
    plan,
    status,
    accessUntil,
  );
}
