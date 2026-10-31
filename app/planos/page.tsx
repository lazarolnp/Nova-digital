import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { getUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { accessOf, limit } from "@/lib/access";
import { planOffers } from "@/lib/pricing";
import { SEED_TRAILS } from "@/lib/seed";
import { joinWaitlistAction } from "@/app/actions/account";
import { PublicFooter, PublicNav } from "@/components/PublicNav";
import { PlanCards, type OfferView } from "@/components/PlanCards";

export const metadata: Metadata = { title: "Planos" };
export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await getUser().catch(() => null);
  const access = user ? await accessOf(user) : null;
  const onWaitlist = user ? Boolean(await get("SELECT 1 FROM waitlist WHERE user_id = ?", user.id)) : false;
  const trailName = (slug: string) => SEED_TRAILS.find((t) => t.slug === slug)?.title ?? slug;
  const offers: OfferView[] = (await planOffers()).map((o) => ({
    id: o.id,
    name: o.name,
    description: o.description,
    trailNames: o.trails.map(trailName),
    monthly: o.monthly,
    annual: o.annual,
    checkoutMonthly: o.checkoutMonthly,
    checkoutAnnual: o.checkoutAnnual,
  }));
  const free = [
    "Guia em PDF: como funciona o marketing digital",
    "Curso completo de Fundamentos do Marketing Digital",
    "Aulas introdutórias de todas as trilhas",
    "Missões iniciais e ferramentas básicas",
    "Plano de 30 dias personalizado",
    `Até ${await limit("free", "max_projects")} projetos no portfólio`,
  ];

  return (
    <>
      <PublicNav />
      <main className="section stack-lg">
        <div style={{ textAlign: "center" }}>
          <h1 className="section-title">Planos</h1>
          <p className="section-lead" style={{ marginInline: "auto" }}>
            Escolha a trilha do caminho que você quer seguir ou o Completo para ter tudo. Você pode assinar mais de um plano e cancelar quando quiser.
          </p>
        </div>

        <PlanCards
          offers={offers}
          activeIds={access?.plans.map((p) => p.id) ?? []}
          loggedIn={Boolean(user)}
          onWaitlist={onWaitlist}
          waitlistAction={joinWaitlistAction}
        />

        <div className="card stack">
          <div className="row between">
            <h2 style={{ fontSize: 18 }}>Gratuito</h2>
            {user && access && !access.plans.length ? <span className="badge">Seu plano atual</span> : null}
          </div>
          <div className="grid grid-3" style={{ gap: 8 }}>
            {free.map((f) => (
              <div key={f} className="row small" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                <Check size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 3 }} /> {f}
              </div>
            ))}
          </div>
          {!user ? (
            <Link href="/cadastro" className="btn" style={{ alignSelf: "flex-start" }}>
              Criar conta gratuita
            </Link>
          ) : null}
        </div>

        <p className="small faint" style={{ textAlign: "center" }}>
          Nenhum plano garante renda ou clientes. Os planos liberam conteúdo, missões e materiais de prática. Pagamento processado pela Kiwify.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}
