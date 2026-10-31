"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  CalendarCheck,
  Crown,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Map,
  Menu,
  Shield,
  Target,
  User,
  Wrench,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number }>; count?: number };

export function Sidebar({ unread, isAdmin, aiEnabled }: { unread: number; isAdmin: boolean; aiEnabled: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: "Visão geral",
      items: [
        { href: "/painel", label: "Painel", icon: LayoutDashboard },
        { href: "/plano", label: "Plano de 30 dias", icon: CalendarCheck },
        ...(aiEnabled ? [{ href: "/assistente", label: "Assistente IA", icon: Bot }] : []),
      ],
    },
    {
      title: "Aprender",
      items: [
        { href: "/trilhas", label: "Trilhas", icon: Map },
        { href: "/cursos", label: "Cursos", icon: BookOpen },
      ],
    },
    {
      title: "Praticar",
      items: [
        { href: "/missoes", label: "Central de Missões", icon: Target },
        { href: "/projetos", label: "Projetos e Portfólio", icon: FolderKanban },
        { href: "/ferramentas", label: "Ferramentas", icon: Wrench },
      ],
    },
    {
      title: "Conta",
      items: [
        { href: "/notificacoes", label: "Notificações", icon: Bell, count: unread },
        { href: "/conta", label: "Minha conta", icon: User },
        { href: "/planos", label: "Planos", icon: Crown },
        { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      ],
    },
  ];
  if (isAdmin) sections.push({ title: "Administração", items: [{ href: "/admin", label: "Painel admin", icon: Shield }] });

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="mobile-header">
        <Link href="/painel" className="brand" style={{ padding: 0 }}>
          <span className="brand-mark">N</span> NovaDigital
        </Link>
        <button type="button" className="btn btn-sm menu-toggle" onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open}>
          <Menu size={18} />
        </button>
      </div>
      {open ? <div className="backdrop" onClick={() => setOpen(false)} aria-hidden /> : null}
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Navegação principal">
        <div className="row between">
          <Link href="/painel" className="brand">
            <span className="brand-mark">N</span> NovaDigital
          </Link>
          {open ? (
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)} aria-label="Fechar menu">
              <X size={18} />
            </button>
          ) : null}
        </div>
        <nav>
          {sections.map((s) => (
            <div key={s.title}>
              <div className="nav-section">{s.title}</div>
              {s.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className={`nav-link${isActive(item.href) ? " active" : ""}`} aria-current={isActive(item.href) ? "page" : undefined}>
                    <Icon size={17} />
                    {item.label}
                    {item.count ? <span className="count">{item.count > 99 ? "99+" : item.count}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <form action={logoutAction}>
            <button type="submit" className="nav-link btn-ghost" style={{ width: "100%", background: "none", cursor: "pointer" }}>
              <LogOut size={17} /> Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
