"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="auth-wrap">
      <div className="card auth-card empty">
        <h1 style={{ fontSize: 22 }}>Algo deu errado</h1>
        <p className="muted">Não foi possível carregar esta página. Tente novamente em instantes.</p>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
