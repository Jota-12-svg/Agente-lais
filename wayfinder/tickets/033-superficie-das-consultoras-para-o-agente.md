---
id: "033"
title: Superfície das consultoras para o agente
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

> **Nasceu do fechamento do ticket [013](013-sinal-de-sucesso-do-aprendizado.md) em
> 2026-09-02.** O 013 decidiu que o **julgamento da consultora sobre o atendimento**
> (`advisor_verdict`) é o único sinal que treina a qualidade do agente e o de maior peso —
> mas deixou explícito que *onde* e *como* a consultora faz isso é trabalho à parte. Este é
> esse trabalho. Dá nitidez à névoa **"Superfície para as consultoras"** do
> [`map.md`](../map.md).

## Question

O agente fala com o cliente; a consultora precisa de um lugar para **receber o que ele
preparou, julgar como ele foi e assumir a conversa**. Hoje esse lugar seria a aba de fila do
ticket [012](012-quando-e-como-o-agente-escala.md) — mas o dono do projeto levantou que isso
merece desenho próprio, porque a mesma superfície tende a concentrar mais de uma coisa:

- **Receber o chamado de escalada** — o relance que o ticket 012 já definiu (telefone, nome,
  o que quer, para quando, orçamento, novo/cliente, horário, gatilho). A notificação em si
  já foi decidida no [029](029-canal-de-notificacao-da-fila.md): e-mail via Apps Script com
  trigger de tempo. **Este ticket não reabre o 029** — e-mail continua sendo a notificação
  da fase 1.
- **Julgar o atendimento** — marcar `agente_mandou_bem` / `agente_atrapalhou` + nota livre,
  e o `business_outcome` (`virou_venda` / `virou_visita` / `sem_venda` / `perdido`) ao fechar
  o chamado. O 013 fixou que isso existe e tem peso máximo; falta o **como**, com atrito
  quase zero, dentro do que a consultora já usa.
- **Assumir a conversa** — a passagem do controle do agente para a consultora, e o caminho
  de volta se ela quiser devolver.
- **Marcar que uma venda aconteceu** — quando o polling do Mainô não casa (consumidor final,
  CPF), a consultora é a fonte.
- **Corrigir o agente no meio** — se ela vê o agente dizendo algo errado antes de assumir.

A decidir:

- **Onde isso vive.** Coluna(s) na aba de fila do 012? Uma aba nova? Um app leve à parte? Um
  formulário? O critério é adesão real de quem está atendendo cliente o dia todo — a
  ferramenta mais rica que ninguém preenche vale menos que uma coluna que elas fecham por
  hábito.
- **Quanto cabe na fase 1.** Provavelmente só: desfecho + `advisor_verdict` + nota livre. O
  resto (assumir/devolver, correção no meio) pode ser fase posterior.
- **Se a aba de fila do 012 basta como está**, ou se ela precisa evoluir — e nesse caso o
  012 ganha um addendum, sem reabrir.
- **Como a decisão do 029** (e-mail) e a construção do [030](030-implementar-notificacao-da-fila.md)
  / [031](031-implementar-escrita-do-chamado-na-fila.md) se encaixam com o que sair daqui.

**Resolvido quando** houver uma decisão de qual superfície a consultora usa para julgar o
atendimento e receber a escalada na fase 1, o que exatamente ela preenche, e como isso chega
ao Supabase como `advisor_verdict` / `business_outcome`. Depende de ouvir as consultoras
(ticket [020](020-perguntas-para-as-consultoras.md)) e conversa com o protótipo de tom
([014](014-como-o-agente-soa.md)), que é quando elas veem o agente pela primeira vez.

## Relação com outros tickets

- **013** — fixou o sinal (`advisor_verdict`, peso, hierarquia). Este ticket dá o veículo.
- **012** — a aba de fila é o candidato natural a base; pode ganhar addendum.
- **029 / 030 / 031** — a notificação por e-mail está decidida e em implementação; este
  ticket não a substitui, consolida a superfície em volta dela.
- **020** — perguntar às consultoras o que elas topam preencher (a pergunta foi adiada de
  propósito para depois do 014 — ver nota no fim do 020).
