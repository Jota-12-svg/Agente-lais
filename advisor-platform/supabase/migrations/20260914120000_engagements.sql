-- Memória interna do agente — um atendimento por linha (ticket 046, addendum ao 010/013).
--
-- Decisão de escopo (grilling do 046, 2026-09-14): só campos OPERACIONAIS, o bastante pra
-- sobreviver a um restart sem perder a conversa em andamento. SEM os campos de qualificação
-- estruturada (modo/orçamento/prazo) — a extração ainda não existe (gate item 8 do 038) — e
-- SEM a taxonomia fina de desfecho do 013 (terminal_state/conversation_sentiment/sale_link) —
-- fica pra quando esse ticket precisar de fato. `status = 'encerrado'` é só o bastante pra
-- saber que a linha é histórico, não estado vivo.
--
-- `engagements` é a memória do agente (todo atendimento, inclusive os que esfriam/erram —
-- CONTEXT.md, comentário em `handoffs.sql`); `handoffs` é só a fila que a consultora vê. Join
-- por `engagement_id`, coluna que já existia em `handoffs` (nullable, sem FK) esperando esta
-- tabela nascer — a FK entra no fim deste arquivo.

-- ─── Enum ─────────────────────────────────────────────────────────────────────
-- Espelha o `status` que já existe em memória no runtime hoje (agente-runtime/index.js,
-- `estadoDe`) + 'encerrado', que não existia em memória (o runtime só apagava a conversa do
-- Map — `conversas.delete(jid)`) e agora marca a linha como histórico em vez de sumir de
-- verdade.
create type engagement_status as enum ('qualificando', 'escalado', 'com_consultora', 'encerrado');

-- ─── Tabela ───────────────────────────────────────────────────────────────────
create table engagements (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  closed_at     timestamptz,                     -- setado quando status vira 'encerrado'

  contact_jid   text not null,                   -- jid completo do WhatsApp — chave de correlação
  contact_phone text,                             -- best-effort (telefoneResolvido, @lid nem sempre resolve)
  contact_name  text,

  status        engagement_status not null default 'qualificando',
  handoff_id    uuid references handoffs (id),   -- setado ao escalar; fecha o join que handoffs.engagement_id previa

  -- Histórico de turnos, formato interno do runtime ({role: 'client'|'agent', text,
  -- attachments}) — NÃO o formato `contents` da API do Gemini (isso é montado na hora da
  -- chamada, em askManu). Áudio nunca persiste aqui: o base64 é descartado depois de mandar
  -- pro Gemini (decisão do grilling 046 — sem necessidade técnica clara e sem a LGPD do
  -- projeto resolvida ainda, ver map.md "Not yet specified").
  history       jsonb not null default '[]'::jsonb
);

comment on table engagements is
  'Memória interna do agente — um atendimento (do primeiro "oi" até fechar/esfriar) por linha. Distinta de handoffs (só o relance pra fila). Ticket 046.';

-- ─── Índices ──────────────────────────────────────────────────────────────────
-- Só um atendimento ABERTO por contato: garante "abre linha nova quando a anterior encerra"
-- (CONTEXT.md — "um mesmo contato tem vários atendimentos ao longo do tempo") sem lógica de
-- aplicação extra. `status <> 'encerrado'` é o predicado — linhas encerradas saem do conflito,
-- então a próxima mensagem do mesmo jid, depois de fechado, insere uma linha nova em vez de
-- colidir. Usado como alvo de `on conflict` em `engagements_upsert` (próxima migration).
create unique index engagements_open_per_jid_idx on engagements (contact_jid) where status <> 'encerrado';

-- Histórico por contato, mais recente primeiro (uso futuro do laço de aprendizado — nada
-- consulta isso ainda).
create index engagements_contact_jid_idx on engagements (contact_jid, created_at desc);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
-- Carrega a conversa inteira de um cliente — dado sensível de verdade, mais que `handoffs`
-- (que só tem o relance). Decisão do grilling 046: NENHUMA policy pra `authenticated`/`anon` —
-- a plataforma das consultoras não lê isso (CONTEXT.md: a plataforma "não é a memória interna
-- do agente"; a consultora vê a conversa pelo próprio WhatsApp, coexistência). Leitura e
-- escrita só via RPC security definer, gateada por segredo — ver a migration seguinte.
alter table engagements enable row level security;

-- ─── FK que `handoffs` já esperava ────────────────────────────────────────────
-- `handoffs.engagement_id` nasceu nullable e sem FK (comentário original: "nullable até
-- engagements existir" — handoffs.sql linha 37). Agora existe.
alter table handoffs
  add constraint handoffs_engagement_id_fkey
  foreign key (engagement_id) references engagements (id);
