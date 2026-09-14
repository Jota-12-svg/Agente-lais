-- "Reportar problema" ganha o rótulo de prioridade que o 037 já previa como requisito (trazido
-- pelo 011, registrado no cabeçalho do próprio ticket 037): erro em que o agente afirma preço
-- ou disponibilidade de produto — a restrição dura nº 1 do CLAUDE.md — é mais urgente que
-- qualquer outro tipo de problema reportado, dentro do mesmo canal. Não é campo/canal novo, é
-- um rótulo — ficou de fora da primeira leva (20260914130000_problem_reports.sql) e é
-- adicionado agora, ao fechar o 038.

alter table problem_reports
  add column product_claim boolean not null default false;

comment on column problem_reports.product_claim is
  'Marca se o erro envolve o agente ter afirmado preço ou disponibilidade de um produto (restrição dura nº 1 do CLAUDE.md) — mais urgente que os demais tipos de problema reportado. Requisito do 037 (via 011), aplicado ao fechar o 038.';
