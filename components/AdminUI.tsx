import Link from "next/link";

const TABS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/conteudo", label: "Cursos e aulas" },
  { href: "/admin/missoes", label: "Missões" },
  { href: "/admin/ferramentas", label: "Ferramentas" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/chamados", label: "Chamados" },
  { href: "/admin/configuracoes", label: "Planos e limites" },
];

export function AdminHeader({ title, active, ok, erro }: { title: string; active: string; ok?: string; erro?: string }) {
  return (
    <>
      <div className="stack" style={{ gap: 10 }}>
        <span className="label">Administração</span>
        <h1 className="page-title">{title}</h1>
        <nav className="row" aria-label="Seções da administração">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`chip${active === t.href ? " active" : ""}`}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {ok ? (
        <div className="alert alert-success" role="status">
          {ok}
        </div>
      ) : null}
      {erro ? (
        <div className="alert alert-error" role="alert">
          {erro}
        </div>
      ) : null}
    </>
  );
}

export type Flash = Promise<{ ok?: string; erro?: string }>;
