"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, signupAction } from "@/app/actions/auth";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="stack" noValidate>
      {state?.error ? (
        <div className="alert alert-error" role="alert">
          {state.error}
        </div>
      ) : null}
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      <SubmitButton className="btn btn-primary btn-block" pendingText="Entrando...">
        Entrar
      </SubmitButton>
      <p className="small muted" style={{ textAlign: "center" }}>
        Ainda não tem conta? <Link href="/cadastro" style={{ color: "var(--accent-text)" }}>Criar conta gratuita</Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signupAction, undefined);
  return (
    <form action={action} className="stack" noValidate>
      {state?.error ? (
        <div className="alert alert-error" role="alert">
          {state.error}
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" className="input" autoComplete="name" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required />
        <span className="help">Mínimo de 8 caracteres.</span>
      </div>
      <SubmitButton className="btn btn-primary btn-block" pendingText="Criando conta...">
        Criar conta gratuita
      </SubmitButton>
      <p className="small muted" style={{ textAlign: "center" }}>
        Já tem conta? <Link href="/entrar" style={{ color: "var(--accent-text)" }}>Entrar</Link>
      </p>
    </form>
  );
}
