import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { all, get, parseJson } from "@/lib/db";
import { intParam } from "@/lib/validation";
import { deleteLessonAction, updateLessonAction } from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Aula" };

export default async function AdminLesson({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Flash }) {
  await requireAdmin();
  const id = intParam((await params).id);
  if (!id) notFound();
  const flash = await searchParams;
  const l = get<{ id: number; module_id: number; title: string; content: string; exercise: string; materials: string; video_url: string; duration_min: number; is_free_preview: number; sort: number; course_id: number }>(
    "SELECT l.*, m.course_id FROM lessons l JOIN modules m ON m.id = l.module_id WHERE l.id = ?",
    id,
  );
  if (!l) notFound();
  const modules = all<{ id: number; title: string }>("SELECT id, title FROM modules WHERE course_id = ? ORDER BY sort, id", l.course_id);
  const materials = parseJson<{ title: string; url: string }[]>(l.materials, [])
    .map((m) => `${m.title} | ${m.url}`)
    .join("\n");
  return (
    <>
      <AdminHeader title={`Aula: ${l.title}`} active="/admin/conteudo" {...flash} />
      <div className="row">
        <Link href={`/admin/conteudo/${l.course_id}`} className="small muted">
          ← Voltar ao curso
        </Link>
        <Link href={`/aulas/${l.id}`} className="small" style={{ color: "var(--accent-text)" }}>
          Ver como aluno
        </Link>
      </div>
      <form action={updateLessonAction.bind(null, l.id)} className="card stack">
        <div className="grid grid-3" style={{ gap: 12 }}>
          <div className="field span-2">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" className="input" defaultValue={l.title} required />
          </div>
          <div className="field">
            <label htmlFor="module_id">Módulo</label>
            <select id="module_id" name="module_id" className="select" defaultValue={l.module_id}>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="duration_min">Duração (min)</label>
            <input id="duration_min" name="duration_min" type="number" min={1} className="input" defaultValue={l.duration_min} />
          </div>
          <div className="field">
            <label htmlFor="sort">Ordem</label>
            <input id="sort" name="sort" type="number" className="input" defaultValue={l.sort} />
          </div>
          <div className="field">
            <label htmlFor="video_url">Vídeo (YouTube, Vimeo ou .mp4)</label>
            <input id="video_url" name="video_url" className="input" defaultValue={l.video_url} placeholder="https://" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="content">Conteúdo (Markdown: ## título, - lista, **negrito**, tabelas com |)</label>
          <textarea id="content" name="content" className="textarea" style={{ minHeight: 360, fontFamily: "ui-monospace, monospace", fontSize: 13 }} defaultValue={l.content} />
        </div>
        <div className="field">
          <label htmlFor="exercise">Exercício</label>
          <textarea id="exercise" name="exercise" className="textarea" defaultValue={l.exercise} />
        </div>
        <div className="field">
          <label htmlFor="materials">Materiais de apoio (uma linha por item: Título | https://link)</label>
          <textarea id="materials" name="materials" className="textarea" defaultValue={materials} />
        </div>
        <label className="check">
          <input type="checkbox" name="is_free_preview" defaultChecked={l.is_free_preview === 1} />
          <span>Aula aberta no plano gratuito (mesmo em curso premium)</span>
        </label>
        <button type="submit" className="btn btn-primary">
          Salvar aula
        </button>
      </form>
      <form action={deleteLessonAction.bind(null, l.id)}>
        <button type="submit" className="btn btn-danger btn-sm">
          Excluir aula
        </button>
      </form>
    </>
  );
}
