import type { DatabaseSync } from "node:sqlite";
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

export function seedIfEmpty(db: DatabaseSync) {
  const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) insertSetting.run(key, value);

  const { n } = db.prepare("SELECT COUNT(*) AS n FROM trails").get() as { n: number };
  if (n > 0) return;

  db.exec("BEGIN");
  try {
    const insTrail = db.prepare(
      "INSERT INTO trails (slug, title, subtitle, description, level_label, sort) VALUES (?, ?, ?, ?, ?, ?)",
    );
    const insCourse = db.prepare(
      "INSERT INTO courses (slug, trail_id, title, summary, description, skills, is_premium, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const insModule = db.prepare("INSERT INTO modules (course_id, title, sort) VALUES (?, ?, ?)");
    const insLesson = db.prepare(
      "INSERT INTO lessons (module_id, title, content, exercise, materials, duration_min, is_free_preview, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const trailIds = new Map<string, number>();

    SEED_TRAILS.forEach((t, ti) => {
      const trailId = Number(insTrail.run(t.slug, t.title, t.subtitle, t.description, t.level, ti).lastInsertRowid);
      trailIds.set(t.slug, trailId);
      const c = t.course;
      const courseId = Number(
        insCourse.run(c.slug, trailId, c.title, c.summary, c.description, c.skills.join(", "), c.premium ? 1 : 0, ti)
          .lastInsertRowid,
      );
      c.modules.forEach((m, mi) => {
        const moduleId = Number(insModule.run(courseId, m.title, mi).lastInsertRowid);
        m.lessons.forEach((l, li) => {
          insLesson.run(
            moduleId,
            l.title,
            l.content,
            l.exercise,
            JSON.stringify(l.materials ?? []),
            l.duration,
            l.preview ? 1 : 0,
            li,
          );
        });
      });
    });

    const insMission = db.prepare(
      `INSERT INTO missions (slug, trail_id, title, objective, steps, tools, checklist, criteria, est_minutes, difficulty, xp, is_premium, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    SEED_MISSIONS.forEach((m, i) => {
      insMission.run(
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
      );
    });

    const insTool = db.prepare(
      `INSERT INTO tools (name, category, description, use_case, difficulty, pricing, pricing_note, url, is_premium, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    SEED_TOOLS.forEach((t, i) => {
      insTool.run(t.name, t.category, t.description, t.useCase, t.difficulty, t.pricing, t.pricingNote, t.url, t.premium ? 1 : 0, i);
    });

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
