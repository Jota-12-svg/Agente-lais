-- Fila de chamados da plataforma das consultoras.
-- Esquema fixado na resolução do ticket 035 (§6). Não relitigar aqui — ver 037.
--
-- `handoffs` guarda SÓ o chamado escalado (o relance para a consultora priorizar e
-- assumir), nunca a conversa inteira. Não é a memória interna do agente — essa é a
-- tabela `engagements`, que segue como névoa do mapa. Join por `engagement_id`.

-- ─── Enums ────────────────────────────────────────────────────────────────────
-- Modo do atendimento (CONTEXT.md). O agente classifica a conversa, não a pessoa.
create type engagement_mode as enum ('consumer', 'architect');

-- Gatilho da escalada (ticket 012). `qualified` = escalada por completude.
create type handoff_trigger as enum (
  'purchase_intent',
  'architect',
  'human_requested',
  'irritation',
  'price_negotiation',
  'qualified'
);

-- Ciclo de vida do chamado. A fila mostra só `pending` + `assumed`.
create type handoff_status as enum ('pending', 'assumed', 'closed');

-- Desfecho de negócio (taxonomia do ticket 013). Peso baixo na fase 1.
create type business_outcome as enum ('sale', 'store_visit', 'no_sale', 'lost');

-- Veredito da consultora sobre o atendimento do agente (ticket 013).
-- É o sinal de MAIOR peso do aprendizado. `null` = a consultora pulou.
create type advisor_verdict as enum ('agent_did_well', 'agent_hindered');

-- ─── Tabela ───────────────────────────────────────────────────────────────────
create table handoffs (
  id                   uuid primary key default gen_random_uuid(),

  -- Escrito pelo agente ao escalar (ticket 031).
  engagement_id        uuid,                       -- join com a memória do agente; nullable até `engagements` existir
  created_at           timestamptz not null default now(),  -- horário de entrada = prioridade da fila
  contact_phone        text not null,              -- como a consultora acha o chat no WhatsApp
  contact_name         text,                       -- nome confirmado, se coletado
  summary              text not null,              -- o que a pessoa quer, uma linha
  desired_timeframe    text,                       -- para quando
  budget               text,                       -- faixa, se veio à tona
  engagement_mode      engagement_mode not null,
  is_returning_client  boolean not null default false,  -- quase sempre false na fase 1 (addendum do 010)
  owner_advisor        text,                       -- dona anexada, se houver — SEM trava
  "trigger"            handoff_trigger not null,

  -- Escrito pela plataforma (a consultora, via web app).
  status               handoff_status not null default 'pending',
  assumed_by           text,                       -- e-mail da consultora (Google auth)
  assumed_at           timestamptz,
  closed_by            text,
  closed_at            timestamptz,                -- fecha → sai da fila; base da purga LGPD
  business_outcome     business_outcome,
  advisor_verdict      advisor_verdict,
  advisor_verdict_note text,

  -- Escrito pela Edge Function de notificação (idempotência — 037 parte 3).
  notified_at          timestamptz
);

comment on table handoffs is
  'Fila de chamados escalados que as consultoras enxergam. Distinta da memória do agente (engagements). Ticket 035/037.';

-- ─── Índice da fila ───────────────────────────────────────────────────────────
-- A tela lista `status in (pending, assumed)` ordenado por `created_at`.
create index handoffs_queue_idx on handoffs (status, created_at);

-- Idempotência da notificação: achar rápido os ainda não notificados.
create index handoffs_unnotified_idx on handoffs (created_at) where notified_at is null;

-- ─── Allow-list das consultoras ───────────────────────────────────────────────
-- Quem pode entrar na plataforma. Em tabela, não hard-coded (ticket 037 §1).
-- 3 consultoras + a dona. Só e-mails @gmail.com (levantamento 1 do ticket 020).
create table advisor_allowlist (
  email      text primary key,
  name       text not null,
  created_at timestamptz not null default now()
);

comment on table advisor_allowlist is
  'E-mails autorizados a logar na plataforma das consultoras. Editado só pelo dono, direto no banco.';

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- A fila atualiza sozinha na tela, sem refresh (ticket 035 §1).
alter publication supabase_realtime add table handoffs;
