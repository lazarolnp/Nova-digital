import { SEED_TRAILS } from "./seed";

export const FREE_GUIDE = { slug: "como-funciona", title: "Como funciona o marketing digital", free: true };

/** Guias em PDF: um gratuito e um por trilha (arquivos em content/guides-pdf, gerados por npm run build:guides). */
export const GUIDES = [FREE_GUIDE, ...SEED_TRAILS.map((t) => ({ slug: t.slug, title: `Guia da trilha: ${t.title}`, free: false }))];

export function guideBySlug(slug: string) {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
