import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, BookOpen, FileText, CalendarCheck, FolderKanban, Sparkles, Target, Trophy, Wrench } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { listCourses } from "@/lib/content";
import { AREA_TO_TRAIL, PROJECT_STATUS } from "@/lib/options";
import { JOURNEY_STAGES, journeyStage, levelFor, totalXp, userStats, xpByDay } from "@/lib/progress";
import { currentPlan, itemHref } from "@/lib/planview";
import { Progress } from "@/components/Progress";
import { PlanItemRow } from "@/components/PlanItemRow";
import { XpChart } from "@/components/XpChart";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const onboarding = await get<{ area: string }>("SELECT area FROM onboarding WHERE user_id = ?", user.id);
  const focusTrail = AREA_TO_TRAIL[onboarding?.area ?? "indefinido"];
  const focusCourse = await get<{ id: number }>("SELECT c.id FROM courses c JOIN trails t ON t.id = c.trail_id WHERE t.slug = ? ORDER BY c.sort LIMIT 1", focusTrail);

  const xp = await totalXp(user.id);
  const level = levelFor(xp);
  const stats = await userStats(user.id);
  const stage = await journeyStage(user.id, focusCourse?.id ?? null);
  const plan = await currentPlan(user.id);
  const courses = await listCourses(user.id);
  const inProgress = courses.filter((c) => c.done > 0 && c.done < c.lessons);
  const completed = courses.filter((c) => c.lessons > 0 && c.done === c.lessons);
  const focus = courses.find((c) => c.id === focusCourse?.id);
  const learning = [...inProgress, ...(focus && !inProgress.includes(focus) && focus.done < focus.lessons ? [focus] : [])];
  const projects = await all<{ id: number; name: string; status: string; category: string; steps: number; done: number }>(
    `SELECT p.id, p.name, p.status, p.category, COUNT(s.id) AS steps, COALESCE(SUM(s.done), 0) AS done
     FROM projects p LEFT JOIN project_steps s ON s.project_id = p.id
     WHERE p.user_id = ? AND p.status <> 'concluido' GROUP BY p.id ORDER BY p.updated_at DESC LIMIT 3`,
    user.id,
  );
  const weekItems = plan?.items.filter((i) => i.week === plan.week) ?? [];
  const next = plan?.items.find((i) => !i.done_at && i.day >= plan.today) ?? plan?.items.find((i) => !i.done_at);
  const skills = Array.from(new Set(learning.concat(completed).flatMap((c) => c.skills.split(",").map((s) => s.trim()).filter(Boolean)))).slice(0, 8);
  const chart = await xpByDay(user.id, 14);

  return (
    <>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Olá, {user.name.split(" ")[0]}!</h1>
          <p className="page-subtitle">
            Etapa atual da sua jornada: <strong style={{ color: "var(--text)" }}>{stage.title}</strong> — {stage.description}
          </p>
        </div>
        <Link href="/plano" className="btn btn-primary">
          <CalendarCheck size={16} /> Ver plano de 30 dias
        </Link>
      </div>

      <div className="grid grid-4">
        <div className="card">
          <div className="label">Nível {level.level}</div>
          <div className="stat">{level.name}</div>
          <div style={{ marginTop: 10 }}>
            <Progress value={level.pct} small label="Progresso até o próximo nível" />
          </div>
          <p className="tiny faint" style={{ marginTop: 6 }}>
            {xp} XP{level.nextAt ? ` · ${level.nextAt - xp} XP para ${level.next}` : " · nível máximo"}
          </p>
        </div>
        <div className="card">
          <div className="label">Evolução no plano</div>
          <div className="stat">{plan?.pct ?? 0}%</div>
          <p className="tiny faint" style={{ marginTop: 6 }}>
            {plan ? `${plan.done} de ${plan.items.length} tarefas · dia ${plan.today} de 30` : "Plano ainda não gerado"}
          </p>
        </div>
        <div className="card">
          <div className="label">Aulas concluídas</div>
          <div className="stat">{stats.lessonsDone}</div>
          <p className="tiny faint" style={{ marginTop: 6 }}>
            {completed.length} {completed.length === 1 ? "curso concluído" : "cursos concluídos"}
          </p>
        </div>
        <div className="card">
          <div className="label">Missões concluídas</div>
          <div className="stat">{stats.missionsDone}</div>
          <p className="tiny faint" style={{ marginTop: 6 }}>
            {stats.streak > 0 ? `${stats.streak} ${stats.streak === 1 ? "dia" : "dias"} seguidos de atividade` : "Registre atividade hoje para iniciar uma sequência"}
          </p>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card span-2">
          <div className="card-head">
            <div>
              <h2 className="card-title">Plano de ação da semana</h2>
              {plan ? <p className="small muted">{plan.goals[plan.week - 1] ?? ""}</p> : null}
            </div>
            <Link href="/plano" className="btn btn-sm">
              Plano completo
            </Link>
          </div>
          {plan && weekItems.length ? (
            <div className="list">
              {weekItems.slice(0, 6).map((i) => (
                <PlanItemRow key={i.id} item={i} href={itemHref(i)} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>Você ainda não tem um plano ativo.</p>
              <Link href="/onboarding" className="btn btn-primary btn-sm">
                Gerar meu plano
              </Link>
            </div>
          )}
        </div>
        <div className="stack-lg">
          <div className="card" style={{ borderColor: "var(--accent)" }}>
            <div className="row" style={{ gap: 8 }}>
              <Sparkles size={16} color="var(--accent-text)" />
              <span className="label">Próxima tarefa recomendada</span>
            </div>
            {next ? (
              <>
                <h3 style={{ marginTop: 10, fontSize: 17 }}>{next.title}</h3>
                <p className="small muted" style={{ marginTop: 6 }}>
                  {next.detail}
                </p>
                <Link href={itemHref(next) ?? "/plano"} className="btn btn-primary btn-block" style={{ marginTop: 14 }}>
                  Começar agora <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <p className="small muted" style={{ marginTop: 10 }}>
                Você concluiu todas as tarefas do plano. Refaça seu plano em Minha conta para o próximo ciclo.
              </p>
            )}
          </div>
          <div className="card">
            <h2 className="card-title">Jornada no marketing digital</h2>
            <ol className="stack" style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
              {JOURNEY_STAGES.map((s) => (
                <li key={s.n} className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                  <span
                    className="badge"
                    style={
                      s.n === stage.n
                        ? { background: "linear-gradient(135deg,var(--accent),var(--accent-2))", color: "#fff", borderColor: "transparent" }
                        : s.n < stage.n
                          ? { background: "var(--success-soft)", color: "var(--success)", borderColor: "transparent" }
                          : undefined
                    }
                  >
                    {s.n}
                  </span>
                  <span className={s.n > stage.n ? "muted small" : "small"} style={{ fontWeight: s.n === stage.n ? 750 : 500 }}>
                    {s.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Cursos em andamento</h2>
            <Link href="/cursos" className="small" style={{ color: "var(--accent-text)" }}>
              Catálogo
            </Link>
          </div>
          {learning.length ? (
            <div className="stack">
              {learning.slice(0, 4).map((c) => {
                const pct = c.lessons ? (c.done / c.lessons) * 100 : 0;
                return (
                  <Link key={c.id} href={`/cursos/${c.slug}`} className="stack" style={{ gap: 6 }}>
                    <div className="row between">
                      <span style={{ fontWeight: 650 }} className="small">
                        {c.title}
                      </span>
                      <span className="tiny faint">{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} small label={`Progresso em ${c.title}`} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty small">
              <BookOpen size={22} />
              Nenhum curso iniciado ainda.
              <Link href="/trilhas" className="btn btn-sm">
                Explorar trilhas
              </Link>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Projetos em desenvolvimento</h2>
            <Link href="/projetos" className="small" style={{ color: "var(--accent-text)" }}>
              Todos
            </Link>
          </div>
          {projects.length ? (
            <div className="list">
              {projects.map((p) => (
                <Link key={p.id} href={`/projetos/${p.id}`} className="list-item">
                  <div className="icon-box">
                    <FolderKanban size={17} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="small" style={{ fontWeight: 650 }}>
                      {p.name}
                    </div>
                    <div className="tiny faint">
                      {PROJECT_STATUS[p.status]} · {p.done}/{p.steps} etapas
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty small">
              <FolderKanban size={22} />
              Nenhum projeto em andamento.
              <Link href="/projetos" className="btn btn-sm">
                Criar projeto
              </Link>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="card-title">Habilidades em desenvolvimento</h2>
          {skills.length ? (
            <div className="row" style={{ marginTop: 14 }}>
              {skills.map((s) => (
                <span key={s} className="badge badge-accent">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="small muted" style={{ marginTop: 12 }}>
              Conclua aulas para começar a desenvolver habilidades.
            </p>
          )}
          <h3 className="label" style={{ marginTop: 22 }}>
            Atalhos
          </h3>
          <div className="grid grid-2" style={{ marginTop: 10, gap: 8 }}>
            <Link href="/missoes" className="btn btn-sm">
              <Target size={14} /> Missões
            </Link>
            <Link href="/ferramentas" className="btn btn-sm">
              <Wrench size={14} /> Ferramentas
            </Link>
            <Link href="/assistente" className="btn btn-sm">
              <Bot size={14} /> Assistente
            </Link>
            <Link href="/conta#conquistas" className="btn btn-sm">
              <Trophy size={14} /> Conquistas
            </Link>
            <Link href="/trilhas" className="btn btn-sm">
              <BookOpen size={14} /> Trilhas
            </Link>
            <a href="/api/guias/como-funciona" className="btn btn-sm">
              <FileText size={14} /> Guia PDF
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Evolução das suas atividades</h2>
            <p className="small muted">XP ganho por dia nos últimos 14 dias (aulas, missões, projetos e tarefas do plano).</p>
          </div>
        </div>
        <XpChart data={chart} />
      </div>
    </>
  );
}
