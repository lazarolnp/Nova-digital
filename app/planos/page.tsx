import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { getUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { getSetting, limit, planOf } from "@/lib/access";
import { joinWaitlistAction } from "@/app/actions/account";
import { AI_ENABLED } from "@/lib/features";
import { PublicFooter, PublicNav } from "@/components/PublicNav";

export const metadata: Metadata = { title: "Planos" };
export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await getUser();
  const plan = user ? await planOf(user) : null;
  const priceLabel = await getSetting("billing.premium_price_label");
  const checkoutUrl = await getSetting("billing.checkout_url");
  const onWaitlist = user ? Boolean(await get("SELECT 1 FROM waitlist WHERE user_id = ?", user.id)) : false;
  const free = [
    "Curso completo de Fundamentos do Marketing Digital",
    "Aulas introdutórias de todas as trilhas",
    "Missões iniciais com checklist e registro",
    "Biblioteca com ferramentas básicas",
    "Plano de 30 dias personalizado",
    ...(AI_ENABLED ? [`Assistente de IA: até ${await limit("free", "ai_messages_per_day")} interações por dia`] : ["Guia em PDF: como funciona o marketing digital"]),
    `Até ${await limit("free", "max_projects")} projetos no portfólio`,
  ];
  const premium = [
    "Catálogo completo de cursos e trilhas avançadas",
    "Todas as missões e projetos práticos",
    "Modelos profissionais e ferramentas adicionais",
    ...(AI_ENABLED ? [`Assistente de IA ampliado: até ${await limit("premium", "ai_messages_per_day")} interações por dia`] : ["Guias em PDF de todas as trilhas"]),
    `Até ${await limit("premium", "max_projects")} projetos no portfólio`,
    "Plano de 30 dias com todo o conteúdo premium incluído",
  ];

  let premiumCta: React.ReactNode;
  if (plan === "premium") premiumCta = <span className="badge badge-accent">Seu plano atual</span>;
  else if (checkoutUrl)
    premiumCta = (
      <a href={checkoutUrl} className="btn btn-primary btn-block" rel="noopener noreferrer">
        Assinar o Premium
      </a>
    );
  else if (!user)
    premiumCta = (
      <Link href="/cadastro" className="btn btn-primary btn-block">
        Criar conta e ser avisado
      </Link>
    );
  else if (onWaitlist) premiumCta = <span className="badge badge-success">Você será avisado quando as assinaturas abrirem</span>;
  else
    premiumCta = (
      <form action={joinWaitlistAction}>
        <button type="submit" className="btn btn-primary btn-block">
          Quero ser avisado
        </button>
      </form>
    );

  return (
    <>
      <PublicNav />
      <main className="section">
        <div style={{ textAlign: "center" }}>
          <h1 className="section-title">Planos</h1>
          <p className="section-lead" style={{ marginInline: "auto" }}>
            Comece gratuitamente. Quando quiser ir além, o Premium libera o catálogo completo e recursos ampliados.
          </p>
        </div>
        <div className="grid grid-2" style={{ marginTop: 32, maxWidth: 900, marginInline: "auto" }}>
          <div className="card stack">
            <h2 style={{ fontSize: 20 }}>Gratuito</h2>
            <div className="stat">R$ 0</div>
            <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {free.map((f) => (
                <li key={f} className="row small" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                  <Check size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "auto" }}>
              {plan === "free" ? (
                <span className="badge">Seu plano atual</span>
              ) : !user ? (
                <Link href="/cadastro" className="btn btn-block">
                  Criar conta gratuita
                </Link>
              ) : null}
            </div>
          </div>
          <div className="card stack" style={{ borderColor: "var(--accent)", boxShadow: "0 0 30px var(--glow)" }}>
            <h2 style={{ fontSize: 20 }} className="row">
              <Crown size={18} color="var(--accent-text)" /> Premium
            </h2>
            <div className="stat" style={{ fontSize: priceLabel ? 30 : 20 }}>
              {priceLabel || "Preço em definição"}
            </div>
            <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {premium.map((f) => (
                <li key={f} className="row small" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                  <Check size={16} color="var(--accent-text)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "auto" }}>{premiumCta}</div>
          </div>
        </div>
        <p className="small faint" style={{ textAlign: "center", marginTop: 24 }}>
          Nenhum plano garante renda ou clientes. O Premium amplia o conteúdo e as ferramentas de prática.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}
