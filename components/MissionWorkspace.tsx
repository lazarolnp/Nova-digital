"use client";

import { useActionState, useState, useTransition } from "react";
import { Bot, CheckCircle2, RotateCcw } from "lucide-react";
import {
  completeMissionAction,
  reopenMissionAction,
  saveMissionResultAction,
  startMissionAction,
  toggleMissionCheckAction,
} from "@/app/actions/learning";
import { requestMissionFeedbackAction } from "@/app/actions/ai";
import { SubmitButton } from "./SubmitButton";
import { Markdown } from "./Markdown";

type Props = {
  missionId: number;
  checklist: string[];
  criteria: string[];
  xp: number;
  aiEnabled: boolean;
  showAi: boolean;
  progress: {
    status: "em_andamento" | "concluida";
    checks: boolean[];
    review: boolean[];
    result_text: string;
    result_url: string;
    ai_feedback: string;
  } | null;
};

export function MissionWorkspace({ missionId, checklist, criteria, xp, aiEnabled, showAi, progress }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState<boolean[]>(checklist.map((_, i) => Boolean(progress?.checks[i])));
  const [review, setReview] = useState<boolean[]>(criteria.map((_, i) => Boolean(progress?.review[i])));
  const [resultState, saveResult] = useActionState(saveMissionResultAction.bind(null, missionId), undefined);
  const [feedbackPending, startFeedback] = useTransition();
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string } | { ok: boolean } | undefined>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (res && "error" in res && res.error) setError(res.error);
    });

  if (!progress) {
    return (
      <div className="card stack" style={{ alignItems: "flex-start" }}>
        <h2 className="card-title">Pronto para começar?</h2>
        <p className="muted small">Ao iniciar, você libera o checklist, o registro do resultado e a autoavaliação.</p>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => run(() => startMissionAction(missionId))}>
          {pending ? "Iniciando..." : "Iniciar missão"}
        </button>
        {error ? <span className="error-text">{error}</span> : null}
      </div>
    );
  }

  const completed = progress.status === "concluida";
  const toggle = (kind: "checklist" | "self_review", i: number, value: boolean) => {
    const setter = kind === "checklist" ? setChecks : setReview;
    setter((arr) => arr.map((v, idx) => (idx === i ? value : v)));
    run(async () => {
      const res = await toggleMissionCheckAction(missionId, i, kind, value);
      if (res?.error) setter((arr) => arr.map((v, idx) => (idx === i ? !value : v)));
      return res;
    });
  };

  return (
    <div className="stack-lg">
      {completed ? (
        <div className="alert alert-success row between" role="status">
          <span>
            <CheckCircle2 size={16} style={{ verticalAlign: "-3px" }} /> Missão concluída! +{xp} XP
          </span>
          <button type="button" className="btn btn-sm" disabled={pending} onClick={() => run(() => reopenMissionAction(missionId))}>
            <RotateCcw size={14} /> Reabrir para editar
          </button>
        </div>
      ) : null}

      <section className="card" aria-labelledby="checklist">
        <div className="card-head">
          <h2 id="checklist" className="card-title">
            Checklist de conclusão
          </h2>
          <span className="small muted">
            {checks.filter(Boolean).length}/{checklist.length}
          </span>
        </div>
        {checklist.map((c, i) => (
          <label key={c} className={`check${checks[i] ? " done" : ""}`}>
            <input type="checkbox" checked={checks[i]} disabled={completed} onChange={(e) => toggle("checklist", i, e.target.checked)} />
            <span>{c}</span>
          </label>
        ))}
      </section>

      <section className="card" aria-labelledby="resultado">
        <h2 id="resultado" className="card-title">
          Registro do resultado
        </h2>
        <p className="small muted" style={{ margin: "6px 0 14px" }}>
          Descreva o que você fez, decisões e aprendizados. Adicione o link do trabalho (Drive, Canva, página publicada, vídeo etc.).
        </p>
        <form action={saveResult} className="stack">
          <div className="field">
            <label htmlFor="result_text">O que você fez</label>
            <textarea id="result_text" name="result_text" className="textarea" defaultValue={progress.result_text} maxLength={8000} disabled={completed} />
          </div>
          <div className="field">
            <label htmlFor="result_url">Link do resultado (opcional)</label>
            <input id="result_url" name="result_url" type="url" className="input" defaultValue={progress.result_url} placeholder="https://" disabled={completed} />
          </div>
          {!completed ? (
            <div className="row">
              <SubmitButton className="btn">Salvar registro</SubmitButton>
              {resultState?.ok ? <span className="small" style={{ color: "var(--success)" }}>{resultState.ok}</span> : null}
              {resultState?.error ? <span className="error-text">{resultState.error}</span> : null}
            </div>
          ) : null}
        </form>
      </section>

      <section className="card" aria-labelledby="criterios">
        <h2 id="criterios" className="card-title">
          Critérios de avaliação
        </h2>
        <p className="small muted" style={{ margin: "6px 0 10px" }}>
          Use como autoavaliação: marque os critérios que seu trabalho atende.
        </p>
        {criteria.map((c, i) => (
          <label key={c} className="check">
            <input type="checkbox" checked={review[i]} onChange={(e) => toggle("self_review", i, e.target.checked)} />
            <span>{c}</span>
          </label>
        ))}
      </section>

      {showAi ? (
      <section className="card" aria-labelledby="feedback">
        <div className="card-head">
          <h2 id="feedback" className="card-title">
            Feedback do assistente
          </h2>
          <button
            type="button"
            className="btn btn-sm"
            disabled={!aiEnabled || feedbackPending}
            onClick={() =>
              startFeedback(async () => {
                setFeedbackError(null);
                const res = await requestMissionFeedbackAction(missionId);
                if (res.error) setFeedbackError(res.error);
              })
            }
          >
            <Bot size={14} /> {feedbackPending ? "Analisando..." : progress.ai_feedback ? "Pedir novo feedback" : "Pedir feedback"}
          </button>
        </div>
        {!aiEnabled ? <p className="small muted">O assistente de IA ainda não foi configurado nesta instalação.</p> : null}
        {feedbackError ? <p className="error-text">{feedbackError}</p> : null}
        {progress.ai_feedback ? (
          <Markdown source={progress.ai_feedback} />
        ) : aiEnabled ? (
          <p className="small muted">Salve o registro do resultado e peça uma análise com base nos critérios desta missão.</p>
        ) : null}
      </section>
      ) : null}

      {!completed ? (
        <div className="card row between">
          <p className="small muted" style={{ maxWidth: 520 }}>
            Para concluir, marque todos os itens do checklist e registre o resultado (texto ou link).
          </p>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => run(() => completeMissionAction(missionId))}>
            <CheckCircle2 size={16} /> Concluir missão
          </button>
        </div>
      ) : null}
      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
