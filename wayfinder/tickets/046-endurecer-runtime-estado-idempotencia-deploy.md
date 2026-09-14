---
id: "046"
title: Endurecer o runtime do agente — estado persistido, idempotência e deploy automático
labels: [wayfinder:task]
status: in-progress
assignee: sessão-grilling-046
blocked-by: []
---

> **Aberto em 2026-09-14, ao fechar o [044](044-construir-runtime-do-agente.md).** O 044 foi
> fechado adotando o runtime provisório (`agente-runtime/`) como v1 — validado ao vivo em
> produção (WhatsApp → Gemini → fila → `/health`). Três entregas do desenho original do 044
> **não** foram feitas e foram deliberadamente adiadas para cá, sem bloquear aquele
> fechamento. Ver `## Resolução` do 044 para o porquê de cada uma ter ficado de fora.

## Question

O runtime provisório funciona, mas carrega três dívidas técnicas conhecidas, registradas desde
que ele nasceu (cabeçalho de `agente-runtime/index.js` e `package.json`):

1. **Estado de conversa em memória (`Map`), não persistido.** Um restart do processo (deploy,
   crash, `railway restart`) no meio de uma qualificação apaga o histórico da conversa e
   qualquer vínculo com um chamado escalado (`handoffId`) — o cliente que estava sendo
   qualificado volta como se nunca tivesse conversado.
2. **Sem idempotência na escalada.** Se a mensagem de gatilho for reprocessada (retry de rede,
   reconexão do Baileys reentregando histórico), o mesmo atendimento pode gerar dois chamados
   na fila.
3. **Deploy manual via `railway up`** (CLI, do computador de quem estiver na sessão), não
   push-to-deploy via GitHub — a decisão do [042](042-stack-e-hospedagem-do-runtime.md) previa
   o segundo (rollback de um clique, deploy não depende de quem está na sessão ter o CLI
   configurado).

### O que decidir / construir

**Item 1 é o que tem peso de decisão, não só execução** — exige fechar uma névoa que
`map.md` ainda lista em "Not yet specified": o **esquema de `engagements`** (a memória da
conversa no Supabase). Antes de codificar, decidir com grilling (ou ao menos registrar a
decisão explicitamente, seguindo o padrão do projeto):

- Granularidade: uma linha por conversa em andamento (upsert a cada turno) ou um log de
  eventos? Este projeto já tem precedente de "log, não estado mutável" no `terminal_state`/
  `business_outcome` do [013](013-sinal-de-sucesso-do-aprendizado.md) — vale considerar o
  mesmo espírito aqui.
- Relação com `handoffs` (035): `engagements` é a memória interna do agente (todo
  atendimento, inclusive os que esfriam, decisão do [010](010-o-que-e-um-lead-qualificado.md));
  `handoffs` é só a fila que a consultora vê. Ligados por `engagement_id`, já nomeado no
  `CONTEXT.md` — confirmar o campo existe e como se popula.
- O que persistir por turno: histórico de mensagens (texto + referência a anexo de áudio, não
  o áudio bruto — decidir se guarda o base64 ou descarta depois de mandar pro Gemini), status
  (`qualificando`/`escalado`/`com_consultora`), `handoffId` quando houver.
- RLS: `engagements` carrega dado real de cliente — mesmo cuidado do 045 com `handoffs` (não
  abrir para a chave anônima da plataforma; o runtime escreve com que credencial?).

**Item 2** (idempotência) não depende do item 1 — pode ser resolvido antes ou em paralelo:
alguma chave de deduplicação na escalada (id da mensagem de gatilho? já existe `handoffId` por
conversa em memória, só falta checar antes de escrever de novo).

**Item 3** (deploy) é o mais contido — apontar o serviço Railway `agente-runtime` para este
repositório (push-to-deploy), mesmo padrão que a plataforma das consultoras provavelmente já
usa (confirmar).

**Consequência natural, não obrigatória neste ticket:** com o estado persistido, a detecção de
"devolver ao agente"/"fechar chamado" (045) pode trocar o poll de 5s por reação direta
(trigger/Realtime na escrita de `handoffs`) — o próprio 044 já registrava isso como o caminho
certo assim que este ticket existisse. Vale fazer junto se o esforço for pequeno, mas não é
critério de fechamento.

## Depende de

- Nada bloqueante para começar o grilling do esquema. A implementação em si só faz sentido
  depois da decisão de esquema (item 1) estar registrada.

## Fora do escopo deste ticket

- Trocar o adapter de auth do Baileys (disco + Volume do Railway) por Supabase — o 044 aceitou
  a solução via Volume como equivalente funcional, não como pendência.
- Watchdog SMS/Telegram — ainda escopo do [038](038-estrategia-de-rollout.md).

**Resolvido quando** o runtime sobreviver a um restart no meio de uma qualificação sem perder o
histórico da conversa nem o vínculo com um chamado escalado, uma escalada reprocessada não gerar
chamado duplicado na fila, e um push no repositório disparar deploy do serviço `agente-runtime`
no Railway sem comando manual.

---

## Item 1 — esquema de `engagements` (grilling 2026-09-14)

Grilling com o dono, 2 rodadas, 8 perguntas. Decisões:

1. **Escopo mínimo** — só o operacional pra sobreviver a restart, sem os campos de
   qualificação estruturada (modo/orçamento/prazo — a extração ainda não existe, gate item 8
   do [038](038-estrategia-de-rollout.md)) nem a taxonomia fina do
   [013](013-sinal-de-sucesso-do-aprendizado.md) (`terminal_state`/`conversation_sentiment`/
   `sale_link`). Fica pra quando esse ticket precisar de fato.
2. **Histórico como JSONB** na própria linha (tradução direta do `st.history` em memória),
   não tabela relacional separada.
3. **Áudio: base64 descartado** depois de mandar pro Gemini — guarda só `mimeType` no
   histórico persistido, não o conteúdo. Evita passivo de LGPD novo enquanto aquela névoa não
   fecha (map.md).
4. **Uma linha por atendimento, várias linhas por contato ao longo do tempo** — confirma o que
   o `CONTEXT.md` já pressupõe ("um mesmo contato tem vários atendimentos"). Implementado via
   índice único parcial (`contact_jid` só entre as linhas `status <> 'encerrado'`), sem lógica
   de aplicação extra: a próxima mensagem depois de um atendimento encerrado insere linha nova
   porque o índice não bate mais no conflito.
5. **`status` ganha um 4º valor, `'encerrado'`** (além dos 3 que já existiam em memória:
   `qualificando`/`escalado`/`com_consultora`), com `closed_at` marcando quando virou isso.
   Sem taxonomia fina — é só o suficiente pra saber que a linha é histórico.
6. **Segredo próprio (`ENGAGEMENT_SECRET`)**, não reaproveita o `HANDOFF_INSERT_SECRET` — a
   superfície de escrita é bem maior (todo turno, não só a escalada). **De quebra, corrigido
   um risco documentado desde 2026-09-12** (handover 09-12 e 09-14, pendência explícita "mover
   pra vault quando o 046 mexer no esquema de novo"): o segredo não fica mais hardcoded no
   corpo da função SQL (`pg_get_functiondef` reimprimia em texto — já causou duas rotações de
   emergência do `HANDOFF_INSERT_SECRET`). Agora vive no **Supabase Vault**
   (`vault.decrypted_secrets`), extensão que já estava habilitada e nunca usada (ticket 002).
7. **`engagements` não é lida pela plataforma das consultoras** — RLS habilitada, zero
   policies pra `authenticated`/`anon`. A consultora vê a conversa pelo próprio WhatsApp
   (coexistência); a plataforma "não é a memória interna do agente" (`CONTEXT.md`). Leitura e
   escrita só via RPC `security definer`.
8. **Correção de premissa**: este ticket (linha 46, versão original) presumia que
   `engagement_id` já estava "nomeado no CONTEXT.md" — não estava; só existe na migration SQL
   de `handoffs` e nos tickets. `handoffs.engagement_id` ganhou a FK que faltava
   (`handoffs_engagement_id_fkey`) nesta mesma leva de migrations.

### Implementado (código, não aplicado em produção ainda)

- `advisor-platform/supabase/migrations/20260914120000_engagements.sql` — enum
  `engagement_status`, tabela `engagements`, índices (inclusive o parcial do item 4), RLS
  habilitada sem policies, FK nova em `handoffs.engagement_id`.
- `advisor-platform/supabase/migrations/20260914120100_engagements_rpc.sql` — `check_engagement_secret`
  (lê do Vault), `engagements_upsert` (grava por turno, `on conflict` no índice parcial),
  `engagements_list_open` (reidrata no boot), grants explícitos.
- `agente-runtime/engagement-writer.mjs` — módulo novo, espelha `handoff-writer.mjs`.
- `agente-runtime/index.js` — `persistirEngajamento()` chamado depois de cada turno e de cada
  mudança de status vinda do poll de `handoffs` devolvidos/fechados/reassumidos;
  `rehidratarEngajamentos()` chamado uma vez no boot (trava contra reconexão de socket
  chamando `start()` de novo sem reiniciar o processo).
- `.env.example` — `ENGAGEMENT_SECRET` documentado.

### Pendente — precisa de ação humana, não é código

Duas barreiras deliberadas impediram terminar sozinho (não contornadas de propósito — ver
handover do dia pro porquê): o guard de isolamento de worktree recusa qualquer comando com
conteúdo dinâmico (substituição, `source`, script), e o próprio histórico do projeto trata
`supabase db push` em produção como exigindo autorização explícita do dono (tentativa de
contornar via Management API já foi bloqueada de propósito antes, ver handover 2026-09-11).

1. **Aplicar as duas migrations em produção** — `supabase db push --workdir advisor-platform`
   (pede `SUPABASE_DB_PASSWORD`) ou colar o SQL dos dois arquivos direto no SQL Editor do
   painel Supabase.
2. **Criar o segredo no Vault**: `select vault.create_secret('<valor aleatório gerado agora>',
   'engagement_secret', 'RPCs engagements_upsert/engagements_list_open — ticket 046');` — rodar
   uma vez, direto no SQL Editor (nunca versionar o valor).
3. **Setar `ENGAGEMENT_SECRET`** (mesmo valor do passo 2) na variável de ambiente do serviço
   Railway `agente-runtime` — mesmo padrão do `HANDOFF_INSERT_SECRET`.
4. **Deploy do `agente-runtime`** (`railway up ./agente-runtime --path-as-root --service
   agente-runtime -c`) — só depois dos passos 1–3, senão o runtime sobe sem conseguir
   persistir (cai no fallback "config ausente", loga aviso, funciona só em memória como antes).
5. **Validar ao vivo**: mandar mensagem de teste, `railway restart` no meio da qualificação,
   confirmar que a conversa retoma sem perder contexto (é o critério de "resolvido" do item 1).

Itens 2 (idempotência) e 3 (deploy automático) deste ticket **não foram tocados** — seguem
como próxima fatia, sem bloqueio do item 1.
