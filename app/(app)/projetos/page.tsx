import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FolderKanban } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { limit, planOf } from "@/lib/access";
import { PROJECT_STATUS, PROJECT_TEMPLATES } from "@/lib/options";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/Progress";
import { NewProjectForm } from "@/components/ProjectForms";

export const metadata: Metadata = { title: "Projetos e Portfólio" };

export default async function ProjectsPage() {
  const user = await requireOnboardedUser();
  const plan = planOf(user);
  const max = limit(plan, "max_projects");
  const projects = all<{ id: number; name: string; category: string; status: string; is_demo: number; is_public: number; steps: number; done: number }>(
    `SELECT p.id, p.name, p.category, p.status, p.is_demo, p.is_public, COUNT(s.id) AS steps, COALESCE(SUM(s.done), 0) AS done
     FROM projects p LEFT JOIN project_steps s ON s.project_id = p.id WHERE p.user_id = ? GROUP BY p.id ORDER BY p.updated_at DESC`,
    user.id,
  );
  const atLimit = projects.length >= max;
  return (
    <>
      <PageHeader
        title="Projetos e Portfólio"
        subtitle="Organize seus trabalhos, acompanhe etapas e monte um portfólio para apresentar a clientes."
        actions={
          user.portfolio_public && user.handle ? (
            <Link href={`/portfolio/${user.handle}`} className="btn" target="_blank">
              Ver portfólio público <ExternalLink size={14} />
            </Link>
          ) : (
            <Link href="/conta" className="btn">
              Ativar portfólio público
            </Link>
          )
        }
      />
      {projects.length ? (
        <div className="grid grid-auto">
          {projects.map((p) => {
            const pct = p.steps ? (p.done / p.steps) * 100 : p.status === "concluido" ? 100 : 0;
            return (
              <Link key={p.id} href={`/projetos/${p.id}`} className="card card-hover stack">
                <div className="row between">
                  <span className="label">{p.category}</span>
                  <span className={`badge ${p.status === "concluido" ? "badge-success" : p.status === "planejamento" ? "" : "badge-info"}`}>{PROJECT_STATUS[p.status]}</span>
                </div>
                <h2 style={{ fontSize: 17 }}>{p.name}</h2>
                <div className="row">
                  {p.is_demo ? <span className="badge">Demonstração</span> : null}
                  {p.is_public ? <span className="badge badge-accent">No portfólio</span> : null}
                </div>
                <Progress value={pct} small label={`Etapas de ${p.name}`} />
                <span className="tiny faint">
                  {p.done}/{p.steps} etapas
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card empty">
          <FolderKanban size={28} />
          <p>Você ainda não tem projetos. Comece por um modelo demonstrativo abaixo.</p>
        </div>
      )}
      <div className="row between">
        <h2 style={{ fontSize: 18 }}>Criar projeto</h2>
        <span className="small muted">
          {projects.length}/{max} projetos no seu plano
          {atLimit && plan === "free" ? (
            <>
              {" "}
              · <Link href="/planos" style={{ color: "var(--accent-text)" }}>ampliar no Premium</Link>
            </>
          ) : null}
        </span>
      </div>
      <NewProjectForm templates={PROJECT_TEMPLATES.map(({ key, name, description }) => ({ key, name, description }))} atLimit={atLimit} />
    </>
  );
}
