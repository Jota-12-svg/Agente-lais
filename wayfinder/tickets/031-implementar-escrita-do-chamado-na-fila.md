---
id: "031"
title: Implementar a escrita do chamado do agente na fila (INSERT no Supabase)
labels: [wayfinder:task]
status: open
assignee: claude-sonnet-5
blocked-by: ["035"]
---

> **Mecanismo de autenticação decidido e testado ao vivo em 2026-09-11** (grilling + deploy
> real, sessão de reconciliação do 037) — ver "Decisão do mecanismo" abaixo. O ticket **segue
> `open`**: o mecanismo está pronto e provado, mas só está ligado ao `prototipo-tom-014/`
> (descartável), não ao runtime de produção, que ainda não existe. Fecha quando o runtime
> real chamar este mesmo caminho.

> **Reenquadrado em 2026-09-02 — ver [035](035-plataforma-central-das-consultoras.md), agora
> fechado.** A fila vive numa plataforma sobre o **Supabase**, não numa aba da planilha. A
> intenção deste ticket continua — o agente escreve o chamado ao escalar —, mas o alvo muda:
>
> - **Alvo:** `INSERT` na tabela `handoffs` do Supabase (esquema fixado na resolução do 035,
>   §6), via *service role* server-side. **Some** a conta de serviço + delegação de domínio +
>   toda a discussão de autenticação Sheets abaixo.
> - **Some** também o esquema da linha como escopo deste ticket — está fechado no 035.
> - **Entra:** ao escalar, o agente também marca a conversa como não lida no WhatsApp
>   (`chatModify({ markRead: false }, jid)` via Baileys) — sinal secundário, ver 035 §5.
> - **Continua:** idempotência (não duplicar chamado em retry) e o ponto de integração no
>   runtime do agente (névoa do mapa).
>
> `blocked-by: ["035"]` + runtime. O texto abaixo é o desenho antigo (Sheets), histórico.

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

---

## Decisão do mecanismo (2026-09-11)

Testado ao vivo, ligado ao `prototipo-tom-014/` (não ao runtime — esse ainda não existe).
Grelhado com o dono antes de escrever qualquer código.

**Nem papel Postgres dedicado com senha, nem service role — uma RPC `security definer`,
gateada por segredo.** A pergunta original ("papel dedicado × service role") tinha uma
terceira resposta melhor que as duas:

- **`public.handoffs_insert(...)`** — função Postgres `security definer`, roda com o
  privilégio de quem a criou (contorna o RLS por dentro), mas é **chamada por HTTPS puro**
  via `/rest/v1/rpc/handoffs_insert`, com a **publishable key** (pública por design, a mesma
  que a plataforma já expõe no navegador — não é segredo).
- **Gate por segredo dentro da função**: o primeiro argumento (`p_secret`) precisa bater com
  um valor fixo gravado no corpo da função; se não bater, `raise exception` (HTTP 403). O
  segredo (`HANDOFF_INSERT_SECRET`, `.env`, nunca commitado) só existe no processo que chama
  — nunca chega a um navegador, então não pode vazar por aí.
- **Por que não papel Postgres dedicado com conexão direta:** exigiria a lib `pg` (o
  protótipo é zero-dependências por decisão própria) e guardar usuário/senha de banco no
  processo do agente — mais uma credencial de infraestrutura pra rotacionar e proteger.
- **Por que não service role:** o `CLAUDE.md` §4 veta — ignora RLS por completo, "se algum
  dia parecer necessária, é sinal de que o modelo de acesso está errado".
- **Mapeamento de dados** (do sinal `[[ESCALAR: trigger=X; nome=Y; motivo=Z]]` que a Manu
  emite): `trigger` vem direto no enum certo (a Manu escolhe entre os 6 valores, não texto
  livre); `engagement_mode` é inferido (`architect` se `trigger=architect`, senão
  `consumer` — Fase 1 só tem esses dois); `contact_name` vem do sinal, opcional; **`summary`**
  é o motivo em texto livre. **`contact_phone` não existe** nesse protótipo (é chat de
  navegador, não WhatsApp) — usa um placeholder de teste (`TESTE-PROTOTIPO-014 (id-da-
  conversa)`), nunca confundível com contato real. **Em produção isso desaparece por conta
  própria**: toda mensagem do WhatsApp (Cloud API ou Baileys, ticket 016) já chega com o
  número de quem mandou — não precisa perguntar nem extrair, é o identificador nativo da
  conversa.
- **Idempotência: deliberadamente fora de escopo deste teste.** Processo único, sem retry,
  sem múltiplos workers — o runtime real vai precisar tratar isso quando existir.
- Código: `prototipo-tom-014/handoff-writer.mjs` (módulo isolado, pra poder ser levado
  praticamente inteiro pro runtime real quando ele existir) + o sinal de escalada em
  `run.mjs`/`system-prompt.md` estendido com `trigger=`/`nome=`.
- **Testado ao vivo duas vezes**: conversa real com a Manu → ela decide escalar → o chamado
  aparece sozinho na fila da plataforma (Realtime), sem eu tocar em nada lá. Confirmado nome
  do cliente, tipo (consumidor/arquiteto) e motivo corretos.

**Ainda falta pro 031 fechar de verdade:** o runtime do agente (névoa do mapa) chamar este
mesmo `handoff-writer.mjs` (ou algo equivalente) a partir do WhatsApp real, com o telefone
verdadeiro no lugar do placeholder, e resolver idempotência.
