import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Lock, PlayCircle, Target } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { getCourse } from "@/lib/content";
import { canAccessLesson, planOf } from "@/lib/access";
import { Progress } from "@/components/Progress";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const user = await requireOnboardedUser();
  return { title: getCourse(slug, user.id)?.course.title ?? "Curso" };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireOnboardedUser();
  const data = getCourse(slug, user.id);
  if (!data) notFound();
  const { course, modules, lessons, missions } = data;
  const plan = planOf(user);
  const done = lessons.filter((l) => l.completed).length;
  const pct = lessons.length ? (done / lessons.length) * 100 : 0;
  const nextLesson = lessons.find((l) => !l.completed && canAccessLesson(plan, course.is_premium, l.is_free_preview));
  const minutes = lessons.reduce((s, l) => s + l.duration_min, 0);
  const lockedCount = lessons.filter((l) => !canAccessLesson(plan, course.is_premium, l.is_free_preview)).length;

  return (
    <>
      <div className="stack" style={{ gap: 6 }}>
        <Link href="/cursos" className="small muted">
          ← Catálogo de cursos
        </Link>
        <div className="row">
          {course.trail_title ? <span className="label">{course.trail_title}</span> : null}
          {course.is_premium ? <span className="badge badge-accent">Premium</span> : <span className="badge badge-success">Gratuito</span>}
        </div>
        <h1 className="page-title">{course.title}</h1>
        <p className="page-subtitle" style={{ maxWidth: 760 }}>
          {course.description}
        </p>
      </div>

      <div className="grid grid-3">
        <div className="span-2 stack-lg">
          {modules.map((m, mi) => (
            <section key={m.id} className="card" aria-labelledby={`mod-${m.id}`}>
              <div className="card-head">
                <h2 id={`mod-${m.id}`} className="card-title">
                  Módulo {mi + 1} · {m.title}
                </h2>
                <span className="small muted">
                  {m.lessons.filter((l) => l.completed).length}/{m.lessons.length}
                </span>
              </div>
              <div className="list">
                {m.lessons.map((l, li) => {
                  const open = canAccessLesson(plan, course.is_premium, l.is_free_preview);
                  return (
                    <Link key={l.id} href={`/aulas/${l.id}`} className="list-item">
                      {l.completed ? (
                        <CheckCircle2 size={20} color="var(--success)" />
                      ) : open ? (
                        <Circle size={20} color="var(--text-faint)" />
                      ) : (
                        <Lock size={18} color="var(--text-faint)" />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>
                          {li + 1}. {l.title}
                        </div>
                        <div className="tiny faint">
                          {l.duration_min} min{course.is_premium && l.is_free_preview ? " · aula aberta" : ""}
                        </div>
                      </div>
                      {!open ? <span className="badge badge-warning">Premium</span> : null}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <aside className="stack-lg">
          <div className="card stack">
            <div className="label">Seu progresso</div>
            <div className="stat">{Math.round(pct)}%</div>
            <Progress value={pct} label="Progresso no curso" />
            <p className="small muted">
              {done} de {lessons.length} aulas · cerca de {Math.round(minutes / 6) / 10}h de conteúdo
            </p>
            {nextLesson ? (
              <Link href={`/aulas/${nextLesson.id}`} className="btn btn-primary btn-block">
                <PlayCircle size={16} /> {done ? "Continuar" : "Começar"}: {nextLesson.title}
              </Link>
            ) : lockedCount ? (
              <Link href="/planos" className="btn btn-primary btn-block">
                <Lock size={16} /> Liberar {lockedCount} aulas no Premium
              </Link>
            ) : (
              <span className="badge badge-success">Curso concluído</span>
            )}
          </div>
          <div className="card">
            <h2 className="card-title">Habilidades</h2>
            <div className="row" style={{ marginTop: 10 }}>
              {course.skills.split(",").map((s) => (
                <span key={s} className="badge">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
          {missions.length ? (
            <div className="card">
              <h2 className="card-title">Desafios e missões da trilha</h2>
              <div className="list" style={{ marginTop: 6 }}>
                {missions.map((m) => (
                  <Link key={m.id} href={`/missoes/${m.slug}`} className="list-item">
                    <Target size={17} color="var(--accent-text)" />
                    <span className="small" style={{ flex: 1 }}>
                      {m.title}
                    </span>
                    {m.is_premium && plan === "free" ? <Lock size={14} color="var(--text-faint)" /> : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
