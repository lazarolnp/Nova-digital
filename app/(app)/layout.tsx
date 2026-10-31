import Link from "next/link";
import { Bell, Crown } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { planOf } from "@/lib/access";
import { unreadCount } from "@/lib/progress";
import { Sidebar } from "@/components/Sidebar";
import { AI_ENABLED } from "@/lib/features";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();
  const plan = await planOf(user);
  const unread = await unreadCount(user.id);
  return (
    <div className="shell">
      <Sidebar unread={unread} isAdmin={user.role === "admin"} aiEnabled={AI_ENABLED} />
      <div className="main">
        <header className="topbar">
          <div className="row">
            {plan === "premium" ? (
              <span className="badge badge-accent">
                <Crown size={12} /> Premium
              </span>
            ) : (
              <Link href="/planos" className="badge">
                Plano gratuito
              </Link>
            )}
          </div>
          <div className="topbar-right">
            <Link href="/notificacoes" className="btn btn-sm btn-ghost" aria-label={`Notificações${unread ? `: ${unread} não lidas` : ""}`}>
              <Bell size={16} />
              {unread ? <span className="badge badge-accent">{unread}</span> : null}
            </Link>
            <Link href="/conta" className="small" style={{ fontWeight: 650 }}>
              {user.name.split(" ")[0]}
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="content" id="conteudo">
          {children}
        </main>
      </div>
    </div>
  );
}
