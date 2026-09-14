---
id: "035"
title: Plataforma central das consultoras — substrato da fila e desfecho
labels: [wayfinder:grilling]
status: closed
assignee: sessão 2026-09-02 (grilling com o dono do projeto)
blocked-by: []
---

> **Numeração:** nasceu como "033" numa sessão paralela (2026-09-02, madrugada) que não viu
> outra sessão abrir o [033](033-manual-do-agente-para-as-consultoras.md) (manual do agente)
> quase ao mesmo tempo. Renumerado para **035** ao reconciliar — 034 já está reservado pelo
> 033 para a redação do manual. O conteúdo é o mesmo desde a criação.
>
> **Consolidação (reconciliação de 2026-09-02):** o fechamento do ticket
> [013](013-sinal-de-sucesso-do-aprendizado.md), numa terceira branch paralela, tinha aberto
> um ticket `033-superficie-das-consultoras-para-o-agente` para a mesma superfície (onde a
> consultora recebe o chamado, julga o atendimento com o `advisor_verdict` e assume a
> conversa). Como é o mesmo assunto que este ticket, foi **consolidado aqui** — este 035 é o
> ticket único da superfície das consultoras. Todas as referências do 013 apontam para cá.

## Question

**Decisão do dono do projeto (2026-09-02):** a fila de chamados **não fica mais numa aba da
planilha compartilhada**. No lugar, uma **plataforma própria, simples**, onde tudo que a
consultora precisa para pegar um chamado do agente fica centralizado e fácil de acessar. O
pedido é explícito: **simples o bastante para não consumir o projeto, funcional o bastante
para valer a pena**.

Isso reabre o substrato — não o comportamento — de decisões já fechadas (ver "Impacto em
outros tickets" abaixo).

### O que esta decisão já fixa

- **A fila sai da planilha.** Passa a viver numa tabela do **Supabase** (já no stack:
  Postgres + Auth + Realtime, plano free), exposta por uma tela web pequena.
- **Escopo do v1 (resposta do dono):** **fila de chamados + marcação de desfecho**. A tela
  lista os chamados pendentes, a consultora **assume** e **fecha** um chamado, e registra o
  **desfecho** (venda / visita agendada / sem sucesso — taxonomia a fechar, ver ponto 5).
  Espelhar a conversa dentro da plataforma **fica fora do v1**.
- **O comportamento do [012](012-quando-e-como-o-agente-escala.md) continua intacto:** o
  agente **produz fila, não roteia**; o chamado entra com o nome da dona anexado quando
  houver, **sem trava** — qualquer consultora pega; o aviso à consultora **não pode ser
  WhatsApp ativo** (restrição dura, 016/026).
- **O relance continua sendo o relance do [010](010-o-que-e-um-lead-qualificado.md)**
  (telefone, nome, o que quer, para quando, orçamento, novo/cliente, horário, gatilho),
  nunca a conversa inteira — essa fica no WhatsApp.

### O que este ticket decide (grilling com o dono)

1. **Canal de aviso.** O que tira a consultora do "não sei que a fila mudou" sem ela ficar
   com a tela aberta o tempo todo: **bot de Telegram**, **e-mail**, **web push (PWA)**, ou
   outro. Na prática **reabre a pergunta do research [029](029-canal-de-notificacao-da-fila.md)**
   num contexto novo (a fila não está mais na planilha, então Apps Script varrendo planilha
   não se aplica). A restrição de 029 continua: nada de mensagem ativa no WhatsApp de
   produção. Pergunta a levar junto (herdada do 029 e do [020](020-perguntas-para-as-consultoras.md)):
   **o celular de cada consultora avisa quando chega e-mail/mensagem no expediente?** — não
   só "elas checam".
2. **Login das consultoras.** **Magic link por e-mail** (Supabase Auth), **login com
   Google** (elas já têm `@gmail`), ou **senha compartilhada**. Trade-off central: LGPD e
   saber quem assumiu o quê (usuário identificado) × montar rápido (senha única).
3. **Stack e hospedagem.** Recomendação a confirmar: Supabase (backend + auth + realtime) +
   uma SPA pequena hospedada em tier free (Vercel/Netlify/Cloudflare Pages). Decidir
   framework e onde hospeda, mantendo "simples" como critério.
4. **Esquema da tabela de chamados.** Campos do relance do 010 + `status`
   (`pendente` / `assumido` / `fechado`) + `assumido_por` + `desfecho` + timestamps.
   Fechar a lista exata e os nomes (inglês, conforme `CLAUDE.md`).
5. **Taxonomia de desfecho do v1 e como ela conversa com o [013](013-sinal-de-sucesso-do-aprendizado.md).**
   O 013 **está fechado** e já decidiu os sinais: `terminal_state`
   (`escalado` / `resolvido_sem_escalada` / `esfriado` / `fora_de_escopo`), `business_outcome`
   (`virou_venda` / `virou_visita` / `sem_venda` / `perdido`) quando escala, e o
   `advisor_verdict` da consultora (`agente_mandou_bem` / `agente_atrapalhou` + nota livre) —
   este último é **o sinal de maior peso do aprendizado**. Este ticket decide **onde a
   consultora clica** para registrar `business_outcome` + `advisor_verdict` ao fechar um
   chamado, com o atrito quase zero que o 013 pede. **Não relitigar a taxonomia — ela é
   decisão fechada do 013;** aqui é só a superfície.
6. **Substituição × coexistência.** A plataforma substitui a aba da fila por completo desde o
   dia 1, ou há um período em que as duas convivem? (A fila nunca existiu na planilha ainda —
   ver nota do 004 —, então provavelmente é substituição limpa, mas confirmar.)
7. **O que a consultora faz na tela.** Assumir, fechar, marcar desfecho, ver os dados do
   chamado — e **precisa poder corrigir** um dado que o agente extraiu errado antes de
   assumir? Definir o mínimo.

### Impacto em outros tickets

- **[013](013-sinal-de-sucesso-do-aprendizado.md)** (fechado, grilling) — decidiu os sinais
  (`terminal_state`, `business_outcome`, `advisor_verdict`) e que a captura do `advisor_verdict`
  é "manual, um canal só, atrito quase zero". Este ticket é esse canal. O 013 deixou explícito
  que *onde e como* a consultora registra é trabalho deste ticket; a taxonomia não se relitiga
  aqui.
- **[029](029-canal-de-notificacao-da-fila.md)** (fechado, research) — o **enunciado**
  (canal de aviso sem WhatsApp ativo) continua válido e é retomado aqui; a **conclusão**
  (e-mail via Apps Script varrendo a planilha) **cai** com a fila saindo da planilha. Ao
  fechar o 035, anotar isso na linha do 029 no `map.md`, como se fez com o 005↔016.
- **[030](030-implementar-notificacao-da-fila.md)** (aberto, task) — **obsoleto na forma
  atual** (Apps Script vinculado ao Google Sheet). Vira `blocked-by: ["035"]`; ao fechar o
  035, ou é reescrito para o canal escolhido ou é fechado como substituído.
- **[031](031-implementar-escrita-do-chamado-na-fila.md)** (aberto, task) — **continua
  válido em intenção** (o agente escreve o chamado quando escala), mas o alvo muda de
  **Sheets API v4** para **Supabase**, o que elimina a conta de serviço + delegação de
  domínio e simplifica bastante. Vira `blocked-by: ["035"]` (esquema e stack) e segue
  dependendo da arquitetura do runtime para o ponto de integração no código.
- **[033](033-manual-do-agente-para-as-consultoras.md)** (aberto, grilling) — o item 3/4 do
  manual descreve "o que aparece na aba de chamados e como a consultora responde". Quando
  este ticket fechar, esse trecho passa a descrever a plataforma, não a planilha. Não
  bloqueia o grilling do 033, mas a redação (034) deve esperar as duas decisões.

### Relação com a névoa do mapa

Cobre a **primeira fatia** da névoa **"Superfície para as consultoras"**: ver a fila,
assumir um chamado, marcar o desfecho. Ver e **corrigir a conversa** do agente dentro da
plataforma, e o fluxo de "assumir uma conversa em andamento", ficam para depois do v1.

**Resolvido quando** estiverem decididos: canal de aviso, login, stack/hospedagem e esquema
da tabela — mais como a consultora registra `business_outcome` + `advisor_verdict` na tela
(a taxonomia em si já é decisão fechada do 013) — e estiver registrado o que fazer com
029/030/031. A construção da plataforma em si é o passo seguinte (deste ticket ou de um que
ele abrir).

---

## Resolução

Fechado por grilling com o dono do projeto — 4 rodadas, 2026-09-02.

### A decisão em uma frase

Uma **plataforma web única** — a plataforma das consultoras — sobre o Supabase que a loja
já tem, onde a consultora **vê a fila de chamados do agente, assume um chamado, fecha e
registra o desfecho + o veredito sobre o atendimento do agente** (`advisor_verdict` do 013).
Notificação por e-mail. Nada de app separado para gerir.

### 1. A superfície e a stack

- **Um web app, uma tela**, mobile-first. **Constraint dura:** fácil e intuitiva para quem
  não mexe com tecnologia — é critério de aceite do build, não um "seria bom".
- **Vite + framework leve** (Svelte ou React — decisão do build). **Sem backend de
  aplicação:** o app fala direto com o Supabase pela *publishable key* + RLS.
- **Supabase** (projeto que a loja já tem, plano free) entrega tudo: Postgres (a tabela
  `handoffs`), Auth (login Google), Realtime (a fila atualiza sozinha sem refresh), Edge
  Functions + Database Webhooks (o disparo da notificação).
- **Hospedagem:** estática — Cloudflare Pages (free) recomendado; Railway (o dono já tem
  plano pago) é alternativa aceitável. Railway também é candidato natural a hospedar o
  runtime do agente depois.
- O dono tem Supabase + Railway pago; **nenhuma conta nova** é necessária para o v1.

### 2. Login

**Login com Google** (Supabase Auth, provider Google). As três consultoras + a dona já usam
`@gmail.com` (levantamento 1 do 020) e ficam logadas no navegador — é um clique. `assumed_by`
sai de graça e com nome real, o que serve à atribuição e à LGPD. Uma **allow-list de 4
e-mails** controla quem entra; qualquer outro login é recusado.

Descartados: *magic link* (checar e-mail a cada sessão é atrito) e *senha compartilhada*
(perde "quem assumiu" e o RLS por pessoa).

### 3. O que a consultora faz na tela (escopo do v1)

1. **Ver a fila** — lista dos chamados abertos, cada um com o relance do
   [010](010-o-que-e-um-lead-qualificado.md) (telefone, nome, o que quer, para quando,
   orçamento, novo/cliente, gatilho) e **há quanto tempo espera**. A fila fica **clean**:
   mostra só o que está aberto (`pending` + `assumed`).
2. **Assumir** — carimba `assumed_by` + hora e move para `assumed`. **Trava suave, não
   dura:** mostra "GABRIELA pegou às 14h03" para as outras não pegarem junto, mas qualquer
   uma pode reabrir. O rodízio continua sendo delas, não do agente (comportamento do 012
   intacto).
3. **Fechar** — formulário curto: `business_outcome` (venda / visita / sem venda / perdido)
   + `advisor_verdict` (agente mandou bem / atrapalhou / pular) + nota livre opcional. **Ao
   fechar, o chamado é salvo no Supabase e some da fila** — a tela nunca fica carregada de
   chamado já resolvido. Um "histórico" read-only dos últimos fechados é opcional no v1.
4. **Corrigir dado que o agente extraiu errado:** **fora do v1.** Ela tem a conversa inteira
   no WhatsApp; corrigir a memória do agente é assunto do laço de aprendizado, não desta
   tela.

A **dona vê a mesma tela** que as consultoras no v1 — sem visão admin separada.

### 4. Notificação — "a fila mudou"

**E-mail, e só e-mail no v1.** Disparo: **Database Webhook** do Supabase no `INSERT` da
tabela `handoffs` → **Edge Function** → e-mail (Resend, free tier) para os **4** (3
consultoras + dona). Isso **substitui inteiramente** o desenho do 029 (Apps Script varrendo
planilha): a fila não está mais na planilha, e o webhook do Supabase dispara para qualquer
insert, inclusive o do agente via *service role* — o problema que o 029 contornava
desaparece.

SMS foi cogitado e cortado pelo dono em favor de simplicidade. É uma **adição de ~15 linhas
na mesma Edge Function** se o e-mail se provar fraco — o desenho não precisa mudar para
isso.

**Risco registrado, não resolvido:** a proeminência do e-mail no celular das consultoras
durante o expediente **nunca foi confirmada** (lacuna do 029). Com e-mail-só, essa pergunta
vira carga. Duas mitigações: (a) a marca de "não lida" no WhatsApp (item 5); (b) a pergunta
foi para o [020](020-perguntas-para-as-consultoras.md) (pergunta 34) e precisa de resposta
antes ou durante o rollout.

### 5. Sinal secundário — agente marca a conversa como "não lida" no WhatsApp

Ao escalar, o agente marca a conversa como **não lida** no WhatsApp
(`chatModify({ markRead: false }, jid)` via Baileys). O estado sincroniza para os aparelhos
das consultoras pelo *app-state sync* do WhatsApp multi-dispositivo. Elas vivem no WhatsApp o
dia todo — um chat não lido ali é mais visível que um e-mail.

- **Não é o sistema de registro** — é uma conveniência efêmera. Se qualquer consultora abre
  o chat, some. A fila na plataforma é a fonte da verdade.
- Marcar lido/não-lido é *app-state* passivo, não mensageria — não deve somar risco de
  banimento, mas isso e a sincronização para companions **precisam ser validados no
  [027](027-testar-self-hosted-no-numero-atual.md)** (item 6, adicionado lá) antes de
  confiar. Há a ressalva histórica do WhatsApp para Windows (019, em pausa) de que sync
  desktop nem sempre é confiável.
- Entra no escopo do [031](031-implementar-escrita-do-chamado-na-fila.md): ao escalar, o
  agente faz `INSERT` em `handoffs` **e** `chatModify markRead:false`.

### 6. Esquema da tabela `handoffs`

`handoffs` guarda **só o chamado escalado** — não é a memória interna do agente (essa é a
tabela `engagements`, que segue como névoa do mapa). Nomes em inglês (`CLAUDE.md`).

| Campo | Tipo | Quem escreve | Notas |
|---|---|---|---|
| `id` | uuid pk | — | |
| `engagement_id` | uuid, nullable | agente | join com a memória do agente para o laço de aprendizado; nullable até `engagements` existir |
| `created_at` | timestamptz | agente | "horário de entrada" — prioridade da fila |
| `contact_phone` | text | agente | como a consultora acha o chat no WhatsApp |
| `contact_name` | text, nullable | agente | nome confirmado, se coletado |
| `summary` | text | agente | o que a pessoa quer — uma linha |
| `desired_timeframe` | text, nullable | agente | para quando |
| `budget` | text, nullable | agente | faixa, se veio à tona |
| `engagement_mode` | enum `consumer` / `architect` | agente | modo do atendimento (CONTEXT.md) |
| `is_returning_client` | bool, default false | agente | quase sempre false na fase 1 (addendum do 010) |
| `owner_advisor` | text, nullable | agente | dona anexada, se houver — **sem trava** |
| `trigger` | enum | agente | `purchase_intent` / `architect` / `human_requested` / `irritation` / `price_negotiation` / `qualified` (gatilhos do 012) |
| `status` | enum `pending` / `assumed` / `closed`, default `pending` | plataforma | a fila mostra só `pending` + `assumed` |
| `assumed_by` | text, nullable | plataforma | e-mail/nome da consultora (Google auth) |
| `assumed_at` | timestamptz, nullable | plataforma | |
| `closed_by` | text, nullable | plataforma | |
| `closed_at` | timestamptz, nullable | plataforma | fecha → sai da fila; base da purga LGPD |
| `business_outcome` | enum, nullable | plataforma | `sale` / `store_visit` / `no_sale` / `lost` (taxonomia do 013) |
| `advisor_verdict` | enum, nullable | plataforma | `agent_did_well` / `agent_hindered`; null = pulou |
| `advisor_verdict_note` | text, nullable | plataforma | |

**RLS:** os 4 advisors autenticados **leem e atualizam** todas as linhas; **`INSERT` é só do
agente** (*service role*, server-side — [031](031-implementar-escrita-do-chamado-na-fila.md)),
nunca das consultoras; **ninguém deleta** (arquiva por `status`, purga depois pela decisão de
LGPD). `business_outcome` e `advisor_verdict` gravados aqui são a **fonte da verdade** desses
sinais; o laço de aprendizado os lê pelo join `engagement_id`.

### 7. Substituição, LGPD, sequência

- **Substituição limpa** da "aba de fila": ela nunca chegou a existir na planilha (nota do
  004). Sem período de convivência, sem migração. A planilha compartilhada continua sendo só
  o diretório de arquitetos / carteira (leitura do agente no 1º contato).
- **LGPD:** a tabela guarda dado pessoal (telefone, nome, o que a pessoa quer). Protegida por
  **RLS** no Supabase; o login identificado (item 2) já ajuda. O v1 **não** constrói
  consentimento nem retenção — `closed_at` deixa a purga trivial de adicionar quando a
  decisão de LGPD (névoa do mapa) vier. A plataforma entra sob essa névoa junto com o store
  interno do agente.
- **Sequência:** design e esquema fechados **agora**. A **construção espera o runtime do
  agente** — não há o que enfileirar sem agente produzindo chamado, e não faz sentido manter
  código de plataforma órfão. O esquema fechado aqui destrava o
  [031](031-implementar-escrita-do-chamado-na-fila.md) no papel.

### Impacto em outros tickets

- **[029](029-canal-de-notificacao-da-fila.md)** (fechado, research) — enunciado (avisar sem
  WhatsApp ativo) continua; **conclusão cai inteira** (Apps Script varrendo planilha). Nota
  na linha do 029 no `map.md`, como se fez com 005↔016.
- **[030](030-implementar-notificacao-da-fila.md)** — **fechado como absorvido pelo 037.** O
  Apps Script vinculado ao Google Sheet não existe mais como caminho.
- **[031](031-implementar-escrita-do-chamado-na-fila.md)** — **atualizado.** Alvo muda de
  Sheets API v4 → `INSERT` no Supabase (some conta de serviço + delegação de domínio); +
  `chatModify markRead:false` no mesmo ponto. `blocked-by: ["035"]` + runtime.
- **[037](037-construir-plataforma-consultoras-v1.md)** — **aberto.** Constrói a plataforma
  v1: web app + Edge Function de notificação + migração `handoffs` + RLS. `blocked-by:
  ["035"]`.
- **[027](027-testar-self-hosted-no-numero-atual.md)** — **item 6 adicionado:**
  `markRead:false` sincroniza para os companions? conta como risco de banimento?
- **[020](020-perguntas-para-as-consultoras.md)** — **pergunta 34 adicionada:** o celular
  avisa quando chega e-mail no expediente?
- **[033](033-manual-do-agente-para-as-consultoras.md)** — quando o 037 entregar, o manual
  descreve a plataforma (não a planilha) e ganha o passo de "abrir/favoritar o link e ler a
  fila". A redação (034) espera o 037.
- **Névoa do mapa** — "Superfície para as consultoras": a fatia v1 (ver fila, assumir,
  fechar, veredito) **sai da névoa**; ver/corrigir a conversa dentro da plataforma continua.
  "Modelo de dados no Supabase": `handoffs` fica **definido**; `engagements` (memória do
  agente) continua névoa.

### Vocabulário — entra no `CONTEXT.md`

- **Chamado** (`handoff`) — o registro de uma **escalada** na fila da plataforma, com o
  relance para a consultora priorizar e assumir. Uma linha da tabela `handoffs`.
- **Plataforma das consultoras** (`advisor_platform`) — a tela web única onde a consultora
  vê a fila de chamados, assume, fecha e registra desfecho + `advisor_verdict`. Sobre o
  Supabase; não é a planilha compartilhada nem a memória interna do agente.
