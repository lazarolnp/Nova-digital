import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { aiUsageToday, limit, planOf } from "@/lib/access";
import { aiConfigured } from "@/lib/ai";
import { intParam } from "@/lib/validation";
import { deleteConversationAction } from "@/app/actions/ai";
import { Chat } from "@/components/Chat";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Assistente IA" };

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const user = await requireOnboardedUser();
  const { c, q } = await searchParams;
  const plan = await planOf(user);
  const conversations = await all<{ id: number; title: string }>(
    "SELECT id, title FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 30",
    user.id,
  );
  const selectedId = intParam(c);
  const selected = selectedId ? await get<{ id: number }>("SELECT id FROM conversations WHERE id = ? AND user_id = ?", selectedId, user.id) : undefined;
  const messages = selected
    ? await all<{ role: "user" | "assistant"; content: string }>("SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY id", selected.id)
    : [];

  return (
    <>
      <PageHeader
        title="Assistente IA"
        subtitle="Tire dúvidas, planeje seus estudos, crie roteiros, anúncios e propostas. O assistente conhece seu plano e seu progresso."
      />
      <div className="grid assistant-grid" style={{ alignItems: "start" }}>
        <aside className="card stack" aria-label="Conversas">
          <Link href="/assistente" className="btn btn-primary btn-block">
            <MessageSquarePlus size={16} /> Nova conversa
          </Link>
          {conversations.length ? (
            <div className="list">
              {conversations.map((conv) => (
                <div key={conv.id} className="list-item" style={{ padding: "8px 2px" }}>
                  <Link
                    href={`/assistente?c=${conv.id}`}
                    className="small"
                    style={{ flex: 1, minWidth: 0, fontWeight: conv.id === selected?.id ? 750 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {conv.title}
                  </Link>
                  <form action={deleteConversationAction.bind(null, conv.id)}>
                    <button type="submit" className="btn btn-sm btn-ghost" aria-label={`Excluir conversa ${conv.title}`}>
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="small muted">Suas conversas aparecerão aqui.</p>
          )}
        </aside>
        <div style={{ minWidth: 0 }}>
          <Chat
            key={selected?.id ?? "nova"}
            conversationId={selected?.id ?? null}
            initialMessages={messages}
            enabled={aiConfigured()}
            initialQuery={q?.slice(0, 500)}
            usage={{ used: await aiUsageToday(user.id), limit: await limit(plan, "ai_messages_per_day") }}
          />
        </div>
      </div>
    </>
  );
}
