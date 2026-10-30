import { z } from "zod";
import { getUser } from "@/lib/auth";
import { all, get, run } from "@/lib/db";
import { aiUsageToday, consumeAiQuota, limit, planOf, refundAiQuota } from "@/lib/access";
import { aiConfigured, friendlyAiError, streamChat, userContext } from "@/lib/ai";
import { sameOrigin } from "@/lib/origin";
import { trailAssistant } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  conversationId: z.number().int().positive().nullable(),
  trail: z.string().max(60).optional(),
  message: z.string().trim().min(1).max(6000),
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json(403, { error: "Origem não permitida." });
  const user = await getUser();
  if (!user) return json(401, { error: "Faça login para usar o assistente." });
  if (!aiConfigured()) return json(503, { error: "O assistente de IA ainda não foi configurado nesta instalação." });

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return json(400, { error: "Requisição inválida." });
  }
  if (!parsed.success) return json(400, { error: "A mensagem deve ter entre 1 e 6.000 caracteres." });
  const { message } = parsed.data;
  let conversationId = parsed.data.conversationId;

  // Especialista da trilha: definido na criação da conversa e mantido nas mensagens seguintes.
  let trail = trailAssistant(parsed.data.trail ?? "") ? (parsed.data.trail as string) : "";
  if (conversationId) {
    const own = await get<{ trail: string }>("SELECT trail FROM conversations WHERE id = ? AND user_id = ?", conversationId, user.id);
    if (!own) return json(404, { error: "Conversa não encontrada." });
    trail = own.trail;
  }

  const plan = await planOf(user);
  if (!await consumeAiQuota(user.id, plan)) {
    return json(429, {
      error: `Você usou as ${await limit(plan, "ai_messages_per_day")} mensagens de hoje do seu plano. O limite renova amanhã.`,
    });
  }

  if (!conversationId) {
    const title = message.length > 60 ? `${message.slice(0, 57)}...` : message;
    conversationId = Number((await run("INSERT INTO conversations (user_id, title, trail) VALUES (?, ?, ?)", user.id, title, trail)).lastInsertRowid);
  }
  await run("INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'user', ?)", conversationId, message);
  await run("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?", conversationId);

  // Últimas 30 mensagens (ordem cronológica); a conversa precisa começar com o usuário.
  const history = await all<{ role: "user" | "assistant"; content: string }>(
    "SELECT role, content FROM (SELECT id, role, content FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 30) ORDER BY id",
    conversationId,
  );
  while (history.length && history[0].role !== "user") history.shift();

  const context = await userContext(user, plan);
  const convId = conversationId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      send({ type: "meta", conversationId: convId, used: await aiUsageToday(user.id), limit: await limit(plan, "ai_messages_per_day") });
      try {
        const text = await streamChat(history, context, (chunk) => send({ type: "text", text: chunk }), trail);
        if (text.trim()) await run("INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)", convId, text);
        send({ type: "done" });
      } catch (err) {
        console.error("[assistente]", err);
        await refundAiQuota(user.id);
        // Remove a pergunta sem resposta para manter a conversa alternando entre usuário e assistente.
        await run(
          "DELETE FROM chat_messages WHERE id = (SELECT id FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1) AND role = 'user'",
          convId,
        );
        send({ type: "error", error: friendlyAiError(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
