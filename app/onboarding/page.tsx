import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { OnboardingForm } from "@/components/OnboardingForm";
import type { OnboardingKey } from "@/lib/options";

export const metadata: Metadata = { title: "Seu plano personalizado" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const current = await get<Record<OnboardingKey, string>>("SELECT level, area, hours, budget, goal, preference FROM onboarding WHERE user_id = ?", user.id);
  return (
    <main className="auth-wrap">
      <div className="auth-card fade-in" style={{ maxWidth: 680 }}>
        <div className="row between" style={{ paddingBottom: 18 }}>
          <span className="brand" style={{ padding: 0 }}>
            <span className="brand-mark">N</span> NovaDigital
          </span>
          {user.onboarded ? (
            <Link href="/painel" className="btn btn-sm">
              Voltar ao painel
            </Link>
          ) : null}
        </div>
        <div className="card stack-lg">
          <div>
            <h1 style={{ fontSize: 24 }}>{user.onboarded ? "Refazer meu plano" : `Olá, ${user.name.split(" ")[0]}! Vamos montar seu plano`}</h1>
            <p className="muted" style={{ marginTop: 6 }}>
              Seis perguntas rápidas. Com elas, organizamos 30 dias de estudo e prática adequados ao seu tempo, orçamento e objetivo.
              {user.onboarded ? " Refazer o plano substitui o atual; aulas e missões já concluídas continuam marcadas." : ""}
            </p>
          </div>
          <OnboardingForm initial={current} />
        </div>
      </div>
    </main>
  );
}
