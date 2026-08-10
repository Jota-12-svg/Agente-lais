---
id: "013"
title: Sinal de sucesso — o que se mede e como é capturado
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: ["009", "003"]
---

## Question

Este é o ticket que decide **o que o agente vai perseguir**. Escolher o sinal errado é a
falha mais cara possível do projeto: um agente que otimiza para "reunião agendada" aprende
a agendar reunião com quem não vai comprar, e ninguém percebe por meses.

O usuário nomeou três sinais — vendas, reuniões agendadas, e notas de satisfação ou
insatisfação — e fez questão de dizer que **o fracasso também é sinal**: contatos que não
deram certo e feedback ruim devem ser acompanhados com o mesmo cuidado.

A decidir:

- **Definir cada sinal com precisão.** "Venda" é a nota emitida no Maino, ou o "quero
  comprar" na conversa? "Reunião agendada" conta se o cliente não apareceu? Quanto tempo
  depois da conversa uma venda ainda é atribuível ao agente?
- **Como o sinal chega ao sistema.** Automático (nota fiscal no Maino, evento no Calendar)
  ou manual (a consultora marca)? Todo sinal que depende de alguém lembrar de marcar tende
  a não existir — o desenho precisa contar com isso.
- **Satisfação e insatisfação.** Perguntar ao cliente é intrusivo numa venda de R$ 50 mil.
  Alternativas: inferir da conversa, colher da consultora, ou pedir só em casos
  específicos. Decidir uma.
- **O sinal negativo.** Como se distingue "o agente errou" de "esse cliente nunca ia
  comprar"? Sem essa distinção, o agente aprende a evitar clientes difíceis.
- **O julgamento da consultora.** Ela é a melhor fonte de sinal que existe — ela sabe se o
  agente mandou bem. Como capturar isso com atrito quase zero, dentro do WhatsApp que ela
  já usa?
- **Atribuição.** Uma conversa passa pelo agente e depois pela consultora e vira venda. De
  quem foi o mérito, e o que exatamente o agente aprende desse caso?

**Resolvido quando** cada sinal tiver definição, fonte e mecanismo de captura — e estiver
claro o que se aprende com o fracasso, não só com o sucesso. É este ticket que dissolve boa
parte da névoa sobre o mecanismo de aprendizado.
