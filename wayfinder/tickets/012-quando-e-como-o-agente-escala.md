---
id: "012"
title: Quando e como o agente escala para uma consultora
labels: [wayfinder:grilling]
status: open
assignee:
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
