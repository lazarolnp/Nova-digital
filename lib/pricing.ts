import "server-only";
import { allSettings } from "./access";
import { PAID_PLANS, type PaidPlan } from "./plans";

export type PlanOffer = PaidPlan & { checkoutMonthly: string; checkoutAnnual: string };

const num = (v: string | undefined, fallback: number) => {
  const n = Number.parseFloat((v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Planos com preços e links de checkout configurados em Admin → Planos e limites (ou os padrões). */
export async function planOffers(): Promise<PlanOffer[]> {
  const s = await allSettings();
  return PAID_PLANS.map((p) => ({
    ...p,
    monthly: num(s[`plan.${p.id}.price_monthly`], p.monthly),
    annual: num(s[`plan.${p.id}.price_annual`], p.annual),
    checkoutMonthly: s[`plan.${p.id}.checkout_monthly`] ?? "",
    checkoutAnnual: s[`plan.${p.id}.checkout_annual`] ?? "",
  }));
}
