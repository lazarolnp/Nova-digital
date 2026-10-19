"use client";

import { useActionState, useState } from "react";
import { onboardingAction } from "@/app/actions/auth";
import { ONBOARDING_QUESTIONS, type OnboardingKey } from "@/lib/options";

const KEYS = Object.keys(ONBOARDING_QUESTIONS) as OnboardingKey[];

export function OnboardingForm({ initial }: { initial?: Partial<Record<OnboardingKey, string>> }) {
  const [state, action, pending] = useActionState(onboardingAction, undefined);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<OnboardingKey, string>>>(initial ?? {});
  const key = KEYS[step];
  const q = ONBOARDING_QUESTIONS[key];
  const last = step === KEYS.length - 1;

  return (
    <form action={action} className="stack-lg">
      {KEYS.map((k) => (
        <input key={k} type="hidden" name={k} value={answers[k] ?? ""} />
      ))}
      <div className="steps-dots" aria-label={`Pergunta ${step + 1} de ${KEYS.length}`}>
        {KEYS.map((k, i) => (
          <span key={k} className={i <= step ? "on" : ""} />
        ))}
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack fade-in" key={key}>
        <legend className="label" style={{ marginBottom: 8 }}>
          Pergunta {step + 1} de {KEYS.length}
        </legend>
        <h2 style={{ fontSize: 20 }}>{q.label}</h2>
        <div className="option-grid" role="radiogroup" aria-label={q.label} style={{ marginTop: 8 }}>
          {q.options.map((o) => {
            const selected = answers[key] === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`option${selected ? " selected" : ""}`}
                onClick={() => {
                  setAnswers((a) => ({ ...a, [key]: o.value }));
                  if (!last) setTimeout(() => setStep((s) => Math.min(s + 1, KEYS.length - 1)), 150);
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      {state?.error ? (
        <div className="alert alert-error" role="alert">
          {state.error}
        </div>
      ) : null}
      <div className="row between">
        <button type="button" className="btn" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Voltar
        </button>
        {last ? (
          <button type="submit" className="btn btn-primary" disabled={pending || KEYS.some((k) => !answers[k])}>
            {pending ? "Gerando seu plano..." : "Gerar meu plano de 30 dias"}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!answers[key]}>
            Próxima
          </button>
        )}
      </div>
    </form>
  );
}
