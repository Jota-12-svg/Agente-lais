-- Políticas RLS da plataforma das consultoras (ticket 037 §1).
--
-- Regra da resolução do 035 §6:
--   - os advisors autenticados da allow-list LEEM e ATUALIZAM todas as linhas;
--   - INSERT em `handoffs` é só do agente (server-side, ticket 031) — nunca do navegador;
--   - ninguém DELETA (arquiva por `status`; purga futura pela decisão de LGPD).
--
-- Nota (037): a resolução do 035 diz "INSERT via service role". O `CLAUDE.md` §4 e o `.env`
-- vetam a secret key (`sb_secret_...`) neste projeto. Aqui só se define QUE não há política de
-- INSERT para `authenticated`/`anon`; COMO o agente insere (papel dedicado × service role) é
-- decisão do ticket 031 e está sinalizada no handover para o dono resolver.

alter table handoffs         enable row level security;
alter table advisor_allowlist enable row level security;

-- ─── Quem é uma consultora autorizada ─────────────────────────────────────────
-- E-mail do JWT presente na allow-list. `stable`: cacheado dentro da query.
create or replace function public.is_allowed_advisor()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from advisor_allowlist
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

-- ─── advisor_allowlist ────────────────────────────────────────────────────────
-- Legível por qualquer autenticado (são 4 nomes, não é dado sensível) — e assim a
-- função acima não entra em recursão de política. Escrita: nenhuma via API (só o
-- dono, direto no banco / painel).
create policy "authenticated reads allowlist"
  on advisor_allowlist for select
  to authenticated
  using (true);

-- ─── handoffs ─────────────────────────────────────────────────────────────────
create policy "advisors read handoffs"
  on handoffs for select
  to authenticated
  using (public.is_allowed_advisor());

create policy "advisors update handoffs"
  on handoffs for update
  to authenticated
  using (public.is_allowed_advisor())
  with check (public.is_allowed_advisor());

-- Sem política de INSERT e sem política de DELETE para `authenticated`/`anon`:
-- PostgREST recusa as duas operações a partir do navegador. INSERT chega só por
-- um papel que ignora RLS (service role / superusuário na migração) ou por um
-- papel dedicado com GRANT explícito — ver ticket 031.
