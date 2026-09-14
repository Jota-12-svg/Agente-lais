---
id: "037"
title: Construir a plataforma das consultoras — v1
labels: [wayfinder:task]
status: closed
assignee: claude-sonnet-5
blocked-by: ["035"]
---

> **Aberto pelo [035](035-plataforma-central-das-consultoras.md)** (2026-09-02), que fechou
> o desenho: superfície única, stack, login, esquema `handoffs`, canal de aviso. Este ticket
> **constrói** o v1. Absorve o [030](030-implementar-notificacao-da-fila.md) (fechado como
> substituído — o disparo da notificação virou parte deste ticket).
>
> **Requisito trazido pelo [011](011-o-que-o-agente-pode-dizer-sobre-produto.md)** (fechado
> 2026-09-11): quando a peça "reportar problema" do [038](038-estrategia-de-rollout.md) for
> incorporada a este build, ela precisa distinguir **prioridade** — erro de afirmação de
> produto/disponibilidade é mais urgente que outros tipos de erro, dentro do mesmo canal
> (não é campo/canal novo, é um rótulo). Registrar junto do incremento que o 038 já previu
> aqui quando ele fechar.
>
> **038 fechou em 2026-09-14** — o incremento "reportar problema" + tela admin-only foi
> incorporado (migration `problem_reports`, `ReportProblem.svelte`/`ProblemHistory.svelte`,
> Edge Function `notify-admin`). O rótulo de prioridade **exigido acima tinha ficado de fora**
> da primeira leva — achado e corrigido antes do 038 fechar (`product_claim` na tabela, ver
> `## Resolução` do 038). SMS **não** entrou (decisão do 038: sem fornecedor contratado,
> e-mail cobre o caso). `notify-admin` segue não implantada de verdade (mesmo estado do
> `notify-handoff` desde este ticket — falta conta Resend); não reabre este ticket, que já
> estava fechado desde 2026-09-11.

## Question

Construir a plataforma das consultoras conforme a resolução do 035, sem relitigar as
decisões que ele fechou. Três peças:

### 1. Migração `handoffs` + RLS

- Tabela `handoffs` com o esquema exato da resolução do 035 (§6). Enums: `engagement_mode`,
  `trigger`, `status`, `business_outcome`, `advisor_verdict`.
- **RLS:** os 4 advisors autenticados (allow-list) leem e atualizam todas as linhas; `INSERT`
  só via *service role* (o agente, [031](031-implementar-escrita-do-chamado-na-fila.md));
  nenhum `DELETE`.
- Allow-list dos 4 e-mails `@gmail.com` (3 consultoras + dona) — em tabela, não hard-coded.
- Índice para a fila (`status`, `created_at`).

### 2. Web app — uma tela

- **Vite + framework leve** (Svelte ou React — decidir aqui, com "simples" como critério).
  Mobile-first. **Critério de aceite: fácil e intuitiva para quem não mexe com tecnologia** —
  sem jargão, poucos toques, estado sempre claro.
- **Login Google** via Supabase Auth; recusa quem não está na allow-list.
- **Fila** (`status` em `pending` / `assumed`), ao vivo via Supabase Realtime, ordenada por
  tempo de espera. Cada card: relance do [010](010-o-que-e-um-lead-qualificado.md) + há
  quanto tempo espera + gatilho.
- **Assumir**: escreve `assumed_by` + `assumed_at`, muda `status` para `assumed`, mostra
  "FULANA pegou às HHhMM". Trava suave — qualquer uma reabre.
- **Fechar**: formulário curto — `business_outcome` (venda / visita / sem venda / perdido) +
  `advisor_verdict` (mandou bem / atrapalhou / pular) + nota livre. Grava, muda `status` para
  `closed`, **some da fila**.
- Histórico read-only dos últimos ~50 fechados: opcional no v1.
- Hospedagem estática: Cloudflare Pages (free) ou Railway.

### 3. Notificação por e-mail

- **Database Webhook** no `INSERT` de `handoffs` → **Edge Function** (Deno) → e-mail via
  Resend para os 4.
- Conteúdo: o relance + link direto para a plataforma. Sem reproduzir a conversa.
- Deduplicação: um e-mail por chamado (o webhook dispara uma vez no insert; garantir
  idempotência se a função reexecutar).
- Credenciais (Resend, Supabase service role) no `.env` — nomes no `.env.example`.

## Fora do escopo do v1

- SMS (adição de ~15 linhas na mesma Edge Function, se o e-mail se provar fraco — 035 §4).
- Ver/corrigir a conversa do agente dentro da plataforma.
- Visão admin separada para a dona.
- Retenção/purga automática (espera a decisão de LGPD — névoa do mapa).

## Depende de

- **035** — esquema e desenho (bloqueia).
- **Runtime do agente** (névoa do mapa) — o `INSERT` do agente ([031](031-implementar-escrita-do-chamado-na-fila.md))
  mora no runtime. A plataforma pode ser construída e testada com linhas semeadas à mão antes
  do runtime existir, mas só entra em uso real quando o agente produzir chamados.
- Os **e-mails reais** das 4 pessoas e a confirmação de que o celular delas avisa quando
  chega e-mail no expediente (pergunta 34 do [020](020-perguntas-para-as-consultoras.md)).

**Resolvido quando** a plataforma estiver no ar, uma consultora conseguir logar, ver um
chamado (semeado ou real), assumir, fechar com desfecho + veredito, e o e-mail de aviso
chegar — tudo testado de ponta a ponta.

## Resolução

**Construído, implantado e testado de ponta a ponta em 2026-09-11.** Código já existia pronto
na branch `feat/plataforma-consultoras` (PR #4, sessão de 2026-09-02) — o trabalho de hoje foi
rodar o deploy de verdade, corrigir o que quebrou no caminho, e validar.

- **Hospedagem: Railway, não Cloudflare Pages.** Mudança de decisão do dono — já tinha Railway
  disponível (o mesmo usado no harness do [027](027-testar-self-hosted-no-numero-atual.md)) e
  não queria depender de domínio próprio. A SPA (Vite + Svelte 5) é servida por um processo Node
  mínimo (`serve`) a partir de `advisor-platform/web`. URL pública:
  **https://plataforma-consultoras-production.up.railway.app** — sem domínio customizado, só o
  subdomínio que o Railway gera.
- **Migração aplicada no Supabase de produção** (`handoffs`, `advisor_allowlist`, RLS, índices,
  Realtime) via `supabase db push`. Achado no caminho: o histórico de migração do projeto tinha
  3 entradas órfãs de 02/08 (resíduo do projeto anterior, sobrevivente à limpeza do
  [002](002-limpar-o-projeto-supabase.md) porque `DROP SCHEMA`/`DROP ROLE` não tocam a tabela
  de bookkeeping `supabase_migrations.schema_migrations`) — confirmado com uma query que não
  havia tabela nenhuma por trás delas, e corrigido com `supabase migration repair --status
  reverted`, sem alterar dado nenhum.
- **Bug real corrigido:** `supabase/config.toml` tinha a chave `skip_nonce_check` duplicada em
  `[auth.external.google]` (`true` numa linha, `false` do boilerplate do CLI logo abaixo) — TOML
  não aceita chave repetida, e isso quebrava `supabase link`/`db push` por inteiro. Mantido só o
  valor seguro (`false`); a plataforma roda em produção, não localmente, então não precisa do
  ajuste que a linha `true` fazia para teste local.
- **Allow-list: 3 dos 4 e-mails reais gravados** — Joslaine e Gabriela confirmadas; **Pamella
  (e-mail pessoal dela, Outlook) e a Lais ainda faltam.** A Pamella usa Outlook, e o Google
  recusou ela como usuária de teste do OAuth porque o endereço não tem Conta do Google ativa
  vinculada — ela precisa criar uma (pode ser com o próprio e-mail Outlook, não precisa de Gmail
  novo) antes de conseguir logar. O e-mail da Lais nunca chegou a ser passado nesta sessão.
- **Login Google configurado no mesmo projeto do Gemini** (`gen-lang-client-0815886762`), sem
  criar projeto novo — app OAuth em modo **Testing** (não published), porque só 4 pessoas vão
  logar para sempre e isso evita a revisão de verificação da Google. Client ID/secret gravados
  no `.env` (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`/`_SECRET`) e configurados no provider do
  Supabase Auth via Management API. `site_url` e `uri_allow_list` apontando pra URL do Railway.
- **Canal de notificação por e-mail (Resend) caiu do escopo do v1**, decisão do dono: as
  consultoras não checam e-mail no dia a dia — o sinal real que elas usam é o **verde de "não
  lida" no WhatsApp**, que é o item 6 do [027](027-testar-self-hosted-no-numero-atual.md), ainda
  não validado (depende do runtime existir). Para agora, a fila ao vivo na tela é o sinal. Isso
  também responde, de quebra, a pergunta 34 do [020](020-perguntas-para-as-consultoras.md) ("o
  celular delas avisa quando chega e-mail?") — não adianta, elas não usam. Nada do Resend foi
  implantado: sem conta criada, Edge Function `notify-handoff` não implantada, sem Database
  Webhook. O código da função continua no repo, para quando/se o canal voltar a fazer sentido.
- **Teste de ponta a ponta real, feito nesta sessão:** inserida uma linha de teste em
  `handoffs` via Management API, login Google completo (usando temporariamente o e-mail do dono
  na allow-list, removido depois do teste), card apareceu na fila com os dados certos, **Assumir**
  funcionou (`assumed_by`/`assumed_at` gravados, "você pegou às HHhMM" na tela), **Finalizar
  chamado** com o formulário de desfecho + veredito do [013](013-sinal-de-sucesso-do-aprendizado.md)
  funcionou, e o chamado **sumiu da fila** ao fechar — exatamente o comportamento que o
  [035](035-plataforma-central-das-consultoras.md) desenhou. Linha de teste apagada depois.
- **Freio de mão global (ticket 036) já tem protótipo visual** nesta build ("Agente no ar" /
  "Desligar o agente" no topo da tela) — commit anterior da sessão de 02/09. Não testado
  funcionalmente hoje (não há runtime lendo a flag ainda), mas a peça de UI existe.

**Addendum (mesmo dia, depois do teste):** o dono pediu acesso próprio, permanente — a
allow-list agora tem **5 e-mails**, não os 4 originais do 035/037 (3 consultoras + dona):
o e-mail do dono do projeto (João Victor) entrou como acesso de
dono/dev, além das 4 pessoas do negócio. Achado ao verificar: a Pamella (Outlook) **já estava**
na tabela `advisor_allowlist` desde a inserção original da sessão — a recusa dela é só na
lista de test users do OAuth do Google, que é uma trava separada e continua pendente.

**Pendências que não bloqueiam o fechamento deste ticket, mas ficam registradas:**

1. **A Pamella segue de fora** — confirmado de novo (mesma sessão): o Google recusa o
   e-mail Outlook dela como test user porque o endereço não tem Conta do Google, do
   Google Workspace ou do Cloud Identity associada. Não é algo resolvível por API/console —
   só a própria Pamella cria a conta (precisa confirmar um código no Outlook dela; ver
   `accounts.google.com/signup` → "Usar meu endereço de e-mail atual"). Assim que ela fizer
   isso, falta só adicioná-la de novo como test user.
   **Decisão do dono (2026-09-11): a Lais não entra na allow-list.** Não é mais pendência —
   a `advisor_allowlist` fica com 4 e-mails (Joslaine, Gabriela, Pamella, o dono do projeto),
   sem a dona; funcionalmente, hoje só 3 desses conseguem logar de verdade (a Pamella depende
   do item acima).
2. **Runtime do agente** (névoa do mapa) — sem ele, a plataforma roda só com dados de teste/
   semeados; o [031](031-implementar-escrita-do-chamado-na-fila.md) é quem vai fazer o `INSERT`
   real ao vivo.
3. Decisão de autenticação do 031 (papel Postgres dedicado × service role) segue em aberto —
   não avançada nesta sessão.
4. `advisor-platform/deploy-wizard.sh` ficou desatualizado (ainda descreve o fluxo Cloudflare
   Pages + Resend) — não corrigido nesta sessão, o deploy real de hoje não seguiu o script à
   risca. Revisar antes de usá-lo de novo.

Perde "037" do `blocked-by` do **034** (manual das consultoras) — que segue bloqueado só pelo
**036** (freio de mão global, ainda sem o lado do runtime) e pela estratégia de rollout
([038](038-estrategia-de-rollout.md)).
