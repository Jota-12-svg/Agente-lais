-- Dados de teste para exercitar a plataforma ANTES de o runtime do agente existir
-- (ticket 037 — "testada com linhas semeadas à mão"). `supabase db reset` aplica isto.
--
-- NADA aqui é dado real de cliente. Telefones e nomes são fictícios.

-- ─── Allow-list — PLACEHOLDER ────────────────────────────────────────────────
-- Trocar pelos e-mails @gmail.com reais das 3 consultoras + a dona antes do rollout
-- (pergunta pendente com o dono — ver ticket 020). Enquanto forem placeholder,
-- ninguém loga de verdade.
insert into advisor_allowlist (email, name) values
  ('placeholder.pamella@gmail.com',  'PAMELLA'),
  ('placeholder.gabriela@gmail.com', 'GABRIELA'),
  ('placeholder.joslaine@gmail.com', 'JOSLAINE'),
  ('placeholder.lais@gmail.com',     'Laís (dona)')
on conflict (email) do nothing;

-- ─── Chamados semeados ──────────────────────────────────────────────────────
-- Cobrem modos e gatilhos diferentes, com tempos de espera variados.
insert into handoffs
  (contact_phone, contact_name, summary, desired_timeframe, budget,
   engagement_mode, is_returning_client, owner_advisor, "trigger", status, created_at)
values
  ('+55 69 99161-0001', 'Marina Alves',
   'Quer 2 vasos grandes de chão para a sala de estar',
   'ainda este mês', 'até R$ 4.000',
   'consumer', false, null, 'qualified', 'pending', now() - interval '4 minutes'),

  ('+55 69 99161-0002', 'Escritório TRAMA Arquitetura',
   'Mandou planilha com 18 itens para um apartamento em Porto Velho',
   'orçamento em 1 semana', null,
   'architect', false, 'GABRIELA', 'architect', 'pending', now() - interval '23 minutes'),

  ('+55 69 99161-0003', 'Rafael Siqueira',
   'Perguntou o preço de uma mesa de jantar de 8 lugares e quer negociar',
   'sem pressa', 'R$ 8.000 a R$ 12.000',
   'consumer', false, null, 'price_negotiation', 'assumed', now() - interval '1 hour 5 minutes'),

  ('+55 69 99161-0004', 'Carla Menezes',
   'Quer ir à loja no sábado ver luminárias pessoalmente',
   'sábado', null,
   'consumer', false, null, 'purchase_intent', 'pending', now() - interval '11 minutes');

-- O chamado do Rafael já foi assumido pela GABRIELA há ~55 min.
update handoffs
   set assumed_by = 'placeholder.gabriela@gmail.com',
       assumed_at = now() - interval '55 minutes'
 where contact_phone = '+55 69 99161-0003';
