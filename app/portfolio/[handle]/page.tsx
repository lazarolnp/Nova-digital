import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { all, get, parseJson } from "@/lib/db";
import { PROJECT_STATUS } from "@/lib/options";
import { PublicFooter, PublicNav } from "@/components/PublicNav";

export const dynamic = "force-dynamic";

async function owner(handle: string) {
  return await get<{ id: number; name: string; bio: string }>("SELECT id, name, bio FROM users WHERE handle = ? AND portfolio_public = 1", handle);
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const u = await owner((await params).handle);
  return { title: u ? `Portfólio de ${u.name}` : "Portfólio", robots: { index: false } };
}

export default async function PortfolioPage({ params }: { params: Promise<{ handle: string }> }) {
  const u = await owner((await params).handle);
  if (!u) notFound();
  const projects = await all<{ id: number; name: string; category: string; description: string; objective: string; results: string; status: string; links: string; is_demo: number }>(
    "SELECT id, name, category, description, objective, results, status, links, is_demo FROM projects WHERE user_id = ? AND is_public = 1 ORDER BY updated_at DESC",
    u.id,
  );
  return (
    <>
      <PublicNav />
      <main className="section stack-lg">
        <div>
          <span className="label">Portfólio</span>
          <h1 className="section-title" style={{ marginTop: 6 }}>
            {u.name}
          </h1>
          {u.bio ? <p className="section-lead">{u.bio}</p> : null}
        </div>
        {projects.length === 0 ? (
          <div className="card empty">Nenhum projeto publicado ainda.</div>
        ) : (
          <div className="grid grid-2">
            {projects.map((p) => (
              <article key={p.id} className="card stack">
                <div className="row between">
                  <span className="label">{p.category}</span>
                  <div className="row">
                    {p.is_demo ? <span className="badge">Projeto demonstrativo</span> : null}
                    <span className="badge">{PROJECT_STATUS[p.status]}</span>
                  </div>
                </div>
                <h2 style={{ fontSize: 19 }}>{p.name}</h2>
                {p.objective ? (
                  <p className="small">
                    <strong>Objetivo:</strong> {p.objective}
                  </p>
                ) : null}
                {p.description ? <p className="small muted" style={{ whiteSpace: "pre-wrap" }}>{p.description}</p> : null}
                {p.results ? (
                  <p className="small" style={{ whiteSpace: "pre-wrap" }}>
                    <strong>Resultados e aprendizados:</strong> {p.results}
                  </p>
                ) : null}
                <div className="row">
                  {parseJson<{ title: string; url: string }[]>(p.links, []).map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-sm">
                      {l.title} <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
