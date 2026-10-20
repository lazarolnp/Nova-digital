import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { markAllReadAction, markReadAction } from "@/app/actions/account";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Notificações" };

const TABS = [
  { key: undefined, label: "Todas" },
  { key: "conquista", label: "Conquistas" },
  { key: "progresso", label: "Progresso" },
  { key: "sistema", label: "Sistema" },
];

function when(ts: string) {
  const d = new Date(ts.replace(" ", "T") + "Z");
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const user = await requireOnboardedUser();
  const { tipo } = await searchParams;
  const valid = TABS.some((t) => t.key === tipo) ? tipo : undefined;
  const items = await all<{ id: number; kind: string; title: string; body: string; link: string; read_at: string | null; created_at: string }>(
    `SELECT * FROM notifications WHERE user_id = ? ${valid ? "AND kind = ?" : ""} ORDER BY id DESC LIMIT 100`,
    ...(valid ? [user.id, valid] : [user.id]),
  );
  return (
    <>
      <PageHeader
        title="Notificações"
        actions={
          <form action={markAllReadAction}>
            <button type="submit" className="btn">
              Marcar todas como lidas
            </button>
          </form>
        }
      />
      <div className="row" aria-label="Filtrar notificações">
        {TABS.map((t) => (
          <Link key={t.label} href={t.key ? `/notificacoes?tipo=${t.key}` : "/notificacoes"} className={`chip${valid === t.key ? " active" : ""}`}>
            {t.label}
          </Link>
        ))}
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="empty">
            <Bell size={26} />
            Nenhuma notificação por aqui.
          </div>
        ) : (
          <div className="list">
            {items.map((n) => (
              <div key={n.id} className="list-item" style={{ alignItems: "flex-start" }}>
                <span
                  aria-hidden
                  style={{ width: 8, height: 8, borderRadius: 99, marginTop: 8, background: n.read_at ? "transparent" : "var(--accent)", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.read_at ? 500 : 700 }}>{n.title}</div>
                  {n.body ? <div className="small muted">{n.body}</div> : null}
                  <div className="row" style={{ marginTop: 6 }}>
                    {n.link ? (
                      <Link href={n.link} className="small" style={{ color: "var(--accent-text)" }}>
                        Abrir
                      </Link>
                    ) : null}
                    {!n.read_at ? (
                      <form action={markReadAction.bind(null, n.id)}>
                        <button type="submit" className="small btn-ghost" style={{ background: "none", border: 0, color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>
                          Marcar como lida
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                <span className="tiny faint">{when(n.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
