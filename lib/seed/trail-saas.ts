import type { SeedTrail } from "./types";

const ANPD = { title: "ANPD — Proteção de Dados", url: "https://www.gov.br/anpd" };

export const TRAIL_SAAS: SeedTrail = {
  slug: "criacao-de-saas",
  title: "Criação de SaaS",
  subtitle: "Do problema validado ao primeiro cliente pagante",
  description:
    "Aprenda a criar um software vendido por assinatura: validar o problema, definir o MVP, construir com IA e ferramentas acessíveis, cobrar, publicar, medir e conquistar os primeiros clientes.",
  level: "Intermediário",
  assistant: {
    name: "Mentor de SaaS",
    focus:
      "Você é especialista em criação de SaaS (software como serviço) por iniciantes e pequenos times, incluindo construção com ferramentas no-code, low-code e assistentes de programação com IA. Ajude a validar problemas, escrever roteiros de entrevista, definir o escopo do MVP, escolher stack e ferramentas, escrever especificações e prompts para construir com IA, planejar cobrança por assinatura, métricas (MRR, churn, CAC, LTV), lançamento e aquisição. Lembre de segurança, privacidade (LGPD), termos de uso e backups. Seja honesto sobre limitações de ferramentas no-code e sobre o tempo necessário para conquistar clientes.",
    suggestions: [
      "Me ajude a validar uma ideia de SaaS para salões de beleza.",
      "Escreva a especificação de um MVP com as 5 funções essenciais.",
      "Qual stack simples usar para construir com IA?",
      "Como defino o preço da assinatura do meu SaaS?",
    ],
  },
  courses: [
    {
      slug: "saas-do-zero",
      title: "Criação de SaaS do Zero",
      summary: "Validar, construir com IA, cobrar e conquistar os primeiros clientes.",
      description:
        "Um curso prático para criar seu primeiro SaaS: entender o modelo, encontrar e validar um problema real, definir o MVP, construir com ferramentas acessíveis e IA, cobrar por assinatura, publicar com segurança e crescer com métricas.",
      skills: ["Validação de ideias", "Produto (MVP)", "Construção com IA", "Métricas de assinatura"],
      premium: true,
      modules: [
        {
          title: "Entendendo o SaaS",
          lessons: [
            {
              title: "O que é SaaS e como ele ganha dinheiro",
              duration: 12,
              preview: true,
              content: `## Definição

SaaS (*Software as a Service*) é um software que o cliente usa pela internet e paga, normalmente, por **assinatura** mensal ou anual. Exemplos do dia a dia: ferramentas de agenda, gestão financeira, CRM e emissão de notas.

## Por que o modelo é atraente

- **Receita recorrente:** cada cliente paga todo mês enquanto estiver satisfeito.
- **Escala:** o mesmo software atende muitos clientes.
- **Melhoria contínua:** o produto evolui com o uso.

## Os desafios

- Leva tempo para conquistar os primeiros clientes.
- Clientes cancelam se o produto não resolve o problema (o chamado *churn*).
- Exige suporte, manutenção e segurança contínuos.

## Micro-SaaS

Para iniciantes, um caminho comum é o **micro-SaaS**: um software pequeno, focado em um problema específico de um público específico, que pode ser construído e mantido por uma ou poucas pessoas.`,
              exercise: "Liste 3 softwares por assinatura que você ou empresas próximas usam. Para cada um, escreva o problema que resolve e quem paga por ele.",
            },
            {
              title: "Encontrando problemas que valem um software",
              duration: 14,
              preview: true,
              content: `## Comece pelo problema, não pela ideia

Um bom SaaS nasce de um problema **frequente**, **doloroso** e que alguém **já tenta resolver** (com planilhas, papel, WhatsApp ou ferramentas ruins).

## Onde encontrar problemas

- No seu trabalho atual ou em trabalhos anteriores.
- Em pequenos negócios próximos: salões, clínicas, oficinas, escritórios.
- Em comunidades e fóruns onde pessoas reclamam de processos manuais.
- Em avaliações negativas de softwares existentes.

## Perguntas para filtrar

- Quem tem esse problema e com que frequência?
- Como resolvem hoje e quanto isso custa em tempo ou dinheiro?
- Essas pessoas pagam por ferramentas?
- Você consegue alcançar esse público?

## Nicho é vantagem

"Agenda para barbearias" é mais fácil de vender do que "agenda para qualquer negócio". Comece estreito.`,
              exercise: "Liste 10 problemas de um nicho que você conhece e pontue cada um em frequência, dor e disposição para pagar.",
            },
          ],
        },
        {
          title: "Validação e MVP",
          lessons: [
            {
              title: "Validando antes de construir",
              duration: 15,
              content: `## Por que validar

Construir sem validar é a forma mais comum de perder meses. Validar é buscar evidências de que pessoas reais têm o problema e pagariam pela solução.

## Entrevistas

Converse com 5 a 10 pessoas do público. Pergunte sobre **o passado**, não sobre o futuro:
- "Como você resolveu isso da última vez?"
- "Quanto tempo gasta com isso por semana?"
- "O que já tentou e por que não funcionou?"

Evite perguntar "Você usaria meu app?": as pessoas tendem a responder sim por educação.

## Sinais fortes

- As pessoas descrevem o problema sem você sugerir.
- Já pagam por soluções parecidas ou gastam tempo considerável.
- Aceitam entrar numa lista de espera ou fazer uma pré-venda.

## Landing page de lista de espera

Uma página simples explicando a solução, com formulário de interesse, ajuda a medir demanda antes de programar.`,
              exercise: "Escreva um roteiro de entrevista com 8 perguntas sobre o problema que você escolheu e agende 3 conversas.",
            },
            {
              title: "Definindo o MVP",
              duration: 14,
              content: `## O que é MVP

MVP (*produto mínimo viável*) é a menor versão do produto que já **resolve o problema principal** e permite aprender com usuários reais.

## Como definir

1. Escreva o problema principal em uma frase.
2. Liste todas as funções que imaginou.
3. Marque apenas as que são indispensáveis para resolver o problema principal.
4. Corte o resto para versões futuras.

## Exemplo: agenda para barbearias

- **MVP:** cadastro de serviços, horários disponíveis, link de agendamento para o cliente, lista de agendamentos do dia.
- **Depois:** lembretes automáticos, pagamentos online, relatórios, programa de fidelidade.

## Especificação simples

Para cada função do MVP, descreva: quem usa, o que faz, quais dados entram e saem, e o que acontece em caso de erro. Essa especificação será usada para construir, inclusive com IA.`,
              exercise: "Escreva a especificação do MVP do seu SaaS com no máximo 5 funções, descrevendo usuários, dados e fluxos.",
            },
          ],
        },
        {
          title: "Construção",
          lessons: [
            {
              title: "Caminhos para construir: no-code, low-code e código com IA",
              duration: 15,
              content: `## No-code

Ferramentas visuais que permitem montar aplicativos sem programar. São rápidas para protótipos, mas podem ter limites de personalização, desempenho e custo conforme o produto cresce.

## Geradores de aplicativos com IA

Ferramentas que criam telas e funções a partir de descrições em texto. Aceleram muito o início; ainda assim, você precisa **revisar, testar e entender** o que foi gerado.

## Código com assistentes de IA

Assistentes de programação ajudam a escrever, explicar e corrigir código. Uma combinação comum para iniciantes é um framework web, um banco de dados hospedado com autenticação pronta, e uma plataforma de hospedagem com plano gratuito para começar.

## Como escolher

- **Validar rápido?** No-code ou gerador com IA.
- **Produto que vai crescer e precisa de controle?** Código com apoio de IA.
- Em qualquer caso: comece simples e evite ferramentas demais.

Consulte opções na Biblioteca de Ferramentas.`,
              exercise: "Escolha o caminho de construção do seu MVP e justifique considerando seu conhecimento, orçamento e prazo.",
            },
            {
              title: "Construindo com IA: especificação, prompts e testes",
              duration: 15,
              content: `## Trabalhe em partes pequenas

Peça uma função por vez, a partir da especificação do MVP. Exemplo de pedido:

"Crie a tela de cadastro de serviços de uma barbearia: nome, duração em minutos e preço. Salve no banco de dados, mostre a lista e permita editar e excluir. Apenas o dono logado pode ver e alterar os próprios serviços."

## Revise sempre

- Teste cada função como usuário, inclusive casos de erro (campos vazios, valores inválidos).
- Confira se um usuário **não consegue ver dados de outro**: esse é um dos erros mais graves em SaaS.
- Peça para a IA explicar o código que você não entende.

## Versionamento

Use um repositório de código para guardar cada versão funcional. Se algo quebrar, você consegue voltar.

## Dados reais

Nunca coloque chaves secretas no código visível ao navegador nem compartilhe dados de clientes em ferramentas sem saber como são tratados.`,
              exercise: "Escreva os prompts para construir as 2 primeiras funções do seu MVP, incluindo critérios de teste para cada uma.",
            },
            {
              title: "Segurança, privacidade e termos",
              duration: 12,
              content: `## O básico de segurança

- Login seguro (preferir soluções prontas e confiáveis de autenticação).
- Cada cliente acessa apenas os próprios dados.
- Chaves e senhas guardadas em variáveis de ambiente do servidor.
- Backups automáticos do banco de dados.

## LGPD

Se o seu SaaS armazena dados pessoais, você precisa:
- Informar quais dados coleta e por quê (política de privacidade).
- Proteger os dados e limitar o acesso.
- Permitir que o usuário solicite correção ou exclusão.

## Termos de uso

Defina regras de uso, responsabilidades, política de cancelamento e reembolso. Para documentos definitivos, consulte um profissional da área jurídica.`,
              exercise: "Faça um checklist de segurança e privacidade para o seu MVP e marque o que já está atendido.",
              materials: [ANPD],
            },
          ],
        },
        {
          title: "Lançamento e crescimento",
          lessons: [
            {
              title: "Cobrança por assinatura e preço",
              duration: 14,
              content: `## Como cobrar

Use uma plataforma de pagamentos que faça **cobrança recorrente** e avise seu sistema quando um pagamento é aprovado, renovado ou cancelado (webhooks). Assim o acesso é liberado e bloqueado automaticamente.

## Modelos de preço

- **Plano único:** simples para começar.
- **Planos por nível** (básico, profissional): diferenciados por limites ou funções.
- **Por uso:** por usuário, por agendamento, por nota emitida.

## Como definir o valor

- Quanto o problema custa hoje para o cliente (tempo, dinheiro, erros)?
- Quanto cobram as alternativas?
- Seus custos por cliente (hospedagem, ferramentas, suporte).

Comece com um preço que você consiga justificar e teste. Ofereça desconto no plano anual para melhorar o caixa.

## Teste grátis

Um período de teste curto ajuda a pessoa a experimentar, mas exige um bom primeiro uso (onboarding) para converter.`,
              exercise: "Defina o modelo de preço do seu SaaS, o valor inicial e a justificativa com base no problema e nas alternativas.",
            },
            {
              title: "Publicação e primeiros clientes",
              duration: 14,
              content: `## Antes de publicar

- Teste os fluxos principais do início ao fim.
- Tenha uma página explicando o produto, preço, contato e termos.
- Prepare um onboarding: o que o usuário faz nos primeiros minutos.

## Primeiros clientes

- Comece pelas pessoas que você entrevistou e pela lista de espera.
- Ofereça acompanhamento próximo no início: você aprende muito com cada cliente.
- Peça feedback estruturado: o que usam, o que falta, o que confunde.

## Canais de aquisição

- Conteúdo útil para o nicho.
- Parcerias com quem já atende esse público.
- Comunidades onde o público está (sem spam).
- Anúncios, quando já souber quanto vale um cliente.`,
              exercise: "Liste 20 potenciais primeiros clientes ou parceiros e escreva a mensagem de convite para testar seu MVP.",
            },
            {
              title: "Métricas de um SaaS",
              duration: 12,
              content: `## As principais

- **MRR:** receita recorrente mensal.
- **Churn:** percentual de clientes que cancelam por mês.
- **CAC:** custo para conquistar um cliente.
- **LTV:** quanto um cliente paga, em média, durante todo o tempo em que fica.
- **Ativação:** percentual de novos usuários que chegam ao primeiro resultado no produto.

## Relações importantes

- Se o **churn** é alto, investir em aquisição é como encher um balde furado: melhore o produto e o onboarding primeiro.
- O **LTV** precisa ser bem maior que o **CAC** para o negócio se sustentar.

## Exemplo

Com assinatura de R$ 49 e churn mensal de 5%, um cliente fica em média 20 meses. LTV aproximado: R$ 49 × 20 = R$ 980. Se o CAC for R$ 300, há espaço para crescer; se for R$ 1.200, a conta não fecha.`,
              exercise: "Monte uma planilha com MRR, churn, CAC e LTV usando números estimados para o seu SaaS e identifique qual métrica é mais crítica.",
            },
          ],
        },
      ],
    },
  ],
};
