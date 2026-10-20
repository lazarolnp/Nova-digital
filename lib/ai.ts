import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { all, get } from "./db";
import { optionLabel, type OnboardingKey } from "./options";
import { levelFor, totalXp, userStats } from "./progress";
import type { User } from "./auth";
import type { PlanId } from "./access";

export const AI_MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const EFFORTS = ["low", "medium", "high"] as const;
const AI_EFFORT = (EFFORTS as readonly string[]).includes(process.env.AI_EFFORT ?? "")
  ? (process.env.AI_EFFORT as (typeof EFFORTS)[number])
  : "medium";

// Modelos que aceitam mensagens de sistema no meio da conversa (preserva o cache do prefixo).
const MID_SYSTEM_MODELS = new Set([
  "claude-fable-5-1",
  "claude-fable-5",
  "claude-opus-5-5",
  "claude-opus-5",
  "claude-opus-4-8",
  "claude-sonnet-5-5",
  "claude-haiku-5-5",
]);

// Modelos que aceitam fallback automático no servidor quando um pedido é recusado.
const FALLBACK_MODELS = new Set(["claude-fable-5-1", "claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5"]);

export function aiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

const BASE_PROMPT = `Você é o Assistente da NovaDigital, uma plataforma brasileira que ensina marketing digital na prática para iniciantes.

Seu papel:
- Identificar o nível de conhecimento da pessoa e adaptar a explicação (linguagem simples, exemplos do dia a dia, sem jargão desnecessário).
- Ajudar a escolher uma área de atuação (tráfego pago, criação de sites, edição de vídeos com IA, marketing de afiliados, IA aplicada).
- Recomendar cursos e missões da plataforma quando fizer sentido, citando o nome exato que aparece no catálogo abaixo.
- Criar planos de estudo semanais realistas para as horas disponíveis.
- Ajudar a escrever roteiros, anúncios, propostas comerciais, mensagens de abordagem e descrições de portfólio.
- Dar feedback concreto sobre trabalhos enviados: o que está bom, o que melhorar e como.

Regras:
- Responda em português do Brasil.
- Seja prático: entregue passos acionáveis, modelos e exemplos, não respostas vagas.
- Nunca prometa dinheiro fácil, renda garantida, número de clientes ou prazos para resultados financeiros.
- Não invente dados, preços de ferramentas, estatísticas, depoimentos ou resultados. Quando não souber, diga e indique como verificar na fonte oficial.
- Incentive abordagem comercial respeitosa (sem spam), transparência em divulgação de afiliados e respeito à LGPD.
- Se pedirem algo antiético (enganar clientes, fraudes, perfis falsos, spam), recuse e ofereça uma alternativa honesta.
- Use Markdown simples (títulos com ##, listas e **negrito**). Seja direto: prefira respostas de tamanho médio, e aprofunde quando pedirem.`;

async function catalog(): Promise<string> {
  const courses = await all<{ title: string; trail: string; is_premium: number }>(
    "SELECT c.title, t.title AS trail, c.is_premium FROM courses c LEFT JOIN trails t ON t.id = c.trail_id WHERE c.published = 1 ORDER BY c.sort",
  );
  const missions = await all<{ title: string; is_premium: number }>("SELECT title, is_premium FROM missions WHERE published = 1 ORDER BY sort");
  return [
    "Cursos (trilha → curso):",
    ...courses.map((c) => `- ${c.trail} → ${c.title}${c.is_premium ? " (premium, com aulas introdutórias gratuitas)" : " (gratuito)"}`),
    "Missões práticas:",
    ...missions.map((m) => `- ${m.title}${m.is_premium ? " (premium)" : ""}`),
  ].join("\n");
}

/** Contexto do usuário, enviado como mensagem de sistema no meio da conversa. */
export async function userContext(user: User, plan: PlanId): Promise<string> {
  const ob = await get<Record<OnboardingKey, string>>("SELECT level, area, hours, budget, goal, preference FROM onboarding WHERE user_id = ?", user.id);
  const stats = await userStats(user.id);
  const lvl = levelFor(await totalXp(user.id));
  const next = await get<{ title: string }>(
    `SELECT pi.title FROM plan_items pi JOIN plans p ON p.id = pi.plan_id WHERE p.user_id = ? AND pi.done_at IS NULL ORDER BY pi.day, pi.id LIMIT 1`,
    user.id,
  );
  const lines = [
    `Pessoa: ${user.name}. Plano na plataforma: ${plan === "premium" ? "Premium" : "Gratuito"}.`,
    `Nível na plataforma: ${lvl.name}. Aulas concluídas: ${stats.lessonsDone}. Missões concluídas: ${stats.missionsDone}. Projetos concluídos: ${stats.projectsDone}.`,
  ];
  if (ob) {
    lines.push(
      `Respostas do onboarding — conhecimento: ${optionLabel("level", ob.level)}; área: ${optionLabel("area", ob.area)}; ` +
        `horas/semana: ${optionLabel("hours", ob.hours)}; orçamento: ${optionLabel("budget", ob.budget)}; objetivo: ${optionLabel("goal", ob.goal)}; ` +
        `preferência: ${optionLabel("preference", ob.preference)}.`,
    );
  }
  if (next) lines.push(`Próxima tarefa do plano de 30 dias: ${next.title}.`);
  return `Contexto atualizado da pessoa (use para personalizar, não repita literalmente):\n${lines.join("\n")}`;
}

async function requestParams(messages: Anthropic.Beta.Messages.BetaMessageParam[], context: string, maxTokens: number) {
  const system: Anthropic.Beta.Messages.BetaTextBlockParam[] = [
    { type: "text", text: `${BASE_PROMPT}\n\n${await catalog()}`, cache_control: { type: "ephemeral" } },
  ];
  if (MID_SYSTEM_MODELS.has(AI_MODEL)) {
    messages = [...messages, { role: "system", content: context } as unknown as Anthropic.Beta.Messages.BetaMessageParam];
  } else {
    system.push({ type: "text", text: context });
  }
  return {
    model: AI_MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    thinking: { type: "adaptive" as const },
    output_config: { effort: AI_EFFORT },
    ...(FALLBACK_MODELS.has(AI_MODEL) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  };
}

export function friendlyAiError(err: unknown): string {
  if (err instanceof Anthropic.RateLimitError) return "O assistente está com muita demanda agora. Tente novamente em alguns instantes.";
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
    return "O assistente não está configurado corretamente. Avise o suporte.";
  if (err instanceof Anthropic.APIConnectionError) return "Não foi possível conectar ao assistente. Verifique sua conexão e tente novamente.";
  if (err instanceof Anthropic.APIError) return "O assistente encontrou um erro temporário. Tente novamente.";
  return "Ocorreu um erro inesperado ao falar com o assistente.";
}

const REFUSAL_MESSAGE = "Não posso ajudar com esse pedido. Se quiser, reformule com outro objetivo e eu te ajudo.";

/** Conversa em streaming. Emite os trechos de texto e retorna o texto final. */
export async function streamChat(
  history: { role: "user" | "assistant"; content: string }[],
  context: string,
  onText: (chunk: string) => void,
): Promise<string> {
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));
  const stream = getClient().beta.messages.stream(await requestParams(messages, context, 8000));
  let text = "";
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      text += event.delta.text;
      onText(event.delta.text);
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    const msg = (text ? "\n\n" : "") + REFUSAL_MESSAGE;
    onText(msg);
    return text + msg;
  }
  return text;
}

/** Feedback de uma entrega de missão, com base nos critérios de avaliação. */
export async function missionFeedback(input: {
  title: string;
  objective: string;
  criteria: string[];
  resultText: string;
  resultUrl: string;
  context: string;
}): Promise<string> {
  const prompt = `Avalie a entrega de uma missão prática da NovaDigital.

Missão: ${input.title}
Objetivo: ${input.objective}
Critérios de avaliação:
${input.criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Registro enviado pela pessoa:
<entrega>
${input.resultText || "(sem texto)"}
</entrega>
Link informado: ${input.resultUrl || "(nenhum)"} — você não consegue abrir o link; avalie apenas o que foi descrito e, se necessário, peça detalhes.

Responda com:
## Avaliação por critério
Para cada critério: atendido, parcialmente ou não atendido, com uma frase de justificativa.
## Pontos fortes
## O que melhorar
Passos concretos e priorizados.
## Próximo passo sugerido`;
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [{ role: "user", content: prompt }];
  const final = await getClient().beta.messages.stream(await requestParams(messages, input.context, 6000)).finalMessage();
  if (final.stop_reason === "refusal") return REFUSAL_MESSAGE;
  return final.content
    .filter((b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
