---
id: "029"
title: Canal de notificação da fila de chamados
labels: [wayfinder:research]
status: closed
assignee: Claude
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

---

## Resolução

Research completo em
[029-canal-notificacao-fila.md](../research/029-canal-notificacao-fila.md). O achado central
responde ao ponto técnico crítico: a documentação oficial do Apps Script confirma, em texto
explícito e repetido nas páginas de triggers simples e instaláveis, que **gravação via API/script
não dispara `onEdit` nem `onChange`** — e o agente vai escrever o chamado via Sheets API v4, não
editando na UI. Isso descarta qualquer solução baseada em reagir a um evento de edição, incluindo,
por inferência de engenharia (sem confirmação oficial em qualquer sentido, ver lacuna 1 do
research), as próprias "Regras de notificação"/"Notificações condicionais" nativas do Sheets.

**Recomendação: e-mail via Apps Script, disparado por trigger de tempo (time-driven, até 1x por
minuto) que varre periodicamente a aba de chamados** — não por evento de edição. Esse desenho
contorna o problema inteiro: não importa se a linha foi escrita por humano ou por API, o script lê
o estado atual a cada execução. Custo zero, dentro das quotas oficiais (100 destinatários/dia em
conta Gmail pessoal, folgado para o volume esperado), latência configurável até 1 minuto — melhor
que os 30 minutos documentados para Notificações Condicionais e que os relatos de "alguns minutos"
do recurso clássico.

Alternativas descartadas, com razão registrada no research: SMS nativo não existe no Google
(exigiria Twilio, dependência nova e paga, desproporcional antes do e-mail ser testado e
reprovado); Zapier/Make/IFTTT resolvem o mesmo problema com conta externa e custo recorrente, sem
ganho sobre o Apps Script (guardados como plano B); sinal físico na loja descartado por resolver o
problema errado (a loja já tem gente por perto olhando celular) ao maior custo de infraestrutura
entre as opções.

**Pendência não-técnica, fora do escopo deste research:** confirmar com as consultoras se e-mail é
canal que elas de fato checam no expediente — ver ticket
[020](020-perguntas-para-as-consultoras.md). Se a resposta for não, a arquitetura de disparo
(leitura periódica da fila) continua valendo; só o último passo (envio) trocaria de `MailApp` para
Twilio ou uma integração de terceiro.

**Addendum, em resposta a pergunta de acompanhamento sobre "chamativo" e onde a fila vive:** a
fila já vive num lugar único e compartilhado — a aba nova da planilha que as quatro pessoas já
abrem todo dia (decisão do ticket 012), independente de qual canal de notificação for escolhido.
O ponto que faltava avaliar é se o **e-mail chama atenção o suficiente**: isso não é propriedade do
mecanismo, é configuração de notificação push do Gmail no celular de cada consultora, que ninguém
confirmou ainda. Refina, sem trocar, a pendência acima: a pergunta a levar ao ticket 020 não é só
"vocês checam e-mail", é "o celular avisa quando chega um e-mail durante o expediente". SMS
continua como plano B se a resposta for não. Tabela de comparação de proeminência entre os quatro
canais no research completo.
