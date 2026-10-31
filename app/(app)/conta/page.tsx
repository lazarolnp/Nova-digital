import type { Metadata } from "next";
import Link from "next/link";
import { Lock, RefreshCw, Trophy } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { accessOf } from "@/lib/access";
import { optionLabel, ONBOARDING_QUESTIONS, type OnboardingKey } from "@/lib/options";
import { levelFor, totalXp, unlockedAchievements } from "@/lib/progress";
import { PageHeader } from "@/components/PageHeader";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/AccountForms";
import { Progress } from "@/components/Progress";

export const metadata: Metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const user = await requireOnboardedUser();
  const access = await accessOf(user);
  const ob = await get<Record<OnboardingKey, string>>("SELECT level, area, hours, budget, goal, preference FROM onboarding WHERE user_id = ?", user.id);
  const xp = await totalXp(user.id);
  const level = levelFor(xp);
  const achievements = await unlockedAchievements(user.id);

  return (
    <>
      <PageHeader title="Minha conta" subtitle="Perfil, preferências do plano, conquistas e segurança." />
      <div className="grid grid-3" style={{ alignItems: "start" }}>
        <div className="span-2 stack-lg">
          <ProfileForm user={{ name: user.name, email: user.email, handle: user.handle ?? "", bio: user.bio, portfolio_public: user.portfolio_public }} />
          <section className="card" id="conquistas" aria-labelledby="conq">
            <div className="card-head">
              <h2 id="conq" className="card-title">
                Conquistas
              </h2>
              <span className="small muted">
                {achievements.filter((a) => a.unlockedAt).length}/{achievements.length}
              </span>
            </div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              {achievements.map((a) => (
                <div key={a.code} className="row" style={{ flexWrap: "nowrap", opacity: a.unlockedAt ? 1 : 0.55 }}>
                  <div className="icon-box" style={a.unlockedAt ? undefined : { background: "var(--surface-strong)", color: "var(--text-faint)" }}>
                    {a.unlockedAt ? <Trophy size={17} /> : <Lock size={15} />}
                  </div>
                  <div>
                    <div className="small" style={{ fontWeight: 700 }}>
                      {a.title}
                    </div>
                    <div className="tiny faint">{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="card" aria-labelledby="pref">
            <div className="card-head">
              <h2 id="pref" className="card-title">
                Preferências do plano de 30 dias
              </h2>
              <Link href="/onboarding" className="btn btn-sm">
                <RefreshCw size={14} /> Refazer plano
              </Link>
            </div>
            {ob ? (
              <div className="grid grid-2" style={{ gap: 12 }}>
                {(Object.keys(ONBOARDING_QUESTIONS) as OnboardingKey[]).map((k) => (
                  <div key={k}>
                    <div className="tiny faint">{ONBOARDING_QUESTIONS[k].label}</div>
                    <div className="small" style={{ fontWeight: 650 }}>
                      {optionLabel(k, ob[k])}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
        <aside className="stack-lg">
          <div className="card stack">
            <div className="label">Nível {level.level}</div>
            <div className="stat" style={{ fontSize: 24 }}>
              {level.name}
            </div>
            <Progress value={level.pct} small label="Progresso até o próximo nível" />
            <span className="tiny faint">{xp} XP</span>
          </div>
          <div className="card stack">
            <div className="label">Seus planos</div>
            {user.role === "admin" ? <span className="badge badge-info">Administrador: acesso a todas as trilhas</span> : null}
            {access.plans.length ? (
              <div className="list">
                {access.plans.map((p) => (
                  <div key={p.id} className="list-item" style={{ padding: "8px 0" }}>
                    <span className="badge badge-accent">{p.name}</span>
                    <span className="tiny faint" style={{ marginLeft: "auto" }}>
                      {p.until ? `até ${new Date(p.until).toLocaleDateString("pt-BR")}` : "sem data de fim"}
                    </span>
                  </div>
                ))}
              </div>
            ) : user.role !== "admin" ? (
              <span className="badge">Gratuito</span>
            ) : null}
            <Link href="/planos" className="btn btn-sm">
              {access.plans.length ? "Ver ou adicionar planos" : "Conhecer os planos"}
            </Link>
          </div>
          <div className="card stack">
            <h2 className="card-title">Segurança</h2>
            <PasswordForm />
            <DeleteAccountForm />
          </div>
        </aside>
      </div>
    </>
  );
}
