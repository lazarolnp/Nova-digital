import type { Client, InStatement } from "@libsql/client";
import { TRAIL_AFILIADO } from "./trail-afiliados";
import { TRAIL_DROPSHIPPING } from "./trail-dropshipping";
import { TRAIL_CRIACAO_SITES } from "./trail-sites";
import { TRAIL_SAAS } from "./trail-saas";
import { TRAIL_OUTRAS } from "./trail-outras";
import { SEED_MISSIONS } from "./missions";
import { SEED_TOOLS } from "./tools";

export const SEED_TRAILS = [TRAIL_AFILIADO, TRAIL_DROPSHIPPING, TRAIL_CRIACAO_SITES, TRAIL_SAAS, TRAIL_OUTRAS];

export function trailAssistant(slug: string) {
  return SEED_TRAILS.find((t) => t.slug === slug) ?? null;
}

/** Aumente quando a estrutura do conteúdo inicial mudar: o banco é ressincronizado automaticamente. */
export const CONTENT_VERSION = "2";

export const DEFAULT_SETTINGS: Record<string, string> = {
  "limit.free.ai_messages_per_day": "10",
  "limit.premium.ai_messages_per_day": "100",
  "limit.free.max_projects": "3",
  "limit.premium.max_projects": "100",
  "billing.premium_price_label": "",
  "billing.checkout_url": "",
};

function contentStatements(): InStatement[] {
  const stmts: InStatement[] = [];
  const trailIds = new Map<string, number>();
  let courseId = 0;
  let moduleId = 0;
  let lessonId = 0;

  SEED_TRAILS.forEach((t, ti) => {
    const trailId = ti + 1;
    trailIds.set(t.slug, trailId);
    stmts.push({
      sql: "INSERT INTO trails (id, slug, title, subtitle, description, level_label, sort) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [trailId, t.slug, t.title, t.subtitle, t.description, t.level, ti],
    });
    t.courses.forEach((c, ci) => {
      courseId++;
      stmts.push({
        sql: "INSERT INTO courses (id, slug, trail_id, title, summary, description, skills, is_premium, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [courseId, c.slug, trailId, c.title, c.summary, c.description, c.skills.join(", "), c.premium ? 1 : 0, ti * 100 + ci],
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

  stmts.push({
    sql: "INSERT INTO settings (key, value) VALUES ('content.version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    args: [CONTENT_VERSION],
  });
  return stmts;
}

// Ao trocar a estrutura do conteúdo, o progresso ligado às aulas e missões antigas deixa de valer.
// Contas, projetos, conversas e assinaturas são mantidos; cada aluno é convidado a refazer o plano.
const RESET_STATEMENTS: InStatement[] = [
  "DELETE FROM plan_items",
  "DELETE FROM plans",
  "DELETE FROM lesson_progress",
  "DELETE FROM mission_progress",
  "DELETE FROM xp_events WHERE kind IN ('aula', 'missao', 'plano')",
  "DELETE FROM lessons",
  "DELETE FROM modules",
  "DELETE FROM courses",
  "DELETE FROM missions",
  "DELETE FROM tools",
  "DELETE FROM trails",
  `INSERT INTO notifications (user_id, kind, title, body, link)
     SELECT id, 'sistema', 'As trilhas foram reorganizadas', 'Agora são 5 trilhas, cada uma com assistente de IA e guia em PDF. Refaça seu plano de 30 dias.', '/onboarding'
     FROM users WHERE onboarded = 1`,
  "UPDATE users SET onboarded = 0",
];

export async function seedIfEmpty(db: Client) {
  await db.batch(
    Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      args: [key, value],
    })),
    "write",
  );

  const trails = Number((await db.execute("SELECT COUNT(*) AS n FROM trails")).rows[0][0]);
  const version = (await db.execute("SELECT value FROM settings WHERE key = 'content.version'")).rows[0]?.[0] ?? null;
  if (trails > 0 && version === CONTENT_VERSION) return;

  // Lote único e atômico: ou o conteúdo novo entra inteiro, ou nada muda.
  const stmts = trails > 0 ? [...RESET_STATEMENTS, ...contentStatements()] : contentStatements();
  try {
    await db.batch(stmts, "write");
  } catch (err) {
    // Outra instância pode ter sincronizado ao mesmo tempo; só falha se continuar desatualizado.
    const again = (await db.execute("SELECT value FROM settings WHERE key = 'content.version'")).rows[0]?.[0] ?? null;
    if (again !== CONTENT_VERSION) throw err;
  }
}
