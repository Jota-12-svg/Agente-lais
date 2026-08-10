---
id: "014"
title: Como o agente soa — protótipo de atendimento no tom das consultoras
labels: [wayfinder:prototype]
status: open
assignee:
blocked-by: ["003", "009"]
---

## Question

"Não quero mudar o tom no qual elas já atendem" é um requisito que **não se resolve em
prosa** — ninguém sabe dizer se o tom está certo até ler o agente falando. Este ticket
existe para tornar isso concreto e reagível.

O protótipo: transcrições de atendimento escritas como o agente falaria, com o usuário (e,
se possível, uma consultora) lendo e reagindo linha a linha. Nada de código ainda.

Cenários a cobrir:

- Consumidor final chegando frio, sem dizer o que quer.
- Arquiteto mandando planilha de itens.
- Cliente perguntando se tem um produto — o caso em que o agente **não pode afirmar**
  disponibilidade e precisa soar útil mesmo assim.
- Cliente perguntando preço de um item caro.
- Um escalonamento acontecendo: como o agente passa a conversa sem que pareça abandono.
- Cliente mandando áudio, e cliente mandando foto de um produto que viu em outro lugar.
- Cliente irritado ou desconfiado de estar falando com um robô.

Perguntas que o protótipo tem de responder:

- Quão longa é uma mensagem do agente? As consultoras mandam textão ou várias mensagens
  curtas? (Isso é a diferença mais visível entre soar humano e soar bot.)
- Emoji, áudio, gíria, formalidade — o que combina com a Lais Casa?
- O agente se identifica como agente? Tem nome?
- Com que velocidade responde? Instantâneo denuncia máquina.

**Resolvido quando** houver transcrições aprovadas que sirvam de referência de tom para a
construção — e de material de comparação depois, quando o agente estiver rodando de
verdade.
