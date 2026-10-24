import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { productMappings } from "@/lib/payments";
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
  const subs = await all<{ email: string; status: string; access_until: string | null; updated_at: string }>(
    "SELECT email, status, access_until, updated_at FROM external_subscriptions ORDER BY updated_at DESC LIMIT 50",
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
        <h2 className="card-title">2. Produtos que liberam o Premium</h2>
        <p className="small muted">
          {mappings.length === 0
            ? "Nenhum produto cadastrado: qualquer compra aprovada da sua conta Kiwify libera o Premium. Cadastre IDs se você vende outros produtos que não devem liberar acesso."
            : "Somente compras destes produtos ou planos liberam o Premium. O ID aparece na Kiwify e também no registro de eventos abaixo."}
        </p>
        {mappings.map((m) => (
          <div key={m.ref} className="list-item">
            <span style={{ flex: 1 }}>
              <strong>{m.label}</strong> <span className="tiny faint">{m.ref}</span>
            </span>
            <span className="badge badge-accent">Premium</span>
            <form action={removeProductMappingAction.bind(null, m.ref)}>
              <button type="submit" className="btn btn-sm btn-danger">
                Remover
              </button>
            </form>
          </div>
        ))}
        <form action={addProductMappingAction} className="row">
          <input name="ref" className="input" placeholder="ID do produto ou plano na Kiwify" aria-label="ID do produto" style={{ flex: "1 1 220px" }} required />
          <input name="label" className="input" placeholder="Nome (ex.: Plano Completo mensal)" aria-label="Nome do produto" style={{ flex: "1 1 220px" }} />
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
                  <th>Status</th>
                  <th>Acesso até</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.email + s.updated_at}>
                    <td className="wrap-anywhere">{s.email}</td>
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
