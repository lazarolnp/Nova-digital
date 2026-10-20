"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { batch, get, run } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { limit, planOf } from "@/lib/access";
import { XP, awardXp, checkAchievements, revokeXp } from "@/lib/progress";
import { PROJECT_CATEGORIES, PROJECT_STATUS, PROJECT_TEMPLATES } from "@/lib/options";
import { firstError, str, urlSchema, type FormState } from "@/lib/validation";

const projectSchema = z.object({
  name: z.string().trim().min(2, "Dê um nome ao projeto.").max(120),
  category: z.enum(PROJECT_CATEGORIES as [string, ...string[]], { message: "Escolha uma categoria." }),
  description: z.string().max(4000),
  objective: z.string().max(2000),
  status: z.enum(Object.keys(PROJECT_STATUS) as [string, ...string[]]),
  results: z.string().max(6000),
  is_demo: z.boolean(),
  is_public: z.boolean(),
});

const linkSchema = z.object({ title: z.string().trim().min(1).max(120), url: urlSchema.refine((v) => v !== "", "Informe o link.") });

async function ownProject(userId: number, projectId: number) {
  return await get<{ id: number; status: string }>("SELECT id, status FROM projects WHERE id = ? AND user_id = ?", projectId, userId);
}

async function checkProjectLimit(userId: number, plan: "free" | "premium") {
  const count = (await get<{ n: number }>("SELECT COUNT(*) AS n FROM projects WHERE user_id = ?", userId))?.n ?? 0;
  return count < await limit(plan, "max_projects");
}

export async function createProjectAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireOnboardedUser();
  if (!await checkProjectLimit(user.id, await planOf(user))) return { error: "Você atingiu o limite de projetos do seu plano." };
  const template = PROJECT_TEMPLATES.find((t) => t.key === str(fd, "template"));
  let id: number;
  if (template) {
    const projectRef = "(SELECT MAX(id) FROM projects WHERE user_id = ?)";
    await batch([
      {
        sql: "INSERT INTO projects (user_id, name, category, description, objective, is_demo) VALUES (?, ?, ?, ?, ?, 1)",
        args: [user.id, template.name, template.category, template.description, template.objective],
      },
      ...template.steps.map((title, i) => ({
        sql: `INSERT INTO project_steps (project_id, title, sort) VALUES (${projectRef}, ?, ?)`,
        args: [user.id, title, i],
      })),
    ]);
    id = (await get<{ id: number }>("SELECT MAX(id) AS id FROM projects WHERE user_id = ?", user.id))?.id ?? 0;
  } else {
    const parsed = projectSchema.safeParse({
      name: str(fd, "name"),
      category: str(fd, "category"),
      description: str(fd, "description"),
      objective: str(fd, "objective"),
      status: "planejamento",
      results: "",
      is_demo: fd.get("is_demo") === "on",
      is_public: false,
    });
    if (!parsed.success) return { error: firstError(parsed.error) };
    const p = parsed.data;
    id = Number(
      (await run(
        "INSERT INTO projects (user_id, name, category, description, objective, is_demo) VALUES (?, ?, ?, ?, ?, ?)",
        user.id,
        p.name,
        p.category,
        p.description,
        p.objective,
        p.is_demo ? 1 : 0,
      )).lastInsertRowid,
    );
  }
  revalidatePath("/projetos");
  redirect(`/projetos/${id}`);
}

export async function updateProjectAction(projectId: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireOnboardedUser();
  const project = await ownProject(user.id, projectId);
  if (!project) return { error: "Projeto não encontrado." };
  const parsed = projectSchema.safeParse({
    name: str(fd, "name"),
    category: str(fd, "category"),
    description: str(fd, "description"),
    objective: str(fd, "objective"),
    status: str(fd, "status"),
    results: str(fd, "results"),
    is_demo: fd.get("is_demo") === "on",
    is_public: fd.get("is_public") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const p = parsed.data;
  await run(
    `UPDATE projects SET name = ?, category = ?, description = ?, objective = ?, status = ?, results = ?, is_demo = ?, is_public = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
    p.name,
    p.category,
    p.description,
    p.objective,
    p.status,
    p.results,
    p.is_demo ? 1 : 0,
    p.is_public ? 1 : 0,
    project.id,
    user.id,
  );
  if (p.status === "concluido") {
    await awardXp(user.id, "projeto", project.id, XP.project);
    await checkAchievements(user.id);
  } else {
    await revokeXp(user.id, "projeto", project.id);
  }
  revalidatePath("/", "layout");
  return { ok: "Projeto salvo." };
}

export async function deleteProjectAction(projectId: number) {
  const user = await requireOnboardedUser();
  await batch([
    { sql: "DELETE FROM project_steps WHERE project_id IN (SELECT id FROM projects WHERE id = ? AND user_id = ?)", args: [projectId, user.id] },
    { sql: "DELETE FROM projects WHERE id = ? AND user_id = ?", args: [projectId, user.id] },
  ]);
  await revokeXp(user.id, "projeto", projectId);
  revalidatePath("/projetos");
  redirect("/projetos");
}

export async function addStepAction(projectId: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireOnboardedUser();
  if (!await ownProject(user.id, projectId)) return { error: "Projeto não encontrado." };
  const title = str(fd, "title").trim();
  if (!title) return { error: "Descreva a etapa." };
  if (title.length > 200) return { error: "Etapa muito longa." };
  const count = (await get<{ n: number }>("SELECT COUNT(*) AS n FROM project_steps WHERE project_id = ?", projectId))?.n ?? 0;
  if (count >= 50) return { error: "Limite de 50 etapas por projeto." };
  await run("INSERT INTO project_steps (project_id, title, sort) VALUES (?, ?, ?)", projectId, title, count);
  revalidatePath(`/projetos/${projectId}`);
  return { ok: "Etapa adicionada." };
}

export async function toggleStepAction(stepId: number, done: boolean) {
  const user = await requireOnboardedUser();
  const step = await get<{ project_id: number }>(
    "SELECT s.project_id FROM project_steps s JOIN projects p ON p.id = s.project_id WHERE s.id = ? AND p.user_id = ?",
    stepId,
    user.id,
  );
  if (!step) return { error: "Etapa não encontrada." };
  await run("UPDATE project_steps SET done = ? WHERE id = ?", done ? 1 : 0, stepId);
  await run("UPDATE projects SET updated_at = datetime('now') WHERE id = ?", step.project_id);
  revalidatePath(`/projetos/${step.project_id}`);
  return { ok: true };
}

export async function deleteStepAction(stepId: number) {
  const user = await requireOnboardedUser();
  const step = await get<{ project_id: number }>(
    "SELECT s.project_id FROM project_steps s JOIN projects p ON p.id = s.project_id WHERE s.id = ? AND p.user_id = ?",
    stepId,
    user.id,
  );
  if (!step) return { error: "Etapa não encontrada." };
  await run("DELETE FROM project_steps WHERE id = ?", stepId);
  revalidatePath(`/projetos/${step.project_id}`);
  return { ok: true };
}

export async function addLinkAction(projectId: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireOnboardedUser();
  const project = await get<{ links: string }>("SELECT links FROM projects WHERE id = ? AND user_id = ?", projectId, user.id);
  if (!project) return { error: "Projeto não encontrado." };
  const parsed = linkSchema.safeParse({ title: str(fd, "title"), url: str(fd, "url") });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const links = JSON.parse(project.links) as { title: string; url: string }[];
  if (links.length >= 20) return { error: "Limite de 20 links por projeto." };
  links.push(parsed.data);
  await run("UPDATE projects SET links = ?, updated_at = datetime('now') WHERE id = ?", JSON.stringify(links), projectId);
  revalidatePath(`/projetos/${projectId}`);
  return { ok: "Link adicionado." };
}

export async function removeLinkAction(projectId: number, index: number) {
  const user = await requireOnboardedUser();
  const project = await get<{ links: string }>("SELECT links FROM projects WHERE id = ? AND user_id = ?", projectId, user.id);
  if (!project) return { error: "Projeto não encontrado." };
  const links = JSON.parse(project.links) as unknown[];
  links.splice(index, 1);
  await run("UPDATE projects SET links = ? WHERE id = ?", JSON.stringify(links), projectId);
  revalidatePath(`/projetos/${projectId}`);
  return { ok: true };
}
