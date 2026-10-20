import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { get, run } from "./db";

const SESSION_COOKIE = "nd_session";
const SESSION_DAYS = 30;

export type User = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  handle: string | null;
  bio: string;
  portfolio_public: number;
  onboarded: number;
  created_at: string;
};

const USER_COLUMNS = "u.id, u.name, u.email, u.role, u.handle, u.bio, u.portfolio_public, u.onboarded, u.created_at";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(expected, actual);
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", hashToken(token), userId, expires.toISOString());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE id = ?", hashToken(token));
  store.delete(SESSION_COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await get<User>(
    `SELECT ${USER_COLUMNS} FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ?`,
    hashToken(token),
    new Date().toISOString(),
  );
  return user ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/entrar");
  return user;
}

/** Usuário autenticado que já concluiu o onboarding. */
export async function requireOnboardedUser(): Promise<User> {
  const user = await requireUser();
  if (!user.onboarded) redirect("/onboarding");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/painel");
  return user;
}

// ---- Proteção contra força bruta no login ----
const MAX_ATTEMPTS = 5;
const WINDOW_MIN = 15;

export async function clientKey(email: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  return `${ip}|${email.toLowerCase()}`;
}

export async function isRateLimited(key: string) {
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
  await run("DELETE FROM login_attempts WHERE at < ?", since);
  const row = await get<{ n: number }>("SELECT COUNT(*) AS n FROM login_attempts WHERE key = ? AND at >= ?", key, since);
  return (row?.n ?? 0) >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(key: string) {
  await run("INSERT INTO login_attempts (key, at) VALUES (?, ?)", key, new Date().toISOString());
}

export async function clearAttempts(key: string) {
  await run("DELETE FROM login_attempts WHERE key = ?", key);
}
