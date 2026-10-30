import type { SeedTrail } from "./types";

const CONSUMIDOR = { title: "Consumidor.gov.br", url: "https://www.consumidor.gov.br" };
const RECEITA = { title: "Receita Federal — compras internacionais", url: "https://www.gov.br/receitafederal" };
const SEBRAE = { title: "Sebrae", url: "https://sebrae.com.br" };
const ANPD = { title: "ANPD — Proteção de Dados", url: "https://www.gov.br/anpd" };

export const TRAIL_DROPSHIPPING: SeedTrail = {
  slug: "dropshipping",
  title: "Dropshipping",
  subtitle: "Loja virtual sem estoque, com responsabilidade",
  description:
    "Entenda o modelo, escolha produtos e fornecedores com critério, monte a loja, calcule margens, cumpra as regras do consumidor e anuncie com cautela.",
  level: "Iniciante a intermediário",
  assistant: {
    name: "Mentor de Dropshipping",
    focus:
      "Você é especialista em dropshipping e e-commerce no Brasil. Ajude a avaliar produtos e fornecedores (nacionais e internacionais), calcular preço e margem considerando taxas, frete, impostos e anúncios, montar a loja, escrever políticas (troca, devolução, prazo, privacidade) e planejar atendimento e anúncios. Lembre sempre do Código de Defesa do Consumidor (incluindo o direito de arrependimento de 7 dias em compras online), da importância de informar prazos reais e de consultar um contador sobre formalização e impostos. Não prometa faturamento e alerte sobre fornecedores e cursos que vendem resultados fáceis.",
    suggestions: [
      "Como calculo o preço de venda de um produto com frete e taxas?",
      "Quais cuidados ter com fornecedor internacional?",
      "Escreva uma política de trocas e devoluções para minha loja.",
      "Como avalio se um produto tem potencial antes de anunciar?",
    ],
  },
  courses: [
    {
      slug: "dropshipping-na-pratica",
      title: "Dropshipping na Prática",
      summary: "Da escolha do produto à primeira venda, sem atalhos enganosos.",
      description:
        "Curso prático sobre dropshipping no Brasil: o modelo e seus riscos, pesquisa de produtos, fornecedores, plataforma da loja, precificação, políticas e direitos do consumidor, anúncios, atendimento e pós-venda.",
      skills: ["E-commerce", "Pesquisa de produto", "Precificação", "Atendimento"],
      premium: true,
      modules: [
        {
          title: "Entendendo o modelo",
          lessons: [
            {
              title: "O que é dropshipping e como funciona",
              duration: 12,
              preview: true,
              content: `## O modelo

No dropshipping, você vende um produto na sua loja, mas **não mantém estoque**. Quando a venda acontece, você compra o produto do fornecedor, que envia direto para o cliente.

## O fluxo de uma venda

1. O cliente compra na sua loja e paga.
2. Você repassa o pedido ao fornecedor e paga o custo do produto e do frete.
3. O fornecedor envia ao cliente.
4. Você acompanha a entrega e cuida do atendimento.

## Quem é o responsável

Para o cliente, **a loja é sua**. Atrasos, defeitos e trocas são responsabilidade da sua loja perante o consumidor, mesmo que o erro seja do fornecedor. Isso muda tudo na escolha de fornecedores.

## Vantagens e desafios

- **Vantagens:** investimento inicial menor, sem estoque parado, possibilidade de testar produtos.
- **Desafios:** margens apertadas, concorrência alta, dependência do fornecedor, prazos de entrega e atendimento.`,
              exercise: "Descreva com suas palavras o caminho de uma venda no dropshipping e liste quem é responsável por cada etapa perante o cliente.",
            },
            {
              title: "Realidade do mercado: riscos e expectativas",
              duration: 12,
              preview: true,
              content: `## O que costumam não contar

- **Anúncios custam caro:** grande parte da margem pode ir para tráfego pago.
- **Produtos "virais" saturam rápido:** muita gente vende o mesmo produto ao mesmo tempo.
- **Prazos longos geram reclamações:** fornecedores internacionais podem levar semanas para entregar.
- **Chargebacks e devoluções** reduzem o lucro.

## Sinais de alerta em cursos e "mentores"

- Prints de faturamento sem mostrar custos e lucro.
- Promessa de renda em pouco tempo.
- Venda de "lista de fornecedores secretos" ou "produto vencedor garantido".

## Como encarar

Trate a loja como um negócio: teste com orçamento limitado, registre números, calcule lucro real (não faturamento) e esteja preparado para ajustar ou encerrar um produto que não dá resultado.`,
              exercise: "Liste 5 custos que uma loja de dropshipping tem além do custo do produto.",
              materials: [CONSUMIDOR],
            },
          ],
        },
        {
          title: "Produto e fornecedor",
          lessons: [
            {
              title: "Como pesquisar e escolher produtos",
              duration: 14,
              content: `## Critérios de um bom produto

- **Resolve um problema ou desperta desejo claro.**
- **Fácil de demonstrar** em vídeo ou imagem.
- **Não é facilmente encontrado em lojas físicas** perto do cliente.
- **Margem que suporta anúncios, frete e taxas.**
- **Baixo risco de defeito e de devolução** (evite produtos frágeis, com muitos tamanhos ou eletrônicos complexos no começo).

## Onde pesquisar

- Tendências de busca (por exemplo, no Google Trends).
- Anúncios ativos na Biblioteca de Anúncios da Meta.
- Mais vendidos e avaliações em marketplaces.
- Comentários de clientes: o que elogiam e do que reclamam.

## Produtos para evitar

- Itens que exigem certificação ou registro (por exemplo, alguns eletrônicos, cosméticos e produtos de saúde).
- Réplicas e falsificações: além de ilegais, geram bloqueio de contas.
- Produtos que prometem resultados de saúde.`,
              exercise: "Pesquise 5 produtos e avalie cada um nos 5 critérios desta aula, com nota de 1 a 5.",
              materials: [
                { title: "Google Trends", url: "https://trends.google.com" },
                { title: "Biblioteca de Anúncios da Meta", url: "https://www.facebook.com/ads/library" },
              ],
            },
            {
              title: "Fornecedores nacionais e internacionais",
              duration: 14,
              content: `## Nacionais

- **Prazos menores**, o que reduz reclamações.
- Custo do produto costuma ser maior.
- Facilidade de comunicação e de trocas.

## Internacionais

- Produto geralmente mais barato.
- **Prazos maiores** e rastreio às vezes limitado.
- **Impostos de importação:** compras internacionais estão sujeitas a tributos federais e estaduais, e as regras mudam. Consulte a Receita Federal e informe ao cliente se os valores já estão incluídos.

## Como avaliar um fornecedor

1. Faça um **pedido de teste** para você mesmo: confira prazo, embalagem e qualidade.
2. Verifique avaliações, tempo de mercado e canal de atendimento.
3. Pergunte sobre política de defeitos e reposição.
4. Tenha um fornecedor reserva para os produtos principais.

## Registre tudo

Prazos reais medidos, contatos, condições acordadas e histórico de problemas.`,
              exercise: "Monte uma ficha de avaliação de fornecedor com: prazo real, custo, frete, política de defeitos, canal de contato e nota geral.",
              materials: [RECEITA],
            },
            {
              title: "Precificação e margem",
              duration: 15,
              content: `## Os custos de cada venda

- Custo do produto.
- Frete até o cliente.
- Taxa da plataforma da loja e do meio de pagamento.
- Impostos.
- Custo de anúncio por venda (custo por aquisição).
- Reserva para devoluções e chargebacks.

## Exemplo ilustrativo

| Item | Valor |
|---|---|
| Preço de venda | R$ 149,90 |
| Produto + frete | R$ 55,00 |
| Taxas de pagamento e plataforma (exemplo: 7%) | R$ 10,49 |
| Impostos (exemplo: 6%) | R$ 8,99 |
| Anúncio por venda | R$ 45,00 |
| Reserva para devoluções (exemplo: 3%) | R$ 4,50 |
| **Lucro por venda** | **R$ 25,92** |

Os percentuais acima são apenas exemplos: use as taxas reais da sua plataforma e confirme os impostos com um contador.

## Regra prática

Se o lucro por venda, depois do anúncio, for muito pequeno, qualquer aumento no custo do clique leva ao prejuízo. Teste o preço e o custo por venda antes de escalar.`,
              exercise: "Monte uma planilha de precificação com todos os custos desta aula para um produto real que você pesquisou.",
            },
          ],
        },
        {
          title: "Loja e regras",
          lessons: [
            {
              title: "Montando a loja virtual",
              duration: 14,
              content: `## Plataformas

Existem plataformas de loja virtual com planos gratuitos ou pagos e integrações com fornecedores e meios de pagamento. Compare: custo mensal, taxa por venda, integrações, facilidade de uso e suporte em português. Veja opções na Biblioteca de Ferramentas.

## Páginas essenciais

- Página inicial clara, com o que a loja vende.
- Página de produto com fotos reais ou autorizadas, descrição completa, **prazo de entrega real** e preço final.
- Políticas: trocas e devoluções, privacidade, frete e prazos.
- Contato e informações da empresa.

## Página de produto que converte

- Benefícios antes de características.
- Perguntas frequentes.
- Avaliações **reais** (nunca invente avaliações).
- Botão de compra visível no celular.`,
              exercise: "Crie a estrutura da página de produto de um item que você pesquisou: título, 5 benefícios, especificações, prazo e perguntas frequentes.",
            },
            {
              title: "Direitos do consumidor, políticas e formalização",
              duration: 15,
              content: `## Código de Defesa do Consumidor (CDC)

- **Direito de arrependimento:** em compras feitas pela internet, o consumidor pode desistir em até **7 dias** a partir do recebimento, com devolução dos valores pagos.
- **Informação clara:** preço total, prazos, características e dados do vendedor precisam estar visíveis.
- **Garantia:** produtos com defeito precisam ser trocados, consertados ou reembolsados conforme a lei.

## Políticas que sua loja precisa ter

- Trocas e devoluções (como solicitar, prazos, quem paga o frete de volta).
- Prazos de entrega por região.
- Privacidade (quais dados coleta e para quê), em linha com a LGPD.

## Formalização

Vender de forma recorrente exige atenção a CNPJ, emissão de nota fiscal e impostos. As regras dependem da atividade e do regime tributário: **converse com um contador** antes de escalar.`,
              exercise: "Escreva a política de trocas e devoluções da sua loja, incluindo o direito de arrependimento de 7 dias.",
              materials: [CONSUMIDOR, ANPD, SEBRAE],
            },
          ],
        },
        {
          title: "Vendas e operação",
          lessons: [
            {
              title: "Anúncios para lojas: testes de produto",
              duration: 14,
              content: `## O papel do anúncio

No dropshipping, os anúncios costumam ser a principal fonte de vendas. O objetivo do primeiro teste é **validar** se o produto vende com lucro, não escalar.

## Como estruturar um teste

1. Escolha um produto e 2 ou 3 criativos em vídeo mostrando o produto em uso.
2. Defina um orçamento diário que você aceita perder.
3. Rode por alguns dias sem mudar tudo a cada hora.
4. Decida com base no **custo por compra** comparado ao lucro por venda calculado na precificação.

## Criativos

- Mostre o problema e a solução nos primeiros segundos.
- Use imagens reais do produto.
- Evite promessas exageradas e "antes e depois" enganosos.

Aprofunde na trilha "Outras formas de marketing digital", no curso de Tráfego Pago.`,
              exercise: "Planeje um teste de produto: criativos, orçamento diário, duração e o custo por compra máximo aceitável.",
            },
            {
              title: "Atendimento, pós-venda e chargebacks",
              duration: 12,
              content: `## Atendimento

- Responda rápido e com informações concretas (código de rastreio, prazo atualizado).
- Use respostas prontas para dúvidas frequentes, sempre personalizadas.
- Avise o cliente proativamente se houver atraso.

## Chargeback

Chargeback é quando o cliente contesta a compra diretamente com o banco ou a operadora do cartão. Causas comuns: produto não recebido, produto diferente do anunciado, cobrança não reconhecida.

Como reduzir:
- Prazos e descrições honestos.
- Rastreio enviado logo após o despacho.
- Nome da loja reconhecível na fatura do cartão.
- Atendimento acessível antes de o cliente procurar o banco.

## Pós-venda

Peça avaliação depois da entrega, ofereça suporte de uso e registre motivos de devolução para melhorar produtos e fornecedores.`,
              exercise: "Escreva 5 respostas prontas para as dúvidas mais comuns de uma loja (prazo, rastreio, troca, atraso, defeito).",
            },
            {
              title: "Indicadores e decisão: escalar, ajustar ou parar",
              duration: 12,
              content: `## Indicadores principais

- **Taxa de conversão da loja:** visitas que viram compras.
- **Custo por compra** nos anúncios.
- **Ticket médio:** valor médio por pedido.
- **Lucro por venda** e **lucro do mês** (não só faturamento).
- **Taxa de devolução e de chargeback.**

## Como decidir

- **Escalar** quando o lucro por venda se mantém positivo por vários dias e o fornecedor aguenta mais pedidos.
- **Ajustar** quando há sinais de interesse (cliques, carrinhos), mas poucas compras: revise página, preço e criativos.
- **Parar** quando, depois de testes honestos, o custo por compra fica acima do lucro possível.

Encerrar um produto que não funciona é parte do processo, não um fracasso.`,
              exercise: "Crie uma planilha de acompanhamento diário com os indicadores desta aula.",
            },
          ],
        },
      ],
    },
  ],
};
