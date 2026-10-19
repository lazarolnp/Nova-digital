"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { get, run } from "@/lib/db";
import {
  clearAttempts,
  clientKey,
  createSession,
  destroySession,
  hashPassword,
  isRateLimited,
  recordFailedAttempt,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { emailSchema, firstError, passwordSchema, str, type FormState } from "@/lib/validation";
import { ONBOARDING_QUESTIONS, type OnboardingAnswers } from "@/lib/options";
import { saveOnboardingAndPlan } from "@/lib/plan";
import { planOf } from "@/lib/access";
import { notify } from "@/lib/progress";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80, "Nome muito longo."),
  email: emailSchema,
  password: passwordSchema,
});

function makeHandle(name: string) {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "usuario";
  return `${base}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function signupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({ name: str(fd, "name"), email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, email, password } = parsed.data;
  if (get("SELECT id FROM users WHERE email = ?", email)) return { error: "Já existe uma conta com este e-mail." };

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const role = adminEmail && adminEmail === email ? "admin" : "user";
  const id = Number(
    run(
      "INSERT INTO users (name, email, password_hash, role, handle) VALUES (?, ?, ?, ?, ?)",
      name,
      email,
      hashPassword(password),
      role,
      makeHandle(name),
    ).lastInsertRowid,
  );
  notify(id, "sistema", "Bem-vinda(o) à NovaDigital!", "Responda as perguntas iniciais para gerar seu plano de 30 dias.", "/onboarding");
  await createSession(id);
  redirect("/onboarding");
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").trim().toLowerCase();
  const password = str(fd, "password");
  if (!email || !password) return { error: "Informe e-mail e senha." };
  const key = await clientKey(email);
  if (isRateLimited(key)) return { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." };

  const user = get<{ id: number; password_hash: string; onboarded: number }>(
    "SELECT id, password_hash, onboarded FROM users WHERE email = ?",
    email,
  );
  if (!user || !verifyPassword(password, user.password_hash)) {
    recordFailedAttempt(key);
    return { error: "E-mail ou senha incorretos." };
  }
  clearAttempts(key);
  await createSession(user.id);
  const next = str(fd, "next");
  redirect(user.onboarded ? (next.startsWith("/") && !next.startsWith("//") ? next : "/painel") : "/onboarding");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

const onboardingSchema = z.object(
  Object.fromEntries(
    Object.entries(ONBOARDING_QUESTIONS).map(([k, q]) => [
      k,
      z.enum(q.options.map((o) => o.value) as [string, ...string[]], { message: `Responda: ${q.label}` }),
    ]),
  ),
);

export async function onboardingAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(Object.keys(ONBOARDING_QUESTIONS).map((k) => [k, str(fd, k)])));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const first = !user.onboarded;
  saveOnboardingAndPlan(user.id, parsed.data as OnboardingAnswers, planOf(user));
  notify(user.id, "progresso", first ? "Seu plano de 30 dias está pronto" : "Seu plano foi atualizado", "Confira as tarefas da semana.", "/plano");
  redirect("/plano?novo=1");
}
