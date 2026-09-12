---
id: "045"
title: Botão "Devolver ao agente" nos chamados da plataforma
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["044"]
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
