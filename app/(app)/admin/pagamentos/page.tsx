import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { productMappings } from "@/lib/payments";
import { PAID_PLANS, paidPlan } from "@/lib/plans";
import { addProductMappingAction, removeProductMappingAction } from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Pagamentos" };

function when(ts: string) {
  return new Date(ts.replace(" ", "T") + "Z").toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminPayments({ searchParams }: { searchParams: Flash }) {
  await requireAdmin();
  const flash = await searchParams;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "seu-site.vercel.app";
  const base = process.env.APP_URL?.replace(/\/$/, "") || `https://${host}`;
  const webhookUrl = `${base}/api/pagamentos/kiwify`;
  const tokenOk = Boolean(process.env.KIWIFY_WEBHOOK_TOKEN);
  const mappings = await productMappings();
  const events = await all<{ id: number; event_type: string; email: string; product_ref: string; result: string; raw: string; created_at: string }>(
    "SELECT id, event_type, email, product_ref, result, raw, created_at FROM payment_events ORDER BY id DESC LIMIT 50",
  );
  const subs = await all<{ email: string; plan: string; status: string; access_until: string | null; updated_at: string }>(
    "SELECT email, plan, status, access_until, updated_at FROM external_subscriptions ORDER BY updated_at DESC LIMIT 50",
  );

  return (
    <>
      <AdminHeader title="Pagamentos (Kiwify)" active="/admin/pagamentos" {...flash} />

      <section className="card stack">
        <h2 className="card-title">1. Conectar a Kiwify</h2>
        <ol className="small" style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
          <li>Na Kiwify, abra <strong>Apps → Webhooks → Criar webhook</strong>.</li>
          <li>
            Em URL, cole: <code className="wrap-anywhere" style={{ color: "var(--accent-text)" }}>{webhookUrl}</code>
          </li>
          <li>Selecione o(s) produto(s) e marque os eventos: compra aprovada, compra reembolsada, chargeback, assinatura cancelada, assinatura atrasada e assinatura renovada.</li>
          <li>
            Copie o <strong>token</strong> do webhook e cadastre na Vercel como variável <code>KIWIFY_WEBHOOK_TOKEN</code> (ambiente Production). Depois faça Redeploy.
          </li>
          <li>Use o botão <strong>Testar webhook</strong> da Kiwify. O evento deve aparecer no registro abaixo.</li>
        </ol>
        <div className={`alert ${tokenOk ? "alert-success" : "alert-warning"}`}>
          {tokenOk ? "Token configurado: o site está pronto para receber os avisos da Kiwify." : "KIWIFY_WEBHOOK_TOKEN ainda não configurado: os avisos da Kiwify serão recusados."}
        </div>
      </section>

      <section className="card stack">
        <h2 className="card-title">2. Qual plano cada produto libera</h2>
        <p className="small muted">
          Cadastre o ID de cada produto da Kiwify e escolha o plano que ele libera. Compras de produtos não cadastrados não liberam acesso e geram um aviso
          para os administradores. O ID aparece na Kiwify e também no registro de eventos abaixo (use o botão Testar webhook).
        </p>
        {mappings.map((m) => (
          <div key={m.ref} className="list-item">
            <span style={{ flex: 1 }}>
              <strong>{m.label}</strong> <span className="tiny faint">{m.ref}</span>
            </span>
            <span className="badge badge-accent">{paidPlan(m.plan)?.name ?? m.plan}</span>
            <form action={removeProductMappingAction.bind(null, m.ref)}>
              <button type="submit" className="btn btn-sm btn-danger">
                Remover
              </button>
            </form>
          </div>
        ))}
        <form action={addProductMappingAction} className="row">
          <input name="ref" className="input" placeholder="ID do produto ou plano na Kiwify" aria-label="ID do produto" style={{ flex: "1 1 220px" }} required />
          <input name="label" className="input" placeholder="Nome (ex.: NovaDigital Afiliados)" aria-label="Nome do produto" style={{ flex: "1 1 200px" }} />
          <select name="plan" className="select" aria-label="Plano liberado" style={{ flex: "0 1 200px" }} defaultValue="">
            <option value="" disabled>
              Plano que libera
            </option>
            {PAID_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn">
            Adicionar
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Acessos liberados pela Kiwify</h2>
        {subs.length === 0 ? (
          <p className="small muted" style={{ marginTop: 8 }}>
            Nenhum ainda.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Acesso até</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.email + s.updated_at}>
                    <td className="wrap-anywhere">{s.email}</td>
                    <td className="small">{paidPlan(s.plan)?.name ?? s.plan}</td>
                    <td>
                      <span className={`badge ${s.status === "active" ? "badge-success" : s.status === "canceled" ? "badge-warning" : "badge-danger"}`}>
                        {s.status === "active" ? "Ativa" : s.status === "canceled" ? "Cancelada" : "Removida"}
                      </span>
                    </td>
                    <td className="small">{s.access_until ? new Date(s.access_until).toLocaleDateString("pt-BR") : "Sem data de fim"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="card-title">Registro de eventos recebidos</h2>
        {events.length === 0 ? (
          <p className="small muted" style={{ marginTop: 8 }}>
            Nenhum aviso recebido ainda.
          </p>
        ) : (
          <div className="list">
            {events.map((e) => (
              <details key={e.id} className="list-item" style={{ display: "block" }}>
                <summary style={{ cursor: "pointer" }}>
                  <span className="small" style={{ fontWeight: 650 }}>
                    {e.event_type || "sem tipo"}
                  </span>{" "}
                  <span className="small muted">· {e.email || "sem e-mail"} · {when(e.created_at)}</span>
                  <div className="small">{e.result}</div>
                </summary>
                <pre className="tiny wrap-anywhere" style={{ whiteSpace: "pre-wrap", background: "var(--surface-strong)", padding: 10, borderRadius: 10, marginTop: 8 }}>
                  {e.product_ref ? `IDs de produto/plano: ${e.product_ref}\n\n` : ""}
                  {JSON.stringify(JSON.parse(e.raw || "{}"), null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
