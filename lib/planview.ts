import "server-only";
import { all, get, parseJson } from "./db";

export type PlanItem = {
  id: number;
  day: number;
  week: number;
  kind: "aula" | "missao" | "projeto" | "acao";
  ref_id: number | null;
  title: string;
  detail: string;
  est_minutes: number;
  done_at: string | null;
  mission_slug: string | null;
};

export async function currentPlan(userId: number) {
  const plan = await get<{ id: number; summary: string; weekly_goals: string; created_at: string }>(
    "SELECT id, summary, weekly_goals, created_at FROM plans WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    userId,
  );
  if (!plan) return null;
  const items = await all<PlanItem>(
    `SELECT pi.*, m.slug AS mission_slug FROM plan_items pi
     LEFT JOIN missions m ON pi.kind = 'missao' AND m.id = pi.ref_id
     WHERE pi.plan_id = ? ORDER BY pi.day, pi.id`,
    plan.id,
  );
  const created = new Date(plan.created_at.replace(" ", "T") + "Z");
  const elapsed = Math.floor((Date.now() - created.getTime()) / 86400_000);
  const today = Math.min(30, Math.max(1, elapsed + 1));
  const week = Math.min(5, Math.ceil(today / 7));
  const done = items.filter((i) => i.done_at).length;
  return {
    ...plan,
    goals: parseJson<string[]>(plan.weekly_goals, []),
    items,
    today,
    week,
    done,
    pct: items.length ? Math.round((done / items.length) * 100) : 0,
  };
}

export function itemHref(i: Pick<PlanItem, "kind" | "ref_id" | "mission_slug">) {
  if (i.kind === "aula" && i.ref_id) return `/aulas/${i.ref_id}`;
  if (i.kind === "missao" && i.mission_slug) return `/missoes/${i.mission_slug}`;
  if (i.kind === "projeto") return "/projetos";
  return null;
}
