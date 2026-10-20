"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { get, run } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { canAccessLesson, canAccessPremium, planOf } from "@/lib/access";
import { XP, awardXp, checkAchievements, revokeXp } from "@/lib/progress";
import { syncPlanItem } from "@/lib/plan";
import { firstError, str, urlSchema, type FormState } from "@/lib/validation";

async function lessonAccess(lessonId: number) {
  return await get<{ course_premium: number; is_free_preview: number; course_slug: string }>(
    `SELECT c.is_premium AS course_premium, l.is_free_preview, c.slug AS course_slug
     FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id
     WHERE l.id = ? AND c.published = 1`,
    lessonId,
  );
}

export async function setLessonCompleteAction(lessonId: number, done: boolean) {
  const user = await requireOnboardedUser();
  const lesson = await lessonAccess(lessonId);
  if (!lesson || !canAccessLesson(await planOf(user), lesson.course_premium, lesson.is_free_preview)) {
    return { error: "Você não tem acesso a esta aula." };
  }
  await run(
    `INSERT INTO lesson_progress (user_id, lesson_id, completed_at, updated_at) VALUES (?, ?, ${done ? "datetime('now')" : "NULL"}, datetime('now'))
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed_at = ${done ? "COALESCE(completed_at, datetime('now'))" : "NULL"}, updated_at = datetime('now')`,
    user.id,
    lessonId,
  );
  if (done) await awardXp(user.id, "aula", lessonId, XP.lesson);
  else await revokeXp(user.id, "aula", lessonId);
  await syncPlanItem(user.id, "aula", lessonId, done);
  if (done) await checkAchievements(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveLessonNotesAction(lessonId: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireOnboardedUser();
  const lesson = await lessonAccess(lessonId);
  if (!lesson || !canAccessLesson(await planOf(user), lesson.course_premium, lesson.is_free_preview)) return { error: "Sem acesso a esta aula." };
  const notes = str(fd, "notes");
  if (notes.length > 10000) return { error: "A resposta pode ter no máximo 10.000 caracteres." };
  await run(
    `INSERT INTO lesson_progress (user_id, lesson_id, notes, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET notes = excluded.notes, updated_at = datetime('now')`,
    user.id,
    lessonId,
    notes,
  );
  return { ok: "Resposta salva." };
}

// ---- Missões ----
type MissionAccess = { id: number; slug: string; is_premium: number; checklist: string; criteria: string; xp: number };

async function missionFor(missionId: number) {
  const user = await requireOnboardedUser();
  const m = await get<MissionAccess>("SELECT id, slug, is_premium, checklist, criteria, xp FROM missions WHERE id = ? AND published = 1", missionId);
  if (!m || !canAccessPremium(await planOf(user), m.is_premium)) return { user, mission: null };
  return { user, mission: m };
}

export async function startMissionAction(missionId: number) {
  const { user, mission } = await missionFor(missionId);
  if (!mission) return { error: "Missão indisponível no seu plano." };
  await run("INSERT OR IGNORE INTO mission_progress (user_id, mission_id) VALUES (?, ?)", user.id, mission.id);
  revalidatePath(`/missoes/${mission.slug}`);
  revalidatePath("/missoes");
  return { ok: true };
}

export async function toggleMissionCheckAction(missionId: number, index: number, kind: "checklist" | "self_review", value: boolean) {
  const { user, mission } = await missionFor(missionId);
  if (!mission) return { error: "Missão indisponível." };
  const size = (JSON.parse(kind === "checklist" ? mission.checklist : mission.criteria) as string[]).length;
  if (!Number.isInteger(index) || index < 0 || index >= size) return { error: "Item inválido." };
  const row = await get<{ checklist: string; self_review: string }>(
    "SELECT checklist, self_review FROM mission_progress WHERE user_id = ? AND mission_id = ?",
    user.id,
    mission.id,
  );
  if (!row) return { error: "Inicie a missão primeiro." };
  const arr: boolean[] = JSON.parse(kind === "checklist" ? row.checklist : row.self_review);
  const next = Array.from({ length: size }, (_, i) => Boolean(arr[i]));
  next[index] = value;
  await run(`UPDATE mission_progress SET ${kind === "checklist" ? "checklist" : "self_review"} = ? WHERE user_id = ? AND mission_id = ?`, JSON.stringify(next), user.id, mission.id);
  revalidatePath(`/missoes/${mission.slug}`);
  return { ok: true };
}

const resultSchema = z.object({
  result_text: z.string().max(8000, "O registro pode ter no máximo 8.000 caracteres."),
  result_url: urlSchema,
});

export async function saveMissionResultAction(missionId: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const { user, mission } = await missionFor(missionId);
  if (!mission) return { error: "Missão indisponível." };
  const parsed = resultSchema.safeParse({ result_text: str(fd, "result_text"), result_url: str(fd, "result_url") });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const res = await run(
    "UPDATE mission_progress SET result_text = ?, result_url = ? WHERE user_id = ? AND mission_id = ?",
    parsed.data.result_text,
    parsed.data.result_url,
    user.id,
    mission.id,
  );
  if (!res.changes) return { error: "Inicie a missão primeiro." };
  revalidatePath(`/missoes/${mission.slug}`);
  return { ok: "Resultado salvo." };
}

export async function completeMissionAction(missionId: number) {
  const { user, mission } = await missionFor(missionId);
  if (!mission) return { error: "Missão indisponível." };
  const row = await get<{ checklist: string; result_text: string; result_url: string }>(
    "SELECT checklist, result_text, result_url FROM mission_progress WHERE user_id = ? AND mission_id = ?",
    user.id,
    mission.id,
  );
  if (!row) return { error: "Inicie a missão primeiro." };
  const size = (JSON.parse(mission.checklist) as string[]).length;
  const checks: boolean[] = JSON.parse(row.checklist);
  if (checks.filter(Boolean).length < size) return { error: "Conclua todos os itens do checklist antes de finalizar." };
  if (!row.result_text.trim() && !row.result_url.trim()) return { error: "Registre o resultado (texto ou link) antes de finalizar." };
  await run(
    "UPDATE mission_progress SET status = 'concluida', completed_at = datetime('now') WHERE user_id = ? AND mission_id = ?",
    user.id,
    mission.id,
  );
  await awardXp(user.id, "missao", mission.id, mission.xp);
  await syncPlanItem(user.id, "missao", mission.id, true);
  await checkAchievements(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function reopenMissionAction(missionId: number) {
  const { user, mission } = await missionFor(missionId);
  if (!mission) return { error: "Missão indisponível." };
  await run("UPDATE mission_progress SET status = 'em_andamento', completed_at = NULL WHERE user_id = ? AND mission_id = ?", user.id, mission.id);
  await revokeXp(user.id, "missao", mission.id);
  await syncPlanItem(user.id, "missao", mission.id, false);
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- Plano ----
export async function togglePlanItemAction(itemId: number, done: boolean) {
  const user = await requireOnboardedUser();
  const item = await get<{ id: number; kind: string }>(
    `SELECT pi.id, pi.kind FROM plan_items pi JOIN plans p ON p.id = pi.plan_id WHERE pi.id = ? AND p.user_id = ?`,
    itemId,
    user.id,
  );
  if (!item) return { error: "Tarefa não encontrada." };
  if (item.kind === "aula" || item.kind === "missao") {
    return { error: "Esta tarefa é marcada automaticamente ao concluir a aula ou a missão." };
  }
  await run(`UPDATE plan_items SET done_at = ${done ? "datetime('now')" : "NULL"} WHERE id = ?`, item.id);
  if (done) await awardXp(user.id, "plano", item.id, 5);
  else await revokeXp(user.id, "plano", item.id);
  if (done) await checkAchievements(user.id);
  revalidatePath("/plano");
  revalidatePath("/painel");
  return { ok: true };
}
