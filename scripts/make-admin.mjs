// Promove uma conta existente a administradora.
// Uso: npm run make-admin -- email@exemplo.com
// Usa o mesmo banco do app: TURSO_DATABASE_URL/TURSO_AUTH_TOKEN, DATABASE_URL ou data/novadigital.db.
import path from "node:path";
import { createClient } from "@libsql/client";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Uso: npm run make-admin -- email@exemplo.com");
  process.exit(1);
}
const url =
  process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || `file:${path.join(process.cwd(), "data", "novadigital.db")}`;
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const res = await db.execute({ sql: "UPDATE users SET role = 'admin' WHERE email = ?", args: [email] });
if (!res.rowsAffected) {
  console.error(`Nenhuma conta encontrada com o e-mail ${email}. Crie a conta pelo site primeiro.`);
  process.exit(1);
}
console.log(`${email} agora é administrador(a).`);
