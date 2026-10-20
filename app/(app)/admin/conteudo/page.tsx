import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { createCourseAction } from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Cursos" };

export default async function AdminCourses({ searchParams }: { searchParams: Flash }) {
  await requireAdmin();
  const flash = await searchParams;
  const courses = await all<{ id: number; title: string; slug: string; trail: string | null; is_premium: number; published: number; lessons: number }>(
    `SELECT c.id, c.title, c.slug, t.title AS trail, c.is_premium, c.published,
       (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id) AS lessons
     FROM courses c LEFT JOIN trails t ON t.id = c.trail_id ORDER BY c.sort, c.id`,
  );
  const trails = await all<{ id: number; title: string }>("SELECT id, title FROM trails ORDER BY sort");
  return (
    <>
      <AdminHeader title="Cursos e aulas" active="/admin/conteudo" {...flash} />
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Trilha</th>
              <th>Aulas</th>
              <th>Acesso</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.title}</strong>
                  <div className="tiny faint">{c.slug}</div>
                </td>
                <td className="small">{c.trail ?? "—"}</td>
                <td>{c.lessons}</td>
                <td>{c.is_premium ? <span className="badge badge-accent">Premium</span> : <span className="badge badge-success">Gratuito</span>}</td>
                <td>{c.published ? <span className="badge badge-success">Publicado</span> : <span className="badge">Rascunho</span>}</td>
                <td>
                  <Link href={`/admin/conteudo/${c.id}`} className="btn btn-sm">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={createCourseAction} className="card stack">
        <h2 className="card-title">Novo curso</h2>
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" className="input" required />
          </div>
          <div className="field">
            <label htmlFor="slug">Identificador (slug)</label>
            <input id="slug" name="slug" className="input" placeholder="meu-novo-curso" required />
          </div>
          <div className="field">
            <label htmlFor="trail_id">Trilha</label>
            <select id="trail_id" name="trail_id" className="select">
              <option value="">Sem trilha</option>
              {trails.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="skills">Habilidades (separadas por vírgula)</label>
            <input id="skills" name="skills" className="input" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="summary">Resumo</label>
          <input id="summary" name="summary" className="input" maxLength={300} />
        </div>
        <div className="field">
          <label htmlFor="description">Descrição</label>
          <textarea id="description" name="description" className="textarea" maxLength={3000} />
        </div>
        <div className="row">
          <label className="check">
            <input type="checkbox" name="is_premium" /> <span>Premium</span>
          </label>
          <label className="check">
            <input type="checkbox" name="published" /> <span>Publicado</span>
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Criar curso
        </button>
      </form>
    </>
  );
}
