---
id: "044"
title: Construir o runtime do agente — v1
labels: [wayfinder:task]
status: open
assignee: Claude
blocked-by: []
---

> **Aberto e reivindicado na sessão de reconciliação de 2026-09-11.** O grilling do
> [042](042-stack-e-hospedagem-do-runtime.md) fechou a última névoa grande de arquitetura —
> este ticket é a **construção** que ele deixou pronta para começar. Não há decisão nova aqui,
> só execução das seis respostas da `## Resolução` do 042.

## Question

Juntar num processo de produção único as três peças que hoje existem **separadas e já
validadas isoladamente**, mas nunca conectadas de ponta a ponta com WhatsApp de verdade:

1. **A conversa com a Manu** — `prototipo-tom-014/` (system prompt, chamada ao
   `gemini-3.6-flash`, sinal `[[ESCALAR: trigger=X; nome=Y; motivo=Z]]`). Testado ao vivo,
   mas roda hoje num chat de navegador descartável, não no WhatsApp.
2. **A escrita na fila** — [031](031-implementar-escrita-do-chamado-na-fila.md):
   `handoff-writer.mjs` chamando a RPC `public.handoffs_insert` (security definer, gateada
   pelo segredo `HANDOFF_INSERT_SECRET`). Testado ao vivo duas vezes a partir do protótipo —
   falta só quem chama ela ser o runtime real, com telefone de WhatsApp de verdade em vez do
   placeholder de teste.
3. **A conexão com o WhatsApp** — `whatsapp-self-hosted-test/index.js` (Baileys), hoje um
   harness de teste para o [027](027-testar-self-hosted-no-numero-atual.md), não o runtime.
   Tem a lógica de pareamento e de escuta de mensagens que o runtime real vai reaproveitar
   como ponto de partida — mas falta responder mensagens (só escuta).

### O que este ticket constrói, seguindo a `## Resolução` do 042 item a item

- **Novo serviço no projeto Railway** que já hospeda `plataforma-consultoras` (mesmo projeto,
  processo único: WhatsApp + qualificação + Gemini no mesmo container).
- **Adapter de auth state do Baileys → Supabase**, substituindo `useMultiFileAuthState`
  (que grava em disco). Não existe pacote oficial — é um adapter fino próprio, salvando as
  chaves de sessão Signal a cada troca. Sem isso, todo redeploy re-pede o QR code.
- **Estado da conversa em andamento por cliente, também no Supabase** — não em memória do
  processo, para sobreviver a um restart no meio de uma qualificação.
- **Portar a lógica de conversa do `prototipo-tom-014/`** para um módulo de produção:
  mensagem chega via Baileys (o telefone do cliente já vem nativo, sem placeholder) → contexto
  da conversa carregado do Supabase → chamada ao Gemini → resposta enviada de volta via
  Baileys. O `system-prompt.md` e o formato do sinal `[[ESCALAR:...]]` não mudam.
- **Suporte a áudio de entrada** (achado em 2026-09-12, fora do escopo original deste
  ticket — não era esquecimento consciente): o runtime provisório (`agente-runtime/`) não
  tratava `audioMessage`, só texto — mensagens de voz do cliente eram descartadas em
  silêncio, contrariando o comportamento já fechado no [014](014-como-o-agente-soa.md)
  ("entende o áudio do cliente e devolve o entendimento por escrito"). Corrigido diretamente
  no provisório: baixa o buffer via `downloadMediaMessage` (Baileys) e manda como `inlineData`
  pro Gemini, mesmo padrão já validado no [018](018-validar-contrato-do-llm.md) (OGG/Opus
  aceito sem transcodificar) e já usado manualmente no `prototipo-tom-014/run.mjs`. A versão
  definitiva deste ticket precisa portar esse suporte também — não é só texto que vira
  `contents` do Gemini, é texto **e** anexo de áudio por turno do histórico.
- **Ligar a chamada real ao `handoffs_insert`** com o telefone de WhatsApp de verdade, e
  **tratar idempotência** (não escalar duas vezes o mesmo atendimento se a mensagem de
  gatilho for reprocessada) — a lacuna que o 031 deixou registrada.
- **Endpoint `/health`** para o watchdog externo (UptimeRobot/Better Stack, escolha de
  ferramenta fica livre — decisão do 042 foi só a categoria).
- **Assinatura Realtime numa tabela de flag do Supabase**, para o freio de mão
  ([036](036-freio-de-mao-global.md)) — este ticket só liga o ponto de leitura; o esquema da
  tabela e a UI de acionar/religar são escopo do 036, que segue bloqueado até ambos existirem.
- **Variáveis de ambiente do serviço Railway do runtime** (`GEMINI_API_KEY`,
  `HANDOFF_INSERT_SECRET`, credenciais do Supabase) — isoladas do serviço da plataforma.
- **Deploy via GitHub (push-to-deploy) já configurado no Railway** — só apontar o serviço
  novo para este repositório; rollback de um clique é nativo, nada a construir.

## Fora do escopo deste ticket

- **Ir ao ar no número real da loja** — depende do resultado do
  [027](027-testar-self-hosted-no-numero-atual.md) (ação física do dono, em andamento em
  paralelo). Este ticket pode ser construído e testado contra o mesmo número/chip de teste que
  o 027 está validando, ou contra o harness sem WhatsApp real (como o 031 foi testado, via
  chat), sem esperar o resultado do 027 para existir código.
- **O mecanismo do freio de mão em si** (esquema da tabela, UI) — escopo do
  [036](036-freio-de-mao-global.md).
- **O watchdog em si** (escolher UptimeRobot vs. Better Stack, configurar o alerta) — decisão
  de ferramenta, pode ficar para quem constrói, não é gate deste ticket.

## Depende de

- Nada bloqueante — o [042](042-stack-e-hospedagem-do-runtime.md) fechou todas as decisões de
  arquitetura que faltavam. Pode ser puxado imediatamente.

**Resolvido quando** o processo estiver rodando no Railway, uma mensagem mandada para o número
de teste (do 027, quando disponível) ou simulada (enquanto 027 não conclui) chegar, a Manu
responder usando o Gemini, uma escalada gerar um chamado real na fila da plataforma com o
telefone certo, e o `/health` responder — fechando (ou deixando prontos para fechar) 031 e o
item 7 do gate de entrada do [038](038-estrategia-de-rollout.md).
