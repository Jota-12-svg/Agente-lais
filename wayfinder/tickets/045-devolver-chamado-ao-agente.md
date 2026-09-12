---
id: "045"
title: Botão "Devolver ao agente" nos chamados da plataforma
labels: [wayfinder:task]
status: closed
assignee: claude-sonnet-5
blocked-by: []
---

> **Origem — grilling com o dono, 2026-09-12**, no mesmo pedido que corrigiu o bug de áudio
> (ver `agente-runtime/index.js`). As decisões de design abaixo já saíram fechadas da
> conversa; falta só a construção, e ela espera o [044](044-construir-runtime-do-agente.md).

## Question

Hoje a plataforma das consultoras (`advisor-platform/`) tem, no `HandoffCard.svelte`, dois
botões por chamado: **Assumir** (`status: 'pending' → 'assumed'`) e **Devolver à fila**
(`status: 'assumed' → 'pending'`, some `assumed_by`) — mas "devolver à fila" só troca de
consultora, nunca devolve o controle da conversa para o agente. Pedido do dono: um terceiro
botão, ao lado dos dois, que devolve o chamado **para a Manu responder de novo**.

Isso contraria a decisão "definitivo" do ticket [012](012-quando-e-como-o-agente-escala.md)
("depois que uma consultora assume, o agente nunca mais fala naquela conversa") — tratado
como revisão explícita dela, não como feature solta. Ver addendum de 2026-09-12 no próprio
012.

## Decisões do grilling (2026-09-12)

- **Critério de quando o botão aparece/funciona: sem restrição.** Decisão revisada em
  2026-09-12 (a versão original desta sessão de grilling só permitia devolver antes da
  primeira resposta humana real — o dono corrigiu para julgamento livre da consultora,
  mesma confiança já dada hoje ao "Devolver à fila"). O botão aparece sempre que
  `status = 'assumed'`, junto do "Devolver à fila", e a consultora decide na hora, mesmo que
  já tenha respondido ao cliente. **Simplifica a implementação**: não precisa rastrear, por
  chamado, se/quando a consultora respondeu (não precisa de coluna nova tipo
  `advisor_replied_at`, nem do runtime observar esse sinal) — só precisa saber que o chamado
  foi marcado como devolvido.
- **Modelagem do estado "devolvido":** **4º valor no enum `handoff_status`**
  (`pending | assumed | closed | returned_to_agent`, nome exato fica para quem implementar),
  em vez de reaproveitar `pending` como o "Devolver à fila" já faz. Motivo: `pending` hoje
  significa "qualquer consultora pode pegar" — usar o mesmo valor pra "voltou pro agente"
  obrigaria o runtime a inferir intenção por uma combinação de colunas, em vez de ler um
  estado explícito e sem ambiguidade.
- **Onde a construção mora:** **não** em cima do runtime provisório (`agente-runtime/`, que
  só tem estado de conversa em `Map`, em memória, sem relação nenhuma com `handoffs`) — faz
  parte do [044](044-construir-runtime-do-agente.md), que já vai trocar esse estado por algo
  persistido no Supabase. Empilhar mais um mecanismo em cima do `Map` provisório seria
  retrabalho garantido quando o 044 chegar.

## Fora do escopo deste ticket

- Qualquer mudança no comportamento de **Assumir** ou **Devolver à fila** (`HandoffCard.svelte`)
  além de adicionar o botão novo ao lado deles.
- O "fluxo inverso" registrado na névoa do `map.md` ("assumir uma conversa em andamento" —
  consultora tomar o controle no **meio** de uma qualificação que o agente ainda está
  fazendo) — é outro mecanismo, ainda sem ticket.

## Depende de

- [044](044-construir-runtime-do-agente.md) — precisa do runtime lendo `handoffs` e do
  estado de conversa persistido no Supabase antes de existir um "voltar a responder" que
  sobrevive a um redeploy. Não desbloqueia sozinho: quem fechar o 044 decide se este ticket
  vira parte dele ou continua separado.

**Resolvido quando**: o botão existe no `HandoffCard.svelte` ao lado de "Devolver à fila",
grava o novo estado em `handoffs`, e o runtime volta a responder o cliente naquele chamado a
partir do estado persistido (não do `Map` em memória) — validado com um chamado de teste de
ponta a ponta.

---

## Resolução

**Construído em 2026-09-12, direto em cima do runtime provisório** — o dono pediu
explicitamente, na mesma sessão, pra funcionar agora, revertendo a decisão acima de "espera o
044". Registrado como decisão nova, não como desvio silencioso.

### O que foi implementado

- **Enum**: `returned_to_agent` adicionado a `handoff_status` (migração
  `20260912120000_devolver_ao_agente_e_contact_jid.sql`), como decidido — estado próprio, não
  reaproveita `pending`.
- **Coluna nova, achado no caminho**: `contact_jid` em `handoffs` (jid bruto do WhatsApp,
  `text`, nullable) — necessária porque o runtime provisório não tem NENHUMA relação com
  `handoffs` hoje (nem lê, nunca leu). Sem um jid gravado na própria linha, não haveria como
  saber a qual conversa um chamado corresponde depois de "devolver" ou "fechar". Colunas de
  auditoria simétricas: `returned_by`, `returned_at`.
- **Mecanismo de leitura — não é Realtime.** A ideia óbvia (o runtime assinar `postgres_changes`
  em `handoffs`, mesmo padrão do freio de mão/036) foi descartada: `agent_settings` é um
  booleano; `handoffs` carrega nome, telefone e resumo do cliente — abrir `SELECT` pra chave
  anônima do runtime (que não faz login Google) exporia dado real de cliente a qualquer um com
  a publishable key. Em vez disso: **RPC nova `handoffs_status_for_jids`** (security definer,
  gateada pelo mesmo `HANDOFF_INSERT_SECRET` do `handoffs_insert`), devolve só
  `{contact_jid, status}` — nunca PII. O runtime faz **poll a cada 15s**, só com os jids das
  conversas que ele mesmo tem `status = 'escalado'` em memória (nunca manda a lista toda).
- **`HandoffCard.svelte`**: botão "Devolver ao agente" ao lado de "Devolver à fila", sem
  confirmação (mesmo padrão do vizinho) — `update({status: 'returned_to_agent', returned_by,
  returned_at})`.
- **`agente-runtime/index.js`**: ao detectar `returned_to_agent` num poll, `estadoDe(jid).status
  = 'qualificando'` — mantém o histórico da conversa (contexto não se perde), só destrava.

### Limitação aceita conscientemente

Como o runtime provisório guarda `contact_jid` só na tabela (persistido) mas o **vínculo pra
saber quem está "escalado" agora** ainda é o `Map` em memória de sempre — um restart do
processo entre a escalada e o clique no botão perde a conversa da memória, e o poll não acha
mais ninguém pra destravar (o jid simplesmente não aparece mais como `escalado`). Mesma
limitação que já era aceita pro provisório inteiro (`estado de conversa em memória`, ver
cabeçalho do `agente-runtime/index.js`); o **044** resolve isso de vez ao persistir o estado
da conversa também.

### Bug achado ao vivo, corrigido na hora — mensagem perdida na corrida com o poll

Primeiro teste real do dono: clicou "Devolver ao agente", a Consuelo mandou outra mensagem
segundos depois, e a Manu não respondeu. Causa: o poll roda a cada 15s (agora 5s) — uma
mensagem chegando nesse intervalo, enquanto o chamado ainda estava `escalado` no Map, era
descartada em silêncio e **nunca reprocessada**; a Manu só voltava a falar na mensagem
seguinte. Corrigido: guarda a última mensagem recebida enquanto `escalado` (`pendingMessage`),
e reprocessa ela assim que o poll detecta `returned_to_agent`, em vez de esperar outra
mensagem chegar.

### Efeito colateral: telefone resolvido melhor, achado no mesmo pedido

Ver [012 addendum](012-quando-e-como-o-agente-escala.md#addendum-2026-09-12) e o achado de
"fechar chamado reinicia o atendimento" — três pedidos do dono na mesma sessão, implementados
juntos porque compartilham a mesma peça de infraestrutura (`contact_jid` + poll).
