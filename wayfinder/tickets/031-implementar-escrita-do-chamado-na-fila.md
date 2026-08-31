---
id: "031"
title: Implementar a escrita do chamado do agente na aba de fila (Sheets API)
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["004"]
---

## Question

O ticket [012](012-quando-e-como-o-agente-escala.md) decidiu que, ao escalar, o agente **lança
o chamado numa aba nova da planilha compartilhada** (linha marcada como pendente, com o nome da
dona anexado quando houver, sem trava). Isso é a metade do trabalho que fica do lado do agente,
diferente do ticket [030](030-implementar-notificacao-da-fila.md), que é o script que só lê essa
aba depois de escrita. Nenhum ticket cobre hoje **escrever de verdade** essa linha — é essa a
lacuna que este ticket fecha.

**O que precisa ser feito:**

- Definir o esquema exato da linha: quais colunas a aba de fila tem (nome do cliente, contato,
  motivo do chamado, timestamp, nome da dona se houver, status/pendente). O ticket 012 decidiu o
  comportamento, não o layout — este ticket fecha o layout, confirmando contra o formato real da
  planilha (ticket 004).
- Decidir e implementar o mecanismo de autenticação de **escrita** na planilha a partir do
  agente — Sheets API v4, mas o caminho de credencial (conta de serviço com a planilha
  compartilhada com ela, ou outro) ainda não foi decidido para Sheets especificamente. O ticket
  [006](006-integracao-com-google-calendar.md) resolveu essa pergunta para o Google Calendar
  (conta de serviço com delegação de domínio se Workspace, `freeBusyReader` compartilhado se
  Gmail comum) — a lógica provavelmente transfere para Sheets, mas precisa ser confirmada e
  documentada aqui, não assumida.
- Implementar a chamada de escrita (`spreadsheets.values.append` ou equivalente) no ponto do
  runtime do agente onde a escalada acontece.
- Tratar idempotência: se o agente tentar escalar duas vezes a mesma conversa (retry de rede,
  reprocessamento), não duplicar a linha na fila.

**Depende também da arquitetura do runtime** (ainda não especificada no mapa — ver "Not yet
specified" em `map.md`), porque é lá que a chamada de escrita vai morar. Se o runtime ainda não
estiver decidido quando este ticket for puxado, a parte de autenticação e esquema pode ser
resolvida antes, e a integração no código real espera o runtime.

**Resolvido quando** o agente conseguir escrever uma linha real na aba de fila da planilha de
produção (ou de teste, se produção ainda não estiver liberada), com o esquema documentado e sem
duplicar em caso de retry.

---

## Nota — inspeção do ticket 004 (2026-08-30)

A estrutura da planilha foi inspecionada (ver `## Resolução` no
[004](004-acesso-a-planilha-e-ao-catalogo.md)). O que isso muda para este ticket:

- **A aba de fila não existe na planilha atual** — as abas existentes são diretório de
  arquitetos, mailing, abas de relacionamento por consultora e logs de VISITAS/Entregas. O
  layout da aba de fila é decisão deste ticket (comportamento já fixado no
  [012](012-quando-e-como-o-agente-escala.md); o relance a gravar está detalhado na resolução
  do [010](010-o-que-e-um-lead-qualificado.md)).
- **Confirmar antes de escrever** se `CARTEIRA+MAILLING.xlsx` corresponde à planilha viva onde
  a aba de fila deve morar, ou se a planilha compartilhada de trabalho é outra (pendência
  aberta na resolução do 004).
- O **acesso de edição via Sheets API** continua sendo escopo deste ticket — não veio com a
  exportação `.xlsx`.
- As abas VISITAS e Entregas usam um layout de **blocos de colunas por consultora**; se a aba
  de fila seguir a convenção da casa, considerar isso, mas o 012 decidiu fila **sem trava por
  consultora** (qualquer uma pega) — provavelmente uma tabela única com coluna "dona" opcional.
