---
id: "014"
title: Como o agente soa — protótipo de atendimento no tom das consultoras
labels: [wayfinder:prototype]
status: in-progress
assignee: sessão 2026-09-02 (worktree como-o-agente-soa-014)
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

---

## Respostas — ticket 020 (2026-08-11, resposta 1 de 4)

- **Textão ou várias curtas:** "Mensagens mais completas" — lê como textão, não fragmentado
  em várias mensagens.
- **Áudio:** "Às vezes".
- **Emoji:** "Alguns" — usa, mas poucos, não intenso.
- **Tempo de resposta:** "Alguns minutos".
- **Atendimento de arquiteto é diferente do de cliente comum:** "Sim, bastante" — mas o texto
  livre de "o que muda" não veio nesta rodada.

**Não é o bastante para fechar o protótipo:** é uma resposta de quatro, e o próprio ticket já
previa que 7–11 se confirmam melhor lendo as conversas exportadas
([003](003-exportacao-das-conversas-das-consultoras.md)) do que por resposta verbal — vale como
ponto de partida, não como tom definitivo.
