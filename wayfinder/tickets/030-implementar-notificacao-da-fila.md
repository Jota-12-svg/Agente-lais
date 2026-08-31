---
id: "030"
title: Implementar o script de notificação da fila (Apps Script)
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["004"]
---

## Question

O ticket [029](029-canal-de-notificacao-da-fila.md) decidiu o mecanismo: um script do Google
Apps Script vinculado à planilha compartilhada, disparado por **trigger de tempo** (não por
`onEdit`/`onChange` — a documentação oficial confirma que esses eventos não disparam para
gravação feita via API, que é como o agente escreve o chamado), que varre a aba de fila
periodicamente e manda e-mail para as consultoras quando encontra chamado novo. Este ticket é
**construir esse script de verdade**, não decidir o desenho de novo.

**O que precisa ser feito:**

- Escrever o Apps Script: trigger de tempo (começar em 1x/minuto, ajustar se a quota ou o
  comportamento real pedir), leitura da aba de fila, marcação de "já notificado" (coluna de
  controle ou timestamp da última varredura, para não duplicar aviso a cada execução), e envio
  via `MailApp.sendEmail()` (ou `GmailApp.sendEmail()` se precisar de HTML) para os e-mails das
  consultoras.
- Formato do e-mail: o que a consultora precisa ver sem abrir a planilha — pelo menos o motivo
  do chamado e um link direto para a aba de fila. Definir o conteúdo exato é parte deste ticket.
- Testar de ponta a ponta contra a planilha real: gravar uma linha (manualmente, e depois via
  API, imitando o agente) e confirmar que o e-mail chega, dentro da latência esperada
  (documentada como até 1 minuto no research 029).
- Registrar, na resolução, o link de destino do script (é bound ao Google Sheet, então mora
  dentro do próprio arquivo — documentar onde encontrar/editar).

**Por que espera o ticket [004](004-acesso-a-planilha-e-ao-catalogo.md):** o desenho do research
029 foi pensado para não depender de saber o tipo de conta (pessoal vs. Workspace), mas
**construir e testar o script exige a planilha real** — layout de colunas, e-mails reais das
consultoras, e confirmação prática da quota (conta pessoal Gmail: 100 e-mails/dia, deve sobrar,
mas só confere na prática).

**Resolvido quando** o script estiver rodando contra a planilha real, testado com uma linha
escrita via API (não só manualmente), e a consultora confirmar que o e-mail chegou dentro da
latência esperada.

---

## Nota — inspeção do ticket 004 (2026-08-30)

A estrutura da planilha foi inspecionada (ver `## Resolução` no
[004](004-acesso-a-planilha-e-ao-catalogo.md)). O que isso muda para este ticket:

- A **aba de fila ainda não existe** — será criada pelo ticket
  [031](031-implementar-escrita-do-chamado-na-fila.md); o layout de colunas é decisão do 031,
  não desta planilha.
- **Os e-mails das consultoras não estão na exportação** — a coluna `E-mail` do diretório é de
  arquitetos. A pergunta 19 do ticket [020](020-perguntas-para-as-consultoras.md) indicou
  `@gmail.com`; os endereços em si ainda precisam ser coletados.
- **Acesso de edição à planilha viva** (para vincular o Apps Script) ainda não obtido — ver a
  mesma pendência no 031.
- Cabeçalhos da planilha vêm com mojibake cp1252 no `.xlsx`; via Apps Script / Sheets API o
  texto chega em UTF-8.
