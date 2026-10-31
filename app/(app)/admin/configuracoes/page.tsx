import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { allSettings } from "@/lib/access";
import { saveSettingsAction } from "@/app/actions/admin";
import { planOffers } from "@/lib/pricing";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Planos e limites" };

export default async function AdminSettings({ searchParams }: { searchParams: Flash }) {
  await requireAdmin();
  const flash = await searchParams;
  const s = await allSettings();
  const offers = await planOffers();
  const num = (key: string, label: string) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <input id={key} name={key} type="number" min={0} max={99999} className="input" defaultValue={s[key]} required />
    </div>
  );
  return (
    <>
      <AdminHeader title="Planos e limites" active="/admin/configuracoes" {...flash} />
      <form action={saveSettingsAction} className="stack-lg">
        <div className="grid grid-2">
          <div className="card stack">
            <h2 className="card-title">Plano gratuito</h2>
            {num("limit.free.ai_messages_per_day", "Interações com a IA por dia")}
            {num("limit.free.max_projects", "Máximo de projetos")}
          </div>
          <div className="card stack">
            <h2 className="card-title">Planos pagos (qualquer plano)</h2>
            {num("limit.premium.ai_messages_per_day", "Interações com a IA por dia")}
            {num("limit.premium.max_projects", "Máximo de projetos")}
          </div>
        </div>
        <div className="card stack">
          <h2 className="card-title">Preços e links de pagamento dos planos</h2>
          <p className="small muted">
            Use ponto ou vírgula nos centavos (ex.: 47 ou 47,90). Cole o link de checkout de cada oferta da Kiwify. Enquanto um link estiver vazio, a página
            de Planos mostra &quot;Quero ser avisado&quot; para aquela opção.
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Plano</th>
                  <th>Mensal (R$)</th>
                  <th>Link mensal</th>
                  <th>Anual (R$)</th>
                  <th>Link anual</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      <input name={`plan.${p.id}.price_monthly`} className="input" defaultValue={String(p.monthly)} aria-label={`Preço mensal ${p.name}`} style={{ width: 90 }} />
                    </td>
                    <td>
                      <input name={`plan.${p.id}.checkout_monthly`} className="input" defaultValue={p.checkoutMonthly} placeholder="https://pay.kiwify.com.br/..." aria-label={`Link mensal ${p.name}`} style={{ minWidth: 220 }} />
                    </td>
                    <td>
                      <input name={`plan.${p.id}.price_annual`} className="input" defaultValue={String(p.annual)} aria-label={`Preço anual ${p.name}`} style={{ width: 90 }} />
                    </td>
                    <td>
                      <input name={`plan.${p.id}.checkout_annual`} className="input" defaultValue={p.checkoutAnnual} placeholder="https://pay.kiwify.com.br/..." aria-label={`Link anual ${p.name}`} style={{ minWidth: 220 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          Salvar configurações
        </button>
      </form>
    </>
  );
}
