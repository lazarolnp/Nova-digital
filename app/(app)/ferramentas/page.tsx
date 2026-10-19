import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { listTools } from "@/lib/content";
import { canAccessPremium, planOf } from "@/lib/access";
import { PageHeader } from "@/components/PageHeader";
import { ToolsBrowser, type ToolView } from "@/components/ToolsBrowser";

export const metadata: Metadata = { title: "Ferramentas" };

const ORDER = [
  "Design e criativos",
  "Edição de vídeo",
  "Inteligência artificial",
  "Criação de sites",
  "Gestão de redes sociais",
  "Análise de anúncios",
  "Organização e produtividade",
  "Prospecção e atendimento comercial",
];

export default async function ToolsPage() {
  const user = await requireOnboardedUser();
  const plan = planOf(user);
  const tools: ToolView[] = listTools().map((t) => {
    const locked = !canAccessPremium(plan, t.is_premium);
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      use_case: t.use_case,
      difficulty: t.difficulty,
      pricing: t.pricing,
      pricing_note: t.pricing_note,
      url: locked ? null : t.url,
      locked,
    };
  });
  const categories = Array.from(new Set(tools.map((t) => t.category))).sort((a, b) => {
    const ia = ORDER.indexOf(a);
    const ib = ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return (
    <>
      <PageHeader title="Kit de ferramentas digitais" subtitle="Ferramentas reais para começar, com opções gratuitas para orçamento reduzido." />
      <div className="alert alert-info">
        Planos e preços das ferramentas mudam com frequência. A classificação (gratuito, freemium ou pago) indica o modelo geral — confirme
        sempre as condições atuais no site oficial antes de contratar.
      </div>
      <ToolsBrowser tools={tools} categories={categories} />
    </>
  );
}
