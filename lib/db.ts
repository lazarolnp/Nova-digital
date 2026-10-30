import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InStatement, type InValue } from "@libsql/client";
import { SCHEMA } from "./schema";
import { seedIfEmpty } from "./seed";

// Banco via libSQL: arquivo local em desenvolvimento ou Turso em produção (ex.: Vercel).
// URL: TURSO_DATABASE_URL (libsql://...) ou DATABASE_URL (file:...). Padrão: data/novadigital.db.

type Param = InValue;

const globalForDb = globalThis as unknown as { __novaDb?: Promise<Client> };

function databaseUrl() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  if (url) return url;
  if (process.env.VERCEL) {
    throw new Error("Configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN: a Vercel não tem disco persistente para SQLite local.");
  }
  const file = path.join(process.cwd(), "data", "novadigital.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return `file:${file}`;
}

async function open(): Promise<Client> {
  const client = createClient({ url: databaseUrl(), authToken: process.env.TURSO_AUTH_TOKEN, intMode: "number" });
  await client.executeMultiple(SCHEMA);
  await migrate(client);
  await seedIfEmpty(client);
  return client;
}

/** Colunas adicionadas depois da primeira versão (CREATE TABLE IF NOT EXISTS não altera tabelas existentes). */
const COLUMN_MIGRATIONS = [{ table: "conversations", column: "trail", ddl: "ALTER TABLE conversations ADD COLUMN trail TEXT NOT NULL DEFAULT ''" }];

async function migrate(client: Client) {
  for (const m of COLUMN_MIGRATIONS) {
    const info = await client.execute(`PRAGMA table_info(${m.table})`);
    const exists = info.rows.some((r) => r[info.columns.indexOf("name")] === m.column);
    if (!exists) {
      try {
        await client.execute(m.ddl);
      } catch (err) {
        // Outra instância pode ter adicionado a coluna ao mesmo tempo.
        if (!/duplicate column/i.test(String(err))) throw err;
      }
    }
  }
}

export function db(): Promise<Client> {
  if (!globalForDb.__novaDb) {
    globalForDb.__novaDb = open().catch((err) => {
      globalForDb.__novaDb = undefined;
      throw err;
    });
  }
  return globalForDb.__novaDb;
}

function toObject<T>(columns: string[], row: ArrayLike<unknown>): T {
  const obj: Record<string, unknown> = {};
  columns.forEach((c, i) => (obj[c] = row[i]));
  return obj as T;
}

export async function all<T>(sql: string, ...args: Param[]): Promise<T[]> {
  const rs = await (await db()).execute({ sql, args });
  return rs.rows.map((r) => toObject<T>(rs.columns, r));
}

export async function get<T>(sql: string, ...args: Param[]): Promise<T | undefined> {
  return (await all<T>(sql, ...args))[0];
}

export async function run(sql: string, ...args: Param[]) {
  const rs = await (await db()).execute({ sql, args });
  return { changes: rs.rowsAffected, lastInsertRowid: Number(rs.lastInsertRowid ?? 0) };
}

/** Executa vários comandos de forma atômica (todos ou nenhum). */
export async function batch(statements: InStatement[]) {
  await (await db()).batch(statements, "write");
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
