---
id: "029"
title: Canal de notificação da fila de chamados
labels: [wayfinder:research]
status: open
assignee:
blocked-by: []
---

## Question

Aberto pelo ticket [012](012-quando-e-como-o-agente-escala.md): o agente lança chamados
pendentes numa aba nova da planilha compartilhada, mas **não pode avisar a consultora por
WhatsApp de forma ativa** — mandar mensagem fora de uma resposta reativa é exatamente o
comportamento que os researches 026/028 identificaram como gatilho de banimento no número de
produção. A fila existir na planilha não basta se ninguém souber que ela mudou sem ficar
checando o tempo todo.

**O que precisa ser respondido:**

- **O que o Google Sheets já oferece nativamente.** Ferramentas → Regras de notificação manda
  e-mail quando a planilha é editada — dá para configurar por edição de qualquer célula, ou só
  quando alguém preenche um formulário associado. Confirmar o alcance real: dá para restringir
  a notificação só à aba de chamados? O e-mail carrega o conteúdo da linha, ou só avisa que
  "algo mudou"?
- **Se o nativo não bastar, o que mais existe** sem exigir uma superfície nova construída do
  zero: e-mail formatado via Apps Script (ainda é "nativo" no sentido de não precisar de
  hospedagem própria), SMS, notificação de um app de terceiros conectado à planilha, ou até um
  sinal físico na loja (o que provavelmente é overkill, mas vale descartar por escrito, não por
  omissão).
- **O e-mail é um canal que as consultoras de fato olham no fluxo de trabalho delas?** O
  ticket [020](020-perguntas-para-as-consultoras.md) já registrou que o e-mail é `@gmail.com`
  comum, não corporativo — mas isso não diz se ele é checado com frequência durante o
  expediente. Se a resposta for "não", e-mail sozinho não resolve, por melhor que seja de
  configurar.

**Resolvido quando** houver uma recomendação clara de canal (ou combinação de canais), testável
assim que o ticket [004](004-acesso-a-planilha-e-ao-catalogo.md) der acesso real à planilha —
com o porquê das alternativas descartadas.
