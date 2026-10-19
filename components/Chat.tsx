"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Markdown } from "./Markdown";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Não sei por onde começar. Qual área combina comigo?",
  "Monte um plano de estudos para esta semana com as horas que tenho.",
  "Explique o que é CTR e CPC como se eu nunca tivesse anunciado.",
  "Me ajude a escrever uma mensagem de abordagem para uma clínica, sem parecer spam.",
  "Crie um roteiro de vídeo curto de 30 segundos para uma padaria.",
  "Quais projetos eu posso colocar no portfólio se ainda não tenho clientes?",
];

export function Chat({
  conversationId: initialId,
  initialMessages,
  enabled,
  initialQuery,
  usage,
}: {
  conversationId: number | null;
  initialMessages: Msg[];
  enabled: boolean;
  initialQuery?: string;
  usage: { used: number; limit: number };
}) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState(initialId);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState(initialQuery ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(usage.used);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError(null);
    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    let newId = conversationId;
    try {
      const res = await fetch("/api/assistente", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId, message }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Não foi possível enviar a mensagem." }));
        throw new Error(data.error);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const evt = JSON.parse(line);
          if (evt.type === "meta") {
            newId = evt.conversationId;
            setConversationId(evt.conversationId);
            setUsed(evt.used);
          } else if (evt.type === "text") {
            setMessages((m) => {
              const copy = m.slice();
              copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + evt.text };
              return copy;
            });
          } else if (evt.type === "error") {
            throw new Error(evt.error);
          }
        }
      }
      if (newId !== initialId) router.replace(`/assistente?c=${newId}`, { scroll: false });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao falar com o assistente.");
      // Remove a pergunta não respondida e devolve o texto ao campo.
      setMessages((m) => m.slice(0, -2));
      setInput(message);
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) {
    return (
      <div className="card empty">
        <h2 className="card-title">Assistente indisponível</h2>
        <p className="muted" style={{ maxWidth: 520 }}>
          O assistente de IA ainda não foi configurado nesta instalação. Quando a chave da API for configurada no servidor, ele ficará
          disponível aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="card chat">
      <div className="chat-log" ref={logRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="stack" style={{ margin: "auto 0" }}>
            <p className="muted">Comece com uma pergunta ou escolha uma sugestão:</p>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="option small" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="bubble bubble-user">
                {m.content}
              </div>
            ) : (
              <div key={i} className="bubble bubble-ai" style={{ whiteSpace: "normal" }}>
                {m.content ? (
                  <Markdown source={m.content} />
                ) : (
                  <span className="typing" aria-label="O assistente está pensando">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </div>
            ),
          )
        )}
      </div>
      {error ? (
        <div className="alert alert-error" role="alert" style={{ marginBottom: 10 }}>
          {error}
        </div>
      ) : null}
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="msg" className="sr-only">
          Mensagem para o assistente
        </label>
        <textarea
          id="msg"
          className="textarea"
          value={input}
          maxLength={6000}
          placeholder="Escreva sua pergunta... (Enter envia, Shift+Enter quebra linha)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()} aria-label="Enviar">
          <Send size={16} />
        </button>
      </form>
      <p className="tiny faint" style={{ marginTop: 8 }}>
        {used}/{usage.limit} mensagens hoje · O assistente pode errar: confira informações importantes em fontes oficiais.
      </p>
    </div>
  );
}
