import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { replyTicketAction } from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Chamados" };

export default async function AdminTickets({ searchParams }: { searchParams: Flash }) {
  await requireAdmin();
  const flash = await searchParams;
  const tickets = await all<{ id: number; category: string; message: string; status: string; reply: string; created_at: string; name: string; email: string }>(
    `SELECT t.*, u.name, u.email FROM tickets t JOIN users u ON u.id = t.user_id
     ORDER BY CASE t.status WHEN 'aberto' THEN 0 WHEN 'respondido' THEN 1 ELSE 2 END, t.id DESC LIMIT 100`,
  );
  return (
    <>
      <AdminHeader title="Chamados de suporte" active="/admin/chamados" {...flash} />
      {tickets.length === 0 ? <div className="card empty">Nenhum chamado.</div> : null}
      {tickets.map((t) => (
        <form key={t.id} action={replyTicketAction.bind(null, t.id)} className="card stack">
          <div className="row between">
            <strong>
              #{t.id} · {t.category}
            </strong>
            <span className="small muted">
              {t.name} · {t.email}
            </span>
          </div>
          <p className="small wrap-anywhere" style={{ whiteSpace: "pre-wrap" }}>
            {t.message}
          </p>
          <textarea name="reply" className="textarea" defaultValue={t.reply} placeholder="Resposta para o aluno" aria-label={`Resposta ao chamado ${t.id}`} />
          <div className="row">
            <select name="status" className="select" defaultValue={t.status === "aberto" ? "respondido" : t.status} aria-label="Status" style={{ maxWidth: 200 }}>
              <option value="aberto">Aberto</option>
              <option value="respondido">Respondido</option>
              <option value="fechado">Fechado</option>
            </select>
            <button type="submit" className="btn btn-primary btn-sm">
              Salvar
            </button>
          </div>
        </form>
      ))}
    </>
  );
}
