---
id: "036"
title: Freio de mão global — desligamento de emergência do agente
labels: [wayfinder:task]
status: open
assignee: Claude
blocked-by: []
---

> **Origem — reconciliação de 2026-09-02.** O grilling do ticket
> [012](012-quando-e-como-o-agente-escala.md), na branch `wayfinder/quando-escalar`, tinha
> separado o "freio de mão" em dois: o **por conversa** (resolvido de graça pelo mecanismo de
> detecção de handoff) e o **global** (desligar o agente inteiro), e abriu um ticket dedicado
> para o segundo. Ao re-aplicar o 012 na trunk, só a metade "por conversa" sobreviveu — a
> seção "Freio de mão" do 012 hoje adia **tudo** para o [027](027-testar-self-hosted-no-numero-atual.md),
> mas o 027 só cobre a pergunta técnica do freio **por conversa** (se uma mensagem de companion
> gera evento no Baileys). O desligamento global ficou sem dono. Este ticket restaura esse
> item de trabalho — já decidido, não é design novo.

> **Ponto de integração decidido em 2026-09-11** — ver
> [042](042-stack-e-hospedagem-do-runtime.md). O runtime lê a flag via **Realtime** numa
> tabela do Supabase (não polling — efeito precisa ser imediato). O esquema da tabela e a UI
> na plataforma das consultoras continuam escopo deste ticket.

## Question

Todo serviço em produção precisa de um **desligamento de emergência**. Para este agente, o
cenário concreto: o agente está respondendo errado — inventando preço, afirmando
disponibilidade de produto (a restrição dura nº 1 do `CLAUDE.md`), "alucinando" — e é preciso
**calá-lo em todas as conversas de uma vez**, imediatamente, sem depender de entrar em cada
conversa.

Isso é distinto do freio de mão **por conversa** (uma consultora assume um atendimento e o
agente se cala ali) — esse já existe de graça pelo mecanismo de detecção de handoff do
ticket 012. Aqui é o botão único que derruba o agente inteiro.

### O que decidir / construir

- **Mecanismo técnico.** Variável de ambiente lida a cada mensagem, flag numa tabela do
  Supabase (o 035 já traz Supabase para o stack), endpoint protegido, painel admin — a
  escolha cabe a quem implementar, mas precisa ser **rápida de acionar** por quem não abre
  terminal.
- **Efeito imediato e abrangente.** O desligamento atinge **todas as conversas em
  andamento**, não só as mensagens que chegarem depois. Enquanto desligado, o agente não
  responde nada (ou responde só uma linha neutra de "já te respondo", a decidir).
- **Quem aciona.** Dono do projeto **e as consultoras** — decisão do dono em 2026-09-02, no
  fecho do [033](033-manual-do-agente-para-as-consultoras.md): o manual do agente promete a
  feature à consultora como algo que ela aciona quando o agente atende errado. Logo a
  implementação **precisa** de um controle acionável por quem não abre terminal (candidato
  natural: um botão na plataforma das consultoras do 035). Não é um controle que o cliente
  final vê.
- **Como se sabe que está desligado.** Um sinal visível para quem opera (log, cor na
  plataforma do 035, e-mail de confirmação) para não ficar dúvida se o agente está no ar.
- **Religar.** O caminho de volta — e se conversas que chegaram durante o apagão precisam de
  algum tratamento (fila de escalada? nada?).

### Relação com outros tickets

- **012** — a seção "Freio de mão" ganha um ponteiro para cá ao fechar este ticket.
- **027** — cobre o freio **por conversa** (mensagem de companion → evento no Baileys); não
  cobre este.
- **035** — se o mecanismo escolhido for uma flag no Supabase, encosta no esquema do 035; e
  o botão acionável pela consultora (ver "Quem aciona") mora naturalmente nessa plataforma.
- **033 / 034** — o manual do agente descreve este freio como feature das consultoras
  (Parte B, seção "Se o agente começar a errar feio"). O [034](034-redigir-o-manual-do-agente.md)
  está bloqueado por este ticket.
- **Névoa "Stack e hospedagem do runtime"** — o ponto de integração no código depende de
  onde e como o agente roda; a decisão do mecanismo pode esperar isso, mas o **requisito**
  fica registrado desde já.

**Resolvido quando** existir um jeito comprovado de desligar o agente inteiro — testado,
com quem tem acesso documentado e o caminho de religar claro.

## Progresso (2026-09-11) — não fecha o ticket

**Mecanismo técnico e UI construídos e testados de ponta a ponta; falta só o runtime consumir.**

- Tabela `agent_settings` (singleton, `id=1`) na migração
  `advisor-platform/supabase/migrations/20260911180000_agent_settings.sql`: `agent_enabled`,
  `toggled_by`, `toggled_at`. Mesma RLS das outras telas da plataforma (advisors da allow-list
  leem e atualizam; sem `INSERT`/`DELETE` via API). Publicada no Realtime. **Aplicada no
  Supabase de produção.**
- `KillSwitch.svelte` trocou o `localStorage` do protótipo visual (521163f) por leitura/escrita
  real: carrega o estado ao montar, assina Realtime (reflete na hora se outra aba/pessoa mudar),
  grava `toggled_by`/`toggled_at` ao acionar. `demo.js` ganhou mock da tabela nova, o modo
  demonstração continua funcionando.
- **Testado de ponta a ponta em produção**
  (`plataforma-consultoras-production.up.railway.app`), login Google real (João Victor):
  desligar → "Desligado por Joao Victor às 16h28"; religar → volta a "Agente no ar". **Realtime
  confirmado entre duas abas diferentes**: religado numa aba, a outra atualizou sozinha, sem
  reload — prova o efeito "imediato e abrangente" que o ticket pede, não só que o dado grava.
- **Quem aciona:** os mesmos advisors da allow-list (consultoras + dono) — decisão do 033/036
  já cumprida, não é controle que o cliente final vê.
- **O que falta para fechar de verdade:** o runtime (ticket
  [044](044-construir-runtime-do-agente.md)) assinar esta mesma tabela via Realtime e
  efetivamente parar de responder quando `agent_enabled = false` — sem isso, a UI prova que o
  estado é gravado e propagado, mas não prova que o agente se cala. "Resolvido quando" deste
  ticket continua de pé até esse teste real existir.

## Progresso (2026-09-14) — metade validada ao vivo, ainda não fecha

O 044 fechou (runtime provisório em produção) e o código **já assina** `agent_settings` via
Realtime e **já obedece** a flag (`agente-runtime/index.js` — `if (!agentEnabled) { ...
continue }`). Testado ao vivo, em produção, no meio do trabalho do 038:

- `update agent_settings set agent_enabled = false ...` direto no banco → log do runtime em
  produção, em segundos: `>>> FREIO DE MÃO: estado mudou via Realtime. agentEnabled: false`.
- Religado (`agent_enabled = true`) → mesmo log, `agentEnabled: true`, confirmado também via
  `/health`.

**O que isso prova:** o caminho banco → Realtime → processo do runtime funciona de ponta a
ponta em produção — não é só a UI gravando e mais nada do outro lado, como o "Progresso
2026-09-11" registrava.

**O que ainda não prova:** que uma **mensagem real chegando** enquanto `agent_enabled = false`
é de fato ignorada — não dá pra simular isso sem mandar mensagem de verdade no WhatsApp (o
dono não pôde nesta sessão). "Resolvido quando" deste ticket **continua de pé** até esse teste
específico acontecer — próxima vez que alguém mandar mensagem no grupo de teste com o freio
de mão desligado (de propósito ou não), confirma e fecha.

## Incremento do 038 (2026-09-14) — canal de aviso, não fecha o ticket

O [038](038-estrategia-de-rollout.md), ao fechar, formalizou o canal por onde **este** freio
de mão avisa o dono quando acionado: registro na tabela `problem_reports`-irmã (evento
`agent_settings` UPDATE) + e-mail via a Edge Function `notify-admin`
(`advisor-platform/supabase/functions/notify-admin/`) — mesmo canal do "reportar problema".
A função **não está implantada de verdade** ainda (falta conta Resend do dono); o toggle em
si já funciona e já avisa via Realtime na plataforma, testado ao vivo (ver "Progresso
2026-09-14" acima). Não muda nada do critério "Resolvido quando" deste ticket — só documenta
onde mora o aviso, que era pergunta aberta no 038 original.
