import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { TicketForm } from "@/components/TicketForm";

export const metadata: Metadata = { title: "Suporte" };

const FAQ = [
  {
    q: "A NovaDigital garante que vou ganhar dinheiro?",
    a: "Não. A plataforma ensina habilidades e organiza sua prática. Resultados dependem de dedicação, do mercado e de muitos outros fatores. Desconfie de quem promete renda garantida.",
  },
  {
    q: "Como meu plano de 30 dias é montado?",
    a: "A partir das suas respostas no onboarding (conhecimento, área, horas, orçamento, objetivo e preferência). Você pode refazê-lo a qualquer momento em Minha conta.",
  },
  {
    q: "O que está incluído no plano gratuito?",
    a: "O curso de Fundamentos completo, as aulas introdutórias de todas as trilhas, missões iniciais, ferramentas básicas, o plano de 30 dias e o guia em PDF \"Como funciona o marketing digital\". Veja a página Planos.",
  },
  {
    q: "Como funciona o portfólio público?",
    a: "Ative em Minha conta e marque em cada projeto se ele deve aparecer. Projetos demonstrativos são identificados como tal.",
  },
];

const STATUS = { aberto: "Aberto", respondido: "Respondido", fechado: "Fechado" } as const;

export default async function SupportPage() {
  const user = await requireOnboardedUser();
  const tickets = await all<{ id: number; category: string; message: string; status: keyof typeof STATUS; reply: string; created_at: string }>(
    "SELECT id, category, message, status, reply, created_at FROM tickets WHERE user_id = ? ORDER BY id DESC LIMIT 20",
    user.id,
  );
  const email = process.env.SUPPORT_EMAIL;
  return (
    <>
      <PageHeader title="Suporte" subtitle="Tire dúvidas sobre a plataforma ou fale com a equipe." />
      <div className="grid grid-3" style={{ alignItems: "start" }}>
        <div className="span-2 stack-lg">
          <TicketForm />
          <div className="card">
            <h2 className="card-title">Perguntas rápidas</h2>
            {FAQ.map((f) => (
              <details key={f.q} className="faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <aside className="stack-lg">
          <div className="card stack">
            <h2 className="card-title">Canais de atendimento</h2>
            <p className="small muted">Os chamados abertos aqui são respondidos pela equipe e a resposta aparece nesta página.</p>
            {email ? (
              <p className="small">
                E-mail: <a href={`mailto:${email}`} style={{ color: "var(--accent-text)" }}>{email}</a>
              </p>
            ) : null}
          </div>
          <div className="card">
            <h2 className="card-title">Seus chamados</h2>
            {tickets.length === 0 ? (
              <p className="small muted" style={{ marginTop: 8 }}>
                Nenhum chamado aberto.
              </p>
            ) : (
              <div className="list">
                {tickets.map((t) => (
                  <div key={t.id} className="list-item" style={{ display: "block" }}>
                    <div className="row between">
                      <span className="small" style={{ fontWeight: 650 }}>
                        #{t.id} · {t.category}
                      </span>
                      <span className={`badge ${t.status === "respondido" ? "badge-success" : t.status === "aberto" ? "badge-info" : ""}`}>{STATUS[t.status]}</span>
                    </div>
                    <p className="small muted wrap-anywhere" style={{ marginTop: 4 }}>
                      {t.message.length > 160 ? `${t.message.slice(0, 160)}…` : t.message}
                    </p>
                    {t.reply ? (
                      <p className="small wrap-anywhere" style={{ marginTop: 6, borderLeft: "3px solid var(--accent)", paddingLeft: 10 }}>
                        {t.reply}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
