"use client";

import { useActionState, useState, useTransition } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import {
  addLinkAction,
  addStepAction,
  createProjectAction,
  deleteProjectAction,
  deleteStepAction,
  removeLinkAction,
  toggleStepAction,
  updateProjectAction,
} from "@/app/actions/projects";
import { PROJECT_CATEGORIES, PROJECT_STATUS } from "@/lib/options";
import { SubmitButton } from "./SubmitButton";

export function NewProjectForm({ templates, atLimit }: { templates: { key: string; name: string; description: string }[]; atLimit: boolean }) {
  const [state, action] = useActionState(createProjectAction, undefined);
  const [templateState, templateAction] = useActionState(createProjectAction, undefined);
  return (
    <div className="grid grid-2">
      <form action={action} className="card stack">
        <h2 className="card-title">Novo projeto em branco</h2>
        <div className="field">
          <label htmlFor="name">Nome</label>
          <input id="name" name="name" className="input" required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="category">Categoria</label>
          <select id="category" name="category" className="select" defaultValue={PROJECT_CATEGORIES[0]}>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="objective">Objetivo</label>
          <input id="objective" name="objective" className="input" maxLength={2000} />
        </div>
        <div className="field">
          <label htmlFor="description">Descrição</label>
          <textarea id="description" name="description" className="textarea" maxLength={4000} />
        </div>
        <label className="check">
          <input type="checkbox" name="is_demo" defaultChecked />
          <span>É um projeto demonstrativo (não feito para um cliente real)</span>
        </label>
        {state?.error ? <div className="alert alert-error">{state.error}</div> : null}
        <SubmitButton disabled={atLimit} pendingText="Criando...">
          Criar projeto
        </SubmitButton>
      </form>
      <div className="card stack">
        <h2 className="card-title">Começar de um modelo demonstrativo</h2>
        <p className="small muted">Modelos com etapas prontas. São marcados como demonstração — não representam clientes ou resultados reais.</p>
        {templates.map((t) => (
          <form key={t.key} action={templateAction} className="list-item" style={{ alignItems: "flex-start" }}>
            <input type="hidden" name="template" value={t.key} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 650 }} className="small">
                {t.name}
              </div>
              <div className="tiny faint">{t.description}</div>
            </div>
            <SubmitButton className="btn btn-sm" disabled={atLimit} pendingText="...">
              Usar
            </SubmitButton>
          </form>
        ))}
        {templateState?.error ? <div className="alert alert-error">{templateState.error}</div> : null}
      </div>
    </div>
  );
}

type Project = {
  id: number;
  name: string;
  category: string;
  description: string;
  objective: string;
  status: string;
  results: string;
  is_demo: number;
  is_public: number;
};

export function EditProjectForm({ project, portfolioUrl }: { project: Project; portfolioUrl: string | null }) {
  const [state, action] = useActionState(updateProjectAction.bind(null, project.id), undefined);
  return (
    <form action={action} className="card stack">
      <h2 className="card-title">Dados do projeto</h2>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="field">
          <label htmlFor="name">Nome</label>
          <input id="name" name="name" className="input" defaultValue={project.name} required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="category">Categoria</label>
          <select id="category" name="category" className="select" defaultValue={project.category}>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="status">Status de desenvolvimento</label>
        <select id="status" name="status" className="select" defaultValue={project.status}>
          {Object.entries(PROJECT_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="objective">Objetivo</label>
        <input id="objective" name="objective" className="input" defaultValue={project.objective} maxLength={2000} />
      </div>
      <div className="field">
        <label htmlFor="description">Descrição (desafio e processo)</label>
        <textarea id="description" name="description" className="textarea" defaultValue={project.description} maxLength={4000} />
      </div>
      <div className="field">
        <label htmlFor="results">Resultados e aprendizados</label>
        <textarea id="results" name="results" className="textarea" defaultValue={project.results} maxLength={6000} />
        <span className="help">Registre apenas resultados reais. Em projetos demonstrativos, descreva o que aprendeu.</span>
      </div>
      <label className="check">
        <input type="checkbox" name="is_demo" defaultChecked={project.is_demo === 1} />
        <span>Projeto demonstrativo (não feito para um cliente real)</span>
      </label>
      <label className="check">
        <input type="checkbox" name="is_public" defaultChecked={project.is_public === 1} />
        <span>
          Mostrar no meu portfólio público
          {portfolioUrl ? null : <span className="faint"> (ative o portfólio público em Minha conta)</span>}
        </span>
      </label>
      <div className="row">
        <SubmitButton>Salvar projeto</SubmitButton>
        {state?.ok ? <span className="small" style={{ color: "var(--success)" }}>{state.ok}</span> : null}
        {state?.error ? <span className="error-text">{state.error}</span> : null}
      </div>
    </form>
  );
}

export function StepsEditor({ projectId, steps }: { projectId: number; steps: { id: number; title: string; done: number }[] }) {
  const [state, action] = useActionState(addStepAction.bind(null, projectId), undefined);
  const [pending, start] = useTransition();
  const [local, setLocal] = useState(steps);
  const done = local.filter((s) => s.done).length;

  return (
    <div className="card stack">
      <div className="card-head" style={{ marginBottom: 0 }}>
        <h2 className="card-title">Etapas e checklist</h2>
        <span className="small muted">
          {done}/{local.length}
        </span>
      </div>
      {local.length === 0 ? <p className="small muted">Adicione as etapas do projeto.</p> : null}
      {local.map((s) => (
        <div key={s.id} className="row" style={{ flexWrap: "nowrap" }}>
          <label className={`check${s.done ? " done" : ""}`} style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={Boolean(s.done)}
              disabled={pending}
              onChange={(e) => {
                const v = e.target.checked;
                setLocal((arr) => arr.map((x) => (x.id === s.id ? { ...x, done: v ? 1 : 0 } : x)));
                start(async () => {
                  await toggleStepAction(s.id, v);
                });
              }}
            />
            <span>{s.title}</span>
          </label>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            aria-label={`Remover etapa ${s.title}`}
            disabled={pending}
            onClick={() =>
              start(async () => {
                setLocal((arr) => arr.filter((x) => x.id !== s.id));
                await deleteStepAction(s.id);
              })
            }
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <form action={action} className="row" style={{ flexWrap: "nowrap" }}>
        <label htmlFor="step" className="sr-only">
          Nova etapa
        </label>
        <input id="step" name="title" className="input" placeholder="Nova etapa" maxLength={200} required />
        <SubmitButton className="btn" pendingText="...">
          Adicionar
        </SubmitButton>
      </form>
      {state?.error ? <span className="error-text">{state.error}</span> : null}
    </div>
  );
}

export function LinksEditor({ projectId, links }: { projectId: number; links: { title: string; url: string }[] }) {
  const [state, action] = useActionState(addLinkAction.bind(null, projectId), undefined);
  const [pending, start] = useTransition();
  return (
    <div className="card stack">
      <h2 className="card-title">Links e arquivos de referência</h2>
      <p className="small muted">Adicione links para o trabalho publicado, pastas no Drive, arquivos no Canva, vídeos etc.</p>
      {links.map((l, i) => (
        <div key={`${l.url}-${i}`} className="list-item">
          <ExternalLink size={15} color="var(--accent-text)" />
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="small wrap-anywhere" style={{ flex: 1 }}>
            {l.title}
          </a>
          <button type="button" className="btn btn-sm btn-ghost" disabled={pending} aria-label={`Remover link ${l.title}`} onClick={() => start(async () => void (await removeLinkAction(projectId, i)))}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <form action={action} className="stack">
        <div className="grid grid-2" style={{ gap: 10 }}>
          <input name="title" className="input" placeholder="Título (ex.: Página publicada)" aria-label="Título do link" maxLength={120} required />
          <input name="url" type="url" className="input" placeholder="https://" aria-label="Endereço do link" required />
        </div>
        <SubmitButton className="btn btn-sm" pendingText="...">
          Adicionar link
        </SubmitButton>
      </form>
      {state?.error ? <span className="error-text">{state.error}</span> : null}
    </div>
  );
}

export function DeleteProjectButton({ projectId }: { projectId: number }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      disabled={pending}
      onClick={() => {
        if (confirm("Excluir este projeto? Esta ação não pode ser desfeita.")) start(() => deleteProjectAction(projectId));
      }}
    >
      <Trash2 size={14} /> Excluir projeto
    </button>
  );
}
