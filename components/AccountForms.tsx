"use client";

import { useActionState } from "react";
import { changePasswordAction, deleteAccountAction, updateProfileAction } from "@/app/actions/account";
import { SubmitButton } from "./SubmitButton";

function Status({ state }: { state: { ok?: string; error?: string } | undefined }) {
  if (state?.error) return <span className="error-text" role="alert">{state.error}</span>;
  if (state?.ok) return <span className="small" style={{ color: "var(--success)" }} role="status">{state.ok}</span>;
  return null;
}

export function ProfileForm({ user }: { user: { name: string; email: string; handle: string; bio: string; portfolio_public: number } }) {
  const [state, action] = useActionState(updateProfileAction, undefined);
  return (
    <form action={action} className="card stack">
      <h2 className="card-title">Dados da conta</h2>
      <div className="field">
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" className="input" defaultValue={user.name} required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" className="input" value={user.email} disabled readOnly />
      </div>
      <div className="field">
        <label htmlFor="handle">Endereço do portfólio</label>
        <input id="handle" name="handle" className="input" defaultValue={user.handle} required maxLength={40} />
        <span className="help">Seu portfólio público fica em /portfolio/{user.handle}</span>
      </div>
      <div className="field">
        <label htmlFor="bio">Apresentação profissional</label>
        <textarea id="bio" name="bio" className="textarea" defaultValue={user.bio} maxLength={600} placeholder="Ex.: Crio landing pages para profissionais de saúde..." />
      </div>
      <label className="check">
        <input type="checkbox" name="portfolio_public" defaultChecked={user.portfolio_public === 1} />
        <span>Ativar portfólio público (mostra apenas os projetos que você marcar)</span>
      </label>
      <div className="row">
        <SubmitButton>Salvar alterações</SubmitButton>
        <Status state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="stack">
      <div className="field">
        <label htmlFor="current">Senha atual</label>
        <input id="current" name="current" type="password" className="input" autoComplete="current-password" required />
      </div>
      <div className="field">
        <label htmlFor="next">Nova senha</label>
        <input id="next" name="next" type="password" className="input" autoComplete="new-password" minLength={8} required />
      </div>
      <SubmitButton className="btn btn-block">Alterar senha</SubmitButton>
      <Status state={state} />
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, undefined);
  return (
    <details>
      <summary className="btn btn-danger btn-block" style={{ listStyle: "none" }}>
        Excluir conta
      </summary>
      <form action={action} className="stack" style={{ marginTop: 12 }}>
        <p className="small muted">Todos os seus dados (progresso, projetos e conversas) serão apagados permanentemente.</p>
        <input name="password" type="password" className="input" placeholder="Sua senha" aria-label="Sua senha" required />
        <input name="confirm" className="input" placeholder='Digite "EXCLUIR"' aria-label="Confirmação" required />
        <SubmitButton className="btn btn-danger btn-block" pendingText="Excluindo...">
          Excluir permanentemente
        </SubmitButton>
        <Status state={state} />
      </form>
    </details>
  );
}
