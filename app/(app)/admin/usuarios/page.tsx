import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { accessOf } from "@/lib/access";
import { PAID_PLANS } from "@/lib/plans";
import { grantPlanAction, revokePlanAction, setRoleAction } from "@/app/actions/admin";
import { AdminHeader } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Usuários" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; q?: string }> }) {
  const me = await requireAdmin();
  const { q, ...flash } = await searchParams;
  const term = (q ?? "").trim().slice(0, 80);
  const users = await all<{ id: number; name: string; email: string; role: "user" | "admin"; waitlist: number; xp: number }>(
    `SELECT u.id, u.name, u.email, u.role,
       EXISTS (SELECT 1 FROM waitlist w WHERE w.user_id = u.id) AS waitlist,
       (SELECT COALESCE(SUM(xp), 0) FROM xp_events x WHERE x.user_id = u.id) AS xp
     FROM users u ${term ? "WHERE u.name LIKE ? OR u.email LIKE ?" : ""} ORDER BY u.id DESC LIMIT 100`,
    ...(term ? [`%${term}%`, `%${term}%`] : []),
  );
  const rows = await Promise.all(users.map(async (u) => ({ ...u, access: await accessOf({ id: u.id, role: "user", email: u.email }) })));

  return (
    <>
      <AdminHeader title="Usuários" active="/admin/usuarios" {...flash} />
      <form className="row" role="search">
        <input name="q" className="input" defaultValue={term} placeholder="Buscar por nome ou e-mail" aria-label="Buscar usuários" style={{ maxWidth: 360 }} />
        <button type="submit" className="btn">
          Buscar
        </button>
      </form>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>XP</th>
              <th>Papel</th>
              <th>Planos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                  <div className="tiny faint">{u.email}</div>
                  {u.waitlist ? <span className="badge badge-info">Lista de espera</span> : null}
                </td>
                <td>{u.xp}</td>
                <td>
                  <form action={setRoleAction.bind(null, u.id)} className="row" style={{ flexWrap: "nowrap" }}>
                    <select name="role" className="select" defaultValue={u.role} aria-label={`Papel de ${u.name}`} style={{ minWidth: 130 }} disabled={u.id === me.id}>
                      <option value="user">Aluno</option>
                      <option value="admin">Administrador</option>
                    </select>
                    {u.id === me.id ? null : (
                      <button type="submit" className="btn btn-sm">
                        Salvar
                      </button>
                    )}
                  </form>
                </td>
                <td>
                  <div className="stack" style={{ gap: 8 }}>
                    {u.access.plans.map((p) => (
                      <div key={p.id} className="row" style={{ gap: 6 }}>
                        <span className={`badge ${p.source === "kiwify" ? "badge-success" : "badge-accent"}`}>
                          {p.name} · {p.source === "kiwify" ? "Kiwify" : "manual"}
                          {p.until ? ` · até ${new Date(p.until).toLocaleDateString("pt-BR")}` : ""}
                        </span>
                        {p.source === "manual" ? (
                          <form action={revokePlanAction.bind(null, u.id, p.id)}>
                            <button type="submit" className="btn btn-sm btn-danger">
                              Revogar
                            </button>
                          </form>
                        ) : null}
                      </div>
                    ))}
                    <form action={grantPlanAction.bind(null, u.id)} className="row" style={{ gap: 6 }}>
                      <select name="plan" className="select" aria-label={`Plano para ${u.name}`} style={{ maxWidth: 190 }} defaultValue="completo">
                        {PAID_PLANS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input type="date" name="until" className="input" aria-label="Válido até (opcional)" style={{ maxWidth: 160 }} />
                      <button type="submit" className="btn btn-sm">
                        Conceder
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tiny faint">
        Sem data, o plano concedido manualmente não expira. Planos comprados na Kiwify são controlados pela Kiwify (renovação, cancelamento e reembolso).
      </p>
    </>
  );
}
