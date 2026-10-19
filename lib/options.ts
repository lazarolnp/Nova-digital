// Opções do onboarding compartilhadas entre cliente e servidor.

export const ONBOARDING_QUESTIONS = {
  level: {
    label: "Qual é o seu conhecimento atual em marketing digital?",
    options: [
      { value: "zero", label: "Estou começando do zero" },
      { value: "basico", label: "Já estudei um pouco, mas nunca pratiquei" },
      { value: "intermediario", label: "Já pratiquei ou fiz algum trabalho" },
    ],
  },
  area: {
    label: "Qual área mais te interessa?",
    options: [
      { value: "trafego", label: "Tráfego pago" },
      { value: "sites", label: "Criação de sites" },
      { value: "video", label: "Edição de vídeos" },
      { value: "afiliados", label: "Marketing de afiliados" },
      { value: "ia", label: "Inteligência artificial aplicada" },
      { value: "indefinido", label: "Ainda não sei" },
    ],
  },
  hours: {
    label: "Quantas horas por semana você consegue dedicar?",
    options: [
      { value: "2-4", label: "De 2 a 4 horas" },
      { value: "5-8", label: "De 5 a 8 horas" },
      { value: "9-15", label: "De 9 a 15 horas" },
      { value: "16+", label: "Mais de 16 horas" },
    ],
  },
  budget: {
    label: "Qual é o seu orçamento inicial aproximado para ferramentas e testes?",
    options: [
      { value: "zero", label: "Nenhum por enquanto" },
      { value: "ate100", label: "Até R$ 100" },
      { value: "ate500", label: "Até R$ 500" },
      { value: "mais500", label: "Mais de R$ 500" },
    ],
  },
  goal: {
    label: "Qual é o seu objetivo principal?",
    options: [
      { value: "renda_extra", label: "Construir uma renda complementar" },
      { value: "carreira", label: "Mudar de carreira" },
      { value: "negocio", label: "Divulgar o meu próprio negócio" },
      { value: "aprender", label: "Aprender uma nova habilidade" },
    ],
  },
  preference: {
    label: "O que você prefere fazer?",
    options: [
      { value: "servicos", label: "Prestar serviços para empresas" },
      { value: "produtos", label: "Vender produtos (meus ou de terceiros)" },
      { value: "conteudo", label: "Criar conteúdo" },
    ],
  },
} as const;

export type OnboardingKey = keyof typeof ONBOARDING_QUESTIONS;

export type OnboardingAnswers = { [K in OnboardingKey]: (typeof ONBOARDING_QUESTIONS)[K]["options"][number]["value"] };

export function optionLabel(key: OnboardingKey, value: string) {
  return ONBOARDING_QUESTIONS[key].options.find((o) => o.value === value)?.label ?? value;
}

export const AREA_TO_TRAIL: Record<string, string> = {
  trafego: "trafego-pago",
  sites: "criacao-de-sites",
  video: "edicao-de-videos-ia",
  afiliados: "marketing-de-afiliados",
  ia: "ia-aplicada",
  indefinido: "primeiros-passos",
};

export const PROJECT_CATEGORIES = ["Site / Landing page", "Criativo", "Campanha", "Vídeo", "Conteúdo", "Proposta comercial", "Outro"];

export const PROJECT_STATUS: Record<string, string> = {
  planejamento: "Planejamento",
  em_andamento: "Em andamento",
  revisao: "Em revisão",
  concluido: "Concluído",
};

export const PROJECT_TEMPLATES = [
  {
    key: "landing",
    name: "Landing page para serviço local (demonstração)",
    category: "Site / Landing page",
    description: "Página de uma seção única para um negócio fictício, com foco em contato pelo WhatsApp.",
    objective: "Demonstrar domínio de estrutura, texto e conversão em landing pages.",
    steps: ["Definir negócio fictício e oferta", "Escrever texto das seções", "Montar a página", "Adicionar botão de WhatsApp", "Testar no celular", "Publicar e registrar link"],
  },
  {
    key: "criativos",
    name: "Série de criativos para anúncio (demonstração)",
    category: "Criativo",
    description: "Três variações de criativo para testar uma mesma oferta.",
    objective: "Mostrar capacidade de criar variações com uma única variável alterada.",
    steps: ["Definir oferta e público", "Pesquisar referências", "Criar variação A", "Criar variação B", "Criar variação C", "Descrever a hipótese de cada uma"],
  },
  {
    key: "campanha",
    name: "Plano de campanha de teste (demonstração)",
    category: "Campanha",
    description: "Planejamento completo de uma campanha, com relatório modelo marcado como simulação.",
    objective: "Demonstrar raciocínio de planejamento e análise de tráfego pago.",
    steps: ["Definir objetivo", "Descrever público", "Planejar criativos", "Definir orçamento e prazo", "Definir critério de decisão", "Montar relatório modelo"],
  },
  {
    key: "video",
    name: "Vídeo curto para negócio (demonstração)",
    category: "Vídeo",
    description: "Vídeo vertical de até 60 segundos com roteiro, legendas e chamada.",
    objective: "Demonstrar roteiro, ritmo e acabamento em vídeos curtos.",
    steps: ["Escrever roteiro", "Gravar", "Editar", "Legendar e revisar", "Exportar 9:16", "Publicar ou hospedar e registrar link"],
  },
];
