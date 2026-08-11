---
id: "012"
title: Quando e como o agente escala para uma consultora
labels: [wayfinder:grilling]
status: open
assignee: Claude
blocked-by: ["009"]
---

## Question

O escalonamento é o mecanismo de segurança de todo o projeto: enquanto o agente souber
reconhecer que está fora da sua alçada e passar a bola, o pior caso é ele ser inútil, não
prejudicial. Se ele **não** souber, o pior caso é perder um cliente de R$ 50 mil.

A decidir:

- **Os gatilhos.** O que faz o agente entregar a conversa? O usuário citou "informação mais
  pessoal ou entendimento mais personalizado" — isso precisa virar critério operável.
  Candidatos: pergunta sobre disponibilidade, negociação de preço, cliente irritado,
  planilha de arquiteto, cliente pedindo pessoa, agente sem confiança na própria resposta,
  conversa longa demais sem avanço.
- **Para qual consultora.** Se o cliente já é de alguém, vai para ela — e se ela estiver
  fora, ou se for cliente novo? Rodízio, disponibilidade na agenda, quem estiver online?
- **Como a consultora é avisada**, e o que ela recebe junto: a conversa inteira, um resumo,
  os campos já qualificados?
- **O que o cliente vê.** O agente anuncia a passagem ("vou chamar a Fulana") ou a troca é
  silenciosa? O cliente sabia que estava falando com um agente? — decisão de transparência
  que também tem lado jurídico.
- **O caminho de volta.** Depois que a consultora assume, o agente volta a atuar naquela
  conversa? Em que condição?
- **Quando ninguém atende.** A consultora não responde em X tempo — o que acontece com o
  cliente pendurado?
- **O freio de mão.** Existe um jeito de a consultora desligar o agente numa conversa, ou
  em todas, na hora?

**Resolvido quando** os gatilhos, o roteamento, o que a consultora recebe e o comportamento
de falha estiverem definidos.

---

## Grilling em andamento — 2026-08-11

Decidido até aqui:

- **Gatilhos:** além dos já fixados em 009 (modo arquiteto/planilha; agenda não confiável),
  também disparam escalada — cliente pede explicitamente por uma pessoa; cliente frustrado;
  negociação de preço/desconto; pergunta sobre disponibilidade **pontual** de item específico
  (wording exata fica para o ticket [011](011-o-que-o-agente-pode-dizer-sobre-produto.md));
  agente sem confiança na própria resposta. **"Qualificação completa" ainda não entra** —
  depende do ticket [010](010-o-que-e-um-lead-qualificado.md), bloqueado.
- **Routing:** a escalada nunca decide roteamento do zero. Entrega para a consultora já dona
  (rodízio ou cliente que volta, per 009); se a conversa começou fora do expediente sem
  atribuição, a escalada é o gatilho que dispara o rodízio adiado nesse momento.
- **Mecanismo de detecção do handoff:** qualquer mensagem enviada na conversa que não veio do
  agente é o sinal de que um humano assumiu — natural pela arquitetura de número
  compartilhado, sem precisar de comando dedicado (ressalva conhecida: ponto cego do
  WhatsApp Windows, ticket [019](019-companion-windows-ponto-cego.md)).

### ⚠️ Em aberto — aguardando resposta das consultoras

**Notificação da escalada.** O research [research/012](../research/012-notificacao-de-escalada.md)
descartou etiqueta nativa via API (não suportada em Coexistence, confirmado com fonte) e
badge de não lida (não aponta pessoa específica — estrutural). A opção que sobrou — template
pago (categoria *utility*) para o **número pessoal** da consultora — depende de duas coisas
que só elas respondem: se aceitam receber esse aviso no número pessoal, e se esse número é
de fato distinto do número compartilhado da loja. Perguntas **33 e 33b** subiram para o
ticket [020](020-perguntas-para-as-consultoras.md). **Este ticket não fecha até essa resposta
voltar** — o resto da árvore de decisão (transparência da passagem, caminho de volta, timeout,
freio de mão) segue sendo trabalhado em paralelo.
