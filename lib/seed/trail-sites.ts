import type { SeedTrail } from "./types";
import { TRAIL_SITES } from "./trails-a";

const base = TRAIL_SITES.course;

export const TRAIL_CRIACAO_SITES: SeedTrail = {
  slug: "criacao-de-sites",
  title: "Criação de sites",
  subtitle: "Landing pages e sites profissionais para clientes",
  description: TRAIL_SITES.description,
  level: "Iniciante",
  assistant: {
    name: "Mentor de Sites",
    focus:
      "Você é especialista em criação de sites e landing pages para pequenos negócios, usando ferramentas no-code e IA. Ajude a planejar estrutura e textos de páginas, escolher ferramenta, configurar domínio, botões de WhatsApp e formulários, melhorar conversão, SEO básico, acessibilidade e desempenho, montar portfólio e precificar e vender o serviço. Sugira textos prontos para revisão e lembre da LGPD em formulários.",
    suggestions: [
      "Escreva o texto de uma landing page para uma clínica de estética.",
      "Qual ferramenta uso para meu primeiro site sem programar?",
      "Como precifico um site para um pequeno negócio?",
      "Revise a estrutura da minha página e diga o que melhorar.",
    ],
  },
  courses: [
    {
      ...base,
      modules: [
        ...base.modules,
        {
          title: "Qualidade e venda do serviço",
          lessons: [
            {
              title: "SEO básico, velocidade e acessibilidade",
              duration: 14,
              content: `## SEO básico

SEO é o conjunto de práticas que ajudam uma página a ser encontrada nos buscadores.
- **Título e descrição** de cada página com o serviço e a cidade (ex.: "Dentista em Campinas — Clínica X").
- **Um título principal (H1)** por página, claro.
- **Textos que respondem dúvidas reais** do cliente.
- **Perfil da Empresa no Google** atualizado e com link para o site, em negócios locais.

## Velocidade

- Comprima imagens antes de enviar.
- Evite vídeos pesados no topo e excesso de animações.
- Teste a página no celular com internet móvel.

## Acessibilidade

- Contraste suficiente entre texto e fundo.
- Texto alternativo nas imagens.
- Botões e links com nomes claros ("Agendar consulta", não "Clique aqui").

Esses cuidados melhoram a experiência de todas as pessoas e ajudam a página a ser encontrada.`,
              exercise: "Revise uma página que você criou: escreva título e descrição para buscadores, comprima as imagens e verifique o contraste dos textos.",
              materials: [
                { title: "Perfil da Empresa no Google", url: "https://www.google.com/business/" },
                { title: "PageSpeed Insights", url: "https://pagespeed.web.dev" },
              ],
            },
            {
              title: "Precificação, contrato e manutenção",
              duration: 14,
              content: `## Como precificar

Considere:
- **Horas estimadas** (planejamento, textos, montagem, revisões, publicação).
- **Custos** que você paga (ferramenta, domínio, imagens).
- **Complexidade** (uma página x site com várias páginas, integrações).
- **Valor para o cliente** (quanto um novo cliente vale para aquele negócio).

Pesquise faixas praticadas na sua região e comece com pacotes de escopo fechado.

## O que deixar por escrito

- Número de páginas e seções.
- Quem fornece textos e imagens.
- Número de rodadas de revisão.
- Prazo de cada etapa.
- Quem paga e em nome de quem ficam domínio e ferramenta (recomendado: no nome do cliente).
- Forma de pagamento (por exemplo, 50% na aprovação e 50% na entrega).

## Manutenção mensal

Ofereça um plano de manutenção: pequenas alterações, atualização de conteúdo, verificação de formulários e relatórios simples. Isso gera receita recorrente e mantém o relacionamento.`,
              exercise: "Monte dois pacotes de serviço (landing page e site institucional) com escopo, prazo, revisões e forma de pagamento.",
            },
          ],
        },
      ],
    },
  ],
};
