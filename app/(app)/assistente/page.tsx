import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { aiUsageToday, limit, planOf } from "@/lib/access";
import { aiConfigured } from "@/lib/ai";
import { AI_ENABLED } from "@/lib/features";
import { redirect } from "next/navigation";
import { SEED_TRAILS, trailAssistant } from "@/lib/seed";
import { intParam } from "@/lib/validation";
import { deleteConversationAction } from "@/app/actions/ai";
import { Chat } from "@/components/Chat";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Assistente IA" };

const GENERAL_SUGGESTIONS = [
  "Não sei por onde começar. Qual área combina comigo?",
  "Monte um plano de estudos para esta semana com as horas que tenho.",
  "Explique o que é CTR e CPC como se eu nunca tivesse anunciado.",
  "Quais projetos eu posso colocar no portfólio se ainda não tenho clientes?",
];

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ c?: string; q?: string; trilha?: string }> }) {
  const user = await requireOnboardedUser();
  if (!AI_ENABLED) redirect("/painel");
  const { c, q, trilha } = await searchParams;
  const plan = await planOf(user);
  const conversations = await all<{ id: number; title: string; trail: string }>(
    "SELECT id, title, trail FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 30",
    user.id,
  );
  const selectedId = intParam(c);
  const selected = selectedId
    ? await get<{ id: number; trail: string }>("SELECT id, trail FROM conversations WHERE id = ? AND user_id = ?", selectedId, user.id)
    : undefined;
  const messages = selected
    ? await all<{ role: "user" | "assistant"; content: string }>("SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY id", selected.id)
    : [];
  // Especialista: o da conversa aberta, ou o escolhido no seletor para uma conversa nova.
  const specialist = trailAssistant(selected ? selected.trail : (trilha ?? ""));
  const trailSlug = specialist?.slug ?? "";
  const nameOf = (slug: string) => trailAssistant(slug)?.assistant.name ?? "Assistente geral";

  return (
    <>
      <PageHeader
        title={specialist ? specialist.assistant.name : "Assistente IA"}
        subtitle={
          specialist
            ? `Especialista da trilha ${specialist.title}. Tire dúvidas, peça exemplos e textos prontos sobre o tema.`
            : "Tire dúvidas, planeje seus estudos, crie roteiros, anúncios e propostas. Escolha um especialista para falar sobre uma trilha."
        }
      />
      {!selected ? (
        <nav className="row" aria-label="Escolher especialista">
          <Link href="/assistente" className={`chip${!specialist ? " active" : ""}`}>
            Geral
          </Link>
          {SEED_TRAILS.map((t) => (
            <Link key={t.slug} href={`/assistente?trilha=${t.slug}`} className={`chip${trailSlug === t.slug ? " active" : ""}`}>
              {t.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <div className="grid assistant-grid" style={{ alignItems: "start" }}>
        <aside className="card stack" aria-label="Conversas">
          <Link href={trailSlug ? `/assistente?trilha=${trailSlug}` : "/assistente"} className="btn btn-primary btn-block">
            <MessageSquarePlus size={16} /> Nova conversa
          </Link>
          {conversations.length ? (
            <div className="list">
              {conversations.map((conv) => (
                <div key={conv.id} className="list-item" style={{ padding: "8px 2px" }}>
                  <Link href={`/assistente?c=${conv.id}`} className="small" style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontWeight: conv.id === selected?.id ? 750 : 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conv.title}
                    </span>
                    <span className="tiny faint">{nameOf(conv.trail)}</span>
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
            key={selected?.id ?? `nova-${trailSlug}`}
            conversationId={selected?.id ?? null}
            trail={trailSlug}
            suggestions={specialist?.assistant.suggestions ?? GENERAL_SUGGESTIONS}
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
