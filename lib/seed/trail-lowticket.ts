import type { SeedTrail } from "./types";

const ADS_LIBRARY = { title: "Biblioteca de Anúncios da Meta", url: "https://www.facebook.com/ads/library" };

export const TRAIL_LOW_TICKET: SeedTrail = {
  slug: "low-ticket",
  title: "Low ticket",
  subtitle: "Produtos digitais de baixo valor vendidos em volume",
  description:
    "Aprenda a criar e vender produtos digitais de baixo valor: escolha do produto, matemática de taxas e anúncios, página de vendas, order bump, upsell, testes de anúncio, métricas e pós-venda.",
  level: "Iniciante a intermediário",
  assistant: {
    name: "Mentor de Low Ticket",
    focus:
      "Você é especialista em produtos digitais low ticket no Brasil (e-books, planilhas, templates, packs e minicursos de baixo valor vendidos em plataformas como Kiwify e Hotmart, geralmente com tráfego pago). Ajude a escolher produto e público, criar um produto de entrega rápida e com qualidade, montar oferta, página de vendas e checkout, planejar order bump, upsell e downsell, calcular CPA máximo considerando taxas fixas e percentuais, planejar testes de anúncio e ler métricas (CPA, ticket médio, ROAS, conversão do checkout, reembolso). Seja honesto: margens são apertadas, taxas fixas pesam em produtos baratos e nada garante lucro. Não incentive escassez falsa, promessas exageradas ou produtos de baixa qualidade.",
    suggestions: [
      "Calcule meu CPA máximo para um produto de R$ 27 com order bump.",
      "Que produto low ticket faz sentido para o nicho de confeitaria?",
      "Escreva a página de vendas de um pack de planilhas financeiras.",
      "Como estruturar order bump e upsell sem parecer insistente?",
    ],
  },
  courses: [
    {
      slug: "low-ticket-na-pratica",
      title: "Low Ticket na Prática",
      summary: "Produto simples, oferta clara e números sob controle.",
      description:
        "Curso prático sobre produtos digitais de baixo valor: como o modelo funciona, a matemática de taxas e anúncios, criação de um produto de entrega rápida, página de vendas e checkout, funil com order bump e upsell, testes de anúncio, métricas e pós-venda.",
      skills: ["Oferta low ticket", "Funil de vendas", "Order bump e upsell", "Métricas de anúncios"],
      premium: true,
      modules: [
        {
          title: "Entendendo o modelo",
          lessons: [
            {
              title: "O que é low ticket e como funciona",
              duration: 12,
              preview: true,
              content: `## Definição

Low ticket é a venda de **produtos digitais de baixo valor**, normalmente entre algumas dezenas de reais, como e-books, planilhas, templates, packs de materiais e minicursos. A lógica é vender em **volume**, geralmente com anúncios levando a pessoa direto para a página de vendas.

## Por que as pessoas usam esse modelo

- **Decisão de compra rápida:** um valor baixo exige menos confiança e menos tempo de consideração.
- **Lista de compradores:** quem compra algo barato já demonstrou interesse e pode comprar outros produtos depois.
- **Teste de mercado:** permite descobrir rapidamente se um tema desperta interesse.

## O funil típico

1. **Anúncio** apresenta o problema e o produto.
2. **Página de vendas** curta e direta.
3. **Checkout** com um **order bump** (um complemento opcional marcado com um clique).
4. **Upsell** depois da compra: uma oferta maior e relacionada.
5. **Entrega** imediata e pós-venda.

## Os desafios

Margens apertadas, taxas fixas que pesam em produtos baratos, custo de anúncios variável e concorrência alta. Sem controle dos números, é fácil vender bastante e ainda assim ter prejuízo.`,
              exercise: "Pesquise 3 produtos low ticket em plataformas de produtos digitais ou na Biblioteca de Anúncios e anote: preço, promessa, formato e se há order bump ou upsell.",
              materials: [ADS_LIBRARY],
            },
            {
              title: "A matemática do low ticket: taxas, CPA e ticket médio",
              duration: 15,
              preview: true,
              content: `## O que sobra de cada venda

Plataformas de produtos digitais cobram, em geral, uma **porcentagem** do valor e uma **taxa fixa** por venda. Em produtos baratos, a taxa fixa pesa muito. Consulte sempre as taxas atuais na página oficial da sua plataforma.

## Exemplo ilustrativo (taxa de exemplo: 9% + R$ 2,50 por transação)

| Cenário | Valor bruto | Taxas | Líquido |
|---|---|---|---|
| Só o produto principal (R$ 27) | R$ 27,00 | R$ 4,93 | R$ 22,07 |
| Produto + order bump de R$ 17 (mesma compra) | R$ 44,00 | R$ 6,46 | R$ 37,54 |

## CPA máximo

**CPA** é o custo de anúncio por compra. Para não ter prejuízo, o CPA precisa ser **menor que o líquido médio por compra**.

## Ticket médio

Nem todo comprador leva o order bump ou o upsell. Exemplo: se 30% levam o bump e 10% levam um upsell, o líquido médio por compra fica entre os dois cenários acima. Use a sua taxa real de aceitação para calcular.

## Regra prática

Antes de anunciar, escreva: preço, taxas, líquido por compra, ticket médio esperado e **CPA máximo**. Esse número decide se o teste deu certo ou não.`,
              exercise: "Monte uma planilha com preço, taxas da sua plataforma, líquido por compra, taxa de aceitação do order bump e CPA máximo para um produto que você criaria.",
            },
          ],
        },
        {
          title: "Produto e oferta",
          lessons: [
            {
              title: "Escolhendo o produto e o público",
              duration: 12,
              content: `## O que vende bem em low ticket

Produtos que resolvem **um problema específico** e entregam resultado prático rápido:
- Planilhas (orçamento doméstico, precificação, controle de estoque).
- Templates (posts para redes sociais, propostas, currículos).
- Guias objetivos (passo a passo de uma tarefa).
- Packs de materiais para profissionais (artes, roteiros, checklists).

## Critérios de escolha

- **Público fácil de alcançar** com anúncios e com um problema claro.
- **Promessa concreta e honesta**: "planilha para precificar doces" é mais forte que "aprenda a ganhar dinheiro".
- **Possibilidade de complementos** para order bump e upsell.
- **Você consegue entregar com qualidade.**

## Evite

- Temas que exigem promessas de saúde, renda ou resultado garantido.
- Copiar ou revender materiais de terceiros sem direito (os chamados conteúdos "PLR" exigem atenção à licença).`,
              exercise: "Liste 5 ideias de produto low ticket para um público que você conhece e escolha 1 com base nos critérios desta aula.",
            },
            {
              title: "Criando um produto de entrega rápida",
              duration: 14,
              content: `## Escopo pequeno, qualidade alta

Um produto low ticket deve ser **simples de consumir**: a pessoa compra e consegue usar no mesmo dia.

## Como produzir

1. Defina o resultado que a pessoa terá ao usar o produto.
2. Liste apenas o necessário para chegar a esse resultado.
3. Produza com ferramentas acessíveis (editor de documentos, planilhas, ferramentas de design com modelos).
4. Inclua um **guia de uso** curto.
5. Peça para 2 ou 3 pessoas testarem antes de vender.

## Entrega

Use a área de membros ou o envio automático da plataforma. Verifique se o arquivo abre no celular e se o link de acesso chega ao e-mail do comprador.

## Use a IA com critério

A IA ajuda a organizar e revisar, mas o conteúdo precisa ser verificado e útil de verdade. Produtos genéricos geram reembolso.`,
              exercise: "Escreva o sumário e o guia de uso do seu produto low ticket e defina quem vai testá-lo antes do lançamento.",
            },
            {
              title: "Oferta, página de vendas e checkout",
              duration: 14,
              content: `## Página de vendas curta

Em low ticket, a página costuma ser direta:
1. Título com o resultado concreto.
2. Para quem é.
3. O que a pessoa recebe (com imagens do produto).
4. Como acessa (entrega imediata).
5. Garantia e política de reembolso.
6. Preço e botão de compra.

## Checkout

- Poucos campos e carregamento rápido no celular.
- Pix e cartão disponíveis.
- **Order bump** com descrição clara e preço visível.

## Honestidade

- Depoimentos apenas reais e autorizados.
- Nada de contadores falsos ou "últimas unidades" de um produto digital.
- O preço "de/por" só pode existir se o preço anterior foi realmente praticado.`,
              exercise: "Escreva a página de vendas do seu produto seguindo a estrutura desta aula e a descrição do order bump.",
            },
          ],
        },
        {
          title: "Funil e anúncios",
          lessons: [
            {
              title: "Order bump, upsell e downsell",
              duration: 14,
              content: `## Order bump

Complemento opcional oferecido **dentro do checkout**, marcado com um clique. Deve ser barato, relacionado e útil. Exemplo: comprou a planilha de precificação, o bump é um pack de etiquetas de preço.

## Upsell

Oferta exibida **depois da compra**, normalmente de valor maior. Exemplo: um minicurso que ensina a usar a planilha para montar o cardápio completo.

## Downsell

Se a pessoa recusa o upsell, uma alternativa mais simples ou mais barata pode ser oferecida.

## Boas práticas

- Cada oferta precisa fazer sentido para quem acabou de comprar.
- Deixe claro como recusar.
- Não esconda cobranças nem marque o bump por padrão.
- Acompanhe a taxa de aceitação de cada etapa para saber o que funciona.`,
              exercise: "Desenhe o funil do seu produto: produto principal, order bump, upsell e downsell, com preço e descrição de cada um.",
            },
            {
              title: "Anúncios para low ticket: criativos e testes",
              duration: 15,
              content: `## Objetivo do teste

Descobrir se o produto vende com **CPA abaixo do máximo** calculado. Não é hora de escalar.

## Estrutura simples

1. Uma campanha com objetivo de vendas.
2. Público amplo ou interesses ligados ao problema.
3. 3 a 5 criativos diferentes (vídeo mostrando o produto, antes e depois do uso, lista de benefícios).
4. Orçamento diário que você aceita perder.
5. Critério de decisão definido antes de começar.

## Criativos que funcionam

- Mostram o produto de verdade.
- Falam de um problema específico nos primeiros segundos.
- Têm chamada clara para a página.

## Leitura rápida

- Muitos cliques e poucas vendas: revise a página e o preço.
- Poucos cliques: revise o criativo e o público.
- CPA acima do máximo por vários dias: ajuste ou pare.

Aprofunde no curso de Tráfego Pago da trilha "Outras formas de marketing digital".`,
              exercise: "Planeje um teste: criativos, público, orçamento diário, duração e CPA máximo que encerra o teste.",
              materials: [ADS_LIBRARY],
            },
          ],
        },
        {
          title: "Métricas e pós-venda",
          lessons: [
            {
              title: "Métricas e decisão: escalar, ajustar ou parar",
              duration: 12,
              content: `## Indicadores

- **CPA:** custo de anúncio por compra.
- **Ticket médio:** valor médio por compra, incluindo bump e upsell.
- **ROAS:** receita dividida pelo valor investido em anúncios.
- **Conversão da página** e **conversão do checkout.**
- **Aceitação do order bump e do upsell.**
- **Taxa de reembolso.**

## Como decidir

- **Escalar** quando o CPA fica abaixo do máximo por vários dias e o reembolso está baixo.
- **Ajustar** quando há interesse, mas o funil perde pessoas em alguma etapa.
- **Parar** quando, após testes honestos, o CPA fica acima do líquido por compra.

## Lucro real

Some todos os custos do mês (anúncios, taxas, ferramentas, reembolsos) e compare com o líquido recebido. Faturamento alto não significa lucro.`,
              exercise: "Crie uma planilha diária com os indicadores desta aula e a coluna de lucro real.",
            },
            {
              title: "Entrega, reembolsos e relacionamento com compradores",
              duration: 12,
              content: `## Entrega impecável

- Acesso enviado automaticamente.
- Instruções claras de uso.
- Canal de suporte visível.

## Reembolsos

O direito de arrependimento permite que o comprador desista em até 7 dias em compras pela internet. Reembolsos altos indicam promessa desalinhada ou produto fraco: use os motivos para melhorar.

## Relacionamento

Quem comprou é o público mais propenso a comprar de novo. Com consentimento:
- Envie conteúdos úteis sobre o tema.
- Peça feedback e depoimentos reais.
- Ofereça produtos maiores quando fizer sentido.

Respeite a LGPD: deixe claro como os dados são usados e permita sair da lista.`,
              exercise: "Escreva o e-mail de boas-vindas ao comprador, com instruções de acesso, suporte e um convite para dar feedback.",
            },
          ],
        },
      ],
    },
  ],
};
