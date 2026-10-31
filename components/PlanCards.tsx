"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Crown } from "lucide-react";

export type OfferView = {
  id: string;
  name: string;
  description: string;
  trailNames: string[];
  monthly: number;
  annual: number;
  checkoutMonthly: string;
  checkoutAnnual: string;
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: v % 1 ? 2 : 0 });

export function PlanCards({
  offers,
  activeIds,
  loggedIn,
  onWaitlist,
  waitlistAction,
}: {
  offers: OfferView[];
  activeIds: string[];
  loggedIn: boolean;
  onWaitlist: boolean;
  waitlistAction: () => Promise<void>;
}) {
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");
  const complete = offers.find((o) => o.id === "completo");
  const singles = offers.filter((o) => o.id !== "completo");

  function cta(o: OfferView) {
    if (activeIds.includes(o.id)) return <span className="badge badge-accent">Seu plano atual</span>;
    const link = period === "monthly" ? o.checkoutMonthly : o.checkoutAnnual;
    if (link)
      return (
        <a href={link} className="btn btn-primary btn-block" rel="noopener noreferrer">
          Assinar {period === "monthly" ? "mensal" : "anual"}
        </a>
      );
    if (!loggedIn)
      return (
        <Link href="/cadastro" className="btn btn-block">
          Criar conta e ser avisado
        </Link>
      );
    if (onWaitlist) return <span className="badge badge-success">Você será avisado quando abrir</span>;
    return (
      <form action={waitlistAction}>
        <button type="submit" className="btn btn-block">
          Quero ser avisado
        </button>
      </form>
    );
  }

  function price(o: OfferView) {
    return period === "monthly" ? (
      <>
        <div className="stat">
          {brl(o.monthly)}
          <span className="muted" style={{ fontSize: 15, fontWeight: 600 }}>
            /mês
          </span>
        </div>
        <span className="tiny faint">ou {brl(o.annual)} no plano anual</span>
      </>
    ) : (
      <>
        <div className="stat">
          {brl(o.annual)}
          <span className="muted" style={{ fontSize: 15, fontWeight: 600 }}>
            /ano
          </span>
        </div>
        <span className="tiny faint">
          equivale a {brl(Math.round((o.annual / 12) * 100) / 100)}/mês · economia de {brl(Math.max(0, o.monthly * 12 - o.annual))}
        </span>
      </>
    );
  }

  return (
    <div className="stack-lg">
      <div className="row" style={{ justifyContent: "center" }} role="radiogroup" aria-label="Período de cobrança">
        <button type="button" role="radio" aria-checked={period === "monthly"} className={`chip${period === "monthly" ? " active" : ""}`} onClick={() => setPeriod("monthly")}>
          Mensal
        </button>
        <button type="button" role="radio" aria-checked={period === "annual"} className={`chip${period === "annual" ? " active" : ""}`} onClick={() => setPeriod("annual")}>
          Anual (2 meses grátis)
        </button>
      </div>

      {complete ? (
        <div id="plano-completo" className="card" style={{ borderColor: "var(--accent)", boxShadow: "0 0 30px var(--glow)" }}>
          <div className="grid grid-2" style={{ alignItems: "center" }}>
            <div className="stack">
              <div className="row">
                <h2 style={{ fontSize: 22 }} className="row">
                  <Crown size={20} color="var(--accent-text)" /> {complete.name}
                </h2>
                <span className="badge badge-accent">Mais completo</span>
              </div>
              <p className="muted">Todas as trilhas, todas as missões e todos os guias em PDF. Ideal para quem quer explorar mais de um caminho.</p>
              <div className="row">
                {complete.trailNames.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="stack">
              {price(complete)}
              {cta(complete)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-3">
        {singles.map((o) => (
          <div key={o.id} id={`plano-${o.id}`} className="card stack">
            <h2 style={{ fontSize: 18 }}>{o.name}</h2>
            <p className="small muted">{o.description}</p>
            {price(o)}
            <ul className="stack small" style={{ listStyle: "none", padding: 0, margin: 0, gap: 6 }}>
              {["Todos os cursos e aulas da trilha", "Todas as missões práticas da trilha", "Guia em PDF da trilha"].map((f) => (
                <li key={f} className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                  <Check size={15} color="var(--accent-text)" style={{ flexShrink: 0, marginTop: 3 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "auto" }}>{cta(o)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
