"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { get, run } from "@/lib/db";
import { destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { firstError, passwordSchema, str, type FormState } from "@/lib/validation";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{2,39}$/, "O endereço do portfólio deve ter de 3 a 40 caracteres: letras minúsculas, números e hífen."),
  bio: z.string().max(600, "A apresentação pode ter no máximo 600 caracteres."),
  portfolio_public: z.boolean(),
});

export async function updateProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: str(fd, "name"),
    handle: str(fd, "handle"),
    bio: str(fd, "bio"),
    portfolio_public: fd.get("portfolio_public") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const p = parsed.data;
  if (get("SELECT id FROM users WHERE handle = ? AND id <> ?", p.handle, user.id)) return { error: "Este endereço já está em uso." };
  run("UPDATE users SET name = ?, handle = ?, bio = ?, portfolio_public = ? WHERE id = ?", p.name, p.handle, p.bio, p.portfolio_public ? 1 : 0, user.id);
  revalidatePath("/", "layout");
  return { ok: "Dados salvos." };
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const row = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", user.id);
  if (!row || !verifyPassword(str(fd, "current"), row.password_hash)) return { error: "Senha atual incorreta." };
  const parsed = passwordSchema.safeParse(str(fd, "next"));
  if (!parsed.success) return { error: firstError(parsed.error) };
  run("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(parsed.data), user.id);
  return { ok: "Senha alterada." };
}

export async function deleteAccountAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const row = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", user.id);
  if (!row || !verifyPassword(str(fd, "password"), row.password_hash)) return { error: "Senha incorreta." };
  if (str(fd, "confirm") !== "EXCLUIR") return { error: "Digite EXCLUIR para confirmar." };
  await destroySession();
  run("DELETE FROM users WHERE id = ?", user.id);
  redirect("/");
}

export async function markAllReadAction() {
  const user = await requireUser();
  run("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL", user.id);
  revalidatePath("/", "layout");
}

export async function markReadAction(id: number) {
  const user = await requireUser();
  run("UPDATE notifications SET read_at = COALESCE(read_at, datetime('now')) WHERE id = ? AND user_id = ?", id, user.id);
  revalidatePath("/", "layout");
}

const ticketSchema = z.object({
  category: z.enum(["Acesso e conta", "Conteúdo e aulas", "Planos e pagamentos", "Assistente IA", "Outro"], { message: "Escolha um assunto." }),
  message: z.string().trim().min(10, "Descreva o que está acontecendo (mínimo de 10 caracteres).").max(4000),
});

export async function createTicketAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = ticketSchema.safeParse({ category: str(fd, "category"), message: str(fd, "message") });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const open = get<{ n: number }>("SELECT COUNT(*) AS n FROM tickets WHERE user_id = ? AND status = 'aberto'", user.id)?.n ?? 0;
  if (open >= 5) return { error: "Você já tem 5 chamados abertos. Aguarde o retorno antes de abrir outro." };
  run("INSERT INTO tickets (user_id, category, message) VALUES (?, ?, ?)", user.id, parsed.data.category, parsed.data.message);
  revalidatePath("/suporte");
  return { ok: "Chamado enviado. Você verá a resposta nesta página." };
}

export async function joinWaitlistAction() {
  const user = await requireUser();
  run("INSERT OR IGNORE INTO waitlist (user_id) VALUES (?)", user.id);
  revalidatePath("/planos");
}
