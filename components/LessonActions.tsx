"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { saveLessonNotesAction, setLessonCompleteAction } from "@/app/actions/learning";
import { SubmitButton } from "./SubmitButton";

export function CompleteLessonButton({ lessonId, completed, nextHref }: { lessonId: number; completed: boolean; nextHref: string | null }) {
  const [done, setDone] = useState(completed);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !done;
    start(async () => {
      const res = await setLessonCompleteAction(lessonId, next);
      if (res?.error) return setError(res.error);
      setDone(next);
      setError(null);
      if (next && nextHref) router.push(nextHref);
    });
  }

  return (
    <div className="stack" style={{ gap: 6 }}>
      <button type="button" className={done ? "btn" : "btn btn-primary"} onClick={toggle} disabled={pending}>
        <CheckCircle2 size={16} />
        {pending ? "Salvando..." : done ? "Concluída · desmarcar" : nextHref ? "Concluir e ir para a próxima" : "Marcar como concluída"}
      </button>
      {error ? <span className="error-text">{error}</span> : null}
    </div>
  );
}

export function LessonNotesForm({ lessonId, notes }: { lessonId: number; notes: string }) {
  const [state, action] = useActionState(saveLessonNotesAction.bind(null, lessonId), undefined);
  return (
    <form action={action} className="stack">
      <label htmlFor="notes" className="sr-only">
        Sua resposta ao exercício
      </label>
      <textarea id="notes" name="notes" className="textarea" defaultValue={notes} maxLength={10000} placeholder="Escreva aqui sua resposta. Ela fica salva só para você." />
      <div className="row">
        <SubmitButton className="btn btn-sm">Salvar resposta</SubmitButton>
        {state?.ok ? <span className="small" style={{ color: "var(--success)" }}>{state.ok}</span> : null}
        {state?.error ? <span className="error-text">{state.error}</span> : null}
      </div>
    </form>
  );
}
