import type { SeedTrail } from "./types";
import { TRAIL_AFILIADOS } from "./trails-b";

const legacy = TRAIL_AFILIADOS.course.modules;
const L = (m: number, l: number) => legacy[m].lessons[l];

export const TRAIL_AFILIADO: SeedTrail = {
  slug: "marketing-de-afiliados",
  title: "Afiliados",
  subtitle: "Recomende produtos com ética e construa audiência",
  description:
    "Do zero ao primeiro conteúdo de recomendação: plataformas, escolha de produtos, canal, conteúdo orgânico, tráfego, análise de conversões e regras de divulgação.",
  level: "Iniciante",
  assistant: {
    name: "Mentor de Afiliados",
    focus:
      "Você é especialista em marketing de afiliados no Brasil (produtos digitais em plataformas como Hotmart, Kiwify e Eduzz, e programas de produtos físicos de lojas e marketplaces). Ajude a escolher nicho e produto com critério, montar o canal, criar roteiros e conteúdos de recomendação honestos, entender métricas (cliques, conversão, reembolso) e seguir as regras de divulgação (deixar claro que é link de afiliado). Nunca incentive promessas de resultado, perfis falsos, spam ou uso indevido de marcas.",
    suggestions: [
      "Como escolho meu primeiro produto para divulgar?",
      "Crie 5 ideias de conteúdo para divulgar um curso de finanças pessoais.",
      "Qual a diferença entre divulgar produto digital e produto físico?",
      "Como deixo claro que é link de afiliado sem perder vendas?",
    ],
  },
  courses: [
    {
      slug: "afiliados-do-zero",
      title: "Marketing de Afiliados do Zero",
      summary: "Como recomendar produtos de forma honesta, organizada e sustentável.",
      description:
        "Curso completo para quem quer começar como afiliado: como o modelo funciona, onde se afiliar, como escolher produtos, montar um canal, produzir conteúdo que gera confiança, usar tráfego com cautela, medir resultados e seguir as regras.",
      skills: ["Afiliação", "Conteúdo orgânico", "Copy de recomendação", "Análise de conversão"],
      premium: true,
      modules: [
        {
          title: "Fundamentos da afiliação",
          lessons: [
            L(0, 0),
            {
              title: "Plataformas de afiliação no Brasil",
              duration: 12,
              preview: true,
              content: `## Dois grandes grupos

**Produtos digitais** (cursos, e-books, assinaturas) ficam em plataformas como **Hotmart**, **Kiwify** e **Eduzz**. Você se cadastra, encontra produtos no mercado de afiliação da plataforma, pede afiliação e recebe um link rastreado.

**Produtos físicos** ficam em programas de lojas e marketplaces, como o programa de associados da Amazon e os programas de afiliados de grandes varejistas e marketplaces. Você recomenda produtos que já existem na loja e ganha uma porcentagem das compras feitas pelo seu link.

## O que comparar antes de se cadastrar

- **Regras de divulgação:** onde você pode divulgar (redes sociais, anúncios, e-mail) e o que é proibido.
- **Comissão e prazo de pagamento:** os valores e prazos mudam; consulte sempre a página oficial do programa.
- **Janela de atribuição:** por quanto tempo depois do clique a venda ainda conta para você.
- **Política de reembolso do produto:** reembolsos cancelam a sua comissão.

## Uma recomendação prática

Comece por **uma** plataforma. Aprenda como funcionam o painel, os relatórios e os pagamentos antes de abrir contas em várias.`,
              exercise:
                "Crie uma conta em uma plataforma de produtos digitais e em um programa de produtos físicos. Anote, de cada uma: regras de divulgação, prazo de pagamento e janela de atribuição.",
              materials: [
                { title: "Hotmart", url: "https://hotmart.com" },
                { title: "Kiwify", url: "https://kiwify.com.br" },
                { title: "Eduzz", url: "https://www.eduzz.com" },
              ],
            },
            {
              ...L(0, 1),
              title: "Escolha de produtos e nichos",
              content: `${L(0, 1).content}

## Nicho antes de produto

Um **nicho** é um assunto e um público específicos: "finanças para quem está saindo das dívidas", "treino em casa para iniciantes". Escolher o nicho primeiro ajuda a criar conteúdo coerente e a recomendar vários produtos relacionados ao longo do tempo.

Bons nichos para começar costumam ter:
- Pessoas com um problema claro e vontade de resolver.
- Assuntos sobre os quais você consegue falar com propriedade ou aprender rápido.
- Produtos de qualidade disponíveis para afiliação.`,
            },
          ],
        },
        {
          title: "Canal e conteúdo",
          lessons: [
            {
              title: "Escolhendo seu canal e montando o perfil",
              duration: 12,
              content: `## Um canal principal

Escolha **um** canal para começar, de acordo com o seu jeito e o seu nicho:
- **Vídeos curtos** (Reels, TikTok, Shorts): alcance rápido, exige frequência.
- **YouTube:** vídeos mais longos, que continuam sendo encontrados por muito tempo.
- **Blog e busca:** artigos que respondem dúvidas específicas.
- **Instagram com carrosséis:** bom para conteúdo educativo e comparações.

## Perfil que transmite confiança

- **Nome e foto** coerentes com o nicho.
- **Bio** que diz para quem é o conteúdo e o que a pessoa ganha seguindo você.
- **Link na bio** organizado (uma página com seus conteúdos e recomendações).
- **Destaques ou posts fixados** explicando quem você é e como escolhe o que recomenda.

## Separe o pessoal do profissional

Se possível, use um perfil dedicado ao nicho. Isso facilita medir resultados e manter a linha editorial.`,
              exercise:
                "Escolha seu canal principal e escreva: nome do perfil, bio (até 150 caracteres) e os 3 temas que você vai abordar com frequência.",
            },
            L(1, 0),
            {
              title: "Roteiros e formatos que vendem sem enganar",
              duration: 14,
              content: `## A estrutura de uma recomendação honesta

1. **Problema:** a situação que o público vive.
2. **Experiência ou análise:** o que você testou, pesquisou ou observou.
3. **Para quem serve e para quem não serve.**
4. **Pontos positivos e negativos.**
5. **Chamada clara:** onde está o link e o aviso de que é link de afiliado.

## Formatos que funcionam bem

- **"Vale a pena?"**: análise com prós e contras.
- **Comparativo:** duas opções para um mesmo objetivo.
- **Tutorial:** como usar o produto para resolver algo.
- **Erros comuns:** o que evitar no tema, com o produto como uma das soluções.

## O que nunca fazer

- Prometer resultados ("você vai ganhar", "você vai emagrecer X kg").
- Inventar depoimentos ou fingir que usou o que não usou.
- Usar prints de vendas como argumento principal.

Confiança demora para ser construída e some com uma recomendação ruim.`,
              exercise: "Escreva um roteiro de 45 segundos no formato \"Vale a pena?\" para um produto do seu nicho, com prós, contras e aviso de afiliado.",
            },
          ],
        },
        {
          title: "Divulgação e tráfego",
          lessons: [
            L(1, 1),
            {
              title: "Tráfego pago para afiliados: quando faz sentido",
              duration: 14,
              content: `## Cuidado antes de investir

Anunciar como afiliado envolve risco: você paga pelo clique, mas só recebe se houver venda, e reembolsos cancelam comissões. Muitos iniciantes perdem dinheiro por anunciar antes de entender o público.

## Antes de anunciar, confirme

- **As regras do produto permitem anúncios?** Muitos produtores proíbem anunciar com o nome da marca ou em determinadas plataformas.
- **Você já vende de forma orgânica?** Conteúdo que converte sem anúncio indica que a oferta funciona.
- **Você conhece seus números?** Comissão média, taxa de conversão e reembolso.

## Uma conta simples

Se a comissão é de R$ 50 e, a cada 100 cliques, 2 pessoas compram, cada clique "vale" em média R$ 1,00. Se o clique custa mais que isso, a campanha dá prejuízo. Use números do seu próprio histórico, não promessas.

## Comece pequeno

Teste com um orçamento que você pode perder, por poucos dias, com um único objetivo e critério de parada definido.`,
              exercise: "Calcule quanto vale um clique para você com base em uma comissão e uma taxa de conversão hipotéticas. Escreva o critério de parada de um teste.",
            },
            {
              title: "Páginas de captura, listas e relacionamento",
              duration: 12,
              content: `## Por que ter uma lista

Redes sociais mudam regras e alcance. Uma lista de contatos (e-mail ou grupo com consentimento) permite falar com quem se interessou pelo seu conteúdo sem depender do algoritmo.

## Como montar

1. Ofereça algo útil em troca do contato: um checklist, um guia, uma aula.
2. Use uma página simples com título, benefício e formulário.
3. Envie conteúdo útil com regularidade; recomendações vêm depois da confiança.

## LGPD e consentimento

- Deixe claro o que a pessoa vai receber.
- Não adicione pessoas a listas ou grupos sem autorização.
- Ofereça forma fácil de sair da lista.

## Frequência

É melhor um e-mail útil por semana do que mensagens diárias só com ofertas.`,
              exercise: "Planeje uma isca digital (o que é, para quem, qual problema resolve) e os 3 primeiros e-mails da sequência de boas-vindas.",
            },
          ],
        },
        {
          title: "Resultados e regras",
          lessons: [
            L(2, 0),
            L(2, 1),
            {
              title: "Rotina semanal do afiliado",
              duration: 10,
              content: `## Uma semana organizada

- **Segunda:** planejar os conteúdos da semana e revisar métricas da semana anterior.
- **Terça a quinta:** produzir e publicar conteúdos.
- **Sexta:** responder comentários e mensagens, atualizar a página de recomendações.
- **Fim de semana (opcional):** estudar o nicho e testar produtos.

## Indicadores para acompanhar

- Conteúdos publicados.
- Cliques nos links.
- Vendas e reembolsos.
- Qual conteúdo trouxe cada venda.

## Expectativa realista

Os primeiros meses costumam servir para aprender e construir audiência. Medir e ajustar toda semana é o que permite evoluir.`,
              exercise: "Monte sua rotina semanal com dias, horários e as métricas que você vai registrar.",
            },
          ],
        },
      ],
    },
  ],
};
