import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-wrap">
      <div className="card auth-card empty">
        <h1 style={{ fontSize: 22 }}>Página não encontrada</h1>
        <p className="muted">O conteúdo que você procura não existe ou foi removido.</p>
        <Link href="/" className="btn btn-primary">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
