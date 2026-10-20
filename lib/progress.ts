import "server-only";
import { all, get, run } from "./db";

export const LEVELS = [
  { min: 0, name: "Iniciante" },
  { min: 100, name: "Explorador" },
  { min: 300, name: "Praticante" },
  { min: 650, name: "Executor" },
  { min: 1100, name: "Construtor" },
  { min: 1700, name: "Profissional em formação" },
];

export const XP = { lesson: 10, planItem: 5, project: 40 } as const;

export function levelFor(xp: number) {
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (xp >= l.min) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  const pct = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;
  return { level: index + 1, name: current.name, next: next?.name ?? null, nextAt: next?.min ?? null, pct };
}

export async function totalXp(userId: number): Promise<number> {
  return (await get<{ xp: number }>("SELECT COALESCE(SUM(xp), 0) AS xp FROM xp_events WHERE user_id = ?", userId))?.xp ?? 0;
}

/** Concede XP uma única vez por (tipo, referência). */
export async function awardXp(userId: number, kind: string, ref: string | number, xp: number) {
  await run("INSERT OR IGNORE INTO xp_events (user_id, kind, ref, xp) VALUES (?, ?, ?, ?)", userId, kind, String(ref), xp);
}

export async function revokeXp(userId: number, kind: string, ref: string | number) {
  await run("DELETE FROM xp_events WHERE user_id = ? AND kind = ? AND ref = ?", userId, kind, String(ref));
}

export async function notify(userId: number, kind: "sistema" | "conquista" | "progresso", title: string, body = "", link = "") {
  await run("INSERT INTO notifications (user_id, kind, title, body, link) VALUES (?, ?, ?, ?, ?)", userId, kind, title, body, link);
}

export async function unreadCount(userId: number): Promise<number> {
  return (await get<{ n: number }>("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL", userId))?.n ?? 0;
}

// ---- Estatísticas ----
export type UserStats = {
  lessonsDone: number;
  missionsDone: number;
  projectsDone: number;
  projectsTotal: number;
  trailsDone: number;
  planWeeksDone: number;
  streak: number;
};

export async function activityDays(userId: number): Promise<string[]> {
  return (await all<{ d: string }>(
    "SELECT DISTINCT date(created_at) AS d FROM xp_events WHERE user_id = ? ORDER BY d DESC LIMIT 60",
    userId,
  )).map((r) => r.d);
}

function currentStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const cursor = new Date();
  // A sequência continua válida se a última atividade foi hoje ou ontem.
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function userStats(userId: number): Promise<UserStats> {
  const lessonsDone =
    (await get<{ n: number }>("SELECT COUNT(*) AS n FROM lesson_progress WHERE user_id = ? AND completed_at IS NOT NULL", userId))?.n ?? 0;
  const missionsDone =
    (await get<{ n: number }>("SELECT COUNT(*) AS n FROM mission_progress WHERE user_id = ? AND status = 'concluida'", userId))?.n ?? 0;
  const projects = await get<{ total: number; done: number }>(
    "SELECT COUNT(*) AS total, COALESCE(SUM(status = 'concluido'), 0) AS done FROM projects WHERE user_id = ?",
    userId,
  );
  const trailsDone =
    (await get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM (
         SELECT c.id FROM courses c JOIN modules m ON m.course_id = c.id JOIN lessons l ON l.module_id = m.id
         LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ? AND lp.completed_at IS NOT NULL
         WHERE c.published = 1
         GROUP BY c.id HAVING COUNT(l.id) > 0 AND COUNT(l.id) = COUNT(lp.lesson_id)
       )`,
      userId,
    ))?.n ?? 0;
  const planWeeksDone =
    (await get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM (
         SELECT pi.week FROM plan_items pi
         WHERE pi.plan_id = (SELECT id FROM plans WHERE user_id = ? ORDER BY id DESC LIMIT 1)
         GROUP BY pi.week HAVING SUM(pi.done_at IS NULL) = 0
       )`,
      userId,
    ))?.n ?? 0;
  return {
    lessonsDone,
    missionsDone,
    projectsDone: projects?.done ?? 0,
    projectsTotal: projects?.total ?? 0,
    trailsDone,
    planWeeksDone,
    streak: currentStreak(await activityDays(userId)),
  };
}

// ---- Conquistas ----
export const ACHIEVEMENTS: { code: string; title: string; description: string; test: (s: UserStats) => boolean }[] = [
  { code: "primeira-aula", title: "Primeira aula", description: "Concluiu sua primeira aula.", test: (s) => s.lessonsDone >= 1 },
  { code: "dez-aulas", title: "Ritmo de estudo", description: "Concluiu 10 aulas.", test: (s) => s.lessonsDone >= 10 },
  { code: "primeira-missao", title: "Mão na massa", description: "Concluiu sua primeira missão prática.", test: (s) => s.missionsDone >= 1 },
  { code: "cinco-missoes", title: "Executor consistente", description: "Concluiu 5 missões práticas.", test: (s) => s.missionsDone >= 5 },
  { code: "trilha-concluida", title: "Trilha concluída", description: "Concluiu todas as aulas de um curso.", test: (s) => s.trailsDone >= 1 },
  { code: "portfolio-3", title: "Portfólio em construção", description: "Concluiu 3 projetos.", test: (s) => s.projectsDone >= 3 },
  { code: "semana-plano", title: "Semana completa", description: "Concluiu todas as tarefas de uma semana do plano.", test: (s) => s.planWeeksDone >= 1 },
  { code: "sequencia-7", title: "Sete dias seguidos", description: "Registrou atividade por 7 dias consecutivos.", test: (s) => s.streak >= 7 },
];

/** Verifica conquistas novas, registra e notifica. Deve ser chamada após ações de progresso. */
export async function checkAchievements(userId: number) {
  const stats = await userStats(userId);
  const unlocked = new Set(
    (await all<{ code: string }>("SELECT code FROM user_achievements WHERE user_id = ?", userId)).map((r) => r.code),
  );
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.code) && a.test(stats)) {
      await run("INSERT OR IGNORE INTO user_achievements (user_id, code) VALUES (?, ?)", userId, a.code);
      await notify(userId, "conquista", `Conquista desbloqueada: ${a.title}`, a.description, "/conta#conquistas");
    }
  }
}

export async function unlockedAchievements(userId: number) {
  const rows = await all<{ code: string; unlocked_at: string }>(
    "SELECT code, unlocked_at FROM user_achievements WHERE user_id = ?",
    userId,
  );
  const map = new Map(rows.map((r) => [r.code, r.unlocked_at]));
  return ACHIEVEMENTS.map((a) => ({ code: a.code, title: a.title, description: a.description, unlockedAt: map.get(a.code) ?? null }));
}

/** XP por dia nos últimos N dias (para o gráfico de evolução). */
export async function xpByDay(userId: number, days = 14) {
  const rows = await all<{ d: string; xp: number }>(
    "SELECT date(created_at) AS d, SUM(xp) AS xp FROM xp_events WHERE user_id = ? AND date(created_at) >= date('now', ?) GROUP BY d",
    userId,
    `-${days - 1} days`,
  );
  const map = new Map(rows.map((r) => [r.d, r.xp]));
  const out: { day: string; xp: number }[] = [];
  const cursor = new Date();
  cursor.setUTCDate(cursor.getUTCDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const key = cursor.toISOString().slice(0, 10);
    out.push({ day: key, xp: map.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

// ---- Jornada ----
export const JOURNEY_STAGES = [
  { n: 1, title: "Fundamentos", description: "Entender o mercado e os modelos de trabalho." },
  { n: 2, title: "Habilidade principal", description: "Aprender a área escolhida com profundidade." },
  { n: 3, title: "Prática", description: "Executar missões e aplicar o que aprendeu." },
  { n: 4, title: "Portfólio", description: "Reunir projetos que demonstram suas habilidades." },
  { n: 5, title: "Primeiros clientes", description: "Prospectar, propor e entregar com método." },
];

export async function journeyStage(userId: number, focusCourseId: number | null) {
  const pct = async (courseId: number | null) => {
    if (!courseId) return 0;
    const r = await get<{ total: number; done: number }>(
      `SELECT COUNT(l.id) AS total, COUNT(lp.lesson_id) AS done
       FROM modules m JOIN lessons l ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ? AND lp.completed_at IS NOT NULL
       WHERE m.course_id = ?`,
      userId,
      courseId,
    );
    return r && r.total ? r.done / r.total : 0;
  };
  const foundation = (await get<{ id: number }>("SELECT id FROM courses WHERE slug = 'fundamentos-marketing-digital'"))?.id ?? null;
  const stats = await userStats(userId);
  let stage = 1;
  if ((await pct(foundation)) >= 0.8) stage = 2;
  if (stage === 2 && (focusCourseId === foundation || (await pct(focusCourseId)) >= 0.5)) stage = 3;
  if (stage === 3 && stats.missionsDone >= 2) stage = 4;
  if (stage === 4 && stats.projectsDone >= 3) stage = 5;
  return JOURNEY_STAGES[stage - 1];
}
