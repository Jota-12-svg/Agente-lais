---
id: "042"
title: Stack e hospedagem do runtime do agente
labels: [wayfinder:grilling]
status: in-progress
assignee: sessão-grilling-042
blocked-by: []
---

## Question

O mapa carrega, em `Not yet specified`, a última névoa grande do projeto: **onde e como o
agente roda de verdade**. Não é um detalhe de infra — três tickets avançados esperam por essa
decisão para fechar:

- **[031](031-implementar-escrita-do-chamado-na-fila.md)** — o mecanismo de escrita na fila já
  foi decidido e testado ao vivo (RPC `handoffs_insert`, `security definer`, gateada pelo
  segredo `HANDOFF_INSERT_SECRET`, chamada por HTTPS com a publishable key). Falta só o
  runtime real chamar esse mesmo caminho com telefone de WhatsApp de verdade, e tratar
  idempotência.
- **[036](036-freio-de-mao-global.md)** — o freio de mão global tem requisito registrado
  (mecanismo rápido, acionável pelas consultoras via plataforma) mas o **ponto de integração
  no código depende de onde o agente roda**.
- **[038](038-estrategia-de-rollout.md)** — o fallback "agente caiu" depende de um *watchdog*
  externo que avisa o dono por SMS/Telegram; "mecanismo concreto depende da stack de runtime"
  (pendência registrada no próprio 038). O gate de entrada do piloto também lista "runtime
  hospedado num lugar estável" como item 7, hoje sem dono.

### O que já está decidido e não volta a debate aqui

- **Sem parceiro Meta, sem número novo** — self-hosted (Baileys/Evolution API) como
  dispositivo adicional no número atual da loja ([016](016-escolher-parceiro-meta.md)). O
  teste de não-banimento é o [027](027-testar-self-hosted-no-numero-atual.md), ainda não
  rodado — depende de ação física do dono (chip de teste), não deste ticket.
- **Sem ffmpeg / binário nativo por causa de áudio** — o ticket
  [018](018-validar-contrato-do-llm.md) confirmou que o OGG/Opus do WhatsApp entra inline no
  Gemini sem transcodificar. Isso reabre serverless como opção pelo lado do áudio; o que
  ainda pesa contra é o processo longo que o Baileys exige (conexão WebSocket persistente).
- **A fila já mora no Supabase de produção** ([035](035-plataforma-central-das-consultoras.md)/
  [037](037-construir-plataforma-consultoras-v1.md), implantada no Railway). O runtime escreve
  nela via RPC, não é dono do dado.

### O que este grilling precisa decidir

1. **Onde o processo do agente roda.** Precisa de processo longo-vivo por causa do Baileys
   (conexão WebSocket com o WhatsApp) — isso descarta serverless "puro" (funções que dormem
   entre chamadas) ou exige um componente sempre-ligado separado do resto. Candidatos a pesar:
   o mesmo Railway que já hospeda a plataforma das consultoras (menos uma conta nova, um
   único lugar para o dono olhar) vs. outra hospedagem.
2. **Persistência de conversa entre reinícios.** Se o processo cai e sobe de novo no meio de
   uma qualificação, o que sobrevive — o estado da sessão do Baileys (credenciais do
   WhatsApp, para não precisar re-parear o QR code a cada deploy) e o estado da conversa em
   andamento (o que já foi qualificado, para não repetir perguntas ao cliente).
3. **Como o watchdog do 038 observa e dispara.** O fallback "agente caiu" precisa de algo
   externo ao processo do agente (senão um processo morto não avisa que morreu). Health check
   por HTTP, heartbeat numa tabela do Supabase, ou o próprio Railway como avisa de crash —
   e como isso vira SMS/Telegram para o dono.
4. **Onde o freio de mão (036) se integra.** Se o mecanismo for uma flag lida do Supabase a
   cada mensagem (candidato natural, já que o Supabase já é o stack), este ticket confirma o
   ponto de leitura no runtime — não redesenha o mecanismo, que é escopo do 036.
5. **Segredos em produção.** O 015 deixou "onde as credenciais moram em produção" condicionado
   a esta decisão — variáveis de ambiente da plataforma escolhida, ou outro cofre.
6. **Deploy e rollback do próprio runtime.** Como uma mudança no prompt/código vai ao ar sem
   derrubar conversas em andamento; como voltar a uma versão anterior se uma mudança piorar o
   agente (distinto do freio de mão, que desliga sem trocar código).

### Entradas úteis, não bloqueantes

- [016](016-escolher-parceiro-meta.md) — self-hosted no número atual, decisão já fechada.
- [018](018-validar-contrato-do-llm.md) — contrato do LLM validado, sem exigência de ffmpeg.
- [027](027-testar-self-hosted-no-numero-atual.md) — teste de não-banimento, paralelo a este
  ticket, não bloqueante.
- [031](031-implementar-escrita-do-chamado-na-fila.md) — mecanismo de escrita na fila, pronto
  para o runtime chamar.
- [036](036-freio-de-mao-global.md) — requisito do freio de mão, mecanismo em aberto.
- [037](037-construir-plataforma-consultoras-v1.md) — plataforma já no Railway; candidata
  natural a hospedar o runtime também.
- [038](038-estrategia-de-rollout.md) — watchdog do fallback "agente caiu", pendência
  registrada lá.
- `prototipo-tom-014/` — ambiente de teste descartável, mas já mostra o formato de chamada ao
  Gemini e à RPC de escalada que o runtime real vai reaproveitar.

**Resolvido quando** existir uma decisão de onde o processo roda, como sobrevive a reinício,
como o watchdog observa e avisa, onde o freio de mão se integra, onde os segredos moram em
produção e como o deploy/rollback funciona — o suficiente para abrir os tickets de construção
que 031/036/038 esperam.
