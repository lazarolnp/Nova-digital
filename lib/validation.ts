import { z } from "zod";

export type FormState = { error?: string; ok?: string; fieldErrors?: Record<string, string> } | undefined;

export const emailSchema = z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(160);
export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(128, "A senha pode ter no máximo 128 caracteres.");

export const urlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Use um link começando com http:// ou https://");

export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Dados inválidos.";
}

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function intParam(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
}
