import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink, Lock, PenLine } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { getLesson, lessonNeighbors } from "@/lib/content";
import { canAccessLesson, planOf } from "@/lib/access";
import { intParam } from "@/lib/validation";
import { videoEmbed } from "@/lib/video";
import { Markdown } from "@/components/Markdown";
import { CompleteLessonButton, LessonNotesForm } from "@/components/LessonActions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = intParam((await params).id);
  return { title: (id && (await getLesson(id))?.title) || "Aula" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const id = intParam((await params).id);
  if (!id) notFound();
  const user = await requireOnboardedUser();
  const lesson = await getLesson(id);
  if (!lesson) notFound();
  const plan = await planOf(user);
  const allowed = canAccessLesson(plan, lesson.course_premium, lesson.is_free_preview);
  const nav = await lessonNeighbors(lesson.id, lesson.course_id);
  const progress = await get<{ completed_at: string | null; notes: string }>(
    "SELECT completed_at, notes FROM lesson_progress WHERE user_id = ? AND lesson_id = ?",
    user.id,
    lesson.id,
  );
  const video = videoEmbed(lesson.video_url);

  return (
    <>
      <div className="stack" style={{ gap: 6 }}>
        <Link href={`/cursos/${lesson.course_slug}`} className="small muted">
          ← {lesson.course_title}
        </Link>
        <span className="label">
          {lesson.module_title} · Aula {nav.index} de {nav.total} · {lesson.duration_min} min
        </span>
        <h1 className="page-title">{lesson.title}</h1>
      </div>

      {!allowed ? (
        <div className="card empty">
          <Lock size={28} />
          <h2 className="card-title">Esta aula faz parte do Premium</h2>
          <p className="muted" style={{ maxWidth: 520 }}>
            As aulas introdutórias deste curso estão abertas no plano gratuito. Para acessar o curso completo, conheça o plano Premium.
          </p>
          <div className="row">
            <Link href="/planos" className="btn btn-primary">
              Conhecer o Premium
            </Link>
            <Link href={`/cursos/${lesson.course_slug}`} className="btn">
              Ver aulas abertas
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-3" style={{ alignItems: "start" }}>
          <article className="span-2 stack-lg">
            {video ? (
              <div className="video-frame">
                {video.type === "iframe" ? (
                  <iframe src={video.src} title={`Vídeo: ${lesson.title}`} allow="encrypted-media; picture-in-picture; fullscreen" loading="lazy" />
                ) : (
                  <video src={video.src} controls preload="metadata" />
                )}
              </div>
            ) : null}
            <div className="card">
              <Markdown source={lesson.content} />
            </div>
            {lesson.exercise ? (
              <section className="card" aria-labelledby="exercicio">
                <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                  <PenLine size={17} color="var(--accent-text)" />
                  <h2 id="exercicio" className="card-title">
                    Exercício
                  </h2>
                </div>
                <p style={{ marginBottom: 14 }}>{lesson.exercise}</p>
                <LessonNotesForm lessonId={lesson.id} notes={progress?.notes ?? ""} />
              </section>
            ) : null}
          </article>
          <aside className="stack-lg" style={{ position: "sticky", top: 16 }}>
            <div className="card stack">
              <CompleteLessonButton lessonId={lesson.id} completed={Boolean(progress?.completed_at)} nextHref={nav.next ? `/aulas/${nav.next.id}` : null} />
              <div className="row between">
                {nav.prev ? (
                  <Link href={`/aulas/${nav.prev.id}`} className="btn btn-sm btn-ghost">
                    <ChevronLeft size={15} /> Anterior
                  </Link>
                ) : (
                  <span />
                )}
                {nav.next ? (
                  <Link href={`/aulas/${nav.next.id}`} className="btn btn-sm btn-ghost">
                    Próxima <ChevronRight size={15} />
                  </Link>
                ) : null}
              </div>
            </div>
            {lesson.materialList.length ? (
              <div className="card">
                <h2 className="card-title">Materiais de apoio</h2>
                <div className="list" style={{ marginTop: 6 }}>
                  {lesson.materialList.map((m) => (
                    <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer" className="list-item small">
                      <ExternalLink size={15} color="var(--accent-text)" />
                      <span>{m.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="card">
              <h2 className="card-title">Ficou com dúvida?</h2>
              <p className="small muted" style={{ marginTop: 6 }}>
                Pergunte ao especialista desta trilha. Ele conhece o conteúdo da plataforma e o seu progresso.
              </p>
              <Link href={`/assistente?${lesson.trail_slug ? `trilha=${lesson.trail_slug}&` : ""}q=${encodeURIComponent(`Tenho uma dúvida sobre a aula "${lesson.title}": `)}`} className="btn btn-sm" style={{ marginTop: 12 }}>
                Perguntar ao assistente
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
