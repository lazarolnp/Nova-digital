"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { get, run } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/access";
import { notify } from "@/lib/progress";
import { firstError, str } from "@/lib/validation";

function back(path: string, params: { ok?: string; erro?: string }): never {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
  revalidatePath("/", "layout");
  redirect(q ? `${path}?${q}` : path);
}

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O identificador (slug) deve conter apenas letras minúsculas, números e hífens.")
  .max(80);
const bool = (fd: FormData, key: string) => (fd.get(key) === "on" ? 1 : 0);
const lines = (v: string) =>
  v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const int = (v: string, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const httpUrl = /^https:\/\/[^\s]+$/i;

// ---- Cursos ----
const courseSchema = z.object({
  title: z.string().trim().min(2, "Informe o título.").max(140),
  slug,
  trail_id: z.number().int().positive().nullable(),
  summary: z.string().max(300),
  description: z.string().max(3000),
  skills: z.string().max(300),
});

function courseFromForm(fd: FormData) {
  const trail = str(fd, "trail_id");
  return courseSchema.safeParse({
    title: str(fd, "title"),
    slug: str(fd, "slug"),
    trail_id: trail ? Number(trail) : null,
    summary: str(fd, "summary"),
    description: str(fd, "description"),
    skills: str(fd, "skills"),
  });
}

export async function createCourseAction(fd: FormData) {
  await requireAdmin();
  const parsed = courseFromForm(fd);
  if (!parsed.success) back("/admin/conteudo", { erro: firstError(parsed.error) });
  const c = parsed.data;
  if (get("SELECT id FROM courses WHERE slug = ?", c.slug)) back("/admin/conteudo", { erro: "Já existe um curso com este identificador." });
  const sort = get<{ n: number }>("SELECT COALESCE(MAX(sort), 0) + 1 AS n FROM courses")?.n ?? 0;
  const id = run(
    "INSERT INTO courses (slug, trail_id, title, summary, description, skills, is_premium, published, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    c.slug,
    c.trail_id,
    c.title,
    c.summary,
    c.description,
    c.skills,
    bool(fd, "is_premium"),
    bool(fd, "published"),
    sort,
  ).lastInsertRowid;
  back(`/admin/conteudo/${id}`, { ok: "Curso criado." });
}

export async function updateCourseAction(courseId: number, fd: FormData) {
  await requireAdmin();
  const path = `/admin/conteudo/${courseId}`;
  const parsed = courseFromForm(fd);
  if (!parsed.success) back(path, { erro: firstError(parsed.error) });
  const c = parsed.data;
  if (get("SELECT id FROM courses WHERE slug = ? AND id <> ?", c.slug, courseId)) back(path, { erro: "Já existe um curso com este identificador." });
  run(
    "UPDATE courses SET slug = ?, trail_id = ?, title = ?, summary = ?, description = ?, skills = ?, is_premium = ?, published = ?, sort = ? WHERE id = ?",
    c.slug,
    c.trail_id,
    c.title,
    c.summary,
    c.description,
    c.skills,
    bool(fd, "is_premium"),
    bool(fd, "published"),
    int(str(fd, "sort"), 0, 9999, 0),
    courseId,
  );
  back(path, { ok: "Curso salvo." });
}

export async function deleteCourseAction(courseId: number, fd: FormData) {
  await requireAdmin();
  if (str(fd, "confirm") !== "EXCLUIR") back(`/admin/conteudo/${courseId}`, { erro: "Digite EXCLUIR para confirmar a exclusão." });
  run("DELETE FROM courses WHERE id = ?", courseId);
  back("/admin/conteudo", { ok: "Curso excluído." });
}

export async function addModuleAction(courseId: number, fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title").trim();
  if (!title || title.length > 140) back(`/admin/conteudo/${courseId}`, { erro: "Informe o título do módulo (até 140 caracteres)." });
  const sort = get<{ n: number }>("SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM modules WHERE course_id = ?", courseId)?.n ?? 0;
  run("INSERT INTO modules (course_id, title, sort) VALUES (?, ?, ?)", courseId, title, sort);
  back(`/admin/conteudo/${courseId}`, { ok: "Módulo adicionado." });
}

export async function updateModuleAction(moduleId: number, courseId: number, fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title").trim();
  if (!title || title.length > 140) back(`/admin/conteudo/${courseId}`, { erro: "Título do módulo inválido." });
  run("UPDATE modules SET title = ?, sort = ? WHERE id = ? AND course_id = ?", title, int(str(fd, "sort"), 0, 999, 0), moduleId, courseId);
  back(`/admin/conteudo/${courseId}`, { ok: "Módulo salvo." });
}

export async function deleteModuleAction(moduleId: number, courseId: number) {
  await requireAdmin();
  run("DELETE FROM modules WHERE id = ? AND course_id = ?", moduleId, courseId);
  back(`/admin/conteudo/${courseId}`, { ok: "Módulo excluído." });
}

// ---- Aulas ----
function parseMaterials(raw: string) {
  const out: { title: string; url: string }[] = [];
  for (const line of lines(raw)) {
    const [title, url] = line.split("|").map((s) => s.trim());
    if (!title || !url || !httpUrl.test(url)) return null;
    out.push({ title, url });
  }
  return out;
}

export async function createLessonAction(moduleId: number, courseId: number, fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title").trim();
  if (!title || title.length > 160) back(`/admin/conteudo/${courseId}`, { erro: "Informe o título da aula." });
  const sort = get<{ n: number }>("SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM lessons WHERE module_id = ?", moduleId)?.n ?? 0;
  const id = run("INSERT INTO lessons (module_id, title, sort) VALUES (?, ?, ?)", moduleId, title, sort).lastInsertRowid;
  back(`/admin/aulas/${id}`, { ok: "Aula criada. Preencha o conteúdo." });
}

export async function updateLessonAction(lessonId: number, fd: FormData) {
  await requireAdmin();
  const path = `/admin/aulas/${lessonId}`;
  const title = str(fd, "title").trim();
  const content = str(fd, "content");
  const exercise = str(fd, "exercise");
  const video = str(fd, "video_url").trim();
  if (!title || title.length > 160) back(path, { erro: "Informe o título da aula." });
  if (content.length > 50000 || exercise.length > 5000) back(path, { erro: "Conteúdo muito longo." });
  if (video && !httpUrl.test(video)) back(path, { erro: "O link do vídeo deve começar com https://" });
  const materials = parseMaterials(str(fd, "materials"));
  if (!materials) back(path, { erro: "Materiais: use uma linha por item no formato Título | https://link" });
  const moduleId = Number(str(fd, "module_id"));
  const owner = get<{ course_id: number }>(
    "SELECT m2.course_id FROM lessons l JOIN modules m ON m.id = l.module_id JOIN modules m2 ON m2.course_id = m.course_id WHERE l.id = ? AND m2.id = ?",
    lessonId,
    moduleId,
  );
  if (!owner) back(path, { erro: "Módulo inválido." });
  run(
    "UPDATE lessons SET module_id = ?, title = ?, content = ?, exercise = ?, materials = ?, video_url = ?, duration_min = ?, is_free_preview = ?, sort = ? WHERE id = ?",
    moduleId,
    title,
    content,
    exercise,
    JSON.stringify(materials),
    video,
    int(str(fd, "duration_min"), 1, 600, 10),
    bool(fd, "is_free_preview"),
    int(str(fd, "sort"), 0, 999, 0),
    lessonId,
  );
  back(path, { ok: "Aula salva." });
}

export async function deleteLessonAction(lessonId: number) {
  await requireAdmin();
  const course = get<{ course_id: number }>("SELECT m.course_id FROM lessons l JOIN modules m ON m.id = l.module_id WHERE l.id = ?", lessonId);
  run("DELETE FROM lessons WHERE id = ?", lessonId);
  back(course ? `/admin/conteudo/${course.course_id}` : "/admin/conteudo", { ok: "Aula excluída." });
}

// ---- Missões ----
const missionSchema = z.object({
  title: z.string().trim().min(2, "Informe o título.").max(160),
  slug,
  objective: z.string().trim().min(5, "Descreva o objetivo.").max(1000),
  difficulty: z.enum(["Iniciante", "Intermediário", "Avançado"]),
});

export async function saveMissionAction(missionId: number | null, fd: FormData) {
  await requireAdmin();
  const path = missionId ? `/admin/missoes/${missionId}` : "/admin/missoes";
  const parsed = missionSchema.safeParse({
    title: str(fd, "title"),
    slug: str(fd, "slug"),
    objective: str(fd, "objective"),
    difficulty: str(fd, "difficulty"),
  });
  if (!parsed.success) back(path, { erro: firstError(parsed.error) });
  const m = parsed.data;
  if (get("SELECT id FROM missions WHERE slug = ? AND id <> ?", m.slug, missionId ?? 0)) back(path, { erro: "Já existe uma missão com este identificador." });
  const steps = lines(str(fd, "steps"));
  const checklist = lines(str(fd, "checklist"));
  const criteria = lines(str(fd, "criteria"));
  if (!steps.length || !checklist.length || !criteria.length) back(path, { erro: "Passos, checklist e critérios precisam de pelo menos um item cada." });
  const trail = str(fd, "trail_id");
  const values = [
    m.slug,
    trail ? Number(trail) : null,
    m.title,
    m.objective,
    JSON.stringify(steps),
    JSON.stringify(lines(str(fd, "tools"))),
    JSON.stringify(checklist),
    JSON.stringify(criteria),
    int(str(fd, "est_minutes"), 5, 2000, 60),
    m.difficulty,
    int(str(fd, "xp"), 0, 500, 50),
    bool(fd, "is_premium"),
    bool(fd, "published"),
    int(str(fd, "sort"), 0, 9999, 0),
  ] as const;
  if (missionId) {
    // Se o checklist mudar de tamanho, o progresso salvo se ajusta automaticamente na próxima marcação.
    run(
      `UPDATE missions SET slug = ?, trail_id = ?, title = ?, objective = ?, steps = ?, tools = ?, checklist = ?, criteria = ?,
       est_minutes = ?, difficulty = ?, xp = ?, is_premium = ?, published = ?, sort = ? WHERE id = ?`,
      ...values,
      missionId,
    );
    back(path, { ok: "Missão salva." });
  }
  const id = run(
    `INSERT INTO missions (slug, trail_id, title, objective, steps, tools, checklist, criteria, est_minutes, difficulty, xp, is_premium, published, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...values,
  ).lastInsertRowid;
  back(`/admin/missoes/${id}`, { ok: "Missão criada." });
}

export async function deleteMissionAction(missionId: number) {
  await requireAdmin();
  run("DELETE FROM missions WHERE id = ?", missionId);
  back("/admin/missoes", { ok: "Missão excluída." });
}

// ---- Ferramentas ----
const toolSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(80),
  category: z.string().trim().min(2, "Informe a categoria.").max(80),
  description: z.string().trim().min(5, "Descreva a ferramenta.").max(500),
  use_case: z.string().max(500),
  difficulty: z.enum(["Fácil", "Médio", "Avançado"]),
  pricing: z.enum(["gratuito", "freemium", "pago"]),
  pricing_note: z.string().max(300),
  url: z.string().trim().regex(httpUrl, "Informe o link oficial começando com https://"),
});

export async function saveToolAction(toolId: number | null, fd: FormData) {
  await requireAdmin();
  const parsed = toolSchema.safeParse(Object.fromEntries(Object.keys(toolSchema.shape).map((k) => [k, str(fd, k)])));
  if (!parsed.success) back("/admin/ferramentas", { erro: firstError(parsed.error) });
  const t = parsed.data;
  const values = [t.name, t.category, t.description, t.use_case, t.difficulty, t.pricing, t.pricing_note, t.url, bool(fd, "is_premium")] as const;
  if (toolId) {
    run(
      "UPDATE tools SET name = ?, category = ?, description = ?, use_case = ?, difficulty = ?, pricing = ?, pricing_note = ?, url = ?, is_premium = ? WHERE id = ?",
      ...values,
      toolId,
    );
  } else {
    run(
      "INSERT INTO tools (name, category, description, use_case, difficulty, pricing, pricing_note, url, is_premium, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 999)",
      ...values,
    );
  }
  back("/admin/ferramentas", { ok: toolId ? "Ferramenta salva." : "Ferramenta adicionada." });
}

export async function deleteToolAction(toolId: number) {
  await requireAdmin();
  run("DELETE FROM tools WHERE id = ?", toolId);
  back("/admin/ferramentas", { ok: "Ferramenta removida." });
}

// ---- Usuários e assinaturas ----
export async function setRoleAction(userId: number, fd: FormData) {
  const admin = await requireAdmin();
  const role = str(fd, "role");
  if (role !== "user" && role !== "admin") back("/admin/usuarios", { erro: "Papel inválido." });
  if (userId === admin.id && role !== "admin") back("/admin/usuarios", { erro: "Você não pode remover o seu próprio acesso de administrador." });
  run("UPDATE users SET role = ? WHERE id = ?", role, userId);
  back("/admin/usuarios", { ok: "Papel atualizado." });
}

export async function grantPremiumAction(userId: number, fd: FormData) {
  await requireAdmin();
  const until = str(fd, "until");
  let end: string | null = null;
  if (until) {
    const d = new Date(`${until}T23:59:59Z`);
    if (Number.isNaN(d.getTime()) || d.getTime() < Date.now()) back("/admin/usuarios", { erro: "Data de validade inválida." });
    end = d.toISOString();
  }
  run("UPDATE subscriptions SET status = 'canceled' WHERE user_id = ? AND status = 'active'", userId);
  run("INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES (?, 'premium', 'active', 'manual', ?)", userId, end);
  notify(userId, "sistema", "Seu acesso Premium foi liberado", "Aproveite o catálogo completo. Refaça seu plano para incluir o conteúdo premium.", "/onboarding");
  back("/admin/usuarios", { ok: "Premium concedido." });
}

export async function revokePremiumAction(userId: number) {
  await requireAdmin();
  run("UPDATE subscriptions SET status = 'canceled' WHERE user_id = ? AND status = 'active'", userId);
  back("/admin/usuarios", { ok: "Premium revogado." });
}

// ---- Configurações ----
const LIMIT_KEYS = ["limit.free.ai_messages_per_day", "limit.premium.ai_messages_per_day", "limit.free.max_projects", "limit.premium.max_projects"];

export async function saveSettingsAction(fd: FormData) {
  await requireAdmin();
  for (const key of LIMIT_KEYS) {
    const v = str(fd, key);
    if (!/^\d{1,5}$/.test(v)) back("/admin/configuracoes", { erro: "Os limites devem ser números inteiros entre 0 e 99999." });
    setSetting(key, v);
  }
  const price = str(fd, "billing.premium_price_label").trim();
  const checkout = str(fd, "billing.checkout_url").trim();
  if (price.length > 60) back("/admin/configuracoes", { erro: "O texto de preço pode ter no máximo 60 caracteres." });
  if (checkout && !httpUrl.test(checkout)) back("/admin/configuracoes", { erro: "O link de checkout deve começar com https://" });
  setSetting("billing.premium_price_label", price);
  setSetting("billing.checkout_url", checkout);
  back("/admin/configuracoes", { ok: "Configurações salvas." });
}

// ---- Chamados ----
export async function replyTicketAction(ticketId: number, fd: FormData) {
  await requireAdmin();
  const reply = str(fd, "reply").trim();
  const status = str(fd, "status");
  if (!["aberto", "respondido", "fechado"].includes(status)) back("/admin/chamados", { erro: "Status inválido." });
  if (reply.length > 4000) back("/admin/chamados", { erro: "Resposta muito longa." });
  const ticket = get<{ user_id: number }>("SELECT user_id FROM tickets WHERE id = ?", ticketId);
  if (!ticket) back("/admin/chamados", { erro: "Chamado não encontrado." });
  run("UPDATE tickets SET reply = ?, status = ? WHERE id = ?", reply, status, ticketId);
  if (reply) notify(ticket.user_id, "sistema", `Seu chamado #${ticketId} foi respondido`, "", "/suporte");
  back("/admin/chamados", { ok: "Chamado atualizado." });
}
