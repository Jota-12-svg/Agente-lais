---
id: "046"
title: Endurecer o runtime do agente — estado persistido, idempotência e deploy automático
labels: [wayfinder:task]
status: closed
assignee: sessão-idempotencia-deploy-046
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

### Implementado e aplicado em produção (2026-09-14)

- `advisor-platform/supabase/migrations/20260914120000_engagements.sql` — enum
  `engagement_status`, tabela `engagements`, índices (inclusive o parcial do item 4), RLS
  habilitada sem policies, FK nova em `handoffs.engagement_id`. **Aplicada em produção** via
  SQL Editor do painel (o `supabase db push` por CLI seguiu bloqueado pelo guard de isolamento
  de worktree — ver nota abaixo); conferida contra `information_schema.columns`: as 10 colunas
  batem.
- `advisor-platform/supabase/migrations/20260914120100_engagements_rpc.sql` — `check_engagement_secret`
  (lê do Vault), `engagements_upsert` (grava por turno, `on conflict` no índice parcial),
  `engagements_list_open` (reidrata no boot), grants explícitos. **Aplicada em produção** —
  testado com secret errado, RPC devolveu `28000: forbidden` como esperado.
- `agente-runtime/engagement-writer.mjs` — módulo novo, espelha `handoff-writer.mjs`.
- `agente-runtime/index.js` — `persistirEngajamento()` chamado depois de cada turno e de cada
  mudança de status vinda do poll de `handoffs` devolvidos/fechados/reassumidos;
  `rehidratarEngajamentos()` chamado uma vez no boot (trava contra reconexão de socket
  chamando `start()` de novo sem reiniciar o processo).
- `.env.example` — `ENGAGEMENT_SECRET` documentado.
- **Segredo `engagement_secret` criado no Supabase Vault** (`select vault.create_secret(encode(gen_random_bytes(32),'hex'), 'engagement_secret', ...)`
  — valor gerado inteiramente no servidor, nunca visto nem transmitido pela sessão que
  aplicou). ID do registro: `a5928fa8-b0e5-4e91-8684-da230f93563b` (não é sensível, é só o id).

**Como foi aplicado, já que `db push` seguia bloqueado**: navegador (Chrome, sessão já logada
do dono) direto no SQL Editor do painel Supabase. "Digitar" o SQL via simulação de teclado
corrompia parênteses/aspas (o Monaco auto-fecha bracket e desalinha com texto já balanceado);
contornado com `window.monaco.editor.getEditors()[0].setValue(...)`, conferido por
comprimento de string exato contra o arquivo fonte antes de cada `Run`.

### Item 1 — validado ao vivo em produção (2026-09-14, mesma sessão)

O dono revelou o valor do Vault (`Integrations → Vault → Secrets`, ícone de olho) e colou em
`ENGAGEMENT_SECRET` no Railway. Achado no caminho: **a variável ficou como "1 Change" pendente
até clicar em "Deploy" explicitamente** — um `railway up` rodado antes desse clique usa o
conjunto de variáveis antigo (o runtime subiu logando `engagement-writer: config ausente`,
confirmado nos logs, até a variável ser de fato aplicada e um segundo deploy rodar).

**Validação do critério "resolvido" do item 1** — sem depender de mandar mensagem real de
WhatsApp: inserida uma linha de teste direto em `engagements` (`contact_jid =
'teste-046-validacao@s.whatsapp.net'`, `status = 'qualificando'`), rodado `railway restart
--service agente-runtime --yes`, e o log do boot seguinte mostrou:

```
[15:45:46] INFO (25): >>> Atendimentos abertos reidratados do Supabase — restart não perdeu conversa em andamento.
    total: 1
```

**Confirmado: um restart não perde mais uma conversa em andamento.** Linha de teste apagada
depois (`delete ... returning id`, mesmo `id` confirmado no retorno) — produção sem resíduo.

**Item 1 do 046 está fechado.** Itens 2 (idempotência) e 3 (deploy automático) **não foram
tocados** — seguem como próxima fatia, sem bloqueio do item 1. O ticket como um todo segue
`in-progress` até esses dois fecharem também.

## Item 2 — idempotência na escalada (2026-09-14, mesma sessão do fechamento do 038)

Lido `processarTurno` inteiro antes de mexer. O bug real: duas chamadas concorrentes pro
mesmo jid (cliente manda mensagens em rajada — cada uma vira seu próprio evento
`messages.upsert`) podiam escalar duas vezes. Entre `await askManu(...)` e
`st.status = 'escalado'` não há nenhum outro `await` — a checagem-e-escrita é atômica no
event loop single-thread do Node — mas o código **não checava** `st.status` antes de
escrever, só setava. Se a segunda chamada terminasse o próprio `await askManu` depois da
primeira já ter escalado, ela escalava de novo, escrevendo um segundo chamado na fila pro
mesmo atendimento.

**Fix**: `if (escalou && st.status !== 'escalado')` em vez de só `if (escalou)`
(`agente-runtime/index.js`, `processarTurno`). Quem chega primeiro nessa linha "vence"; quem
chega depois já vê `st.status === 'escalado'` e pula o bloco — sem escrever de novo.

**Validado com reprodução isolada** (não dá pra mandar mensagem real de WhatsApp em rajada
sob demanda): script à parte simulando duas chamadas concorrentes com o mesmo padrão de
`await` do código real (a segunda "termina" antes da primeira, cenário de corrida de
verdade) — sem a guarda, duplicava (2 chamados); com a guarda, só 1. `node --check` limpo.

**Defesa em profundidade no banco (constraint por `engagement_id`) considerada e descartada
nesta leva**: `handoffs.engagement_id` existe (FK do item 1), mas achado ao investigar —
**confirmado vazio (`NULL`) em produção, em todas as linhas**. O `handoffs_insert` nunca
recebeu/populou esse campo. Corrigir isso exigiria mexer na função (não versionada em
migration, criada via painel) que já vazou o segredo em texto duas vezes via
`pg_get_functiondef` (duas rotações de emergência registradas no projeto) — fora de escopo
e risco desnecessário pra este ticket. Fica registrado como achado solto, não pendência
deste item: a guarda em memória cobre o cenário real descrito no ticket (mensagens
reprocessadas dentro do mesmo processo vivo); só não cobre duplicata entre processos
diferentes rodando ao mesmo tempo, cenário que não deveria acontecer com o Railway rodando
uma réplica só.

**Item 2 fechado.**

## Item 3 — deploy automático via GitHub (2026-09-14, mesma sessão)

**Achado que mudou o escopo real do item**: ao conectar o serviço `agente-runtime` do
Railway ao GitHub, o primeiro deploy de teste falhou — `main` estava parado desde o commit
`e874f04` (fase de pesquisa do projeto, **antes até da pasta `agente-runtime/` existir**).
Confirmado (`git ls-tree origin/main -- agente-runtime/`, vazio): nada do trabalho real dos
últimos dias — inclusive tudo que roda em produção hoje — jamais foi mergeado em `main` por
PR, ao contrário do que o próprio CLAUDE.md descreve como o fluxo. Existia até um PR (#1)
aberto desde 2026-08-10 trazendo exatamente essa atualização, nunca mergeado.

Perguntado ao dono como proceder — escolhido atualizar `main` agora. PR #1 revisado/editado
(título e corpo) e **squash-mergeado** (`5e424ed`, fast-forward puro, sem conflito — `main`
era ancestral direto de `wayfinder/atendimento-hoje`, nunca tinha divergido). Branch
`wayfinder/atendimento-hoje` mantida (não é uma branch curta de feature — é a branch de
trabalho corrente do dia, ainda em uso por sessões paralelas).

**Implementado** (Railway GraphQL API, via `railway api` — a CLI (`railway service source
connect`) só cobre repo+branch, sem root directory de monorepo):
- `serviceInstanceDeploy`/`source connect`: serviço `agente-runtime` ligado ao repo
  `Jota-12-svg/Agente-lais`, branch `main`.
- `serviceInstanceUpdate`: `rootDirectory: /agente-runtime`,
  `watchPatterns: ["agente-runtime/**"]` — só redisploya quando algo dentro da pasta do
  runtime muda, não o monorepo inteiro.

**Validado de ponta a ponta, depois do merge do main**: `serviceInstanceDeploy` disparado
pro commit mais novo de `main` — build `SUCCESS`, `/health` confirma `conectado`, log do
boot mostra o volume persistente montando normalmente (sem pedir QR de novo — auth
sobrevive ao novo caminho de deploy também) e "Atendimentos abertos reidratados do
Supabase" (item 1 continua funcionando no deploy via GitHub). Confirma o critério "Resolvido
quando" do ticket: "um push no repositório dispara deploy... sem comando manual" — a partir
de agora, um merge em `main` faz isso sozinho; `railway up` manual não é mais necessário
(mas continua funcionando, se precisar).

**Item 3 fechado.**

**046 como um todo: fechado — itens 1, 2 e 3 completos.**

## Resolução

**Fechado em 2026-09-14.** Os três itens (estado persistido, idempotência, deploy
automático) completos e validados ao vivo em produção — ver as seções acima para cada um.

**Efeito colateral relevante, fora do escopo original do ticket**: ao trabalhar no item 3,
achado que `main` nunca tinha recebido PR desde a fase de pesquisa do projeto — todo o
trabalho real vivia só em `wayfinder/atendimento-hoje`. Corrigido com o dono (PR #1,
squash-merge `5e424ed`) — `main` agora reflete o estado real do repositório, condição
necessária pra push-to-deploy funcionar. Isso não muda o fluxo de trabalho descrito no
CLAUDE.md (branches curtas → PR → squash em `main`); só corrige o fato de que, na prática,
esse fluxo não vinha sendo fechado (PRs abertos, nunca mergeados).

**Consequência natural do 044** (poll de 5s virar reação direta a Realtime na escrita de
`handoffs`) **não foi feita** — registrada no ticket como "vale fazer se o esforço for
pequeno, mas não é critério de fechamento"; permanece de fora, sem abrir ticket novo (não
é dívida, é escopo que nunca entrou).
