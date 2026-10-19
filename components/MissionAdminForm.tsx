import { saveMissionAction } from "@/app/actions/admin";

type M = {
  id: number;
  slug: string;
  trail_id: number | null;
  title: string;
  objective: string;
  steps: string[];
  tools: string[];
  checklist: string[];
  criteria: string[];
  est_minutes: number;
  difficulty: string;
  xp: number;
  is_premium: number;
  published: number;
  sort: number;
};

export function MissionAdminForm({ mission, trails }: { mission: M | null; trails: { id: number; title: string }[] }) {
  const m = mission;
  return (
    <form action={saveMissionAction.bind(null, m?.id ?? null)} className="card stack">
      <h2 className="card-title">{m ? "Editar missão" : "Nova missão"}</h2>
      <div className="grid grid-3" style={{ gap: 12 }}>
        <div className="field span-2">
          <label htmlFor="title">Título</label>
          <input id="title" name="title" className="input" defaultValue={m?.title} required />
        </div>
        <div className="field">
          <label htmlFor="slug">Identificador</label>
          <input id="slug" name="slug" className="input" defaultValue={m?.slug} required />
        </div>
        <div className="field">
          <label htmlFor="trail_id">Trilha</label>
          <select id="trail_id" name="trail_id" className="select" defaultValue={m?.trail_id ?? ""}>
            <option value="">Sem trilha</option>
            {trails.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="difficulty">Dificuldade</label>
          <select id="difficulty" name="difficulty" className="select" defaultValue={m?.difficulty ?? "Iniciante"}>
            <option>Iniciante</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="est_minutes">Tempo estimado (min)</label>
          <input id="est_minutes" name="est_minutes" type="number" className="input" defaultValue={m?.est_minutes ?? 60} />
        </div>
        <div className="field">
          <label htmlFor="xp">XP</label>
          <input id="xp" name="xp" type="number" className="input" defaultValue={m?.xp ?? 50} />
        </div>
        <div className="field">
          <label htmlFor="sort">Ordem</label>
          <input id="sort" name="sort" type="number" className="input" defaultValue={m?.sort ?? 0} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="objective">Objetivo</label>
        <textarea id="objective" name="objective" className="textarea" defaultValue={m?.objective} required />
      </div>
      <div className="grid grid-2" style={{ gap: 12 }}>
        {(
          [
            ["steps", "Passo a passo (um por linha)"],
            ["tools", "Ferramentas recomendadas (uma por linha)"],
            ["checklist", "Checklist de conclusão (um por linha)"],
            ["criteria", "Critérios de avaliação (um por linha)"],
          ] as const
        ).map(([k, label]) => (
          <div key={k} className="field">
            <label htmlFor={k}>{label}</label>
            <textarea id={k} name={k} className="textarea" defaultValue={m ? m[k].join("\n") : ""} />
          </div>
        ))}
      </div>
      <div className="row">
        <label className="check">
          <input type="checkbox" name="is_premium" defaultChecked={m?.is_premium === 1} /> <span>Premium</span>
        </label>
        <label className="check">
          <input type="checkbox" name="published" defaultChecked={m ? m.published === 1 : true} /> <span>Publicada</span>
        </label>
      </div>
      <button type="submit" className="btn btn-primary">
        {m ? "Salvar missão" : "Criar missão"}
      </button>
    </form>
  );
}
