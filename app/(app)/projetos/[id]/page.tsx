import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { all, get, parseJson } from "@/lib/db";
import { intParam } from "@/lib/validation";
import { DeleteProjectButton, EditProjectForm, LinksEditor, StepsEditor } from "@/components/ProjectForms";

export const metadata: Metadata = { title: "Projeto" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = intParam((await params).id);
  if (!id) notFound();
  const user = await requireOnboardedUser();
  const project = await get<{
    id: number;
    name: string;
    category: string;
    description: string;
    objective: string;
    status: string;
    results: string;
    links: string;
    is_demo: number;
    is_public: number;
    created_at: string;
  }>("SELECT * FROM projects WHERE id = ? AND user_id = ?", id, user.id);
  if (!project) notFound();
  const steps = await all<{ id: number; title: string; done: number }>("SELECT id, title, done FROM project_steps WHERE project_id = ? ORDER BY sort, id", id);
  const portfolioUrl = user.portfolio_public && user.handle ? `/portfolio/${user.handle}` : null;

  return (
    <>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <div className="stack" style={{ gap: 6 }}>
          <Link href="/projetos" className="small muted">
            ← Projetos
          </Link>
          <h1 className="page-title">{project.name}</h1>
          <div className="row">
            <span className="badge">{project.category}</span>
            {project.is_demo ? <span className="badge">Demonstração</span> : null}
          </div>
        </div>
        <DeleteProjectButton projectId={project.id} />
      </div>
      <div className="grid grid-3" style={{ alignItems: "start" }}>
        <div className="span-2">
          <EditProjectForm project={project} portfolioUrl={portfolioUrl} />
        </div>
        <div className="stack-lg">
          <StepsEditor key={steps.map((s) => `${s.id}:${s.done}`).join(",")} projectId={project.id} steps={steps} />
          <LinksEditor projectId={project.id} links={parseJson(project.links, [])} />
        </div>
      </div>
    </>
  );
}
