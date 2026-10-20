import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Gauge, Lock, Sparkles, Wrench } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { getMission } from "@/lib/content";
import { canAccessPremium, planOf } from "@/lib/access";
import { aiConfigured } from "@/lib/ai";
import { MissionWorkspace } from "@/components/MissionWorkspace";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const user = await requireOnboardedUser();
  return { title: (await getMission((await params).slug, user.id))?.mission.title ?? "Missão" };
}

export default async function MissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireOnboardedUser();
  const data = await getMission(slug, user.id);
  if (!data) notFound();
  const { mission, progress } = data;
  const allowed = canAccessPremium(await planOf(user), mission.is_premium);
  const minutes = mission.est_minutes >= 60 ? `${Math.round((mission.est_minutes / 60) * 10) / 10} horas` : `${mission.est_minutes} minutos`;

  return (
    <>
      <div className="stack" style={{ gap: 6 }}>
        <Link href="/missoes" className="small muted">
          ← Central de Missões
        </Link>
        <span className="label">{mission.trail_title}</span>
        <h1 className="page-title">{mission.title}</h1>
        <div className="row small muted">
          <span className="row" style={{ gap: 5 }}>
            <Clock size={14} /> {minutes}
          </span>
          <span className="row" style={{ gap: 5 }}>
            <Gauge size={14} /> {mission.difficulty}
          </span>
          <span className="row" style={{ gap: 5 }}>
            <Sparkles size={14} /> +{mission.xp} XP
          </span>
        </div>
      </div>
      <div className="grid grid-3" style={{ alignItems: "start" }}>
        <div className="stack-lg">
          <div className="card">
            <h2 className="card-title">Objetivo</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              {mission.objective}
            </p>
          </div>
          <div className="card">
            <h2 className="card-title">Passo a passo</h2>
            <ol className="small" style={{ paddingLeft: 20, margin: "10px 0 0", lineHeight: 1.7 }}>
              {mission.stepList.map((s) => (
                <li key={s} style={{ margin: "4px 0" }}>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="card">
            <h2 className="card-title">Ferramentas recomendadas</h2>
            <div className="row" style={{ marginTop: 10 }}>
              {mission.toolList.map((t) => (
                <span key={t} className="badge">
                  <Wrench size={11} /> {t}
                </span>
              ))}
            </div>
            <Link href="/ferramentas" className="small" style={{ display: "inline-block", marginTop: 12, color: "var(--accent-text)" }}>
              Abrir biblioteca de ferramentas →
            </Link>
          </div>
        </div>
        <div className="span-2">
          {allowed ? (
            <MissionWorkspace
              missionId={mission.id}
              checklist={mission.checklistItems}
              criteria={mission.criteriaList}
              xp={mission.xp}
              aiEnabled={aiConfigured()}
              progress={
                progress
                  ? {
                      status: progress.status,
                      checks: progress.checks,
                      review: progress.review,
                      result_text: progress.result_text,
                      result_url: progress.result_url,
                      ai_feedback: progress.ai_feedback,
                    }
                  : null
              }
            />
          ) : (
            <div className="card empty">
              <Lock size={28} />
              <h2 className="card-title">Missão do plano Premium</h2>
              <p className="muted">Você pode ver o objetivo e os passos. Para registrar e concluir esta missão, conheça o Premium.</p>
              <Link href="/planos" className="btn btn-primary">
                Conhecer o Premium
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
