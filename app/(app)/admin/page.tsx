import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { aiConfigured, AI_MODEL } from "@/lib/ai";
import { AdminHeader } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Administração" };

const count = (sql: string) => get<{ n: number }>(sql)?.n ?? 0;

export default async function AdminHome() {
  await requireAdmin();
  const cards = [
    { label: "Usuários", value: count("SELECT COUNT(*) AS n FROM users") },
    { label: "Assinaturas ativas", value: count("SELECT COUNT(DISTINCT user_id) AS n FROM subscriptions WHERE status = 'active'") },
    { label: "Lista de espera Premium", value: count("SELECT COUNT(*) AS n FROM waitlist") },
    { label: "Chamados abertos", value: count("SELECT COUNT(*) AS n FROM tickets WHERE status = 'aberto'") },
    { label: "Aulas concluídas (total)", value: count("SELECT COUNT(*) AS n FROM lesson_progress WHERE completed_at IS NOT NULL") },
    { label: "Missões concluídas (total)", value: count("SELECT COUNT(*) AS n FROM mission_progress WHERE status = 'concluida'") },
  ];
  const content = all<{ label: string; n: number }>(
    `SELECT 'Cursos' AS label, COUNT(*) AS n FROM courses UNION ALL SELECT 'Aulas', COUNT(*) FROM lessons
     UNION ALL SELECT 'Missões', COUNT(*) FROM missions UNION ALL SELECT 'Ferramentas', COUNT(*) FROM tools`,
  );
  return (
    <>
      <AdminHeader title="Visão geral" active="/admin" />
      <div className="grid grid-3">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="label">{c.label}</div>
            <div className="stat">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">Conteúdo</h2>
          <div className="row" style={{ marginTop: 12 }}>
            {content.map((c) => (
              <span key={c.label} className="badge">
                {c.label}: {c.n}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Assistente de IA</h2>
          <p className="small muted" style={{ marginTop: 8 }}>
            {aiConfigured() ? `Configurado. Modelo: ${AI_MODEL}.` : "Não configurado. Defina ANTHROPIC_API_KEY nas variáveis de ambiente do servidor."}
          </p>
        </div>
      </div>
    </>
  );
}
