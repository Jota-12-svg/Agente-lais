-- "Reportar problema" — canal de aviso de erro do piloto (addendum 2026-09-14 ao ticket 038).
--
-- Standalone, não amarrado a um chamado (o erro pode acontecer antes de o agente escalar, ou
-- nem estar ligado a uma conversa específica) — decisão original do 038. O addendum de hoje
-- muda só o consumo: em vez de só notificação por e-mail (Resend, mesmo caminho nunca
-- implantado do `notify-handoff`, ver ticket 037), a plataforma ganha uma tela de histórico
-- completo, visível só pro admin — o dono pediu explicitamente essa forma.

-- ─── Quem é admin ────────────────────────────────────────────────────────────
-- `advisor_allowlist` ganha uma distinção que não existia: até aqui, todo mundo na allow-list
-- era só "consultora com acesso" (nenhuma linha de código ou RLS diferenciava a dona/o dono do
-- projeto das consultoras). Só o admin lê `problem_reports` — as outras continuam só inserindo.
alter table advisor_allowlist add column is_admin boolean not null default false;

update advisor_allowlist set is_admin = true where email = 'joaovictormarchi76@gmail.com';

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from advisor_allowlist
    where email = lower(auth.jwt() ->> 'email') and is_admin
  );
$$;

-- ─── Tabela ───────────────────────────────────────────────────────────────────
create table problem_reports (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  reported_by        text not null,   -- e-mail da consultora; nome resolvido via advisor_allowlist na tela
  contact_reference  text,            -- telefone/nome do cliente, texto livre — opcional (038 §"Canal de aviso de erro")
  description        text not null
);

comment on table problem_reports is
  'Canal "reportar problema" do piloto — qualquer consultora registra, só o admin lê. Log imutável. Ticket 038, addendum 2026-09-14.';

create index problem_reports_created_at_idx on problem_reports (created_at desc);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table problem_reports enable row level security;

create policy "advisors insert problem reports"
  on problem_reports for insert
  to authenticated
  with check (public.is_allowed_advisor());

create policy "admin reads problem reports"
  on problem_reports for select
  to authenticated
  using (public.is_admin());

-- Sem policy de UPDATE/DELETE: é log, imutável (mesmo espírito de handoffs fechados — arquiva,
-- não edita).

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- A tela do admin atualiza sozinha quando uma consultora reporta, sem precisar de refresh.
alter publication supabase_realtime add table problem_reports;
