# NovaDigital

Plataforma para iniciantes aprenderem marketing digital **na prática**: trilhas de aprendizagem, Central de Missões, kit de ferramentas, plano individual de 30 dias, projetos e portfólio, e um assistente de IA — com modelo freemium e painel administrativo.

> A NovaDigital não promete renda nem resultados rápidos. O foco é ensinar habilidades reais e organizar a prática.

## Como rodar

Requisitos: **Node.js 20+**.

```bash
cp .env.example .env.local   # ajuste as variáveis
npm install
npm run dev                  # http://localhost:3000
```

Produção:

```bash
npm run build
npm start
```

Sem configuração de banco, o app usa o arquivo local `data/novadigital.db`. As tabelas e o conteúdo inicial (7 trilhas, 47 aulas, 13 missões e 37 ferramentas) são criados automaticamente na primeira execução.

### Administrador

Defina `ADMIN_EMAIL` antes de se cadastrar com esse e-mail, ou promova uma conta existente:

```bash
npm run make-admin -- voce@exemplo.com
```

### Assistente de IA

Defina `ANTHROPIC_API_KEY` no servidor. Sem a chave, o assistente e o feedback de missões aparecem como "não configurado" — nenhuma resposta é simulada. Opcionalmente ajuste `AI_MODEL` (padrão `claude-opus-5-5`) e `AI_EFFORT` (`low`, `medium`, `high`).

## Trilhas, IA e guias

| Trilha | Cursos | Especialista de IA |
|---|---|---|
| Afiliados | Marketing de Afiliados do Zero | Mentor de Afiliados |
| Dropshipping | Dropshipping na Prática | Mentor de Dropshipping |
| Criação de sites | Sites e Landing Pages Profissionais | Mentor de Sites |
| Criação de SaaS | Criação de SaaS do Zero | Mentor de SaaS |
| Outras formas de marketing digital | Fundamentos (gratuito), Tráfego Pago, Infoprodutos, Edição de Vídeos com IA, IA no Trabalho, Primeiros Clientes | Mentor de Marketing Digital |

- **Conteúdo:** `lib/seed/trail-*.ts` (aulas, exercícios, materiais), missões em `lib/seed/missions.ts`, ferramentas em `lib/seed/tools.ts`.
- **IA por trilha:** o foco de cada especialista fica em `assistant.focus` da trilha. Cada conversa guarda a trilha em que foi criada.
- **Guias em PDF:** textos em `content/guides/*.md`; gere os PDFs com `npm run build:guides` (precisa de um Chromium; informe `CHROMIUM_PATH` se necessário). O guia "Como funciona o marketing digital" é liberado para qualquer conta; os guias das trilhas seguem o acesso Premium.
- **Atualizar o conteúdo inicial:** ao mudar a estrutura em `lib/seed`, aumente `CONTENT_VERSION` em `lib/seed/index.ts`. Na próxima execução o banco é ressincronizado: o progresso em aulas e missões é zerado, contas, projetos, conversas e assinaturas são mantidos, e cada aluno é convidado a refazer o plano. Edições feitas pelo painel admin no conteúdo também são substituídas.

## Publicar na Vercel

A Vercel não tem disco permanente, então o banco fica no **Turso** (SQLite hospedado, com plano gratuito).

1. Em [vercel.com/new](https://vercel.com/new), importe este repositório. O framework (Next.js) é detectado sozinho.
2. Crie o banco: no projeto da Vercel, abra **Storage → Create Database → Turso** (ou crie em [turso.tech](https://turso.tech)). A integração adiciona `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` ao projeto. Se criar pelo site do Turso, copie esses dois valores para **Settings → Environment Variables**.
3. Adicione também em **Settings → Environment Variables**:
   - `ADMIN_EMAIL` — o e-mail que você vai usar para se cadastrar como administrador;
   - `ANTHROPIC_API_KEY` — para ativar o assistente de IA (opcional);
   - `APP_URL` — o endereço final do site, por exemplo `https://novadigital.vercel.app`.
4. Faça o deploy (ou **Redeploy** depois de adicionar as variáveis). No primeiro acesso, o app cria as tabelas e o conteúdo inicial no Turso.
5. Cadastre-se no site com o e-mail de `ADMIN_EMAIL` para entrar como administrador.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Banco Turso (obrigatório na Vercel) |
| `DATABASE_URL` | Alternativa local, ex.: `file:./data/outro.db` |
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic para o assistente |
| `AI_MODEL` / `AI_EFFORT` | Modelo e profundidade de raciocínio do assistente |
| `APP_URL` | URL pública, usada na verificação de origem da API |
| `ADMIN_EMAIL` | E-mail que recebe papel de administrador no cadastro |
| `KIWIFY_WEBHOOK_TOKEN` | Token do webhook da Kiwify (liberação automática do Premium) |
| `SUPPORT_EMAIL` | E-mail exibido na página de Suporte (opcional) |

## Páginas

| Rota | Página |
|---|---|
| `/` | Landing page |
| `/cadastro`, `/entrar` | Cadastro e login |
| `/onboarding` | Perguntas iniciais e geração do plano |
| `/painel` | Dashboard (jornada, plano da semana, próxima tarefa, cursos, projetos, habilidades, evolução) |
| `/cursos`, `/cursos/[slug]` | Catálogo e página do curso |
| `/aulas/[id]` | Player de aulas (vídeo opcional, conteúdo, exercício, materiais) |
| `/trilhas` | Trilhas de aprendizagem |
| `/missoes`, `/missoes/[slug]` | Central de Missões |
| `/ferramentas` | Biblioteca de ferramentas |
| `/assistente` | Assistente de IA |
| `/plano` | Plano individual de 30 dias |
| `/projetos`, `/projetos/[id]` | Projetos e portfólio |
| `/portfolio/[handle]` | Portfólio público (opcional, por usuário) |
| `/conta` | Perfil, conquistas, preferências e segurança |
| `/notificacoes`, `/suporte` | Notificações e chamados |
| `/planos` | Planos gratuito e Premium |
| `/admin/*` | Administração: cursos, aulas, missões, ferramentas, usuários, chamados, limites |

## Arquitetura

- **Next.js 15 (App Router) + React 19 + TypeScript**, Server Components e Server Actions.
- **SQLite/libSQL** via `@libsql/client`: arquivo local no desenvolvimento, Turso em produção (`lib/db.ts`, esquema em `lib/schema.ts`, conteúdo inicial em `lib/seed/`).
- **Autenticação própria**: senhas com scrypt, sessões com token aleatório (apenas o hash fica no banco), cookie `httpOnly`/`SameSite=Lax`, limite de tentativas de login.
- **Permissões no servidor**: toda ação e página verifica sessão, papel (`user`/`admin`) e plano (`lib/access.ts`). Conteúdo premium nunca é enviado ao navegador de quem não tem acesso.
- **Plano de 30 dias** gerado por regras a partir do onboarding (`lib/plan.ts`) — respeita horas, orçamento, área, objetivo e o plano de acesso.
- **Progresso e gamificação**: XP por aula, missão, projeto e tarefa (sem duplicidade), níveis, conquistas e notificações (`lib/progress.ts`).
- **IA** (`lib/ai.ts`, `app/api/assistente/route.ts`): SDK oficial da Anthropic, streaming, contexto do aluno e catálogo, limite diário configurável por plano, verificação de origem contra CSRF.
- **Visual**: tokens CSS com tema escuro (padrão) e claro, responsivo, baseado na identidade dos prints de referência.

### Pagamentos (Kiwify)

O acesso Premium é liberado automaticamente quando a Kiwify confirma o pagamento:

1. A Kiwify envia um webhook para `/api/pagamentos/kiwify`. O site confere a assinatura HMAC-SHA1 com o token (`KIWIFY_WEBHOOK_TOKEN`) e recusa avisos falsos.
2. O acesso fica vinculado ao **e-mail do comprador** (tabela `external_subscriptions`). Quem compra antes de criar conta recebe o Premium ao se cadastrar com o mesmo e-mail.
3. Renovação estende o acesso; cancelamento mantém até o fim do período pago; reembolso e chargeback removem na hora.

Configuração e registro dos eventos recebidos: **Admin → Pagamentos**. O administrador também pode conceder o Premium manualmente em **Admin → Usuários**.
