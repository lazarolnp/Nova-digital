import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { all } from "@/lib/db";

export const metadata: Metadata = { title: "Status da instalação", robots: { index: false } };
export const dynamic = "force-dynamic";

// Diagnóstico da configuração. Mostra apenas se cada variável existe e uma categoria de erro — nunca valores.
function diagnose(err: unknown): { title: string; fix: string } {
  const msg = err instanceof Error ? `${err.message} ${String((err as { cause?: unknown }).cause ?? "")}` : String(err);
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "";
  if (/Configure TURSO_DATABASE_URL/.test(msg))
    return {
      title: "As variáveis do banco Turso não foram configuradas.",
      fix: "Na Vercel, abra Settings → Environment Variables, adicione TURSO_DATABASE_URL e TURSO_AUTH_TOKEN (ambiente Production) e faça Redeploy.",
    };
  if (url && !/^(libsql|https|wss?|file):/.test(url))
    return {
      title: "TURSO_DATABASE_URL está em um formato inválido.",
      fix: "O valor deve começar com libsql:// (ex.: libsql://nome-do-banco-usuario.turso.io). Corrija e faça Redeploy.",
    };
  if (/401|403|unauthori[sz]ed|forbidden|token|jwt/i.test(msg))
    return {
      title: "O Turso recusou a conexão: o token de acesso é inválido ou expirou.",
      fix: "Gere um novo token no painel do Turso (ou reconecte a integração na Vercel), atualize TURSO_AUTH_TOKEN e faça Redeploy.",
    };
  if (/ENOTFOUND|EAI_AGAIN|fetch failed|getaddrinfo|404|not found/i.test(msg))
    return {
      title: "Não foi possível encontrar o banco no endereço informado.",
      fix: "Confira se TURSO_DATABASE_URL está correto e se o banco existe no painel do Turso. Depois faça Redeploy.",
    };
  return {
    title: "O banco respondeu com um erro inesperado.",
    fix: "Abra a Vercel em Deployments → (último deploy) → Logs/Runtime Logs e procure a mensagem de erro para identificar a causa.",
  };
}

export default async function StatusPage() {
  const env = [
    { name: "TURSO_DATABASE_URL", ok: Boolean(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL), required: true },
    { name: "TURSO_AUTH_TOKEN", ok: Boolean(process.env.TURSO_AUTH_TOKEN), required: true },
    { name: "ADMIN_EMAIL", ok: Boolean(process.env.ADMIN_EMAIL), required: false },
    { name: "ANTHROPIC_API_KEY", ok: Boolean(process.env.ANTHROPIC_API_KEY), required: false },
    { name: "APP_URL", ok: Boolean(process.env.APP_URL), required: false },
  ];
  let problem: { title: string; fix: string } | null = null;
  let counts: { label: string; n: number }[] = [];
  try {
    counts = await all<{ label: string; n: number }>(
      "SELECT 'Trilhas' AS label, COUNT(*) AS n FROM trails UNION ALL SELECT 'Aulas', COUNT(*) FROM lessons UNION ALL SELECT 'Usuários', COUNT(*) FROM users",
    );
  } catch (err) {
    console.error("[status]", err);
    problem = diagnose(err);
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card card stack" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 22 }}>Status da instalação</h1>
        {problem ? (
          <div className="alert alert-error" role="alert">
            <strong>{problem.title}</strong>
            <p style={{ marginTop: 6 }}>{problem.fix}</p>
          </div>
        ) : (
          <div className="alert alert-success" role="status">
            Banco conectado. {counts.map((c) => `${c.label}: ${c.n}`).join(" · ")}
          </div>
        )}
        <div className="list">
          {env.map((e) => (
            <div key={e.name} className="list-item">
              {e.ok ? <CheckCircle2 size={18} color="var(--success)" /> : <XCircle size={18} color={e.required ? "var(--danger)" : "var(--text-faint)"} />}
              <code style={{ flex: 1 }}>{e.name}</code>
              <span className="small muted">{e.ok ? "configurada" : e.required ? "faltando (obrigatória)" : "não configurada (opcional)"}</span>
            </div>
          ))}
        </div>
        <Link href="/" className="btn">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
