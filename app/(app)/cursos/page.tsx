import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Lock } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { listCourses } from "@/lib/content";
import { planOf } from "@/lib/access";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/Progress";

export const metadata: Metadata = { title: "Cursos" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const user = await requireOnboardedUser();
  const plan = await planOf(user);
  const { filtro } = await searchParams;
  const all = await listCourses(user.id);
  const courses = all.filter((c) =>
    filtro === "andamento" ? c.done > 0 && c.done < c.lessons : filtro === "gratuitos" ? !c.is_premium : filtro === "concluidos" ? c.lessons > 0 && c.done === c.lessons : true,
  );
  const filters = [
    { key: undefined, label: "Todos" },
    { key: "andamento", label: "Em andamento" },
    { key: "gratuitos", label: "Gratuitos" },
    { key: "concluidos", label: "Concluídos" },
  ];
  return (
    <>
      <PageHeader title="Catálogo de cursos" subtitle="Cursos gratuitos e premium. Todo curso premium tem aulas introdutórias abertas." />
      <div className="row" role="tablist" aria-label="Filtrar cursos">
        {filters.map((f) => (
          <Link key={f.label} href={f.key ? `/cursos?filtro=${f.key}` : "/cursos"} className={`chip${filtro === f.key ? " active" : ""}`} role="tab" aria-selected={filtro === f.key}>
            {f.label}
          </Link>
        ))}
      </div>
      {courses.length === 0 ? (
        <div className="card empty">Nenhum curso neste filtro.</div>
      ) : (
        <div className="grid grid-auto">
          {courses.map((c) => {
            const pct = c.lessons ? (c.done / c.lessons) * 100 : 0;
            return (
              <Link key={c.id} href={`/cursos/${c.slug}`} className="card card-hover stack">
                <div className="row between">
                  <span className="label">{c.trail_title}</span>
                  {c.is_premium ? (
                    <span className={`badge ${plan === "premium" ? "badge-accent" : "badge-warning"}`}>
                      {plan === "premium" ? "Premium" : <><Lock size={11} /> Premium</>}
                    </span>
                  ) : (
                    <span className="badge badge-success">Gratuito</span>
                  )}
                </div>
                <h2 style={{ fontSize: 18 }}>{c.title}</h2>
                <p className="small muted" style={{ flex: 1 }}>
                  {c.summary}
                </p>
                <div className="row small faint">
                  <Clock size={14} /> {Math.round(c.minutes / 60 * 10) / 10}h · {c.lessons} aulas
                </div>
                <Progress value={pct} small label={`Progresso em ${c.title}`} />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
