import type { Client, InStatement } from "@libsql/client";
import { TRAIL_PRIMEIROS_PASSOS, TRAIL_TRAFEGO, TRAIL_SITES } from "./trails-a";
import { TRAIL_VIDEO, TRAIL_AFILIADOS, TRAIL_IA, TRAIL_CLIENTES } from "./trails-b";
import { SEED_MISSIONS } from "./missions";
import { SEED_TOOLS } from "./tools";

export const SEED_TRAILS = [
  TRAIL_PRIMEIROS_PASSOS,
  TRAIL_TRAFEGO,
  TRAIL_SITES,
  TRAIL_VIDEO,
  TRAIL_AFILIADOS,
  TRAIL_IA,
  TRAIL_CLIENTES,
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  "limit.free.ai_messages_per_day": "10",
  "limit.premium.ai_messages_per_day": "100",
  "limit.free.max_projects": "3",
  "limit.premium.max_projects": "100",
  "billing.premium_price_label": "",
  "billing.checkout_url": "",
};

export async function seedIfEmpty(db: Client) {
  await db.batch(
    Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      args: [key, value],
    })),
    "write",
  );

  const rs = await db.execute("SELECT COUNT(*) AS n FROM trails");
  if (Number(rs.rows[0][0]) > 0) return;

  // Tabelas vazias: IDs explícitos permitem inserir tudo em um único lote atômico.
  const stmts: InStatement[] = [];
  const trailIds = new Map<string, number>();
  let moduleId = 0;
  let lessonId = 0;

  SEED_TRAILS.forEach((t, ti) => {
    const trailId = ti + 1;
    trailIds.set(t.slug, trailId);
    stmts.push({
      sql: "INSERT INTO trails (id, slug, title, subtitle, description, level_label, sort) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [trailId, t.slug, t.title, t.subtitle, t.description, t.level, ti],
    });
    const c = t.course;
    const courseId = ti + 1;
    stmts.push({
      sql: "INSERT INTO courses (id, slug, trail_id, title, summary, description, skills, is_premium, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [courseId, c.slug, trailId, c.title, c.summary, c.description, c.skills.join(", "), c.premium ? 1 : 0, ti],
    });
    c.modules.forEach((m, mi) => {
      moduleId++;
      stmts.push({ sql: "INSERT INTO modules (id, course_id, title, sort) VALUES (?, ?, ?, ?)", args: [moduleId, courseId, m.title, mi] });
      m.lessons.forEach((l, li) => {
        lessonId++;
        stmts.push({
          sql: "INSERT INTO lessons (id, module_id, title, content, exercise, materials, duration_min, is_free_preview, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          args: [lessonId, moduleId, l.title, l.content, l.exercise, JSON.stringify(l.materials ?? []), l.duration, l.preview ? 1 : 0, li],
        });
      });
    });
  });

  SEED_MISSIONS.forEach((m, i) => {
    stmts.push({
      sql: `INSERT INTO missions (slug, trail_id, title, objective, steps, tools, checklist, criteria, est_minutes, difficulty, xp, is_premium, sort)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        m.slug,
        trailIds.get(m.trail) ?? null,
        m.title,
        m.objective,
        JSON.stringify(m.steps),
        JSON.stringify(m.tools),
        JSON.stringify(m.checklist),
        JSON.stringify(m.criteria),
        m.minutes,
        m.difficulty,
        m.xp,
        m.premium ? 1 : 0,
        i,
      ],
    });
  });

  SEED_TOOLS.forEach((t, i) => {
    stmts.push({
      sql: `INSERT INTO tools (name, category, description, use_case, difficulty, pricing, pricing_note, url, is_premium, sort)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [t.name, t.category, t.description, t.useCase, t.difficulty, t.pricing, t.pricingNote, t.url, t.premium ? 1 : 0, i],
    });
  });

  try {
    await db.batch(stmts, "write");
  } catch (err) {
    // Outra instância pode ter semeado ao mesmo tempo; só falha se o banco continuar vazio.
    const again = await db.execute("SELECT COUNT(*) AS n FROM trails");
    if (Number(again.rows[0][0]) === 0) throw err;
  }
}
