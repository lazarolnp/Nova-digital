// Promove uma conta existente a administradora.
// Uso: npm run make-admin -- email@exemplo.com
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Uso: npm run make-admin -- email@exemplo.com");
  process.exit(1);
}
const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "novadigital.db");
const db = new DatabaseSync(file);
const res = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
if (!res.changes) {
  console.error(`Nenhuma conta encontrada com o e-mail ${email}. Crie a conta pelo site primeiro.`);
  process.exit(1);
}
console.log(`${email} agora é administrador(a).`);
