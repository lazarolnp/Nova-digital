import { SEED_TRAILS } from "./seed";

export type PaidPlan = {
  id: string;
  name: string;
  description: string;
  trails: string[];
  monthly: number;
  annual: number;
};

const ALL_TRAILS = SEED_TRAILS.map((t) => t.slug);

/** Planos pagos. Os preços são os padrões; podem ser alterados em Admin → Planos e limites. */
export const PAID_PLANS: PaidPlan[] = [
  { id: "afiliados", name: "Afiliados", description: "Trilha completa de Afiliados", trails: ["marketing-de-afiliados"], monthly: 47, annual: 397 },
  { id: "low-ticket", name: "Low ticket", description: "Trilha completa de Low ticket", trails: ["low-ticket"], monthly: 47, annual: 397 },
  { id: "outras-formas", name: "Outras formas do digital", description: "Tráfego pago, infoprodutos, vídeo, IA e serviços", trails: ["outras-formas"], monthly: 47, annual: 397 },
  { id: "sites", name: "Criação de sites", description: "Trilha completa de Criação de sites", trails: ["criacao-de-sites"], monthly: 57, annual: 477 },
  { id: "dropshipping", name: "Dropshipping", description: "Trilha completa de Dropshipping", trails: ["dropshipping"], monthly: 67, annual: 557 },
  { id: "saas", name: "Criação de SaaS", description: "Trilha completa de Criação de SaaS", trails: ["criacao-de-saas"], monthly: 67, annual: 557 },
  { id: "completo", name: "Completo", description: "Todas as trilhas, missões e guias", trails: ALL_TRAILS, monthly: 127, annual: 997 },
];

export const COMPLETE_PLAN_ID = "completo";

/** Plano pago pelo id. Assinaturas antigas com plano "premium" equivalem ao Completo. */
export function paidPlan(id: string): PaidPlan | null {
  if (id === "premium") return PAID_PLANS.find((p) => p.id === COMPLETE_PLAN_ID) ?? null;
  return PAID_PLANS.find((p) => p.id === id) ?? null;
}

/** Plano individual que libera uma trilha (para mostrar "disponível no plano X"). */
export function planForTrail(trailSlug: string | null): PaidPlan | null {
  if (!trailSlug) return null;
  return PAID_PLANS.find((p) => p.id !== COMPLETE_PLAN_ID && p.trails.includes(trailSlug)) ?? null;
}

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: value % 1 ? 2 : 0 });
}

/** Nome curto do plano que libera uma trilha, para selos como "Plano Afiliados". */
export function planLabel(trailSlug: string | null) {
  return `Plano ${planForTrail(trailSlug)?.name ?? "Completo"}`;
}
