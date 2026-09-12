-- Ticket 045 (devolver chamado ao agente) + achado do dia 2026-09-12 (telefone mostrando
-- "LID:..." em vez de número real quando o contato usa endereçamento @lid do WhatsApp).
--
-- Duas mudanças, mesmo commit porque nascem do mesmo pedido do dono:
--
-- 1. Novo status `returned_to_agent` no ciclo de vida do chamado (012 addendum, 045 §Decisões
--    do grilling — decisão final: sem restrição, a consultora decide na hora). Estado próprio
--    em vez de reaproveitar `pending` (mesmo motivo já registrado no 045: `pending` hoje
--    significa "qualquer consultora pode pegar", conflaria com "voltou pro agente").
alter type handoff_status add value 'returned_to_agent';

-- Colunas de auditoria simétricas às de assumed_by/assumed_at e closed_by/closed_at.
alter table handoffs add column returned_by text;
alter table handoffs add column returned_at timestamptz;

-- 2. `contact_jid`: o jid bruto do WhatsApp (ex. "5541999999999@s.whatsapp.net" ou
--    "966485139573@lid"), gravado pelo runtime ao escalar — separado de `contact_phone`
--    (telefone LEGÍVEL PRA HUMANO, que passa a tentar resolver o número real mesmo para
--    contatos @lid, best-effort, ver agente-runtime/index.js).
--
-- Por quê precisa dos dois: `contact_phone` pode não ser mais reconstituível de volta pro
-- jid depois que virar número real (perde o "LID:" que hoje marca a origem) — e o runtime
-- precisa de um jid exato, não um número humano, pra saber a qual conversa do WhatsApp um
-- chamado corresponde (correlação usada tanto por "devolver ao agente" quanto por "fechar
-- chamado reinicia o atendimento na próxima mensagem", os dois pedidos de 2026-09-12).
-- Nullable: chamados antigos não têm; a UI nunca mostra esta coluna, é uso interno do runtime.
alter table handoffs add column contact_jid text;

comment on column handoffs.contact_jid is
  'Jid bruto do WhatsApp (@s.whatsapp.net ou @lid) — uso interno do runtime pra correlacionar o chamado com a conversa. Não é pra exibir na UI (ver contact_phone).';
