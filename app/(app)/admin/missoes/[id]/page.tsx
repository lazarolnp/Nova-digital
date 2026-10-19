import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { all, get, parseJson } from "@/lib/db";
import { intParam } from "@/lib/validation";
import { deleteMissionAction } from "@/app/actions/admin";
import { AdminHeader, type Flash } from "@/components/AdminUI";
import { MissionAdminForm } from "@/components/MissionAdminForm";

export const metadata: Metadata = { title: "Admin · Missão" };

export default async function AdminMission({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Flash }) {
  await requireAdmin();
  const id = intParam((await params).id);
  if (!id) notFound();
  const flash = await searchParams;
  const row = get<{
    id: number;
    slug: string;
    trail_id: number | null;
    title: string;
    objective: string;
    steps: string;
    tools: string;
    checklist: string;
    criteria: string;
    est_minutes: number;
    difficulty: string;
    xp: number;
    is_premium: number;
    published: number;
    sort: number;
  }>("SELECT * FROM missions WHERE id = ?", id);
  if (!row) notFound();
  const trails = all<{ id: number; title: string }>("SELECT id, title FROM trails ORDER BY sort");
  const mission = {
    ...row,
    steps: parseJson<string[]>(row.steps, []),
    tools: parseJson<string[]>(row.tools, []),
    checklist: parseJson<string[]>(row.checklist, []),
    criteria: parseJson<string[]>(row.criteria, []),
  };
  return (
    <>
      <AdminHeader title={row.title} active="/admin/missoes" {...flash} />
      <div className="row">
        <Link href="/admin/missoes" className="small muted">
          ← Todas as missões
        </Link>
        <Link href={`/missoes/${row.slug}`} className="small" style={{ color: "var(--accent-text)" }}>
          Ver como aluno
        </Link>
      </div>
      <MissionAdminForm mission={mission} trails={trails} />
      <form action={deleteMissionAction.bind(null, row.id)}>
        <button type="submit" className="btn btn-danger btn-sm">
          Excluir missão
        </button>
      </form>
    </>
  );
}
