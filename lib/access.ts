import "server-only";
import { all, get, run } from "./db";
import type { User } from "./auth";

export type PlanId = "free" | "premium";

export async function getSetting(key: string, fallback = ""): Promise<string> {
  return (await get<{ value: string }>("SELECT value FROM settings WHERE key = ?", key))?.value ?? fallback;
}

export async function setSetting(key: string, value: string) {
  await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, value);
}

export async function allSettings(): Promise<Record<string, string>> {
  return Object.fromEntries((await all<{ key: string; value: string }>("SELECT key, value FROM settings")).map((r) => [r.key, r.value]));
}

export type Subscription = {
  id: number;
  plan: string;
  status: string;
  provider: string;
  current_period_end: string | null;
};

export async function activeSubscription(userId: number): Promise<Subscription | undefined> {
  return await get<Subscription>(
    `SELECT id, plan, status, provider, current_period_end FROM subscriptions
     WHERE user_id = ? AND status = 'active' AND (current_period_end IS NULL OR current_period_end > ?)
     ORDER BY id DESC LIMIT 1`,
    userId,
    new Date().toISOString(),
  );
}

/** Plano efetivo do usuário. Administradores têm acesso completo para revisar conteúdo. */
export async function planOf(user: Pick<User, "id" | "role">): Promise<PlanId> {
  if (user.role === "admin") return "premium";
  return await activeSubscription(user.id) ? "premium" : "free";
}

export async function limit(plan: PlanId, name: "ai_messages_per_day" | "max_projects"): Promise<number> {
  const raw = await getSetting(`limit.${plan}.${name}`, "0");
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function canAccessPremium(plan: PlanId, isPremiumContent: boolean | number) {
  return !isPremiumContent || plan === "premium";
}

export function canAccessLesson(plan: PlanId, coursePremium: number, lessonPreview: number) {
  return plan === "premium" || !coursePremium || lessonPreview === 1;
}

// ---- Uso diário do assistente ----
function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function aiUsageToday(userId: number): Promise<number> {
  return (await get<{ count: number }>("SELECT count FROM ai_usage WHERE user_id = ? AND day = ?", userId, today()))?.count ?? 0;
}

/** Reserva uma mensagem do limite diário. Retorna false se o limite foi atingido. */
export async function consumeAiQuota(userId: number, plan: PlanId): Promise<boolean> {
  const max = await limit(plan, "ai_messages_per_day");
  const used = await aiUsageToday(userId);
  if (used >= max) return false;
  await run(
    `INSERT INTO ai_usage (user_id, day, count) VALUES (?, ?, 1)
     ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1`,
    userId,
    today(),
  );
  return true;
}

export async function refundAiQuota(userId: number) {
  await run("UPDATE ai_usage SET count = MAX(count - 1, 0) WHERE user_id = ? AND day = ?", userId, today());
}
