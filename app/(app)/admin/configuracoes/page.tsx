import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { allSettings } from "@/lib/access";
import { saveSettingsAction } from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Planos e limites" };

export default async function AdminSettings({ searchParams }: { searchParams: Flash }) {
  await requireAdmin();
  const flash = await searchParams;
  const s = allSettings();
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
            <h2 className="card-title">Plano Premium</h2>
            {num("limit.premium.ai_messages_per_day", "Interações com a IA por dia")}
            {num("limit.premium.max_projects", "Máximo de projetos")}
          </div>
        </div>
        <div className="card stack">
          <h2 className="card-title">Assinatura</h2>
          <p className="small muted">
            Enquanto não houver link de checkout, a página de Planos mostra &quot;Quero ser avisado&quot; e registra interessados na lista de espera.
          </p>
          <div className="field">
            <label htmlFor="price">Texto de preço do Premium (ex.: R$ 00/mês) — deixe vazio para mostrar &quot;Preço em definição&quot;</label>
            <input id="price" name="billing.premium_price_label" className="input" defaultValue={s["billing.premium_price_label"]} maxLength={60} />
          </div>
          <div className="field">
            <label htmlFor="checkout">Link de checkout do provedor de pagamento (https://)</label>
            <input id="checkout" name="billing.checkout_url" className="input" defaultValue={s["billing.checkout_url"]} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          Salvar configurações
        </button>
      </form>
    </>
  );
}
