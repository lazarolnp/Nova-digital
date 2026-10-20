import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { AdminHeader, type Flash } from "@/components/AdminUI";
import { MissionAdminForm } from "@/components/MissionAdminForm";

export const metadata: Metadata = { title: "Admin · Missões" };

export default async function AdminMissions({ searchParams }: { searchParams: Flash }) {
  await requireAdmin();
  const flash = await searchParams;
  const missions = await all<{ id: number; title: string; trail: string | null; is_premium: number; published: number; done: number }>(
    `SELECT m.id, m.title, t.title AS trail, m.is_premium, m.published,
       (SELECT COUNT(*) FROM mission_progress mp WHERE mp.mission_id = m.id AND mp.status = 'concluida') AS done
     FROM missions m LEFT JOIN trails t ON t.id = m.trail_id ORDER BY t.sort, m.sort, m.id`,
  );
  const trails = await all<{ id: number; title: string }>("SELECT id, title FROM trails ORDER BY sort");
  return (
    <>
      <AdminHeader title="Missões" active="/admin/missoes" {...flash} />
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Missão</th>
              <th>Trilha</th>
              <th>Concluídas</th>
              <th>Acesso</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {missions.map((m) => (
              <tr key={m.id}>
                <td>
                  <strong>{m.title}</strong> {m.published ? null : <span className="badge">Rascunho</span>}
                </td>
                <td className="small">{m.trail ?? "—"}</td>
                <td>{m.done}</td>
                <td>{m.is_premium ? <span className="badge badge-accent">Premium</span> : <span className="badge badge-success">Gratuita</span>}</td>
                <td>
                  <Link href={`/admin/missoes/${m.id}`} className="btn btn-sm">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MissionAdminForm mission={null} trails={trails} />
    </>
  );
}
