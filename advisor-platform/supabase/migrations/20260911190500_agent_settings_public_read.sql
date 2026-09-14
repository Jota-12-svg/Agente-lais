-- Leitura pública de agent_settings — ticket 036/044 (runtime provisório).
--
-- A migração original (20260911180000) restringiu SELECT a advisors autenticados, correto
-- para a tela da plataforma, mas o runtime do agente não faz login Google — ele é um
-- processo de backend lendo a própria flag que o afeta. Sem esta policy, `select` com a
-- publishable key (anon) devolve 0 linhas (RLS bloqueia), e o freio de mão nunca chega a
-- ser lido pelo runtime (achado ao testar o runtime provisório em 2026-09-11).
--
-- Decisão: SELECT público (anon + authenticated) para agent_enabled é seguro — é um único
-- booleano não sensível, e UPDATE continua restrito a advisors da allow-list (policy
-- "advisors update agent_settings", inalterada). Não usa a secret key (vetada pelo
-- CLAUDE.md) — o modelo de acesso certo aqui é RLS mais permissivo pra leitura, não bypass.

create policy "anyone can read agent_settings"
  on agent_settings for select
  to anon, authenticated
  using (true);
