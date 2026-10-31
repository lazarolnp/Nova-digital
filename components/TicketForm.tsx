"use client";

import { useActionState } from "react";
import { createTicketAction } from "@/app/actions/account";
import { SubmitButton } from "./SubmitButton";

const CATEGORIES = ["Acesso e conta", "Conteúdo e aulas", "Planos e pagamentos", "Outro"];

export function TicketForm() {
  const [state, action] = useActionState(createTicketAction, undefined);
  return (
    <form action={action} className="card stack" key={state?.ok ? "sent" : "form"}>
      <h2 className="card-title">Abrir chamado</h2>
      <div className="field">
        <label htmlFor="category">Assunto</label>
        <select id="category" name="category" className="select" defaultValue={CATEGORIES[0]}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="message">Mensagem</label>
        <textarea id="message" name="message" className="textarea" placeholder="Descreva o que está acontecendo..." maxLength={4000} required />
      </div>
      {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
      {state?.ok ? <div className="alert alert-success">{state.ok}</div> : null}
      <SubmitButton className="btn btn-primary btn-block" pendingText="Enviando...">
        Enviar chamado
      </SubmitButton>
    </form>
  );
}
