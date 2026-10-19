import type { SeedTrail } from "./types";

const META_HELP = { title: "Central de Ajuda para Empresas da Meta", url: "https://www.facebook.com/business/help" };
const META_LEARN = { title: "Meta para Empresas — cursos gratuitos", url: "https://www.facebook.com/business/learn" };
const ADS_LIBRARY = { title: "Biblioteca de Anúncios da Meta", url: "https://www.facebook.com/ads/library" };
const GOOGLE_ADS_HELP = { title: "Central de Ajuda do Google Ads", url: "https://support.google.com/google-ads" };
const SKILLSHOP = { title: "Google Skillshop — certificações gratuitas", url: "https://skillshop.withgoogle.com" };
const CONSUMIDOR = { title: "Consumidor.gov.br", url: "https://www.consumidor.gov.br" };
const REGISTRO_BR = { title: "Registro.br — domínios .br", url: "https://registro.br" };

export const TRAIL_PRIMEIROS_PASSOS: SeedTrail = {
  slug: "primeiros-passos",
  title: "Primeiros passos no digital",
  subtitle: "Entenda o mercado e escolha seu caminho",
  description:
    "A base para quem está começando do zero: como o marketing digital funciona, quais modelos de negócio existem, como escolher uma área e como se proteger de promessas falsas.",
  level: "Iniciante",
  course: {
    slug: "fundamentos-marketing-digital",
    title: "Fundamentos do Marketing Digital",
    summary: "O mapa completo para começar com clareza e sem cair em armadilhas.",
    description:
      "Neste curso você entende o que é marketing digital na prática, conhece os modelos de trabalho mais comuns, aprende a diferença entre vender produtos e prestar serviços e monta uma rotina de estudos realista.",
    skills: ["Visão de mercado", "Planejamento de carreira", "Segurança digital"],
    premium: false,
    modules: [
      {
        title: "Entendendo o mercado",
        lessons: [
          {
            title: "Como funciona o marketing digital",
            duration: 12,
            content: `## O que é, de verdade

Marketing digital é o conjunto de ações que uma empresa ou pessoa faz na internet para **ser encontrada, gerar confiança e vender**. Não é só postar em rede social: envolve entender quem é o cliente, onde ele está e o que faz ele tomar uma decisão.

## As peças principais

- **Atração:** fazer pessoas conhecerem a marca (conteúdo, anúncios, busca no Google).
- **Relacionamento:** manter contato com quem demonstrou interesse (redes sociais, WhatsApp, e-mail).
- **Conversão:** transformar interesse em ação — uma compra, um orçamento, um cadastro.
- **Análise:** medir o que funcionou para repetir, e o que não funcionou para corrigir.

## O funil, de forma simples

Pense em três etapas: a pessoa **descobre** que existe uma solução, **considera** se ela serve e **decide**. Cada peça do marketing atua em uma dessas etapas. Um anúncio pode gerar descoberta; um depoimento real ajuda na consideração; uma página clara com botão de WhatsApp facilita a decisão.

## Por que isso importa para você

Toda empresa — da padaria do bairro à loja online — precisa dessas etapas funcionando. É aí que surgem as oportunidades: quem domina uma parte desse processo consegue ajudar negócios reais e ser pago por isso.`,
            exercise:
              "Escolha um negócio do seu bairro. Anote: como você descobriu esse negócio, o que te fez confiar nele e como você compra dele. Identifique em qual etapa (descoberta, consideração ou decisão) ele parece mais fraco na internet.",
          },
          {
            title: "Principais modelos de negócio",
            duration: 14,
            content: `## Os caminhos mais comuns

Não existe um único jeito de trabalhar com marketing digital. Os modelos mais comuns para quem está começando são:

- **Prestação de serviços:** você executa uma tarefa para uma empresa — gerenciar anúncios, criar um site, editar vídeos, cuidar de redes sociais. É o caminho com retorno mais direto, porque a empresa paga pelo trabalho.
- **Marketing de afiliados:** você divulga produtos de terceiros e recebe comissão por venda. Exige construção de audiência e confiança; os resultados tendem a demorar mais.
- **Criação de conteúdo:** você constrói uma audiência e monetiza com parcerias, publicidade ou produtos próprios. Exige constância por bastante tempo.
- **Produtos próprios:** cursos, modelos, e-books ou serviços empacotados. Normalmente faz mais sentido depois que você já domina um assunto.

## Comparando com honestidade

| Modelo | Investimento inicial | Tempo até o primeiro resultado | Principal desafio |
|---|---|---|---|
| Serviços | Baixo | Variável, depende de prospecção | Conseguir os primeiros clientes |
| Afiliados | Baixo a médio | Geralmente longo | Construir audiência e confiança |
| Conteúdo | Baixo | Longo | Constância |
| Produto próprio | Médio | Variável | Validar se alguém quer comprar |

Nenhum modelo garante renda. O que aumenta suas chances é **escolher um, praticar com consistência e medir resultados**.`,
            exercise:
              "Escreva em poucas linhas qual modelo mais combina com você hoje e por quê. Considere: quanto tempo por semana você tem, quanto pode investir e se prefere falar com clientes ou criar conteúdo.",
          },
          {
            title: "Vender produtos x prestar serviços",
            duration: 10,
            content: `## Duas lógicas diferentes

**Vender produtos** (seus ou de terceiros) é escalar uma mesma oferta para muitas pessoas. Você trabalha antes — criando conteúdo, audiência, páginas — e a venda acontece depois.

**Prestar serviços** é resolver um problema específico de um cliente específico. Você conversa, entende a necessidade, entrega e recebe pelo trabalho.

## Vantagens e cuidados

**Serviços**
- Retorno mais previsível quando você consegue clientes.
- Você aprende rápido, porque trabalha com problemas reais.
- Cuidado: seu tempo é limitado; preço e escopo precisam ser bem definidos.

**Produtos**
- Pode atender muitas pessoas sem aumentar o trabalho na mesma proporção.
- Cuidado: depende de tráfego, audiência e confiança — e isso leva tempo.

## Uma recomendação prática

Para muitos iniciantes, começar por **serviços** ajuda a ganhar experiência, portfólio e entender o mercado por dentro. Mais tarde, esse conhecimento pode virar produto. Mas isso não é regra: o importante é escolher conscientemente.`,
            exercise:
              "Liste três problemas que empresas próximas de você têm na internet (ex.: perfil desatualizado, sem site, sem anúncios). Para cada um, anote se ele seria resolvido melhor com um serviço ou com um produto.",
          },
        ],
      },
      {
        title: "Escolhendo seu caminho",
        lessons: [
          {
            title: "Como escolher uma área de atuação",
            duration: 12,
            content: `## Comece pelo que você consegue praticar

A melhor área para começar é aquela que você consegue **praticar já nesta semana**, com os recursos que tem. Use estes critérios:

- **Afinidade:** você gosta de números e testes (tráfego pago)? De design e estrutura (sites)? De contar histórias (vídeo)? De escrever e ensinar (conteúdo/afiliados)?
- **Recursos:** você tem computador? Só celular? Pode investir algum valor em ferramentas ou testes?
- **Demanda local:** quais serviços as empresas da sua cidade mais precisam?
- **Tempo:** quantas horas por semana você consegue dedicar de verdade?

## Um teste de 7 dias

Em vez de decidir só pensando, **experimente**. Durante uma semana, faça uma pequena tarefa de cada área que te interessa: crie um criativo simples, monte uma página básica, edite um vídeo curto. Observe em qual você perdeu a noção do tempo e em qual teve mais facilidade.

## Evite a armadilha da troca constante

Trocar de área toda semana faz você recomeçar sempre do zero. Depois de escolher, dê a si mesmo pelo menos 30 dias de foco antes de reavaliar.`,
            exercise:
              "Dê uma nota de 1 a 5 para cada área (tráfego pago, sites, vídeo, afiliados, IA aplicada) em afinidade, recursos disponíveis e demanda local. Some as notas e escreva qual área você vai testar primeiro.",
          },
          {
            title: "Como montar uma rotina de estudos",
            duration: 10,
            content: `## Constância vence intensidade

Estudar 1 hora por dia, 5 dias por semana, costuma render mais do que 8 horas seguidas uma vez por semana. O cérebro precisa de repetição e de intervalo.

## Uma estrutura simples

- **Defina blocos fixos:** escolha horários reais na sua semana e trate como compromisso.
- **Regra 50/50:** metade do tempo aprendendo, metade praticando. Sem prática, o conteúdo some.
- **Uma meta por semana:** por exemplo, "terminar o módulo 1 e criar meu primeiro criativo".
- **Revisão no fim da semana:** 15 minutos para olhar o que fez e planejar a próxima.

## Ambiente e foco

Deixe o celular longe durante o bloco de estudo, feche abas que não são necessárias e anote dúvidas em vez de parar para pesquisar tudo na hora.

## Use a NovaDigital a seu favor

O seu **Plano de 30 dias** já distribui aulas, missões e projetos de acordo com as horas que você informou. Marque cada tarefa ao concluir: isso mostra o seu avanço real e ajuda a manter o ritmo.`,
            exercise:
              "Monte sua agenda da próxima semana com os blocos de estudo e prática. Escreva os dias, horários e a meta da semana.",
          },
          {
            title: "Como evitar golpes e falsas promessas de renda",
            duration: 14,
            content: `## Sinais de alerta

O mercado digital tem muitas oportunidades reais, mas também muitas armadilhas. Desconfie quando encontrar:

- **Promessa de ganho garantido** ou valores altos em pouco tempo, sem esforço.
- **Pressão para decidir agora** ("só hoje", "últimas vagas") sem informações claras.
- **Esquemas que dependem de recrutar pessoas** em vez de vender algo útil.
- **Prints de faturamento** como única prova — eles podem ser editados e não mostram custos.
- **Pedidos de pagamento para "liberar" um trabalho**, uma vaga ou um prêmio.
- **Tarefas pagas para curtir, avaliar ou assistir vídeos** que depois pedem depósito.

## Como se proteger

- Pesquise o nome da empresa e do responsável, incluindo reclamações.
- Nunca compartilhe senhas, códigos de verificação ou dados bancários por mensagem.
- Prefira aprender com fontes oficiais das plataformas (Meta, Google) e conteúdos que mostram o processo, não apenas resultados.
- Se algo parece bom demais para ser verdade, provavelmente é.

## Uma postura saudável

Construir renda com habilidades digitais é possível, mas **leva tempo, prática e aprendizado contínuo**. Desconfie de qualquer um — inclusive de plataformas de ensino — que diga o contrário.`,
            exercise:
              "Encontre um anúncio ou post que promete ganhos rápidos na internet. Liste quais sinais de alerta desta aula aparecem nele.",
            materials: [CONSUMIDOR],
          },
        ],
      },
    ],
  },
};

export const TRAIL_TRAFEGO: SeedTrail = {
  slug: "trafego-pago",
  title: "Tráfego pago",
  subtitle: "Anúncios no Meta Ads e Google Ads",
  description:
    "Aprenda como funcionam os anúncios online, monte campanhas de teste com segurança, leia métricas e estruture uma oferta de gestão de tráfego para empresas.",
  level: "Iniciante a intermediário",
  course: {
    slug: "trafego-pago-do-zero",
    title: "Tráfego Pago do Zero",
    summary: "De fundamentos a campanhas de teste e oferta de serviço.",
    description:
      "Um curso prático sobre anúncios online: objetivos, públicos, criativos, orçamento, métricas e análise. Termina com a estruturação de uma oferta de serviço para empresas locais.",
    skills: ["Meta Ads", "Google Ads", "Leitura de métricas", "Criativos"],
    premium: true,
    modules: [
      {
        title: "Fundamentos",
        lessons: [
          {
            title: "Fundamentos dos anúncios online",
            duration: 12,
            preview: true,
            content: `## O que é tráfego pago

Tráfego pago é quando uma empresa **paga para que uma plataforma mostre seu anúncio** para pessoas selecionadas. As principais plataformas são a Meta (Facebook e Instagram) e o Google (Pesquisa, YouTube, Display).

## Como a plataforma decide quem vê

As plataformas funcionam como leilões. O anunciante define um **objetivo**, um **público** e um **orçamento**; a plataforma decide em tempo real quem vê o anúncio considerando o valor oferecido, a qualidade do anúncio e a chance de a pessoa realizar a ação desejada.

## Os três pilares

- **Oferta:** o que está sendo anunciado e por que alguém se interessaria.
- **Criativo:** a imagem, o vídeo e o texto que chamam a atenção.
- **Segmentação:** para quem o anúncio é mostrado.

Um anúncio bem configurado com uma oferta fraca dificilmente funciona. Por isso, o gestor de tráfego precisa entender também o negócio do cliente.

## Por que é uma habilidade valorizada

Quase toda empresa que vende online já considerou anunciar, mas muitas não sabem configurar, acompanhar ou interpretar resultados. É aqui que um profissional organizado faz diferença.`,
            exercise:
              "Abra a Biblioteca de Anúncios da Meta, pesquise uma empresa conhecida do seu segmento favorito e anote: qual é a oferta, como é o criativo e qual ação o anúncio pede.",
            materials: [ADS_LIBRARY, META_LEARN],
          },
          {
            title: "Meta Ads e Google Ads: diferenças",
            duration: 10,
            preview: true,
            content: `## Intenção x interrupção

- **Google Ads (Pesquisa):** a pessoa **procura** algo ("dentista perto de mim"). O anúncio aparece para quem já tem intenção. É ótimo para serviços com demanda ativa.
- **Meta Ads:** a pessoa está navegando no feed e o anúncio **interrompe** com algo relevante. É ótimo para gerar desejo, apresentar novidades e alcançar públicos por interesses e comportamento.

## Quando usar cada um

| Situação | Melhor ponto de partida |
|---|---|
| Serviço que as pessoas pesquisam (encanador, clínica) | Google Pesquisa |
| Produto visual ou novidade | Meta (Instagram/Facebook) |
| Negócio local querendo mensagens no WhatsApp | Meta com objetivo de mensagens, ou Google com extensão de chamada |
| Marca que precisa ser lembrada | Meta e YouTube |

## Na prática

Muitas empresas usam os dois. Para quem está começando, recomenda-se dominar **uma plataforma primeiro**. A Meta costuma ser mais acessível para aprender com orçamentos pequenos; o Google exige entender bem palavras-chave.`,
            exercise:
              "Para três negócios diferentes (ex.: pizzaria, advogado, loja de roupas), escreva qual plataforma você usaria primeiro e justifique em uma frase.",
            materials: [GOOGLE_ADS_HELP, META_HELP],
          },
        ],
      },
      {
        title: "Estrutura de campanhas",
        lessons: [
          {
            title: "Público, criativos e objetivos",
            duration: 15,
            content: `## Comece pelo objetivo

As plataformas otimizam para o objetivo escolhido. Se você escolher "alcance", ela vai buscar pessoas que veem muitos anúncios; se escolher "mensagens", vai buscar quem costuma iniciar conversas. **Escolha o objetivo que corresponde ao resultado que o cliente quer.**

## Público

- **Localização:** essencial para negócios locais.
- **Idade e interesses:** use como direção, não como prisão. Públicos muito pequenos limitam a entrega.
- **Públicos personalizados:** pessoas que já interagiram com a empresa (visitantes do site, seguidores).

## Criativos

O criativo é o que mais influencia o resultado. Um bom criativo:
- Mostra o produto ou o benefício nos primeiros segundos.
- Fala com uma dor ou desejo específico.
- Tem uma chamada clara ("Peça pelo WhatsApp", "Agende sua avaliação").

## Teste com método

Mude **uma variável por vez**: mantenha o público e teste dois criativos, ou mantenha o criativo e teste dois públicos. Assim você sabe o que causou a diferença.`,
            exercise:
              "Escreva o planejamento de uma campanha fictícia para uma pizzaria: objetivo, público (local, idade, interesses) e a ideia de dois criativos diferentes para testar.",
          },
          {
            title: "Orçamento e métricas essenciais",
            duration: 15,
            content: `## Orçamento

Comece pequeno, com um valor diário que o cliente consegue manter por alguns dias seguidos. As plataformas precisam de tempo e dados para otimizar; mudar tudo a cada dia atrapalha o aprendizado do algoritmo.

## As métricas que você precisa conhecer

- **Impressões:** quantas vezes o anúncio foi exibido.
- **Alcance:** quantas pessoas diferentes viram.
- **CPM:** custo por mil impressões. Indica quanto está custando aparecer.
- **CTR:** taxa de cliques. Mostra se o criativo chama atenção.
- **CPC:** custo por clique.
- **Conversões:** ações valiosas (mensagens, cadastros, compras).
- **Custo por resultado:** quanto custou cada conversão.
- **ROAS:** retorno sobre o investimento em anúncios (receita ÷ investimento), quando há vendas rastreadas.

## Leia as métricas em conjunto

CTR alto com poucas conversões pode indicar um problema na página ou na oferta. CTR baixo pode indicar criativo fraco ou público errado. **Nenhuma métrica isolada conta a história toda.**`,
            exercise:
              "Uma campanha teve 20.000 impressões, 300 cliques e 15 mensagens com R$ 150 investidos. Calcule CTR, CPC e custo por mensagem. O que você testaria primeiro para melhorar?",
          },
          {
            title: "Como criar campanhas de teste",
            duration: 15,
            content: `## Por que testar

Ninguém sabe de antemão qual anúncio vai funcionar. Uma campanha de teste existe para **descobrir, com pouco dinheiro, o que vale escalar**.

## Estrutura recomendada

1. **Defina a hipótese:** "Acredito que o vídeo mostrando a pizza saindo do forno terá custo por mensagem menor que a foto estática."
2. **Defina o orçamento e o prazo:** por exemplo, um valor diário fixo por 5 a 7 dias.
3. **Mude uma variável:** dois ou três criativos com o mesmo público.
4. **Defina o critério de decisão:** qual métrica decide o vencedor (ex.: custo por mensagem).
5. **Registre tudo:** data, configuração, resultados e conclusões.

## Se você ainda não pode investir

Monte o plano de campanha completo e um **painel fictício** identificado como simulação. Isso já treina sua capacidade de planejar e serve de material de portfólio — desde que esteja claramente marcado como exercício, sem resultados inventados.

## Segurança

Use contas próprias ou do cliente com permissões corretas no Gerenciador de Negócios. Nunca peça a senha pessoal do cliente: as plataformas oferecem acesso de parceiro.`,
            exercise:
              "Escreva uma hipótese de teste, o orçamento diário, o prazo, a variável testada e o critério de decisão para uma campanha de um negócio real ou fictício.",
            materials: [META_HELP],
          },
        ],
      },
      {
        title: "Resultados e serviço",
        lessons: [
          {
            title: "Como analisar resultados",
            duration: 12,
            content: `## Do número à decisão

Analisar não é só copiar números para um relatório. É responder: **o que aconteceu, por que aconteceu e o que fazer agora**.

## Um roteiro de análise

1. **Objetivo foi atingido?** Compare o custo por resultado com o que o cliente pode pagar por cliente.
2. **Onde está o gargalo?** Pouca gente vendo (orçamento/público), pouca gente clicando (criativo), pouca gente convertendo (página/oferta/atendimento).
3. **O que manter, pausar e testar?**

## Relatório para o cliente

Um bom relatório é curto e claro:
- Resumo em 3 linhas.
- Principais números do período.
- O que funcionou e o que não funcionou.
- Próximos passos.

## Atenção ao que acontece fora do anúncio

Muitas vezes o anúncio funciona, mas o cliente demora a responder no WhatsApp ou não tem estoque. Registrar isso ajuda o cliente a melhorar e protege o seu trabalho.`,
            exercise:
              "Crie um modelo de relatório de uma página com as seções desta aula. Preencha com dados claramente marcados como fictícios.",
          },
          {
            title: "Como estruturar uma oferta de serviço para empresas",
            duration: 14,
            content: `## Defina para quem

"Faço tráfego para qualquer empresa" é fraco. "Ajudo clínicas odontológicas da minha cidade a receber mais pedidos de avaliação pelo WhatsApp" é específico e mais fácil de vender.

## O que está incluído

Deixe claro:
- Plataformas gerenciadas.
- Quantidade de campanhas e criativos por mês (e quem produz os criativos).
- Frequência de relatórios e reuniões.
- O que **não** está incluído (ex.: valor investido em anúncios é pago pelo cliente diretamente à plataforma).

## Expectativas honestas

Nunca prometa número de vendas. Você pode se comprometer com **processo**: configuração correta, testes contínuos, acompanhamento e transparência.

## Precificação inicial

Considere o tempo que você vai gastar, sua experiência e o porte do cliente. No começo, um projeto com escopo pequeno e prazo definido (ex.: configuração + 30 dias de acompanhamento) reduz o risco para os dois lados.`,
            exercise:
              "Escreva sua oferta em um parágrafo: para quem, qual problema resolve, o que está incluído, o que não está e como será o acompanhamento.",
          },
        ],
      },
    ],
  },
};

export const TRAIL_SITES: SeedTrail = {
  slug: "criacao-de-sites",
  title: "Criação de sites",
  subtitle: "Landing pages e sites que convertem",
  description:
    "Construa páginas profissionais com ferramentas no-code e IA, entenda a estrutura de uma landing page, publique com domínio próprio e monte um portfólio para apresentar a clientes.",
  level: "Iniciante",
  course: {
    slug: "sites-e-landing-pages",
    title: "Sites e Landing Pages Profissionais",
    summary: "Da estrutura à publicação, com foco em conversão.",
    description:
      "Aprenda a planejar e construir páginas que apresentam serviços com clareza, geram contatos e transmitem confiança. Inclui publicação, domínio e portfólio.",
    skills: ["Landing pages", "No-code", "Copy para web", "Conversão"],
    premium: true,
    modules: [
      {
        title: "Fundamentos",
        lessons: [
          {
            title: "Fundamentos de páginas profissionais",
            duration: 12,
            preview: true,
            content: `## Para que serve uma página

Toda página precisa ter **um objetivo principal**: gerar contato, vender, captar cadastro ou apresentar um portfólio. Quando a página tenta fazer tudo, o visitante se perde.

## O que faz uma página parecer profissional

- **Clareza imediata:** em 5 segundos o visitante entende o que a empresa faz e para quem.
- **Hierarquia visual:** título forte, subtítulo explicativo, botões destacados.
- **Consistência:** mesmas cores, fontes e espaçamentos em toda a página.
- **Velocidade:** imagens otimizadas, sem excesso de efeitos.
- **Funciona no celular:** a maioria dos acessos vem do celular.

## Acessibilidade básica

Contraste suficiente entre texto e fundo, textos alternativos nas imagens e botões com rótulos claros ajudam todas as pessoas a usar a página — e também melhoram a presença em buscadores.`,
            exercise:
              "Abra o site de três empresas locais pelo celular. Para cada uma, anote se você entendeu em 5 segundos o que ela faz e se encontrou facilmente como entrar em contato.",
          },
          {
            title: "Anatomia de uma landing page",
            duration: 14,
            preview: true,
            content: `## A estrutura que funciona para a maioria dos casos

1. **Topo (hero):** título com o benefício principal, subtítulo explicando como, e um botão de ação.
2. **Problema:** mostre que você entende a situação do visitante.
3. **Solução:** como o serviço ou produto resolve.
4. **Benefícios:** 3 a 6 itens, focados no resultado para o cliente.
5. **Prova:** depoimentos reais, fotos de trabalhos, certificações. **Nunca invente.**
6. **Como funciona:** passos simples do processo.
7. **Perguntas frequentes:** responda objeções comuns.
8. **Chamada final:** repita a ação principal.

## Escrevendo para a web

Frases curtas, parágrafos de até três linhas, palavras do vocabulário do cliente. Troque "soluções inovadoras" por algo concreto, como "agende sua avaliação em 2 minutos pelo WhatsApp".`,
            exercise:
              "Rascunhe em texto a estrutura completa de uma landing page para um serviço local (ex.: personal trainer), preenchendo cada uma das 8 seções.",
          },
        ],
      },
      {
        title: "Construção",
        lessons: [
          {
            title: "Ferramentas no-code e inteligência artificial",
            duration: 14,
            content: `## O que é no-code

Ferramentas no-code permitem construir sites arrastando blocos, sem programar. Exemplos conhecidos incluem construtores de sites com planos gratuitos e versões pagas para domínio próprio e recursos extras. Consulte a **Biblioteca de Ferramentas** da NovaDigital para ver opções e condições.

## Como escolher

- **Objetivo:** uma página única (landing page) ou um site com várias páginas?
- **Orçamento do cliente:** quem vai pagar a ferramenta e o domínio?
- **Manutenção:** o cliente vai editar sozinho depois?

## Onde a IA ajuda

- Gerar rascunhos de textos e títulos para você revisar.
- Sugerir estruturas de seções.
- Criar variações de chamadas para teste.
- Algumas ferramentas geram páginas iniciais a partir de uma descrição.

## Onde a IA não substitui você

A IA não conhece o negócio do cliente nem verifica fatos. **Revise todo texto gerado**, ajuste à realidade da empresa e nunca publique informações que você não confirmou.`,
            exercise:
              "Escolha uma ferramenta no-code com plano gratuito na Biblioteca de Ferramentas e crie uma página com título, subtítulo e um botão. Registre o link no seu projeto.",
          },
          {
            title: "Formulários, WhatsApp e conversão",
            duration: 12,
            content: `## Facilite o contato

- **Botão de WhatsApp:** use links no formato oficial "wa.me" seguido do número com código do país, e uma mensagem inicial pronta.
- **Formulários curtos:** peça só o necessário. Cada campo extra reduz o número de pessoas que concluem.
- **Telefone clicável** e endereço com link para o mapa, em negócios locais.

## Botões que funcionam

- Texto de ação específico: "Quero meu orçamento" em vez de "Enviar".
- Cor de destaque usada apenas para ações principais.
- Botão visível sem precisar rolar no celular.

## Privacidade

Se você coleta dados (nome, telefone, e-mail), informe para que serão usados. A LGPD exige transparência e cuidado com dados pessoais. Não colete o que não vai usar.`,
            exercise:
              "Crie um link de WhatsApp com mensagem pré-preenchida para um negócio fictício e adicione-o como botão na página que você criou.",
            materials: [{ title: "ANPD — Autoridade Nacional de Proteção de Dados", url: "https://www.gov.br/anpd" }],
          },
          {
            title: "Publicação e domínio",
            duration: 10,
            content: `## Domínio

O domínio é o endereço do site (ex.: nomedaempresa.com.br). Domínios ".br" são registrados no Registro.br. Recomenda-se que o domínio fique **registrado no nome do cliente** — isso evita problemas futuros.

## Publicação

A maioria das ferramentas no-code publica com um clique em um subdomínio gratuito; para usar domínio próprio, normalmente é preciso um plano pago e configurar o DNS conforme as instruções da ferramenta.

## Checklist antes de publicar

- Todos os links e botões testados.
- Textos revisados (ortografia e informações).
- Página testada no celular e no computador.
- Título e descrição da página configurados para buscadores.
- Política de privacidade, se houver coleta de dados.`,
            exercise:
              "Faça o checklist completo de publicação na sua página de teste e anote o que precisou corrigir.",
            materials: [REGISTRO_BR],
          },
        ],
      },
      {
        title: "Serviço e portfólio",
        lessons: [
          {
            title: "Estrutura de sites que apresentam serviços",
            duration: 12,
            content: `## Páginas essenciais

Para um prestador de serviços, um site simples costuma ter:
- **Início:** proposta de valor e chamada para contato.
- **Serviços:** o que é oferecido, para quem e como funciona.
- **Sobre:** quem está por trás, experiência e valores.
- **Trabalhos ou portfólio:** exemplos reais.
- **Contato:** WhatsApp, formulário, endereço e horário.

## Organize a informação pelo cliente

Pense nas perguntas que o cliente faz antes de contratar: "Vocês atendem na minha região?", "Quanto tempo demora?", "Como é o pagamento?". Responda essas perguntas no site.`,
            exercise:
              "Desenhe (no papel ou em uma ferramenta) o mapa de páginas de um site para um serviço local, com as seções de cada página.",
          },
          {
            title: "Portfólio e apresentação para clientes",
            duration: 12,
            content: `## Portfólio sem clientes ainda

Você pode criar **projetos demonstrativos**: páginas para negócios fictícios ou redesenhos de páginas existentes. O importante é identificá-los claramente como demonstração — nunca diga que foram trabalhos para clientes reais.

## Como apresentar um projeto

Para cada projeto, mostre:
- O desafio (o que a página precisava resolver).
- As decisões que você tomou e por quê.
- O resultado visual (imagens ou link).
- O que aprendeu ou faria diferente.

## Apresentando ao cliente

Leve exemplos parecidos com o negócio dele, explique o processo de trabalho em etapas e mostre prazos realistas. Use a área **Projetos e Portfólio** da NovaDigital para organizar e compartilhar seus trabalhos.`,
            exercise:
              "Cadastre na área de Projetos uma landing page demonstrativa com desafio, decisões e link, marcada como demonstração.",
          },
        ],
      },
    ],
  },
};
