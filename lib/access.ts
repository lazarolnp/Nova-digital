import "server-only";
import { all, get, run } from "./db";
import { cache } from "react";
import type { User } from "./auth";
import { PAID_PLANS, paidPlan } from "./plans";

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

export type ActivePlan = { id: string; name: string; until: string | null; source: "manual" | "kiwify" };

export type Access = {
  /** "premium" quando há qualquer plano pago (usado nos limites gerais). */
  tier: PlanId;
  admin: boolean;
  plans: ActivePlan[];
  trails: Set<string>;
};

/** Planos ativos do usuário: concedidos manualmente no admin ou comprados na Kiwify (pelo e-mail). */
async function activePlans(userId: number, email: string): Promise<ActivePlan[]> {
  const now = new Date().toISOString();
  const manual = await all<{ plan: string; current_period_end: string | null }>(
    `SELECT plan, current_period_end FROM subscriptions
     WHERE user_id = ? AND status = 'active' AND (current_period_end IS NULL OR current_period_end > ?)`,
    userId,
    now,
  );
  const kiwify = await all<{ plan: string; access_until: string | null }>(
    `SELECT plan, access_until FROM external_subscriptions WHERE email = ? AND (
       (status = 'active' AND (access_until IS NULL OR access_until > ?)) OR
       (status = 'canceled' AND access_until > ?))`,
    email,
    now,
    now,
  );
  const out: ActivePlan[] = [];
  const add = (planId: string, until: string | null, source: ActivePlan["source"]) => {
    const p = paidPlan(planId);
    if (!p) return;
    const existing = out.find((x) => x.id === p.id);
    if (!existing) out.push({ id: p.id, name: p.name, until, source });
    else if (existing.until && (!until || until > existing.until)) existing.until = until;
  };
  manual.forEach((m) => add(m.plan, m.current_period_end, "manual"));
  kiwify.forEach((k) => add(k.plan, k.access_until, "kiwify"));
  return out;
}

const accessCached = cache(async (userId: number, role: string, email: string): Promise<Access> => {
  const plans = await activePlans(userId, email);
  const admin = role === "admin";
  const trails = new Set<string>(admin ? PAID_PLANS.flatMap((p) => p.trails) : plans.flatMap((p) => paidPlan(p.id)?.trails ?? []));
  return { tier: admin || plans.length ? "premium" : "free", admin, plans, trails };
});

/** O que o usuário pode acessar. Administradores acessam tudo para revisar o conteúdo. */
export function accessOf(user: Pick<User, "id" | "role" | "email">): Promise<Access> {
  return accessCached(user.id, user.role, user.email);
}

/** "premium" se o usuário tem qualquer plano pago (usado para limites gerais e textos). */
export async function planOf(user: Pick<User, "id" | "role" | "email">): Promise<PlanId> {
  return (await accessOf(user)).tier;
}

export async function limit(plan: PlanId, name: "ai_messages_per_day" | "max_projects"): Promise<number> {
  const raw = await getSetting(`limit.${plan}.${name}`, "0");
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Acesso a uma trilha. Conteúdo sem trilha (ex.: ferramentas premium) exige qualquer plano pago. */
export function canAccessTrail(access: Access, trailSlug: string | null) {
  if (access.admin) return true;
  return trailSlug ? access.trails.has(trailSlug) : access.tier === "premium";
}

export function canAccessPremium(access: Access, isPremiumContent: boolean | number, trailSlug: string | null = null) {
  return !isPremiumContent || canAccessTrail(access, trailSlug);
}

export function canAccessLesson(access: Access, trailSlug: string | null, coursePremium: number, lessonPreview: number) {
  return !coursePremium || lessonPreview === 1 || canAccessTrail(access, trailSlug);
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
