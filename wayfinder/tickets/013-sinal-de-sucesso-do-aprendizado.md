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

---

## Nota — dependência do ticket 012

O ticket [012](012-quando-e-como-o-agente-escala.md) (fechado em 2026-08-12) passou a depender
do limiar de "contato perdido" decidido aqui para um segundo uso: a **janela de retomada** após
um handoff — quanto tempo o agente ainda reafirma "a consultora já vai te atender" antes de
tratar um contato que volta como atendimento novo do zero. É o mesmo conceito, dois usos; ao
fechar este ticket, decidir um único número serve para os dois, não dois números separados.

---

## Respostas — ticket 020 (2026-08-11, resposta 1 de 4)

- **Atendimento bom mesmo sem venda:** *"Quando o cliente tirou todas as dúvidas de forma
  clara e objetiva sem fazer o cliente perder tempo."* Candidato a definição operável:
  dúvidas resolvidas + sem enrolação para o cliente — não depende de venda nem de reunião
  marcada.
- **Tempo sem resposta = cliente sumiu:** **"2-3 dias"** — mais curto do que a hipótese
  inicial do ticket. Define a janela para considerar um contato esfriado, para fins de
  aprendizado.
- **Processo quando o cliente decide comprar:** *"Informam o preço diretamente na
  conversa"* — não manda PDF nem print da cotação do Mainô, o preço é digitado no chat.
  Importa para onde procurar o sinal de "orçamento passado": no texto da conversa, não num
  anexo.
- **Quando a nota fiscal é emitida:** **"Depende da situação"** — não há regra fixa. Enfraquece
  um pouco a aposta de nota fiscal como sinal objetivo e *imediato*; falta entender os
  "depende de quê" com mais detalhe antes de fechar o desenho do sinal.
- **Tempo até fechar venda:** "Alguns dias" tanto para cliente comum quanto para arquiteto —
  resposta na mesma faixa grosseira para os dois; não há diferença aparente nesta resposta.
- **Telefone na cotação do Mainô:** **"Sempre"** — boa notícia para a chave de atribuição. Se o
  telefone está sempre na cotação, ele é candidato a campo em comum entre a conversa (que tem
  telefone) e a venda (cuja nota tem CPF/nome) — desde que cotação e nota fiquem ligadas dentro
  do Mainô.

**Pendente, sem resposta utilizável ainda:**

- **Pergunta 25** (exemplo de nota fiscal) voltou "Opção 1" — não é um arquivo, provavelmente
  indica intenção de mandar pelo WhatsApp. **O arquivo, que é o que decide se a nota fiscal dá
  para ligar de volta à conversa, ainda não chegou.**
- **Pergunta 32** (exemplos de bons atendimentos) voltou "Por favor, enviar por WhatsApp" —
  também ainda não chegou.

⚠️ Nenhum dado pessoal foi recebido nesta rodada. Quando a nota fiscal e os exemplos de
atendimento chegarem, valem as regras de manuseio do ticket
[020](020-perguntas-para-as-consultoras.md): vão para `/dados/` ou `/conversas/`, nunca para o
repositório — só o padrão observado (campos da nota, condução da conversa) sobe para este
ticket.
