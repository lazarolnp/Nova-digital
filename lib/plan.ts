import "server-only";
import type { InStatement } from "@libsql/client";
import { all, batch, get, run } from "./db";
import { AREA_TO_TRAIL, type OnboardingAnswers, optionLabel } from "./options";
import { canAccessLesson, type PlanId } from "./access";

type Task = {
  kind: "aula" | "missao" | "projeto" | "acao";
  refId: number | null;
  title: string;
  detail: string;
  minutes: number;
};

const STUDY_DAYS: Record<string, number[]> = {
  "2-4": [1, 3, 5],
  "5-8": [1, 2, 4, 5],
  "9-15": [1, 2, 3, 4, 5],
  "16+": [1, 2, 3, 4, 5, 6],
};
const WEEKLY_MINUTES: Record<string, number> = { "2-4": 180, "5-8": 390, "9-15": 720, "16+": 1080 };

/** Aulas acessíveis de uma trilha inteira ou de um curso específico, na ordem do conteúdo. */
async function lessonsOf(where: { trail: string } | { course: string }, plan: PlanId): Promise<Task[]> {
  const byTrail = "trail" in where;
  const rows = await all<{ id: number; title: string; duration_min: number; is_premium: number; is_free_preview: number; course: string }>(
    `SELECT l.id, l.title, l.duration_min, c.is_premium, l.is_free_preview, c.title AS course
     FROM trails t JOIN courses c ON c.trail_id = t.id JOIN modules m ON m.course_id = c.id JOIN lessons l ON l.module_id = m.id
     WHERE ${byTrail ? "t.slug" : "c.slug"} = ? AND c.published = 1 ORDER BY c.sort, m.sort, l.sort`,
    byTrail ? where.trail : where.course,
  );
  return rows
    .filter((r) => canAccessLesson(plan, r.is_premium, r.is_free_preview))
    .map((r) => ({
      kind: "aula" as const,
      refId: r.id,
      title: r.title,
      detail: `${r.course} · assista e faça o exercício da aula`,
      // tempo de leitura + exercício
      minutes: r.duration_min + 20,
    }));
}

async function trailMissions(trailSlug: string, plan: PlanId): Promise<Task[]> {
  const rows = await all<{ id: number; title: string; est_minutes: number; is_premium: number }>(
    `SELECT m.id, m.title, m.est_minutes, m.is_premium FROM missions m JOIN trails t ON t.id = m.trail_id
     WHERE t.slug = ? AND m.published = 1 ORDER BY m.sort`,
    trailSlug,
  );
  return rows
    .filter((m) => plan === "premium" || !m.is_premium)
    .map((m) => ({ kind: "missao" as const, refId: m.id, title: m.title, detail: "Missão prática — registre o resultado ao concluir", minutes: m.est_minutes }));
}

async function missionBySlug(slug: string, plan: PlanId): Promise<Task | null> {
  const m = await get<{ id: number; title: string; est_minutes: number; is_premium: number }>(
    "SELECT id, title, est_minutes, is_premium FROM missions WHERE slug = ? AND published = 1",
    slug,
  );
  if (!m || (m.is_premium && plan !== "premium")) return null;
  return { kind: "missao", refId: m.id, title: m.title, detail: "Missão prática — registre o resultado ao concluir", minutes: m.est_minutes };
}

const action = (title: string, detail: string, minutes = 30): Task => ({ kind: "acao", refId: null, title, detail, minutes });

export async function buildPlan(a: OnboardingAnswers, plan: PlanId) {
  const focusTrail = AREA_TO_TRAIL[a.area] ?? "outras-formas";
  const queue: Task[] = [];
  const seen = new Set<string>();
  const push = (t: Task | null) => {
    if (!t) return;
    const key = `${t.kind}:${t.refId ?? t.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    queue.push(t);
  };

  // 1. Fundamentos (completos para quem está começando)
  const foundation = await lessonsOf({ course: "fundamentos-marketing-digital" }, plan);
  const exploring = a.area === "indefinido" || a.area === "outras";
  if (a.level === "intermediario" && !exploring) {
    foundation.filter((l) => /golpes|rotina/i.test(l.title)).forEach(push);
  } else {
    foundation.forEach(push);
  }
  push(await missionBySlug("rotina-de-estudos", plan));
  push(
    a.budget === "zero"
      ? action("Monte seu kit de ferramentas gratuitas", "Na Biblioteca de Ferramentas, filtre por \"Gratuito\" e escolha uma ferramenta por categoria que você vai usar.", 30)
      : action("Defina um teto de gastos para o mês", "Decida quanto pode investir em ferramentas e testes e anote. Comece pelas opções gratuitas e só pague quando houver necessidade clara.", 20),
  );
  push(await missionBySlug("mapa-do-mercado", plan));

  // 2. Trilha de foco (ou exploração quando ainda não há área definida)
  if (exploring) {
    const intro =
      a.area === "outras"
        ? ["trafego-pago-do-zero", "infoprodutos-do-zero", "edicao-de-videos-com-ia", "ia-no-trabalho-digital", "primeiros-clientes"]
        : ["afiliados-do-zero", "low-ticket-na-pratica", "dropshipping-na-pratica", "sites-e-landing-pages", "saas-do-zero", "trafego-pago-do-zero"];
    for (const course of intro) (await lessonsOf({ course }, plan)).slice(0, 1).forEach(push);
    push(
      action(
        "Escolha sua área de foco",
        "Depois de experimentar as aulas introdutórias, refaça seu plano em Minha conta escolhendo a área que mais combinou com você.",
        20,
      ),
    );
  } else {
    (await lessonsOf({ trail: focusTrail }, plan)).forEach(push);
    (await trailMissions(focusTrail, plan)).forEach(push);
  }
  (await lessonsOf({ course: "ia-no-trabalho-digital" }, plan)).slice(0, 1).forEach(push);
  push(await missionBySlug("kit-de-prompts", plan));

  if (a.area === "dropshipping" && a.budget === "zero") {
    push(
      action(
        "Planeje antes de investir",
        "Dropshipping costuma exigir verba para pedidos de teste e anúncios. Monte a loja de teste e a planilha de margem antes de colocar dinheiro.",
        20,
      ),
    );
  }

  // 3. Portfólio
  push({
    kind: "projeto",
    refId: null,
    title: "Crie seu primeiro projeto de portfólio",
    detail: "Em Projetos, use um modelo demonstrativo da sua área e registre as etapas.",
    minutes: 60,
  });

  // 4. Caminho conforme preferência e objetivo
  if (a.goal === "negocio") {
    push(action("Aplique no seu negócio", "Escolha uma ação aprendida (página, criativo, conteúdo ou loja) e aplique no seu próprio negócio. Registre o antes e o depois.", 90));
  } else if (a.preference === "servicos") {
    (await lessonsOf({ course: "primeiros-clientes" }, plan)).forEach(push);
    push(await missionBySlug("portfolio-tres-projetos", plan));
    push(await missionBySlug("pesquisa-dez-clientes", plan));
    push(await missionBySlug("pratica-abordagem", plan));
  } else if (a.preference === "produtos" && !["afiliados", "dropshipping", "lowticket"].includes(a.area)) {
    (await lessonsOf({ course: "afiliados-do-zero" }, plan)).slice(0, 2).forEach(push);
    (await lessonsOf({ course: "infoprodutos-do-zero" }, plan)).slice(0, 1).forEach(push);
  } else if (a.preference === "conteudo") {
    (await lessonsOf({ course: "edicao-de-videos-com-ia" }, plan)).slice(0, 2).forEach(push);
    push(await missionBySlug("primeiro-video-curto", plan));
  }

  // ---- Distribuição nos 30 dias ----
  const studyDays = STUDY_DAYS[a.hours] ?? STUDY_DAYS["2-4"];
  const perDay = Math.round((WEEKLY_MINUTES[a.hours] ?? 180) / studyDays.length);
  const items: (Task & { day: number; week: number })[] = [];
  let qi = 0;

  for (let day = 1; day <= 28; day++) {
    const week = Math.ceil(day / 7);
    const weekday = ((day - 1) % 7) + 1;
    if (weekday === 7) {
      items.push({
        ...action("Revisão da semana", "Veja o que concluiu, anote dificuldades e ajuste a próxima semana.", 15),
        day,
        week,
      });
      continue;
    }
    if (!studyDays.includes(weekday)) continue;
    let used = 0;
    while (qi < queue.length) {
      const t = queue[qi];
      if (used > 0 && used + t.minutes > perDay) break;
      items.push({ ...t, day, week });
      used += t.minutes;
      qi++;
      if (used >= perDay) break;
    }
    if (used === 0) {
      items.push({
        ...action("Prática livre", "Refaça um exercício, melhore um projeto do portfólio ou peça ao Assistente IA um desafio da sua área.", Math.min(perDay, 60)),
        day,
        week,
      });
    }
  }
  items.push({ ...action("Atualize seu portfólio", "Revise os projetos, complete descrições e links, e marque o que está concluído.", 45), day: 29, week: 5 });
  items.push({
    ...action("Planeje os próximos 30 dias", "Reveja o que concluiu, o que ficou pendente e refaça seu plano em Minha Conta para continuar evoluindo.", 30),
    day: 30,
    week: 5,
  });

  const weeklyGoals = [1, 2, 3, 4, 5].map((w) => {
    const ws = items.filter((i) => i.week === w);
    const lessons = ws.filter((i) => i.kind === "aula").length;
    const missions = ws.filter((i) => i.kind === "missao").length;
    const parts = [];
    if (lessons) parts.push(`${lessons} ${lessons === 1 ? "aula" : "aulas"}`);
    if (missions) parts.push(`${missions} ${missions === 1 ? "missão" : "missões"}`);
    if (ws.some((i) => i.kind === "projeto")) parts.push("1 projeto de portfólio");
    const label = w === 5 ? "Dias 29–30" : `Semana ${w}`;
    return parts.length ? `${label}: concluir ${parts.join(", ")}.` : `${label}: revisar, praticar e organizar o portfólio.`;
  });

  const summary =
    `Plano montado para quem está "${optionLabel("level", a.level).toLowerCase()}", com foco em ${optionLabel("area", a.area).toLowerCase()}, ` +
    `${optionLabel("hours", a.hours).toLowerCase()} por semana e objetivo de ${optionLabel("goal", a.goal).toLowerCase()}. ` +
    `Ele organiza estudo e prática em etapas; resultados como clientes ou renda dependem de vários fatores e não têm prazo garantido.`;

  const leftover = queue.length - qi;
  return { items, weeklyGoals, summary, leftover };
}

export async function saveOnboardingAndPlan(userId: number, a: OnboardingAnswers, plan: PlanId) {
  const built = await buildPlan(a, plan);
  // O plano novo é referenciado por subconsulta, permitindo gravar tudo num único lote atômico.
  const planRef = "(SELECT MAX(id) FROM plans WHERE user_id = ?)";
  const stmts: InStatement[] = [
    {
      sql: `INSERT INTO onboarding (user_id, level, area, hours, budget, goal, preference, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET level = excluded.level, area = excluded.area, hours = excluded.hours,
              budget = excluded.budget, goal = excluded.goal, preference = excluded.preference, updated_at = excluded.updated_at`,
      args: [userId, a.level, a.area, a.hours, a.budget, a.goal, a.preference],
    },
    { sql: "DELETE FROM plan_items WHERE plan_id IN (SELECT id FROM plans WHERE user_id = ?)", args: [userId] },
    { sql: "DELETE FROM plans WHERE user_id = ?", args: [userId] },
    {
      sql: "INSERT INTO plans (user_id, summary, weekly_goals, inputs) VALUES (?, ?, ?, ?)",
      args: [
        userId,
        built.summary + (built.leftover > 0 ? ` Ainda há ${built.leftover} atividades da sua trilha para o próximo ciclo.` : ""),
        JSON.stringify(built.weeklyGoals),
        JSON.stringify(a),
      ],
    },
    ...built.items.map((it) => ({
      sql: `INSERT INTO plan_items (plan_id, day, week, kind, ref_id, title, detail, est_minutes) VALUES (${planRef}, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, it.day, it.week, it.kind, it.refId, it.title, it.detail, it.minutes],
    })),
    // Marca como concluídas as aulas/missões que o usuário já concluiu antes de refazer o plano.
    {
      sql: `UPDATE plan_items SET done_at = datetime('now') WHERE plan_id = ${planRef} AND (
              (kind = 'aula' AND ref_id IN (SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND completed_at IS NOT NULL)) OR
              (kind = 'missao' AND ref_id IN (SELECT mission_id FROM mission_progress WHERE user_id = ? AND status = 'concluida')))`,
      args: [userId, userId, userId],
    },
    { sql: "UPDATE users SET onboarded = 1 WHERE id = ?", args: [userId] },
  ];
  await batch(stmts);
}

/** Mantém o plano sincronizado quando o usuário conclui aulas ou missões fora dele. */
export async function syncPlanItem(userId: number, kind: "aula" | "missao", refId: number, done: boolean) {
  await run(
    `UPDATE plan_items SET done_at = ${done ? "COALESCE(done_at, datetime('now'))" : "NULL"}
     WHERE kind = ? AND ref_id = ? AND plan_id IN (SELECT id FROM plans WHERE user_id = ?)`,
    kind,
    refId,
    userId,
  );
}
