-- RPCs de `engagements` — leitura e escrita só pelo runtime (ticket 046).
--
-- Diferente do padrão herdado do 031 (`handoffs_insert`): o segredo NÃO fica hardcoded no
-- corpo da função. Fica no Supabase Vault (extensão `supabase_vault` já habilitada no projeto,
-- nunca usada até aqui — ver ticket 002), lido em cada chamada via `vault.decrypted_secrets`.
-- Corrige um achado real: introspecção de função (`pg_get_functiondef`) reimprime segredo
-- gravado em texto no corpo — isso já vazou o `HANDOFF_INSERT_SECRET` duas vezes, três
-- rotações de emergência no total (handover 2026-09-12). Era pendência explícita pro dia em
-- que o esquema fosse mexido de novo — é agora.
--
-- O valor do segredo (`engagement_secret`) é inserido no Vault fora desta migration, nunca em
-- texto versionado — ver `## Resolução` do ticket 046 pra como foi feito.
--
-- Chamadas por HTTPS puro via /rest/v1/rpc/<nome>, com a publishable key (pública por design,
-- a mesma que a plataforma já expõe no navegador — não é segredo).

create or replace function public.check_engagement_secret(p_secret text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = 'engagement_secret';

  if v_secret is null then
    raise exception 'engagement_secret não configurado no Vault' using errcode = '28000';
  end if;

  if p_secret is null or p_secret <> v_secret then
    raise exception 'forbidden' using errcode = '28000';
  end if;
end;
$$;

-- ─── Escrita: upsert por turno ─────────────────────────────────────────────────
-- Chamada depois de CADA turno (mensagem do cliente e resposta da Manu) — é o que sustenta
-- "sobrevive a um restart sem perder a conversa em andamento" (046). Um atendimento aberto por
-- jid (índice único parcial da migration anterior): chamar de novo pro mesmo jid ATUALIZA a
-- linha aberta; se a última tiver sido encerrada, o índice não bate no conflito e INSERE uma
-- linha nova — a distinção "abre atendimento novo" mora no índice, não nesta função.
create or replace function public.engagements_upsert(
  p_secret text,
  p_contact_jid text,
  p_status text,
  p_history jsonb,
  p_contact_phone text default null,
  p_contact_name text default null,
  p_handoff_id uuid default null
)
returns table (id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  perform public.check_engagement_secret(p_secret);

  return query
  insert into engagements (contact_jid, contact_phone, contact_name, status, history, handoff_id)
  values (p_contact_jid, p_contact_phone, p_contact_name, p_status::engagement_status, p_history, p_handoff_id)
  on conflict (contact_jid) where status <> 'encerrado'
  do update set
    contact_phone = coalesce(excluded.contact_phone, engagements.contact_phone),
    contact_name  = coalesce(excluded.contact_name, engagements.contact_name),
    status        = excluded.status,
    history       = excluded.history,
    handoff_id    = coalesce(excluded.handoff_id, engagements.handoff_id),
    closed_at     = case when excluded.status = 'encerrado' then now() else engagements.closed_at end,
    updated_at    = now()
  returning engagements.id, engagements.created_at;
end;
$$;

-- ─── Leitura: reidratar o Map em memória depois de um restart ─────────────────
-- Só os atendimentos abertos (status <> 'encerrado') — é só isso que o runtime precisa
-- recarregar no boot pra não perder conversa em andamento. Devolve tudo que uma linha aberta
-- tem, pra virar o objeto `st` de novo em memória.
create or replace function public.engagements_list_open(p_secret text)
returns table (
  id uuid,
  contact_jid text,
  contact_phone text,
  contact_name text,
  status text,
  handoff_id uuid,
  history jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  perform public.check_engagement_secret(p_secret);

  return query
  select e.id, e.contact_jid, e.contact_phone, e.contact_name, e.status::text, e.handoff_id, e.history, e.created_at, e.updated_at
  from engagements e
  where e.status <> 'encerrado';
end;
$$;

-- PostgREST expõe RPC pra qualquer papel com EXECUTE — grant explícito em vez de confiar no
-- default de PUBLIC (mais fácil de auditar depois).
grant execute on function public.check_engagement_secret(text) to anon, authenticated;
grant execute on function public.engagements_upsert(text, text, text, jsonb, text, text, uuid) to anon, authenticated;
grant execute on function public.engagements_list_open(text) to anon, authenticated;
