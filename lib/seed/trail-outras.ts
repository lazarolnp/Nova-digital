import type { SeedCourse, SeedTrail } from "./types";
import { TRAIL_PRIMEIROS_PASSOS, TRAIL_TRAFEGO } from "./trails-a";
import { TRAIL_CLIENTES, TRAIL_IA, TRAIL_VIDEO } from "./trails-b";

const COURSE_INFOPRODUTOS: SeedCourse = {
  slug: "infoprodutos-do-zero",
  title: "Infoprodutos do Zero",
  summary: "Crie e venda um produto digital a partir do que você sabe.",
  description:
    "Como transformar conhecimento em um produto digital (e-book, curso, mentoria em grupo, templates): validar o tema, estruturar o conteúdo, produzir, montar a página de vendas, escolher a plataforma e vender com ética.",
  skills: ["Criação de produto digital", "Página de vendas", "Lançamento"],
  premium: true,
  modules: [
    {
      title: "Do conhecimento ao produto",
      lessons: [
        {
          title: "O que é um infoproduto e quais formatos existem",
          duration: 12,
          preview: true,
          content: `## Definição

Infoproduto é um produto digital que entrega **conhecimento ou ferramentas**: e-books, cursos em vídeo, mentorias em grupo, planilhas, modelos e comunidades.

## Formatos e quando usar

| Formato | Esforço de produção | Bom para |
|---|---|---|
| E-book ou guia | Baixo | Primeiro produto, temas objetivos |
| Templates e planilhas | Baixo a médio | Resolver tarefas práticas |
| Curso gravado | Médio a alto | Ensinar um processo passo a passo |
| Mentoria em grupo | Médio | Acompanhamento e validação do tema |
| Comunidade por assinatura | Contínuo | Relacionamento e atualização frequente |

## Responsabilidade

Um infoproduto precisa **entregar o que promete**. Promessas de resultado exagerado geram reembolsos, reclamações e problemas com as plataformas.`,
          exercise: "Liste 3 assuntos que você domina ou pode aprender bem e, para cada um, o formato de produto mais adequado.",
        },
        {
          title: "Validando o tema antes de produzir",
          duration: 14,
          content: `## Sinais de demanda

- Pessoas fazem perguntas frequentes sobre o tema.
- Já existem produtos sobre o assunto (sinal de mercado, não de saturação).
- Você consegue descrever o **antes e depois** do aluno de forma concreta e honesta.

## Formas de validar

1. **Conteúdo gratuito:** publique sobre o tema e observe interesse, comentários e perguntas.
2. **Conversas:** fale com 5 a 10 pessoas do público sobre suas dificuldades.
3. **Pré-venda ou turma piloto:** venda uma primeira versão com entrega ao vivo para poucas pessoas, com preço menor e reembolso garantido se não fizer sentido.

## Defina a promessa

Escreva em uma frase o que a pessoa vai **conseguir fazer** ao final, sem garantir resultados financeiros. Exemplo: "Ao final, você terá um cardápio precificado e uma planilha de custos da sua confeitaria".`,
          exercise: "Escreva a promessa do seu produto em uma frase e planeje uma forma de validar o tema nas próximas duas semanas.",
        },
      ],
    },
    {
      title: "Produção e venda",
      lessons: [
        {
          title: "Estruturando e produzindo o conteúdo",
          duration: 15,
          content: `## Estrutura

1. Liste o passo a passo que leva o aluno do ponto A ao ponto B.
2. Agrupe os passos em módulos.
3. Para cada aula, defina **um objetivo** e **um exercício**.

## Produção com recursos simples

- Celular ou webcam, boa iluminação natural e áudio limpo são suficientes para começar.
- Gravação de tela para aulas práticas.
- Ferramentas de design com modelos para e-books e materiais.

## Qualidade que importa

- Conteúdo direto, sem enrolação.
- Exercícios e materiais de apoio.
- Canal para tirar dúvidas.

A IA pode ajudar a organizar roteiros e revisar textos, mas o conhecimento e os exemplos precisam ser seus.`,
          exercise: "Monte o sumário do seu infoproduto com módulos, aulas, objetivos e exercícios.",
        },
        {
          title: "Página de vendas e plataforma",
          duration: 14,
          content: `## Estrutura da página de vendas

- Título com o resultado prometido (honesto).
- Para quem é e para quem não é.
- O que está incluído (módulos, bônus, suporte).
- Quem é você e por que pode ensinar isso.
- Depoimentos **reais** (somente com autorização).
- Garantia e política de reembolso.
- Perguntas frequentes e preço.

## Plataformas

Plataformas de produtos digitais cuidam de checkout, pagamento, área de membros e, em muitos casos, programa de afiliados. Compare taxas, prazos de recebimento e recursos na página oficial de cada uma.

## Afiliados do seu produto

Abrir o produto para afiliados pode ampliar o alcance. Defina regras claras de divulgação e acompanhe a qualidade das vendas e dos reembolsos.`,
          exercise: "Escreva a página de vendas do seu produto seguindo a estrutura desta aula.",
          materials: [
            { title: "Kiwify", url: "https://kiwify.com.br" },
            { title: "Hotmart", url: "https://hotmart.com" },
          ],
        },
        {
          title: "Estratégias de lançamento e venda contínua",
          duration: 14,
          content: `## Lançamento

Um lançamento concentra a divulgação em um período: conteúdos de aquecimento, aulas abertas, abertura do carrinho com prazo e encerramento. Funciona melhor quando já existe uma audiência interessada.

## Venda contínua (perpétua)

O produto fica sempre disponível, com conteúdos e anúncios trazendo pessoas ao longo do tempo. Exige um funil estável e acompanhamento de métricas.

## Indicadores

- Visitas na página de vendas.
- Taxa de conversão da página.
- Taxa de reembolso.
- Conclusão das aulas pelos alunos (indica qualidade da entrega).

## Ética

Escassez e prazos devem ser **verdadeiros**. Contadores falsos e "últimas vagas" que nunca acabam destroem a confiança.`,
          exercise: "Escolha entre lançamento e venda contínua para seu produto e escreva o plano das próximas 4 semanas.",
        },
      ],
    },
  ],
};

export const TRAIL_OUTRAS: SeedTrail = {
  slug: "outras-formas",
  title: "Outras formas de marketing digital",
  subtitle: "Fundamentos, tráfego pago, infoprodutos, vídeo, IA e serviços",
  description:
    "Comece pelos fundamentos do marketing digital e explore outros caminhos: gestão de tráfego, criação de infoprodutos, edição de vídeos com IA, IA aplicada ao trabalho e prestação de serviços para empresas.",
  level: "Iniciante a intermediário",
  assistant: {
    name: "Mentor de Marketing Digital",
    focus:
      "Você é especialista em marketing digital para iniciantes, cobrindo os fundamentos, tráfego pago (Meta Ads e Google Ads), criação e venda de infoprodutos, edição de vídeos curtos com IA, uso de IA no trabalho e prestação de serviços para empresas (prospecção sem spam, propostas, precificação e entrega). Ajude a pessoa a escolher um caminho, explique conceitos com exemplos simples e entregue planos e textos prontos para revisão.",
    suggestions: [
      "Qual caminho do digital combina comigo? Tenho pouco tempo e pouco dinheiro.",
      "Explique CTR, CPC e CPA com um exemplo.",
      "Como transformo o que eu sei em um e-book?",
      "Escreva uma proposta para gerenciar o Instagram de uma padaria.",
    ],
  },
  courses: [
    TRAIL_PRIMEIROS_PASSOS.course,
    TRAIL_TRAFEGO.course,
    COURSE_INFOPRODUTOS,
    TRAIL_VIDEO.course,
    TRAIL_IA.course,
    TRAIL_CLIENTES.course,
  ],
};
