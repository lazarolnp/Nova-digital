import type { Client, InStatement } from "@libsql/client";
import { TRAIL_AFILIADO } from "./trail-afiliados";
import { TRAIL_DROPSHIPPING } from "./trail-dropshipping";
import { TRAIL_CRIACAO_SITES } from "./trail-sites";
import { TRAIL_SAAS } from "./trail-saas";
import { TRAIL_OUTRAS } from "./trail-outras";
import { TRAIL_LOW_TICKET } from "./trail-lowticket";
import type { SeedTrail } from "./types";
import { SEED_MISSIONS } from "./missions";
import { SEED_TOOLS } from "./tools";

export const SEED_TRAILS = [TRAIL_AFILIADO, TRAIL_LOW_TICKET, TRAIL_DROPSHIPPING, TRAIL_CRIACAO_SITES, TRAIL_SAAS, TRAIL_OUTRAS];

export function trailAssistant(slug: string) {
  return SEED_TRAILS.find((t) => t.slug === slug) ?? null;
}

/**
 * Versão do conteúdo inicial. Ao mudar o conteúdo em lib/seed, aumente este número:
 * - versões >= ADDITIVE_FROM recebem só o que é novo (trilhas, missões e ferramentas), sem zerar progresso;
 * - versões mais antigas são ressincronizadas por completo.
 */
export const CONTENT_VERSION = 3;
const ADDITIVE_FROM = 2;

export const DEFAULT_SETTINGS: Record<string, string> = {
  "limit.free.ai_messages_per_day": "10",
  "limit.premium.ai_messages_per_day": "100",
  "limit.free.max_projects": "3",
  "limit.premium.max_projects": "100",
  "billing.premium_price_label": "",
  "billing.checkout_url": "",
};

const COURSE_ID = "(SELECT id FROM courses WHERE slug = ?)";

/** Insere uma trilha completa. As referências usam slugs, então funciona em bancos novos ou já em uso. */
function trailStatements(t: SeedTrail, sort: number): InStatement[] {
  const stmts: InStatement[] = [
    {
      sql: "INSERT INTO trails (slug, title, subtitle, description, level_label, sort) VALUES (?, ?, ?, ?, ?, ?)",
      args: [t.slug, t.title, t.subtitle, t.description, t.level, sort],
    },
  ];
  t.courses.forEach((c, ci) => {
    stmts.push({
      sql: "INSERT INTO courses (slug, trail_id, title, summary, description, skills, is_premium, sort) VALUES (?, (SELECT id FROM trails WHERE slug = ?), ?, ?, ?, ?, ?, ?)",
      args: [c.slug, t.slug, c.title, c.summary, c.description, c.skills.join(", "), c.premium ? 1 : 0, sort * 100 + ci],
    });
    c.modules.forEach((m, mi) => {
      stmts.push({ sql: `INSERT INTO modules (course_id, title, sort) VALUES (${COURSE_ID}, ?, ?)`, args: [c.slug, m.title, mi] });
      m.lessons.forEach((l, li) => {
        stmts.push({
          // O módulo recém-criado é o de maior id do curso.
          sql: `INSERT INTO lessons (module_id, title, content, exercise, materials, duration_min, is_free_preview, sort)
                VALUES ((SELECT MAX(id) FROM modules WHERE course_id = ${COURSE_ID}), ?, ?, ?, ?, ?, ?, ?)`,
          args: [c.slug, l.title, l.content, l.exercise, JSON.stringify(l.materials ?? []), l.duration, l.preview ? 1 : 0, li],
        });
      });
    });
  });
  return stmts;
}

/** Missões e ferramentas: só insere as que ainda não existem. */
function missionAndToolStatements(): InStatement[] {
  const stmts: InStatement[] = SEED_MISSIONS.map((m, i) => ({
    sql: `INSERT OR IGNORE INTO missions (slug, trail_id, title, objective, steps, tools, checklist, criteria, est_minutes, difficulty, xp, is_premium, sort)
          VALUES (?, (SELECT id FROM trails WHERE slug = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      m.slug,
      m.trail,
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
  }));
  SEED_TOOLS.forEach((t, i) => {
    stmts.push({
      sql: `INSERT INTO tools (name, category, description, use_case, difficulty, pricing, pricing_note, url, is_premium, sort)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM tools WHERE name = ?)`,
      args: [t.name, t.category, t.description, t.useCase, t.difficulty, t.pricing, t.pricingNote, t.url, t.premium ? 1 : 0, i, t.name],
    });
  });
  return stmts;
}

/** Ordem de exibição das trilhas e cursos conforme SEED_TRAILS. */
function orderStatements(): InStatement[] {
  return SEED_TRAILS.flatMap((t, ti) => [
    { sql: "UPDATE trails SET sort = ? WHERE slug = ?", args: [ti, t.slug] },
    ...t.courses.map((c, ci) => ({ sql: "UPDATE courses SET sort = ? WHERE slug = ?", args: [ti * 100 + ci, c.slug] })),
  ]);
}

const versionStatement = (): InStatement => ({
  sql: "INSERT INTO settings (key, value) VALUES ('content.version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  args: [String(CONTENT_VERSION)],
});

// Reorganização completa (bancos de versões antigas): o progresso ligado às aulas e missões antigas deixa de valer.
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
     SELECT id, 'sistema', 'As trilhas foram reorganizadas', 'Agora cada forma do digital tem sua trilha, com assistente de IA e guia em PDF. Refaça seu plano de 30 dias.', '/onboarding'
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

  const trailCount = Number((await db.execute("SELECT COUNT(*) AS n FROM trails")).rows[0][0]);
  const readVersion = async () => Number((await db.execute("SELECT value FROM settings WHERE key = 'content.version'")).rows[0]?.[0] ?? 0);
  const version = await readVersion();
  if (trailCount > 0 && version >= CONTENT_VERSION) return;

  let stmts: InStatement[];
  if (trailCount === 0 || version < ADDITIVE_FROM) {
    // Banco novo ou de versão antiga: conteúdo completo.
    stmts = [
      ...(trailCount > 0 ? RESET_STATEMENTS : []),
      ...SEED_TRAILS.flatMap((t, i) => trailStatements(t, i)),
      ...missionAndToolStatements(),
      versionStatement(),
    ];
  } else {
    // Atualização incremental: só as trilhas que ainda não existem, sem mexer no progresso.
    const existing = new Set((await db.execute("SELECT slug FROM trails")).rows.map((r) => String(r[0])));
    const added = SEED_TRAILS.filter((t) => !existing.has(t.slug));
    stmts = [
      ...added.flatMap((t) => trailStatements(t, SEED_TRAILS.indexOf(t))),
      ...missionAndToolStatements(),
      ...orderStatements(),
      ...added.map((t) => ({
        sql: `INSERT INTO notifications (user_id, kind, title, body, link)
              SELECT id, 'sistema', ?, ?, ? FROM users`,
        args: [`Nova trilha: ${t.title}`, `${t.subtitle}. Já está disponível em Trilhas, com assistente de IA e guia em PDF.`, `/trilhas/${t.slug}`],
      })),
      versionStatement(),
    ];
  }

  // Lote único e atômico: ou a atualização entra inteira, ou nada muda.
  try {
    await db.batch(stmts, "write");
  } catch (err) {
    // Outra instância pode ter atualizado ao mesmo tempo; só falha se continuar desatualizado.
    if ((await readVersion()) < CONTENT_VERSION) throw err;
  }
}
