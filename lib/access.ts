import "server-only";
import { all, get, run } from "./db";
import type { User } from "./auth";

export type PlanId = "free" | "premium";

export function getSetting(key: string, fallback = ""): string {
  return get<{ value: string }>("SELECT value FROM settings WHERE key = ?", key)?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, value);
}

export function allSettings(): Record<string, string> {
  return Object.fromEntries(all<{ key: string; value: string }>("SELECT key, value FROM settings").map((r) => [r.key, r.value]));
}

export type Subscription = {
  id: number;
  plan: string;
  status: string;
  provider: string;
  current_period_end: string | null;
};

export function activeSubscription(userId: number): Subscription | undefined {
  return get<Subscription>(
    `SELECT id, plan, status, provider, current_period_end FROM subscriptions
     WHERE user_id = ? AND status = 'active' AND (current_period_end IS NULL OR current_period_end > ?)
     ORDER BY id DESC LIMIT 1`,
    userId,
    new Date().toISOString(),
  );
}

/** Plano efetivo do usuário. Administradores têm acesso completo para revisar conteúdo. */
export function planOf(user: Pick<User, "id" | "role">): PlanId {
  if (user.role === "admin") return "premium";
  return activeSubscription(user.id) ? "premium" : "free";
}

export function limit(plan: PlanId, name: "ai_messages_per_day" | "max_projects"): number {
  const raw = getSetting(`limit.${plan}.${name}`, "0");
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

export function aiUsageToday(userId: number): number {
  return get<{ count: number }>("SELECT count FROM ai_usage WHERE user_id = ? AND day = ?", userId, today())?.count ?? 0;
}

/** Reserva uma mensagem do limite diário. Retorna false se o limite foi atingido. */
export function consumeAiQuota(userId: number, plan: PlanId): boolean {
  const max = limit(plan, "ai_messages_per_day");
  const used = aiUsageToday(userId);
  if (used >= max) return false;
  run(
    `INSERT INTO ai_usage (user_id, day, count) VALUES (?, ?, 1)
     ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1`,
    userId,
    today(),
  );
  return true;
}

export function refundAiQuota(userId: number) {
  run("UPDATE ai_usage SET count = MAX(count - 1, 0) WHERE user_id = ? AND day = ?", userId, today());
}
