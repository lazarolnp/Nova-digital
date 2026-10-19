import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { grantPremiumAction, revokePremiumAction, setRoleAction } from "@/app/actions/admin";
import { AdminHeader } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Usuários" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; q?: string }> }) {
  const me = await requireAdmin();
  const { q, ...flash } = await searchParams;
  const term = (q ?? "").trim().slice(0, 80);
  const users = all<{ id: number; name: string; email: string; role: string; created_at: string; premium: number; until: string | null; waitlist: number; xp: number }>(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
       EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > ?)) AS premium,
       (SELECT s.current_period_end FROM subscriptions s WHERE s.user_id = u.id AND s.status = 'active' ORDER BY s.id DESC LIMIT 1) AS until,
       EXISTS (SELECT 1 FROM waitlist w WHERE w.user_id = u.id) AS waitlist,
       (SELECT COALESCE(SUM(xp), 0) FROM xp_events x WHERE x.user_id = u.id) AS xp
     FROM users u ${term ? "WHERE u.name LIKE ? OR u.email LIKE ?" : ""} ORDER BY u.id DESC LIMIT 100`,
    ...(term ? [new Date().toISOString(), `%${term}%`, `%${term}%`] : [new Date().toISOString()]),
  );
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
              <th>Plano</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
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
                  {u.premium ? (
                    <div className="row">
                      <span className="badge badge-accent">Premium{u.until ? ` até ${new Date(u.until).toLocaleDateString("pt-BR")}` : ""}</span>
                      <form action={revokePremiumAction.bind(null, u.id)}>
                        <button type="submit" className="btn btn-sm btn-danger">
                          Revogar
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form action={grantPremiumAction.bind(null, u.id)} className="row" style={{ flexWrap: "nowrap" }}>
                      <input type="date" name="until" className="input" aria-label="Válido até (opcional)" style={{ maxWidth: 170 }} />
                      <button type="submit" className="btn btn-sm">
                        Conceder Premium
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tiny faint">Sem data, o acesso Premium manual não expira. Assinaturas de um provedor de pagamento aparecem aqui quando integradas.</p>
    </>
  );
}
