"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BookOpen, CheckCircle2, Circle, FolderKanban, ListChecks, Target } from "lucide-react";
import { togglePlanItemAction } from "@/app/actions/learning";

const ICONS = { aula: BookOpen, missao: Target, projeto: FolderKanban, acao: ListChecks };
const KIND_LABEL = { aula: "Aula", missao: "Missão", projeto: "Projeto", acao: "Ação" };

export function PlanItemRow({
  item,
  href,
}: {
  item: { id: number; kind: "aula" | "missao" | "projeto" | "acao"; title: string; detail: string; est_minutes: number; done_at: string | null };
  href: string | null;
}) {
  const [done, setDone] = useState(Boolean(item.done_at));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const auto = item.kind === "aula" || item.kind === "missao";
  const Icon = ICONS[item.kind];

  function toggle() {
    const next = !done;
    setDone(next);
    setError(null);
    start(async () => {
      const res = await togglePlanItemAction(item.id, next);
      if (res?.error) {
        setDone(!next);
        setError(res.error);
      }
    });
  }

  return (
    <div className="list-item" style={{ alignItems: "flex-start" }}>
      {auto ? (
        <span title={done ? "Concluída" : "Marcada automaticamente ao concluir"} style={{ marginTop: 2 }}>
          {done ? <CheckCircle2 size={20} color="var(--success)" /> : <Circle size={20} color="var(--text-faint)" />}
        </span>
      ) : (
        <input
          type="checkbox"
          checked={done}
          onChange={toggle}
          disabled={pending}
          aria-label={`Marcar "${item.title}" como ${done ? "não concluída" : "concluída"}`}
          style={{ width: 20, height: 20, accentColor: "var(--accent)", marginTop: 2 }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="badge">
            <Icon size={12} /> {KIND_LABEL[item.kind]}
          </span>
          <span className="tiny faint">~{item.est_minutes} min</span>
        </div>
        <div style={{ fontWeight: 650, marginTop: 4, textDecoration: done ? "line-through" : undefined, color: done ? "var(--text-faint)" : undefined }}>
          {href ? <Link href={href}>{item.title}</Link> : item.title}
        </div>
        <div className="small muted">{item.detail}</div>
        {error ? <div className="error-text">{error}</div> : null}
      </div>
      {href && !done ? (
        <Link href={href} className="btn btn-sm">
          Abrir
        </Link>
      ) : null}
    </div>
  );
}
