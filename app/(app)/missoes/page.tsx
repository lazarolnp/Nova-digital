import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Lock, Target, Trophy } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { listMissions } from "@/lib/content";
import { planOf } from "@/lib/access";
import { levelFor, totalXp } from "@/lib/progress";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/Progress";

export const metadata: Metadata = { title: "Central de Missões" };

function duration(min: number) {
  return min >= 60 ? `${Math.round((min / 60) * 10) / 10}h` : `${min} min`;
}

export default async function MissionsPage({ searchParams }: { searchParams: Promise<{ trilha?: string; status?: string }> }) {
  const user = await requireOnboardedUser();
  const plan = await planOf(user);
  const { trilha, status } = await searchParams;
  const missions = await listMissions(user.id);
  const trails = await all<{ slug: string; title: string }>("SELECT slug, title FROM trails ORDER BY sort");
  const filtered = missions.filter(
    (m) =>
      (!trilha || m.trail_slug === trilha) &&
      (!status || (status === "concluidas" ? m.status === "concluida" : status === "andamento" ? m.status === "em_andamento" : !m.status)),
  );
  const done = missions.filter((m) => m.status === "concluida").length;
  const xp = await totalXp(user.id);
  const level = levelFor(xp);
  const qs = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { trilha, status, ...params };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/missoes?${s}` : "/missoes";
  };

  return (
    <>
      <PageHeader title="Central de Missões" subtitle="Transforme o que aprendeu em entregas reais. Cada missão tem passo a passo, checklist e critérios de avaliação." />
      <div className="grid grid-3">
        <div className="card">
          <div className="label">Missões concluídas</div>
          <div className="stat">
            {done}
            <span className="muted" style={{ fontSize: 16 }}> / {missions.length}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <Progress value={(done / Math.max(1, missions.length)) * 100} small label="Missões concluídas" />
          </div>
        </div>
        <div className="card">
          <div className="label">Seu nível</div>
          <div className="stat">{level.name}</div>
          <p className="tiny faint" style={{ marginTop: 6 }}>
            {xp} XP{level.nextAt ? ` · faltam ${level.nextAt - xp} XP para ${level.next}` : ""}
          </p>
        </div>
        <div className="card">
          <div className="label">Como funciona</div>
          <p className="small muted" style={{ marginTop: 8 }}>
            Inicie a missão, siga os passos, marque o checklist e registre o resultado. Use os critérios para se autoavaliar e, se quiser,
            peça feedback ao assistente.
          </p>
        </div>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        <div className="row" aria-label="Filtrar por trilha">
          <Link href={qs({ trilha: undefined })} className={`chip${!trilha ? " active" : ""}`}>
            Todas as trilhas
          </Link>
          {trails.map((t) => (
            <Link key={t.slug} href={qs({ trilha: t.slug })} className={`chip${trilha === t.slug ? " active" : ""}`}>
              {t.title}
            </Link>
          ))}
        </div>
        <div className="row" aria-label="Filtrar por status">
          {[
            { k: undefined, l: "Qualquer status" },
            { k: "novas", l: "Não iniciadas" },
            { k: "andamento", l: "Em andamento" },
            { k: "concluidas", l: "Concluídas" },
          ].map((f) => (
            <Link key={f.l} href={qs({ status: f.k })} className={`chip${status === f.k ? " active" : ""}`}>
              {f.l}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty">Nenhuma missão com esses filtros.</div>
      ) : (
        <div className="grid grid-auto">
          {filtered.map((m) => {
            const locked = m.is_premium && plan === "free";
            return (
              <Link key={m.id} href={`/missoes/${m.slug}`} className="card card-hover stack">
                <div className="row between">
                  <span className="label">{m.trail_title}</span>
                  {m.status === "concluida" ? (
                    <span className="badge badge-success">
                      <Trophy size={11} /> Concluída
                    </span>
                  ) : m.status === "em_andamento" ? (
                    <span className="badge badge-info">Em andamento</span>
                  ) : locked ? (
                    <span className="badge badge-warning">
                      <Lock size={11} /> Premium
                    </span>
                  ) : null}
                </div>
                <div className="row" style={{ gap: 10, flexWrap: "nowrap", alignItems: "flex-start" }}>
                  <div className="icon-box">
                    <Target size={17} />
                  </div>
                  <h2 style={{ fontSize: 16.5 }}>{m.title}</h2>
                </div>
                <p className="small muted" style={{ flex: 1 }}>
                  {m.objective}
                </p>
                <div className="row small faint">
                  <Clock size={14} /> {duration(m.est_minutes)} · {m.difficulty} · +{m.xp} XP
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
