"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Lock, Search } from "lucide-react";

export type ToolView = {
  id: number;
  name: string;
  category: string;
  description: string;
  use_case: string;
  difficulty: string;
  pricing: "gratuito" | "freemium" | "pago";
  pricing_note: string;
  url: string | null;
  locked: boolean;
};

const PRICING = {
  gratuito: { label: "Gratuito", cls: "badge-success" },
  freemium: { label: "Freemium", cls: "badge-info" },
  pago: { label: "Pago", cls: "badge-warning" },
};

export function ToolsBrowser({ tools, categories }: { tools: ToolView[]; categories: string[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [pricing, setPricing] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter(
      (t) =>
        (!category || t.category === category) &&
        (!pricing || t.pricing === pricing) &&
        (!q || `${t.name} ${t.description} ${t.use_case}`.toLowerCase().includes(q)),
    );
  }, [tools, category, pricing, query]);

  return (
    <div className="stack-lg">
      <div className="card stack">
        <div className="field" style={{ position: "relative" }}>
          <label htmlFor="busca" className="sr-only">
            Buscar ferramenta
          </label>
          <Search size={16} style={{ position: "absolute", left: 14, top: 13, color: "var(--text-faint)" }} />
          <input id="busca" className="input" style={{ paddingLeft: 40 }} placeholder="Buscar por nome ou uso..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="row" aria-label="Filtrar por categoria">
          <button type="button" className={`chip${!category ? " active" : ""}`} onClick={() => setCategory(null)}>
            Todas
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className={`chip${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="row" aria-label="Filtrar por preço">
          <span className="small muted">Custo:</span>
          {[null, "gratuito", "freemium", "pago"].map((p) => (
            <button key={p ?? "todos"} type="button" className={`chip${pricing === p ? " active" : ""}`} onClick={() => setPricing(p)}>
              {p ? PRICING[p as keyof typeof PRICING].label : "Todos"}
            </button>
          ))}
        </div>
      </div>

      <p className="small muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "ferramenta" : "ferramentas"}
      </p>

      <div className="grid grid-auto">
        {filtered.map((t) => (
          <article key={t.id} className="card stack">
            <div className="row between">
              <span className="label">{t.category}</span>
              <span className={`badge ${PRICING[t.pricing].cls}`}>{PRICING[t.pricing].label}</span>
            </div>
            <h2 style={{ fontSize: 17 }}>{t.name}</h2>
            <p className="small muted">{t.description}</p>
            <p className="small">
              <strong>Para que usar:</strong> {t.use_case}
            </p>
            <p className="tiny faint">{t.pricing_note}</p>
            <div className="row between" style={{ marginTop: "auto" }}>
              <span className="badge">Dificuldade: {t.difficulty}</span>
              {t.locked || !t.url ? (
                <Link href="/planos" className="btn btn-sm">
                  <Lock size={13} /> Planos pagos
                </Link>
              ) : (
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  Site oficial <ExternalLink size={13} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 ? <div className="card empty">Nenhuma ferramenta encontrada com esses filtros.</div> : null}
    </div>
  );
}
