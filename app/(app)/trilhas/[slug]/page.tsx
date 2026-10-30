import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, Download, FileText, Lock, Target } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { listMissions, listTrails } from "@/lib/content";
import { planOf } from "@/lib/access";
import { trailAssistant } from "@/lib/seed";
import { Progress } from "@/components/Progress";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: trailAssistant((await params).slug)?.title ?? "Trilha" };
}

export default async function TrailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireOnboardedUser();
  const trail = (await listTrails(user.id)).find((t) => t.slug === slug);
  const seed = trailAssistant(slug);
  if (!trail || !seed) notFound();
  const plan = await planOf(user);
  const missions = (await listMissions(user.id)).filter((m) => m.trail_slug === slug);
  const lessons = trail.courses.reduce((s, c) => s + c.lessons, 0);
  const done = trail.courses.reduce((s, c) => s + c.done, 0);
  const guideOpen = plan === "premium";

  return (
    <>
      <div className="stack" style={{ gap: 6 }}>
        <Link href="/trilhas" className="small muted">
          ← Todas as trilhas
        </Link>
        <div className="row">
          <span className="badge">{trail.level_label}</span>
          <span className="small muted">
            {trail.courses.length} {trail.courses.length === 1 ? "curso" : "cursos"} · {lessons} aulas · {missions.length} missões
          </span>
        </div>
        <h1 className="page-title">{trail.title}</h1>
        <p className="page-subtitle" style={{ maxWidth: 760 }}>
          {trail.description}
        </p>
      </div>

      <div className="grid grid-3">
        <div className="card stack">
          <div className="label">Seu progresso</div>
          <div className="stat">{lessons ? Math.round((done / lessons) * 100) : 0}%</div>
          <Progress value={lessons ? (done / lessons) * 100 : 0} label="Progresso na trilha" />
          <span className="small muted">
            {done} de {lessons} aulas · {trail.missions.done} de {trail.missions.total} missões
          </span>
        </div>
        <div className="card stack">
          <div className="row" style={{ gap: 8 }}>
            <div className="icon-box">
              <Bot size={18} />
            </div>
            <div>
              <div className="label">IA da trilha</div>
              <h2 className="card-title">{seed.assistant.name}</h2>
            </div>
          </div>
          <p className="small muted">Tire dúvidas sobre {seed.title.toLowerCase()} e peça exemplos, planos e textos prontos.</p>
          <Link href={`/assistente?trilha=${slug}`} className="btn btn-primary">
            Conversar com o especialista
          </Link>
        </div>
        <div className="card stack">
          <div className="row" style={{ gap: 8 }}>
            <div className="icon-box">
              <FileText size={18} />
            </div>
            <div>
              <div className="label">Guia em PDF</div>
              <h2 className="card-title">Resumo da trilha</h2>
            </div>
          </div>
          <p className="small muted">Roteiro, checklists, glossário e cuidados da trilha para consultar quando quiser.</p>
          {guideOpen ? (
            <a href={`/api/guias/${slug}`} className="btn">
              <Download size={15} /> Baixar PDF
            </a>
          ) : (
            <Link href="/planos" className="btn">
              <Lock size={14} /> Disponível no Premium
            </Link>
          )}
        </div>
      </div>

      <section className="stack" aria-labelledby="cursos">
        <h2 id="cursos" style={{ fontSize: 18 }}>
          Cursos
        </h2>
        <div className="grid grid-auto">
          {trail.courses.map((c) => {
            const pct = c.lessons ? (c.done / c.lessons) * 100 : 0;
            return (
              <Link key={c.id} href={`/cursos/${c.slug}`} className="card card-hover stack">
                <div className="row between">
                  <span className="small muted">{c.lessons} aulas</span>
                  {c.is_premium ? (
                    <span className={`badge ${plan === "premium" ? "badge-accent" : "badge-warning"}`}>Premium</span>
                  ) : (
                    <span className="badge badge-success">Gratuito</span>
                  )}
                </div>
                <h3 style={{ fontSize: 17 }}>{c.title}</h3>
                <p className="small muted" style={{ flex: 1 }}>
                  {c.summary}
                </p>
                <Progress value={pct} small label={`Progresso em ${c.title}`} />
              </Link>
            );
          })}
        </div>
      </section>

      {missions.length ? (
        <section className="card" aria-labelledby="missoes">
          <h2 id="missoes" className="card-title">
            Missões práticas
          </h2>
          <div className="list" style={{ marginTop: 6 }}>
            {missions.map((m) => (
              <Link key={m.id} href={`/missoes/${m.slug}`} className="list-item">
                <Target size={17} color="var(--accent-text)" />
                <span style={{ flex: 1 }}>{m.title}</span>
                {m.status === "concluida" ? (
                  <span className="badge badge-success">Concluída</span>
                ) : m.is_premium && plan === "free" ? (
                  <Lock size={14} color="var(--text-faint)" />
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
