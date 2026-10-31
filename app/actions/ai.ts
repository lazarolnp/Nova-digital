"use server";

import { revalidatePath } from "next/cache";
import { batch, get, parseJson, run } from "@/lib/db";
import { requireOnboardedUser, requireUser } from "@/lib/auth";
import { accessOf, canAccessPremium, consumeAiQuota, limit, planOf, refundAiQuota } from "@/lib/access";
import { aiConfigured, friendlyAiError, missionFeedback, userContext } from "@/lib/ai";

export async function requestMissionFeedbackAction(missionId: number): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireOnboardedUser();
  if (!aiConfigured()) return { error: "O assistente de IA ainda não foi configurado nesta instalação." };
  const plan = await planOf(user);
  const mission = await get<{ slug: string; title: string; objective: string; criteria: string; is_premium: number; trail: string | null }>(
    "SELECT m.slug, m.title, m.objective, m.criteria, m.is_premium, t.slug AS trail FROM missions m LEFT JOIN trails t ON t.id = m.trail_id WHERE m.id = ? AND m.published = 1",
    missionId,
  );
  if (!mission || !canAccessPremium(await accessOf(user), mission.is_premium, mission.trail)) return { error: "Missão indisponível." };
  const progress = await get<{ result_text: string; result_url: string }>(
    "SELECT result_text, result_url FROM mission_progress WHERE user_id = ? AND mission_id = ?",
    user.id,
    missionId,
  );
  if (!progress || (!progress.result_text.trim() && !progress.result_url.trim())) {
    return { error: "Salve o registro do resultado antes de pedir feedback." };
  }
  if (!await consumeAiQuota(user.id, plan)) {
    return { error: `Você usou as ${await limit(plan, "ai_messages_per_day")} interações de IA de hoje. O limite renova amanhã.` };
  }
  try {
    const feedback = await missionFeedback({
      title: mission.title,
      objective: mission.objective,
      criteria: parseJson<string[]>(mission.criteria, []),
      resultText: progress.result_text,
      resultUrl: progress.result_url,
      context: await userContext(user, plan),
      trail: mission.trail ?? "",
    });
    await run("UPDATE mission_progress SET ai_feedback = ? WHERE user_id = ? AND mission_id = ?", feedback, user.id, missionId);
    revalidatePath(`/missoes/${mission.slug}`);
    return { ok: true };
  } catch (err) {
    console.error("[feedback]", err);
    await refundAiQuota(user.id);
    return { error: friendlyAiError(err) };
  }
}

export async function deleteConversationAction(conversationId: number) {
  const user = await requireUser();
  await batch([
    {
      sql: "DELETE FROM chat_messages WHERE conversation_id IN (SELECT id FROM conversations WHERE id = ? AND user_id = ?)",
      args: [conversationId, user.id],
    },
    { sql: "DELETE FROM conversations WHERE id = ? AND user_id = ?", args: [conversationId, user.id] },
  ]);
  revalidatePath("/assistente");
}
