"use server";

import { revalidatePath } from "next/cache";
import { get, parseJson, run } from "@/lib/db";
import { requireOnboardedUser, requireUser } from "@/lib/auth";
import { canAccessPremium, consumeAiQuota, limit, planOf, refundAiQuota } from "@/lib/access";
import { aiConfigured, friendlyAiError, missionFeedback, userContext } from "@/lib/ai";

export async function requestMissionFeedbackAction(missionId: number): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireOnboardedUser();
  if (!aiConfigured()) return { error: "O assistente de IA ainda não foi configurado nesta instalação." };
  const plan = planOf(user);
  const mission = get<{ slug: string; title: string; objective: string; criteria: string; is_premium: number }>(
    "SELECT slug, title, objective, criteria, is_premium FROM missions WHERE id = ? AND published = 1",
    missionId,
  );
  if (!mission || !canAccessPremium(plan, mission.is_premium)) return { error: "Missão indisponível." };
  const progress = get<{ result_text: string; result_url: string }>(
    "SELECT result_text, result_url FROM mission_progress WHERE user_id = ? AND mission_id = ?",
    user.id,
    missionId,
  );
  if (!progress || (!progress.result_text.trim() && !progress.result_url.trim())) {
    return { error: "Salve o registro do resultado antes de pedir feedback." };
  }
  if (!consumeAiQuota(user.id, plan)) {
    return { error: `Você usou as ${limit(plan, "ai_messages_per_day")} interações de IA de hoje. O limite renova amanhã.` };
  }
  try {
    const feedback = await missionFeedback({
      title: mission.title,
      objective: mission.objective,
      criteria: parseJson<string[]>(mission.criteria, []),
      resultText: progress.result_text,
      resultUrl: progress.result_url,
      context: userContext(user, plan),
    });
    run("UPDATE mission_progress SET ai_feedback = ? WHERE user_id = ? AND mission_id = ?", feedback, user.id, missionId);
    revalidatePath(`/missoes/${mission.slug}`);
    return { ok: true };
  } catch (err) {
    console.error("[feedback]", err);
    refundAiQuota(user.id);
    return { error: friendlyAiError(err) };
  }
}

export async function deleteConversationAction(conversationId: number) {
  const user = await requireUser();
  run("DELETE FROM conversations WHERE id = ? AND user_id = ?", conversationId, user.id);
  revalidatePath("/assistente");
}
