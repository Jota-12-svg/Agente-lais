-- Freio de mão global — ticket 036. Ponto de integração decidido no 042: o runtime lê esta
-- flag via Realtime (não polling), efeito precisa ser imediato em todas as conversas.
--
-- Linha única (singleton, id fixo em 1). As consultoras e o dono ligam/desligam pela
-- plataforma (RLS abaixo); quem lê pra valer, hoje, é só a tela (KillSwitch.svelte) — o
-- runtime ainda não existe (ticket 044). Quando existir, ele assina esta tabela do mesmo jeito.

create table agent_settings (
  id           smallint primary key default 1 check (id = 1),  -- trava de singleton
  agent_enabled boolean not null default true,
  toggled_by   text,          -- e-mail de quem acionou por último (allow-list)
  toggled_at   timestamptz not null default now()
);

comment on table agent_settings is
  'Configuração global do agente. Hoje só o freio de mão (agent_enabled). Ticket 036.';

insert into agent_settings (id) values (1);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
-- Mesma regra de acesso das outras telas da plataforma (037): qualquer advisor da
-- allow-list lê e atualiza. Sem INSERT/DELETE via API — é sempre a mesma linha (id=1).
alter table agent_settings enable row level security;

create policy "advisors read agent_settings"
  on agent_settings for select
  to authenticated
  using (public.is_allowed_advisor());

create policy "advisors update agent_settings"
  on agent_settings for update
  to authenticated
  using (public.is_allowed_advisor())
  with check (public.is_allowed_advisor());

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Efeito precisa ser imediato (036) — a tela e, mais tarde, o runtime assinam via Realtime.
alter publication supabase_realtime add table agent_settings;
