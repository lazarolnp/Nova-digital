import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { currentPlan, itemHref } from "@/lib/planview";
import { PageHeader } from "@/components/PageHeader";
import { PlanItemRow } from "@/components/PlanItemRow";
import { Progress } from "@/components/Progress";

export const metadata: Metadata = { title: "Plano de 30 dias" };

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
  const user = await requireOnboardedUser();
  const { novo } = await searchParams;
  const plan = await currentPlan(user.id);
  const refazer = (
    <Link href="/onboarding" className="btn">
      <RefreshCw size={15} /> Refazer plano
    </Link>
  );

  if (!plan) {
    return (
      <>
        <PageHeader title="Plano de 30 dias" actions={refazer} />
        <div className="card empty">
          <p>Você ainda não tem um plano.</p>
          <Link href="/onboarding" className="btn btn-primary">
            Gerar meu plano
          </Link>
        </div>
      </>
    );
  }

  const weeks = [1, 2, 3, 4, 5];
  return (
    <>
      <PageHeader title="Plano de 30 dias" subtitle="Estudo e prática organizados para a sua rotina." actions={refazer} />
      {novo ? (
        <div className="alert alert-success" role="status">
          Seu plano foi gerado! Comece pelas tarefas da semana 1.
        </div>
      ) : null}
      <div className="grid grid-3">
        <div className="card span-2">
          <h2 className="card-title">Resumo</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            {plan.summary}
          </p>
          <ul className="small" style={{ marginTop: 14, paddingLeft: 18 }}>
            {plan.goals.map((g) => (
              <li key={g} style={{ margin: "4px 0" }}>
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="label">Progresso do plano</div>
          <div className="stat">{plan.pct}%</div>
          <div style={{ marginTop: 10 }}>
            <Progress value={plan.pct} label="Progresso do plano" />
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>
            {plan.done} de {plan.items.length} tarefas concluídas. Hoje é o dia {plan.today} do seu plano.
          </p>
          <p className="tiny faint" style={{ marginTop: 10 }}>
            Aulas e missões são marcadas automaticamente ao serem concluídas. Ações e projetos você marca aqui.
          </p>
        </div>
      </div>

      {weeks.map((w) => {
        const items = plan.items.filter((i) => i.week === w);
        if (!items.length) return null;
        const done = items.filter((i) => i.done_at).length;
        const days = Array.from(new Set(items.map((i) => i.day)));
        return (
          <section key={w} className="card" aria-labelledby={`semana-${w}`} style={w === plan.week ? { borderColor: "var(--accent)" } : undefined}>
            <div className="card-head">
              <div>
                <h2 id={`semana-${w}`} className="card-title">
                  {w === 5 ? "Dias 29 e 30 — fechamento" : `Semana ${w}`} {w === plan.week ? <span className="badge badge-accent">Semana atual</span> : null}
                </h2>
                <p className="small muted">{plan.goals[w - 1]}</p>
              </div>
              <span className="small muted">
                {done}/{items.length} concluídas
              </span>
            </div>
            {days.map((d) => (
              <div key={d} style={{ marginTop: 6 }}>
                <div className="label" style={{ marginTop: 10, color: d === plan.today ? "var(--accent-text)" : undefined }}>
                  Dia {d}
                  {d === plan.today ? " · hoje" : ""}
                </div>
                <div className="list">
                  {items
                    .filter((i) => i.day === d)
                    .map((i) => (
                      <PlanItemRow key={i.id} item={i} href={itemHref(i)} />
                    ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}
