-- Rastro das próprias mensagens da Manu — ticket 047 (achado real em produção, 2026-09-14: a
-- Manu respondeu um cliente que uma consultora já estava atendendo, porque o processo não
-- estava conectado no instante em que ela mandou a mensagem pelo WhatsApp e o sinal `fromMe`
-- se perdeu pra sempre).
--
-- O Baileys reenvia histórico recente numa (re)conexão (evento `messaging-history.set`) — é
-- daí que o runtime vai recuperar sinais `fromMe` perdidos. O problema: uma mensagem `fromMe`
-- histórica pode ser da PRÓPRIA Manu (não conta como handoff) ou de uma consultora humana
-- (conta) — as duas chegam idênticas no evento cru. Esta tabela existe só pra essa
-- desambiguação: guarda o id de toda mensagem que a Manu manda, no momento do envio
-- (`agente-runtime/index.js`, logo após `sock.sendMessage`), pra sobreviver a um restart.
--
-- Sem isso, a decisão do 047 de "qualquer `fromMe` histórico vira com_consultora" arriscaria
-- nunca deixar a Manu recomeçar depois de cair no meio de uma conversa dela mesma, ou reabrir
-- um atendimento que ela já tinha fechado por engano.
--
-- Mesmo padrão de segredo do `engagements` (047, grilling): reaproveita o `engagement_secret`
-- já no Vault — não é um segredo novo, é a mesma fronteira de confiança (runtime → Supabase).

create table agent_sent_messages (
  message_id  text primary key,
  contact_jid text not null,
  sent_at     timestamptz not null default now()
);

comment on table agent_sent_messages is
  'IDs das mensagens que a própria Manu enviou — só pra diferenciar, no histórico reenviado numa reconexão, "fromMe da Manu" de "fromMe humano". Ticket 047. Linhas com mais de 3 dias não têm mais uso (janela de 012/013) e são limpas de forma oportunista pelo próprio RPC de escrita.';

-- Índice pela janela de tempo — é como a limpeza oportunista encontra as linhas vencidas sem
-- varrer a tabela inteira.
create index agent_sent_messages_sent_at_idx on agent_sent_messages (sent_at);

-- RLS ligada, sem nenhuma policy pra `authenticated`/`anon` — mesmo motivo do `engagements`:
-- só o runtime mexe aqui, via RPC security definer gateado por segredo.
alter table agent_sent_messages enable row level security;

-- ─── Escrita: registrar uma mensagem enviada pela Manu ────────────────────────
-- Chamada uma vez por mensagem que a Manu manda. `on conflict do nothing` porque o mesmo
-- envio nunca deveria repetir o id, mas um retry de rede no lado do runtime não pode virar
-- erro aqui. Limpeza oportunista das linhas com mais de 3 dias a cada chamada — sem cron
-- próprio no projeto, é o jeito mais simples de não deixar a tabela crescer sem limite.
create or replace function public.agent_sent_messages_insert(
  p_secret text,
  p_message_id text,
  p_contact_jid text
)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  perform public.check_engagement_secret(p_secret);

  insert into agent_sent_messages (message_id, contact_jid)
  values (p_message_id, p_contact_jid)
  on conflict (message_id) do nothing;

  delete from agent_sent_messages where sent_at < now() - interval '3 days';
end;
$$;

-- ─── Leitura: quais desses ids são da própria Manu ────────────────────────────
-- Chamada no backfill de reconexão (047): o runtime junta os ids `fromMe` do histórico
-- reenviado e pergunta quais já são conhecidos como dela. Qualquer id que NÃO vier nesta
-- lista, dentro da janela de 3 dias, é `fromMe` humano — vira `com_consultora`.
create or replace function public.agent_sent_messages_known(
  p_secret text,
  p_message_ids text[]
)
returns text[]
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_result text[];
begin
  perform public.check_engagement_secret(p_secret);

  select coalesce(array_agg(message_id), '{}')
  into v_result
  from agent_sent_messages
  where message_id = any(p_message_ids);

  return v_result;
end;
$$;

grant execute on function public.agent_sent_messages_insert(text, text, text) to anon, authenticated;
grant execute on function public.agent_sent_messages_known(text, text[]) to anon, authenticated;
