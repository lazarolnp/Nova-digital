import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync as DatabaseSyncType } from "node:sqlite";
import { SCHEMA } from "./schema";
import { seedIfEmpty } from "./seed";

// node:sqlite é carregado via getBuiltinModule para que o bundler não tente empacotá-lo.
const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");

export type DB = DatabaseSyncType;
type Param = string | number | bigint | null | Uint8Array;

const globalForDb = globalThis as unknown as { __novaDb?: DB };

function open(): DB {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "novadigital.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  seedIfEmpty(db);
  return db;
}

export function db(): DB {
  if (!globalForDb.__novaDb) globalForDb.__novaDb = open();
  return globalForDb.__novaDb;
}

// node:sqlite retorna objetos sem protótipo; convertemos para objetos comuns
// para que possam ser serializados e enviados a Client Components.
export function all<T>(sql: string, ...params: Param[]): T[] {
  return db()
    .prepare(sql)
    .all(...params)
    .map((row) => ({ ...row }) as T);
}

export function get<T>(sql: string, ...params: Param[]): T | undefined {
  const row = db().prepare(sql).get(...params);
  return row ? ({ ...row } as T) : undefined;
}

export function run(sql: string, ...params: Param[]) {
  return db().prepare(sql).run(...params);
}

export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec("BEGIN");
  try {
    const result = fn();
    d.exec("COMMIT");
    return result;
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
