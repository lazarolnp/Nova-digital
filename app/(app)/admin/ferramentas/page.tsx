import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listTools, type ToolRow } from "@/lib/content";
import { deleteToolAction, saveToolAction } from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";

export const metadata: Metadata = { title: "Admin · Ferramentas" };

function ToolFields({ t }: { t?: ToolRow }) {
  const p = t ? `t${t.id}-` : "new-";
  return (
    <>
      <div className="grid grid-3" style={{ gap: 10 }}>
        <input name="name" className="input" defaultValue={t?.name} placeholder="Nome" aria-label="Nome" required />
        <input name="category" className="input" defaultValue={t?.category} placeholder="Categoria" aria-label="Categoria" required />
        <input name="url" className="input" defaultValue={t?.url} placeholder="https://site-oficial" aria-label="Link oficial" required />
        <select name="pricing" className="select" defaultValue={t?.pricing ?? "freemium"} aria-label="Modelo de preço">
          <option value="gratuito">Gratuito</option>
          <option value="freemium">Freemium</option>
          <option value="pago">Pago</option>
        </select>
        <select name="difficulty" className="select" defaultValue={t?.difficulty ?? "Fácil"} aria-label="Dificuldade">
          <option>Fácil</option>
          <option>Médio</option>
          <option>Avançado</option>
        </select>
        <label className="check" htmlFor={`${p}premium`}>
          <input id={`${p}premium`} type="checkbox" name="is_premium" defaultChecked={t?.is_premium === 1} /> <span>Exclusiva de planos pagos</span>
        </label>
      </div>
      <textarea name="description" className="textarea" style={{ minHeight: 60 }} defaultValue={t?.description} placeholder="Descrição" aria-label="Descrição" required />
      <div className="grid grid-2" style={{ gap: 10 }}>
        <input name="use_case" className="input" defaultValue={t?.use_case} placeholder="Para que usar" aria-label="Para que usar" />
        <input name="pricing_note" className="input" defaultValue={t?.pricing_note} placeholder="Observação sobre planos" aria-label="Observação sobre planos" />
      </div>
    </>
  );
}

export default async function AdminTools({ searchParams }: { searchParams: Flash }) {
  await requireAdmin();
  const flash = await searchParams;
  const tools = await listTools();
  return (
    <>
      <AdminHeader title="Ferramentas" active="/admin/ferramentas" {...flash} />
      <form action={saveToolAction.bind(null, null)} className="card stack">
        <h2 className="card-title">Adicionar ferramenta</h2>
        <p className="small muted">Cadastre apenas ferramentas reais, com link oficial e modelo de preço confirmado.</p>
        <ToolFields />
        <button type="submit" className="btn btn-primary">
          Adicionar
        </button>
      </form>
      {tools.map((t) => (
        <details key={t.id} className="card">
          <summary style={{ cursor: "pointer", fontWeight: 650 }}>
            {t.name} <span className="small muted">· {t.category} · {t.pricing}</span>
          </summary>
          <form action={saveToolAction.bind(null, t.id)} className="stack" style={{ marginTop: 14 }}>
            <ToolFields t={t} />
            <div className="row">
              <button type="submit" className="btn btn-sm btn-primary">
                Salvar
              </button>
              <button type="submit" formAction={deleteToolAction.bind(null, t.id)} className="btn btn-sm btn-danger">
                Remover
              </button>
            </div>
          </form>
        </details>
      ))}
    </>
  );
}
