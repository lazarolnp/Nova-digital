import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { intParam } from "@/lib/validation";
import {
  addModuleAction,
  createLessonAction,
  deleteCourseAction,
  deleteModuleAction,
  updateCourseAction,
  updateModuleAction,
} from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Curso" };

export default async function AdminCourse({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Flash }) {
  await requireAdmin();
  const id = intParam((await params).id);
  if (!id) notFound();
  const flash = await searchParams;
  const c = await get<{ id: number; title: string; slug: string; trail_id: number | null; summary: string; description: string; skills: string; is_premium: number; published: number; sort: number }>(
    "SELECT * FROM courses WHERE id = ?",
    id,
  );
  if (!c) notFound();
  const trails = await all<{ id: number; title: string }>("SELECT id, title FROM trails ORDER BY sort");
  const modules = await all<{ id: number; title: string; sort: number }>("SELECT id, title, sort FROM modules WHERE course_id = ? ORDER BY sort, id", id);
  const lessons = await all<{ id: number; module_id: number; title: string; is_free_preview: number; video_url: string }>(
    "SELECT l.id, l.module_id, l.title, l.is_free_preview, l.video_url FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? ORDER BY l.sort, l.id",
    id,
  );
  return (
    <>
      <AdminHeader title={c.title} active="/admin/conteudo" {...flash} />
      <div className="row">
        <Link href="/admin/conteudo" className="small muted">
          ← Todos os cursos
        </Link>
        <Link href={`/cursos/${c.slug}`} className="small" style={{ color: "var(--accent-text)" }}>
          Ver como aluno
        </Link>
      </div>
      <div className="grid grid-3" style={{ alignItems: "start" }}>
        <div className="span-2 stack-lg">
          {modules.map((m) => (
            <section key={m.id} className="card stack">
              <form action={updateModuleAction.bind(null, m.id, c.id)} className="row" style={{ flexWrap: "nowrap" }}>
                <input name="title" className="input" defaultValue={m.title} aria-label="Título do módulo" required />
                <input name="sort" type="number" className="input" defaultValue={m.sort} aria-label="Ordem" style={{ width: 80 }} />
                <button type="submit" className="btn btn-sm">
                  Salvar
                </button>
              </form>
              <div className="list">
                {lessons
                  .filter((l) => l.module_id === m.id)
                  .map((l) => (
                    <div key={l.id} className="list-item">
                      <span style={{ flex: 1 }} className="small">
                        {l.title}
                      </span>
                      {l.is_free_preview ? <span className="badge badge-success">Aberta</span> : null}
                      {l.video_url ? <span className="badge">Vídeo</span> : null}
                      <Link href={`/admin/aulas/${l.id}`} className="btn btn-sm">
                        Editar
                      </Link>
                    </div>
                  ))}
              </div>
              <div className="row between">
                <form action={createLessonAction.bind(null, m.id, c.id)} className="row" style={{ flexWrap: "nowrap", flex: 1 }}>
                  <input name="title" className="input" placeholder="Título da nova aula" aria-label="Título da nova aula" required />
                  <button type="submit" className="btn btn-sm">
                    Adicionar aula
                  </button>
                </form>
                <form action={deleteModuleAction.bind(null, m.id, c.id)}>
                  <button type="submit" className="btn btn-sm btn-danger">
                    Excluir módulo e aulas
                  </button>
                </form>
              </div>
            </section>
          ))}
          <form action={addModuleAction.bind(null, c.id)} className="card row" style={{ flexWrap: "nowrap" }}>
            <input name="title" className="input" placeholder="Título do novo módulo" aria-label="Título do novo módulo" required />
            <button type="submit" className="btn btn-primary">
              Adicionar módulo
            </button>
          </form>
        </div>
        <div className="stack-lg">
          <form action={updateCourseAction.bind(null, c.id)} className="card stack">
            <h2 className="card-title">Dados do curso</h2>
            <div className="field">
              <label htmlFor="title">Título</label>
              <input id="title" name="title" className="input" defaultValue={c.title} required />
            </div>
            <div className="field">
              <label htmlFor="slug">Identificador</label>
              <input id="slug" name="slug" className="input" defaultValue={c.slug} required />
            </div>
            <div className="field">
              <label htmlFor="trail_id">Trilha</label>
              <select id="trail_id" name="trail_id" className="select" defaultValue={c.trail_id ?? ""}>
                <option value="">Sem trilha</option>
                {trails.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="summary">Resumo</label>
              <input id="summary" name="summary" className="input" defaultValue={c.summary} />
            </div>
            <div className="field">
              <label htmlFor="description">Descrição</label>
              <textarea id="description" name="description" className="textarea" defaultValue={c.description} />
            </div>
            <div className="field">
              <label htmlFor="skills">Habilidades</label>
              <input id="skills" name="skills" className="input" defaultValue={c.skills} />
            </div>
            <div className="field">
              <label htmlFor="sort">Ordem</label>
              <input id="sort" name="sort" type="number" className="input" defaultValue={c.sort} />
            </div>
            <label className="check">
              <input type="checkbox" name="is_premium" defaultChecked={c.is_premium === 1} /> <span>Pago (liberado pelo plano da trilha)</span>
            </label>
            <label className="check">
              <input type="checkbox" name="published" defaultChecked={c.published === 1} /> <span>Publicado</span>
            </label>
            <button type="submit" className="btn btn-primary">
              Salvar curso
            </button>
          </form>
          <form action={deleteCourseAction.bind(null, c.id)} className="card stack">
            <h2 className="card-title">Excluir curso</h2>
            <p className="small muted">Remove o curso, módulos, aulas e o progresso dos alunos nessas aulas.</p>
            <input name="confirm" className="input" placeholder='Digite "EXCLUIR"' aria-label="Confirmação" />
            <button type="submit" className="btn btn-danger">
              Excluir curso
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
