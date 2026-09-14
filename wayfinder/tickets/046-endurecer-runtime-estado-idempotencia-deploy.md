---
id: "046"
title: Endurecer o runtime do agente — estado persistido, idempotência e deploy automático
labels: [wayfinder:task]
status: open
assignee:
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
