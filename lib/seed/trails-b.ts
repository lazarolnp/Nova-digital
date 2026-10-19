import type { SeedTrail } from "./types";

export const TRAIL_VIDEO: SeedTrail = {
  slug: "edicao-de-videos-ia",
  title: "Edição de vídeos com IA",
  subtitle: "Vídeos curtos, roteiro e portfólio",
  description:
    "Aprenda fundamentos de edição, roteiro e storytelling, crie vídeos curtos com narração e legendas, use IA com responsabilidade e transforme isso em serviço.",
  level: "Iniciante",
  course: {
    slug: "edicao-de-videos-com-ia",
    title: "Edição de Vídeos com IA",
    summary: "Da ideia ao vídeo publicado, com ferramentas acessíveis.",
    description:
      "Curso prático para editar vídeos curtos com qualidade usando ferramentas gratuitas ou freemium, apoiado por IA para roteiro, legendas e organização.",
    skills: ["Edição de vídeo", "Roteiro", "Storytelling", "Legendas"],
    premium: true,
    modules: [
      {
        title: "Fundamentos",
        lessons: [
          {
            title: "Fundamentos de edição",
            duration: 12,
            preview: true,
            content: `## O que a edição faz

Editar é **escolher o que fica e em que ordem**. Um bom editor remove tudo que não ajuda a mensagem e organiza o restante para prender a atenção.

## Conceitos básicos

- **Corte:** remover pausas, erros e repetições.
- **Ritmo:** a velocidade com que as cenas mudam. Vídeos curtos costumam ter cortes frequentes.
- **B-roll:** imagens de apoio que ilustram o que está sendo dito.
- **Trilha e áudio:** o áudio limpo importa mais do que imagem perfeita. Ajuste volumes para a voz ficar clara.
- **Formato:** vertical (9:16) para Reels, TikTok e Shorts; horizontal (16:9) para YouTube tradicional.

## Fluxo de trabalho

1. Organize os arquivos em pastas (brutos, áudio, exportados).
2. Faça o corte grosso (remova o que não serve).
3. Refine o ritmo e adicione B-roll.
4. Ajuste áudio, cor e legendas.
5. Exporte e revise no celular.`,
            exercise:
              "Grave um vídeo de 60 segundos falando sobre um assunto que você gosta. Faça apenas o corte grosso, removendo pausas e erros, e anote a duração final.",
          },
          {
            title: "Roteiro e storytelling",
            duration: 12,
            preview: true,
            content: `## Estrutura para vídeos curtos

1. **Gancho (0–3 s):** uma frase ou imagem que faça a pessoa parar de rolar.
2. **Contexto:** por que isso importa para quem está assistindo.
3. **Conteúdo:** a dica, a história ou a demonstração.
4. **Fechamento:** uma conclusão clara e uma chamada (seguir, comentar, visitar o perfil).

## Storytelling simples

Uma história tem **personagem, conflito e transformação**. Mesmo um vídeo de produto pode seguir isso: a pessoa com um problema, a tentativa de resolver, a solução encontrada.

## Escreva como se fala

Leia o roteiro em voz alta. Se soar artificial, reescreva. Frases curtas funcionam melhor.`,
            exercise:
              "Escreva um roteiro de 30 a 45 segundos com gancho, contexto, conteúdo e fechamento para um negócio local real ou fictício.",
          },
        ],
      },
      {
        title: "Produção",
        lessons: [
          {
            title: "Vídeos curtos: estrutura e ritmo",
            duration: 12,
            content: `## Retenção é o principal indicador

As plataformas mostram mais os vídeos que as pessoas assistem até o fim. Para aumentar a retenção:
- Comece pelo ponto mais interessante.
- Mude algo na tela a cada poucos segundos (corte, zoom, texto, B-roll).
- Evite introduções longas e apresentações pessoais no início.

## Elementos visuais

- **Texto na tela** reforçando a ideia principal.
- **Zoom suave** para destacar momentos.
- **Transições discretas** — excesso de efeitos cansa.

## Consistência visual

Defina fontes, cores e estilo de legenda e use sempre os mesmos. Isso cria identidade para o perfil e acelera a edição.`,
            exercise:
              "Edite o vídeo da aula anterior aplicando: gancho no início, pelo menos um texto na tela e um zoom. Compare a versão antiga com a nova.",
          },
          {
            title: "Narração e legendas",
            duration: 12,
            content: `## Narração

- Grave em ambiente silencioso; tecidos e cortinas ajudam a reduzir eco.
- Mantenha o microfone (ou celular) a uma distância constante.
- Fale com energia, mas naturalmente.

## Legendas

Muita gente assiste vídeos sem som. Legendas aumentam a compreensão e a acessibilidade.
- Muitos editores geram legendas automáticas: **sempre revise**, porque erros de transcrição são comuns, principalmente com nomes e termos técnicos.
- Use fonte legível, contraste alto e no máximo duas linhas por vez.

## Vozes geradas por IA

Algumas ferramentas geram narração com voz sintética. Use com transparência e **nunca imite a voz de uma pessoa real sem autorização**.`,
            exercise:
              "Adicione legendas ao seu vídeo, revise cada linha e registre quantos erros a legenda automática teve.",
          },
          {
            title: "Uso responsável de IA em vídeo",
            duration: 10,
            content: `## O que a IA faz bem

- Transcrever e gerar legendas.
- Sugerir cortes e remover silêncios.
- Ajudar a escrever roteiros e ganchos.
- Gerar imagens ou trechos de apoio.

## Cuidados indispensáveis

- **Direitos de imagem e música:** use trilhas e imagens com licença adequada.
- **Pessoas reais:** não crie vídeos que coloquem palavras ou ações falsas na boca de alguém.
- **Transparência:** quando o conteúdo for gerado por IA de forma relevante, deixe isso claro, conforme as regras de cada plataforma.
- **Verificação:** informações em roteiros gerados por IA precisam ser checadas.

Usar IA com ética protege você, o cliente e a audiência.`,
            exercise:
              "Liste três situações em que você usaria IA no seu fluxo de edição e uma situação em que você não usaria, explicando o motivo.",
          },
        ],
      },
      {
        title: "Serviço e portfólio",
        lessons: [
          {
            title: "Montando seu portfólio de vídeos",
            duration: 10,
            content: `## O que incluir

- 3 a 6 vídeos curtos, de estilos diferentes (produto, depoimento simulado identificado como tal, dica educativa).
- Um "antes e depois" mostrando o material bruto e o editado.
- Uma descrição curta do que você fez em cada vídeo.

## Onde hospedar

Um perfil dedicado em uma rede de vídeos curtos, uma pasta organizada em um serviço de armazenamento ou a área **Projetos e Portfólio** da NovaDigital, com links.

## Identificação

Se o vídeo foi feito para uma marca fictícia ou como exercício, deixe isso explícito. Credibilidade é o seu maior ativo.`,
            exercise:
              "Cadastre seu primeiro vídeo na área de Projetos, com link, descrição do que foi feito e status.",
          },
          {
            title: "Oferecendo edição como serviço",
            duration: 12,
            content: `## Quem precisa de edição

Criadores de conteúdo, profissionais liberais (médicos, advogados, nutricionistas), lojas e restaurantes que querem presença em vídeo, mas não têm tempo para editar.

## Defina o pacote

- Quantidade de vídeos por mês e duração.
- Quem grava (o cliente envia o material bruto?).
- Número de revisões incluídas.
- Prazo de entrega de cada vídeo.

## Processo

1. Briefing (objetivo, público, referências).
2. Recebimento do material.
3. Primeira versão.
4. Ajustes.
5. Entrega final nos formatos combinados.

Registre tudo por escrito para evitar mal-entendidos.`,
            exercise:
              "Escreva um pacote de serviço de edição com quantidade, prazos, revisões e processo.",
          },
        ],
      },
    ],
  },
};

export const TRAIL_AFILIADOS: SeedTrail = {
  slug: "marketing-de-afiliados",
  title: "Marketing de afiliados",
  subtitle: "Divulgação ética e baseada em confiança",
  description:
    "Entenda o mercado de afiliados, escolha produtos com critério, produza conteúdo orgânico, analise conversões e siga as regras de divulgação.",
  level: "Iniciante",
  course: {
    slug: "afiliados-com-etica",
    title: "Marketing de Afiliados com Ética",
    summary: "Como recomendar produtos de forma honesta e sustentável.",
    description:
      "Um curso sobre como funciona a afiliação, critérios de escolha de produtos, conteúdo orgânico, construção de confiança e regras de divulgação.",
    skills: ["Afiliação", "Conteúdo orgânico", "Análise de conversão"],
    premium: true,
    modules: [
      {
        title: "Entendendo o mercado",
        lessons: [
          {
            title: "Como funciona o mercado de afiliados",
            duration: 12,
            preview: true,
            content: `## O modelo

O produtor (dono do produto) oferece uma comissão para quem divulga. O afiliado recebe um **link rastreado**; quando alguém compra por esse link, a plataforma registra a venda e paga a comissão conforme as regras do programa.

## Tipos de produtos

- **Produtos digitais:** cursos, e-books, assinaturas. Comissões costumam ser maiores.
- **Produtos físicos:** programas de lojas e marketplaces. Comissões costumam ser menores, mas o público já conhece as lojas.

## A realidade

Afiliação não é "ganhar dinheiro só com um link". Sem audiência, conteúdo útil e confiança, o link não gera vendas. Os resultados geralmente levam tempo e variam muito entre pessoas.`,
            exercise:
              "Pesquise dois programas de afiliados (um de produto digital e um de produto físico) e anote: como funciona o cadastro, a comissão informada e as regras de divulgação.",
          },
          {
            title: "Escolha de produtos e plataformas",
            duration: 12,
            preview: true,
            content: `## Critérios de escolha

- **Você recomendaria para alguém próximo?** Se não, não divulgue.
- **Reputação:** pesquise reclamações, política de reembolso e atendimento.
- **Alinhamento com seu conteúdo:** o produto precisa fazer sentido para quem acompanha você.
- **Regras do programa:** prazo de pagamento, canais permitidos e restrições.

## Evite

- Produtos com promessas exageradas (cura, enriquecimento, resultados garantidos).
- Programas que pedem pagamento para se afiliar sem entregar nada claro.
- Divulgar muitos produtos sem relação entre si.`,
            exercise:
              "Avalie um produto que você consideraria divulgar usando os critérios desta aula e escreva sua conclusão.",
          },
        ],
      },
      {
        title: "Divulgação",
        lessons: [
          {
            title: "Conteúdo orgânico que gera confiança",
            duration: 14,
            content: `## Conteúdo antes do link

Pessoas compram de quem confiam. Conteúdo útil — tutoriais, comparações honestas, experiências reais — constrói essa confiança.

## Formatos que funcionam

- **Review honesto:** pontos positivos e negativos, para quem serve e para quem não serve.
- **Comparação:** produto A x produto B para um caso de uso específico.
- **Tutorial:** como usar o produto para resolver um problema.
- **Bastidores:** sua experiência real usando o produto.

## Constância

Defina um tema, uma frequência realista e mantenha por semanas. Audiência é construída aos poucos.`,
            exercise:
              "Planeje 4 ideias de conteúdo para um nicho que você escolheu, uma de cada formato desta aula.",
          },
          {
            title: "Estratégias de divulgação",
            duration: 12,
            content: `## Canais

- **Redes sociais de vídeo curto:** alcance rápido, exige frequência.
- **YouTube:** conteúdo pesquisável que continua sendo encontrado por muito tempo.
- **Blog e busca:** artigos que respondem dúvidas específicas.
- **Listas de e-mail ou grupos:** relacionamento direto, com consentimento das pessoas.

## Boas práticas

- Coloque o link onde ele é útil, não em todo lugar.
- Nunca envie mensagens em massa sem permissão (spam).
- Respeite as regras de cada rede e de cada programa de afiliados.`,
            exercise:
              "Escolha um canal principal e escreva um plano de publicação de 2 semanas.",
          },
        ],
      },
      {
        title: "Resultados e regras",
        lessons: [
          {
            title: "Análise de conversões",
            duration: 12,
            content: `## O que acompanhar

- **Cliques no link:** quantas pessoas se interessaram.
- **Taxa de conversão:** vendas ÷ cliques.
- **Conteúdo de origem:** qual vídeo ou post trouxe cada clique, quando a plataforma permite rastrear.
- **Reembolsos:** taxa alta pode indicar promessa desalinhada com o produto.

## Como agir

Conteúdos que geram cliques mas não vendas podem estar atraindo o público errado. Conteúdos com poucas visualizações e boa conversão merecem mais distribuição.`,
            exercise:
              "Monte uma planilha de acompanhamento com colunas: data, conteúdo, canal, cliques, vendas e observações.",
          },
          {
            title: "Regras de divulgação e prevenção contra fraudes",
            duration: 12,
            content: `## Transparência é obrigatória

Ao divulgar um produto em que você ganha comissão, **deixe isso claro** para o público. Isso é uma exigência de autorregulação publicitária e das próprias plataformas, além de ser uma questão de confiança.

## Práticas proibidas ou arriscadas

- Prometer resultados que o produto não garante.
- Usar marca do produtor em anúncios sem autorização.
- Comprar cliques ou gerar vendas falsas.
- Criar perfis falsos de depoimento.

## Proteja-se

Leia os termos de cada programa, guarde comprovantes e desconfie de "produtores" que pedem dinheiro para você se afiliar.`,
            exercise:
              "Reescreva uma legenda de divulgação deixando claro que se trata de link de afiliado, sem promessas exageradas.",
            materials: [{ title: "CONAR — Conselho Nacional de Autorregulamentação Publicitária", url: "https://www.conar.org.br" }],
          },
        ],
      },
    ],
  },
};

export const TRAIL_IA: SeedTrail = {
  slug: "ia-aplicada",
  title: "Inteligência artificial aplicada",
  subtitle: "IA como ferramenta de trabalho",
  description:
    "Use IA para criar conteúdo, pesquisar, planejar, automatizar tarefas e prototipar páginas — entendendo limites, privacidade e a importância de verificar informações.",
  level: "Iniciante",
  course: {
    slug: "ia-no-trabalho-digital",
    title: "IA no Trabalho Digital",
    summary: "Produza mais e melhor, com senso crítico.",
    description:
      "Aprenda a usar assistentes de IA no dia a dia do marketing digital: escrita, pesquisa, planejamento, automação e criação de serviços, com responsabilidade.",
    skills: ["Prompts", "Pesquisa com IA", "Automação", "Prototipação"],
    premium: true,
    modules: [
      {
        title: "Fundamentos",
        lessons: [
          {
            title: "Como utilizar IA no trabalho",
            duration: 12,
            preview: true,
            content: `## IA como assistente, não como piloto automático

Assistentes de IA ajudam a gerar rascunhos, organizar ideias e acelerar tarefas repetitivas. O resultado final continua sendo sua responsabilidade.

## Como pedir bem

Um bom pedido tem:
- **Contexto:** quem você é, para quem é o trabalho.
- **Tarefa:** o que exatamente precisa ser feito.
- **Formato:** lista, tabela, texto curto, número de opções.
- **Restrições:** tom de voz, tamanho, o que evitar.

Exemplo: "Sou gestor de tráfego iniciante. Crie 5 opções de título para um anúncio de uma clínica de fisioterapia em Recife, com até 40 caracteres, tom acolhedor, sem prometer cura."

## Itere

Peça ajustes: "mais curto", "mais formal", "explique o porquê de cada opção". A primeira resposta raramente é a melhor.`,
            exercise:
              "Reescreva um pedido vago que você faria a uma IA usando contexto, tarefa, formato e restrições. Teste os dois e compare.",
          },
          {
            title: "Limitações, privacidade e verificação",
            duration: 12,
            preview: true,
            content: `## Limitações

- A IA pode **inventar informações** com aparência convincente.
- Pode ter conhecimento desatualizado.
- Não conhece a realidade do seu cliente se você não explicar.

## Privacidade

- Não cole dados pessoais de clientes (CPF, telefone, endereço) em ferramentas sem saber como os dados são tratados.
- Leia a política de privacidade da ferramenta e verifique as configurações de uso de dados.
- Em trabalhos para empresas, pergunte se há regras internas sobre uso de IA.

## Verificação

Confirme dados, números, leis e nomes em fontes oficiais. Use a IA para acelerar, não para substituir a checagem.`,
            exercise:
              "Peça a uma IA uma informação factual sobre seu nicho e verifique-a em uma fonte oficial. Anote se estava correta.",
          },
        ],
      },
      {
        title: "Aplicações",
        lessons: [
          {
            title: "Criação de conteúdo e materiais comerciais",
            duration: 12,
            content: `## O que dá para acelerar

- Rascunhos de posts, legendas e roteiros.
- Variações de títulos e chamadas para anúncios.
- Estrutura de propostas comerciais e e-mails.
- Resumos de reuniões a partir das suas anotações.

## Mantenha sua voz

Dê exemplos do seu estilo e peça para a IA seguir. Depois, revise e ajuste com seu jeito de falar. Textos genéricos não diferenciam ninguém.

## Materiais comerciais

Uma apresentação de serviço clara tem: problema do cliente, solução, processo, prazo, investimento e próximos passos. A IA ajuda a organizar; você garante que tudo é verdadeiro.`,
            exercise:
              "Use uma IA para criar o rascunho de uma apresentação do seu serviço e depois reescreva com sua voz, removendo qualquer afirmação que você não possa comprovar.",
          },
          {
            title: "Pesquisa e planejamento com IA",
            duration: 12,
            content: `## Pesquisa

- Liste dúvidas comuns do público de um nicho.
- Organize concorrentes e diferenciais **a partir de informações que você coletou**.
- Gere perguntas para entrevistar clientes.

## Planejamento

- Calendário de conteúdo.
- Plano de estudos semanal.
- Etapas de um projeto com prazos.

O **Assistente IA da NovaDigital** foi preparado para ajudar nessas tarefas considerando o seu plano e o seu progresso na plataforma.`,
            exercise:
              "Peça ao Assistente IA um calendário de conteúdo de 2 semanas para um nicho e ajuste-o à sua realidade.",
          },
          {
            title: "Automação de tarefas",
            duration: 12,
            content: `## O que vale automatizar

Tarefas repetitivas, previsíveis e de baixo risco: organizar respostas frequentes, mover dados entre planilhas, agendar publicações, criar lembretes de follow-up.

## Ferramentas

Existem plataformas que conectam aplicativos ("quando acontecer X, faça Y"), recursos de agendamento das próprias redes sociais e respostas rápidas no WhatsApp Business. Veja opções na Biblioteca de Ferramentas.

## Cuidado

Automação mal configurada pode enviar mensagens erradas para muitas pessoas. Teste com você mesmo antes e mantenha um humano revisando o que é importante.`,
            exercise:
              "Mapeie três tarefas repetitivas da sua rotina e descreva como cada uma poderia ser automatizada.",
          },
        ],
      },
      {
        title: "Serviços com IA",
        lessons: [
          {
            title: "Criação de páginas e protótipos",
            duration: 10,
            content: `## Do texto ao protótipo

Algumas ferramentas criam páginas e interfaces a partir de descrições. Isso permite mostrar uma ideia ao cliente rapidamente, antes de construir a versão final.

## Bom uso

- Use protótipos para alinhar expectativas, não como produto final sem revisão.
- Revise acessibilidade, textos e responsividade.
- Explique ao cliente o que é protótipo e o que é entrega definitiva.`,
            exercise:
              "Crie a descrição detalhada de uma landing page e use uma ferramenta de IA ou no-code para gerar um protótipo. Registre o resultado em Projetos.",
          },
          {
            title: "Desenvolvimento de serviços com IA",
            duration: 12,
            content: `## Serviços possíveis

- Produção de conteúdo assistida por IA, com revisão humana.
- Organização de atendimento com respostas padronizadas.
- Criação de materiais comerciais.
- Implantação de automações simples para pequenos negócios.

## Como posicionar

Venda o **resultado e o processo**, não "uso de IA". O cliente quer economia de tempo, consistência e qualidade.

## Ética

Seja transparente sobre o uso de IA quando for relevante e nunca use para enganar o público do cliente.`,
            exercise:
              "Descreva um serviço com IA que você poderia oferecer: para quem, qual problema resolve e como seria o processo.",
          },
        ],
      },
    ],
  },
};

export const TRAIL_CLIENTES: SeedTrail = {
  slug: "primeiros-clientes",
  title: "Como conseguir os primeiros clientes",
  subtitle: "Portfólio, prospecção e proposta",
  description:
    "Escolha um serviço, monte portfólio, pesquise empresas, faça abordagens respeitosas, conduza conversas, elabore propostas e cuide do relacionamento.",
  level: "Intermediário",
  course: {
    slug: "primeiros-clientes",
    title: "Primeiros Clientes",
    summary: "Um processo comercial simples e respeitoso.",
    description:
      "Da escolha do serviço à retenção do cliente: um curso para quem quer transformar habilidade em trabalho remunerado com método e ética.",
    skills: ["Prospecção", "Negociação", "Propostas", "Atendimento"],
    premium: true,
    modules: [
      {
        title: "Preparação",
        lessons: [
          {
            title: "Escolhendo um serviço para vender",
            duration: 12,
            preview: true,
            content: `## Um serviço, um público

Comece com **um serviço** que você já consegue entregar com qualidade e **um tipo de cliente**. Isso facilita a comunicação, o portfólio e a prospecção.

## Perguntas para decidir

- Qual habilidade eu já pratiquei o suficiente?
- Que tipo de empresa tem esse problema e pode pagar para resolver?
- Eu consigo explicar o resultado do meu serviço em uma frase?

## Exemplo

"Crio landing pages para profissionais de saúde que querem receber agendamentos pelo WhatsApp."`,
            exercise: "Escreva sua frase de posicionamento no formato: \"Ajudo [quem] a [resultado] por meio de [serviço].\"",
          },
          {
            title: "Construindo portfólio sem clientes",
            duration: 12,
            preview: true,
            content: `## Caminhos honestos

- **Projetos demonstrativos** para negócios fictícios.
- **Redesenhos** de páginas ou criativos existentes, como exercício (sem dizer que foi contratado).
- **Trabalhos para conhecidos**, com autorização para mostrar.
- **Missões da NovaDigital**, que já geram entregas para o portfólio.

## Qualidade acima de quantidade

Três projetos bem apresentados valem mais que dez feitos às pressas. Para cada um, explique o objetivo, o processo e o resultado.`,
            exercise: "Liste três projetos que você vai criar para o seu portfólio nas próximas semanas e cadastre o primeiro em Projetos.",
          },
        ],
      },
      {
        title: "Prospecção",
        lessons: [
          {
            title: "Pesquisa de empresas",
            duration: 12,
            content: `## Onde encontrar

- Mapas e perfis de empresas no Google.
- Redes sociais (busca por localização e categoria).
- Associações comerciais e indicações.

## O que observar

- A empresa está ativa?
- Que problema visível ela tem na internet (sem site, perfil abandonado, anúncios fracos)?
- Quem é o responsável e qual o canal de contato oficial?

## Organize

Use uma planilha simples: nome, segmento, canal de contato, problema observado, data do contato e status.`,
            exercise: "Pesquise 10 empresas de um mesmo segmento e preencha a planilha com as colunas desta aula.",
          },
          {
            title: "Abordagem comercial sem spam",
            duration: 12,
            content: `## Princípios

- **Personalize:** mostre que você olhou para a empresa.
- **Seja breve:** poucas linhas.
- **Ofereça valor:** uma observação útil antes de oferecer serviço.
- **Use canais oficiais** e respeite quem não quiser conversar.

## Estrutura de mensagem

1. Quem você é, em uma frase.
2. O que você observou na empresa.
3. Uma sugestão concreta.
4. Uma pergunta aberta e sem pressão.

## O que evitar

Mensagens copiadas em massa, insistência após uma recusa, promessas de resultado e compra de listas de contatos.`,
            exercise: "Escreva uma mensagem de abordagem personalizada para uma das empresas da sua planilha seguindo a estrutura desta aula.",
          },
          {
            title: "Conduzindo a conversa",
            duration: 12,
            content: `## Pergunte mais, fale menos

Na primeira conversa, entenda o negócio:
- Como os clientes chegam hoje?
- O que já tentaram na internet?
- Qual é o objetivo para os próximos meses?
- Quem decide e qual o orçamento aproximado?

## Escute e resuma

Repita o que entendeu: "Então hoje a maior parte dos clientes vem por indicação, e vocês querem receber mais pedidos de orçamento pelo WhatsApp, certo?"

## Próximo passo claro

Termine sempre combinando o que acontece depois: envio de proposta, nova reunião ou um retorno em data definida.`,
            exercise: "Pratique uma conversa simulada com um colega ou com o Assistente IA e anote as respostas para as perguntas desta aula.",
          },
        ],
      },
      {
        title: "Proposta e relacionamento",
        lessons: [
          {
            title: "Proposta comercial e precificação inicial",
            duration: 14,
            content: `## Estrutura da proposta

1. Entendimento do problema (com as palavras do cliente).
2. Solução proposta.
3. Escopo: o que está e o que não está incluído.
4. Etapas e prazos.
5. Investimento e forma de pagamento.
6. Próximos passos.

## Precificação

Considere: horas estimadas, custos (ferramentas), sua experiência e o valor que o trabalho gera para o cliente. Pesquise faixas praticadas no seu mercado e seja consistente. No início, projetos com escopo fechado ajudam a controlar o tempo.

## Formalize

Combine por escrito, mesmo em projetos pequenos: escopo, prazos, revisões e pagamento.`,
            exercise: "Elabore uma proposta comercial completa para um cliente fictício usando a estrutura desta aula.",
          },
          {
            title: "Entrega, atendimento e retenção",
            duration: 12,
            content: `## Entrega

Cumpra prazos, comunique atrasos com antecedência e entregue com uma breve explicação do que foi feito.

## Atendimento

- Defina canais e horários de atendimento.
- Responda com cordialidade e objetividade.
- Registre pedidos e decisões.

## Retenção

Clientes satisfeitos indicam e voltam a contratar. Ao final do projeto, peça feedback, sugira próximos passos e pergunte se pode usar o trabalho no portfólio.`,
            exercise: "Crie um checklist de entrega e uma mensagem de encerramento de projeto pedindo feedback.",
          },
        ],
      },
    ],
  },
};
