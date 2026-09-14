---
id: "042"
title: Stack e hospedagem do runtime do agente
labels: [wayfinder:grilling]
status: closed
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

---

## Resolução (2026-09-11)

Grilling com o dono, 2 rodadas (6 perguntas — uma por item do ticket). O dono concordou com
todas as recomendações. Pesquisa de fatos despachada em subagente antes da rodada 2 (Railway:
modelo always-on, Volumes, restart policy, webhooks, healthcheck; Baileys: adapters de auth
state) — fontes citadas abaixo.

### 1. Onde o processo roda

**Um serviço novo no mesmo projeto Railway** que já hospeda a plataforma das consultoras
([037](037-construir-plataforma-consultoras-v1.md)) — sem conta nova, um único lugar para o
dono olhar. **Processo único** (conexão com o WhatsApp via Baileys + qualificação + chamada
ao Gemini no mesmo processo) — separar em serviços cedo é complexidade sem necessidade
comprovada ainda.

Confirmado por fato: Railway roda serviços como containers **always-on** por padrão (o modo
sleep é *opt-in*, feature "Serverless"), e **WebSocket é explicitamente isento** dos limites
de timeout de request/inatividade — pode ficar aberto indefinidamente. Billing é por uso
contínuo de RAM/CPU (US$10/GB/mês, US$20/vCPU/mês), não por invocação — mais IaaS do que FaaS.
Fontes: [app-sleeping](https://docs.railway.com/reference/app-sleeping),
[specs-and-limits](https://docs.railway.com/networking/public-networking/specs-and-limits),
[pricing](https://docs.railway.com/reference/pricing).

### 2. Persistência de conversa entre reinícios

**Supabase guarda os dois estados que precisam sobreviver a um restart:** a sessão do
WhatsApp (credenciais do pareamento por QR code — sem isso, re-parear a cada deploy seria
inaceitável em produção) e o estado da conversa em andamento (o que já foi qualificado de um
cliente). Não depende do disco do host.

**Nota de implementação, não decisão:** não existe adapter oficial de Baileys para
Postgres/Supabase — `useMultiFileAuthState` (o padrão da lib) grava em arquivos, e o próprio
README do Baileys descreve isso como "guia para escrever adapters SQL/NoSQL", não como
solução pronta pra produção; a cada mensagem trocada as chaves de sessão Signal mudam e
**precisam** ser persistidas pelo adapter, sob risco de mensagens não entregues. Existem
vários adapters comunitários (nenhum oficial, nenhum claramente "padrão") — quem implementar
vai escrever um adapter fino próprio salvando em Supabase, seguindo esse padrão. Fonte:
[Baileys README](https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/README.md).

Isso também evita a limitação de Volumes do Railway (1 por serviço, pequena janela de
downtime em redeploy mesmo com healthcheck) — confirmado que existem, mas não são o caminho
escolhido aqui. Fonte: [volumes](https://docs.railway.com/reference/volumes).

### 3. Watchdog do 038 (fallback "agente caiu")

**Uptime monitoring externo** (ex.: UptimeRobot, Better Stack — camada gratuita cobre isso)
batendo num endpoint `/health` do agente a cada 1–5 min, com **alerta SMS/Telegram direto ao
dono** configurado na própria ferramenta.

Por que não o webhook nativo do Railway (`Deployment.failed`): existe e é real, mas fala
nativamente só com Discord/Slack (exigiria ponte extra pra chegar em SMS/Telegram) e só cobre
"crashou" — não cobre um processo vivo mas travado (sem responder). O healthcheck HTTP nativo
do Railway também não serve pra isso: só atua **no momento do deploy**, para decidir se
promove a nova versão — a própria doc diz que não monitora o endpoint depois que o deploy já
está no ar. Fontes: [webhooks](https://docs.railway.com/observability/webhooks),
[healthchecks](https://docs.railway.com/deployments/healthchecks),
[restart-policy](https://docs.railway.com/deployments/restart-policy) (restart automático
após crash continua valendo, é complementar ao monitor externo, não substitui).

### 4. Onde o freio de mão (036) se integra

Flag numa tabela do Supabase (ex.: `agent_settings`, linha única), lida via **Realtime** — o
processo assina a tabela e mantém a flag em memória, atualizada na hora. Preferido a polling
porque o requisito do 036 é efeito **imediato**, e o processo já mantém uma conexão
persistente mesmo (WebSocket do Baileys) — mais uma assinatura Realtime não é custo extra
relevante. Este ticket só confirma o ponto de integração; o desenho do mecanismo em si
continua escopo do 036.

### 5. Segredos em produção

Variáveis de ambiente do próprio serviço Railway do runtime (aba "Variables"), **isoladas**
do serviço da plataforma das consultoras — cada serviço Railway tem seu próprio conjunto.
Cobre `GEMINI_API_KEY`, `HANDOFF_INSERT_SECRET`, credenciais do Supabase. Responde a
pendência que o [015](015-rotacao-das-credenciais.md) tinha deixado em aberto ("onde as
credenciais moram em produção, condicionado à stack de runtime").

### 6. Deploy e rollback

**Push-to-deploy via GitHub** (com "Wait for CI"), **rollback de um clique** que restaura
imagem + variáveis de ambiente do deploy anterior — nativo do Railway, sem construir nada.
Fontes: [github-autodeploys](https://docs.railway.com/deployments/github-autodeploys),
[deployment-actions](https://docs.railway.com/deployments/deployment-actions).

Como a sessão do WhatsApp e o estado da conversa já vivem no Supabase (item 2), um redeploy
derruba o WebSocket e o container novo reconecta sozinho, sem re-parear QR code — mas existe
uma **janela curta (segundos)** em que uma mensagem que chegue durante a troca só é respondida
com atraso. **Aceito como risco residual** — mesmo espírito de "risco mitigável, não zero" já
aceito pro banimento do número ([016](016-escolher-parceiro-meta.md)); mensagem atrasada, não
perdida (o WhatsApp reentrega do lado do cliente). Resolver isso de verdade (fila de
mensagens) é complexidade desproporcional ao estágio do projeto — fica registrado, não
construído agora.

### Itens não confirmados na pesquisa (registrados, não bloqueiam a decisão)

- Integração nativa de webhook Railway por e-mail (só Discord e Slack confirmados) — sem
  efeito aqui, já que o watchdog escolhido (item 3) não depende dela.
- Maturidade de adapters comunitários específicos de Baileys↔Postgres/Supabase — não muda a
  decisão (Supabase é o alvo, o adapter é implementação), mas quem construir 031/o runtime
  deve avaliar na hora, não assumir que um pacote pronto serve sem revisão.

### Efeito em cadeia

- **[031](031-implementar-escrita-do-chamado-na-fila.md)** — ganha o lugar onde a chamada de
  escrita mora (o serviço Railway do runtime) e o padrão de segredo (env var do serviço, não
  `.env` de dev). Continua aberto — falta o runtime existir de fato.
- **[036](036-freio-de-mao-global.md)** — ganha o ponto de integração (Realtime numa tabela do
  Supabase, lida pelo processo do runtime). O mecanismo em si (esquema da tabela, UI na
  plataforma) continua escopo do 036.
- **[038](038-estrategia-de-rollout.md)** — a pendência "watchdog + canal de push depende da
  stack de runtime" fica resolvida: uptime monitoring externo + SMS/Telegram. O item 7 do gate
  de entrada ("runtime hospedado num lugar estável") passa a ter resposta concreta (Railway).
- **[015](015-rotacao-das-credenciais.md)** — a pendência "onde as credenciais moram em
  produção" fica resolvida (item 5 acima), sem reabrir o ticket.
- **Mapa** — sai de "Not yet specified"; a última névoa grande de arquitetura do projeto está
  fechada. O que resta como névoa de verdade é conteúdo (lógica de qualificação, 010) e
  processo (rollout, 038), não mais infraestrutura.
