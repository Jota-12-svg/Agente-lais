---
labels: [wayfinder:map]
title: Agente de WhatsApp da Lais Aliski Casa
---

# Agente de WhatsApp da Lais Aliski Casa

## Destination

Um agente de WhatsApp **em produção** atendendo clientes reais da Lais Aliski Casa: recebe o
contato novo, faz a qualificação inicial (extrai os dados que a consultora precisa),
responde dúvidas sobre o negócio e sobre produtos que ele conhece, e **escala para uma
consultora** quando a conversa exige julgamento humano — tudo no tom que as consultoras já
usam hoje. Agendar visita entra **se, e só se**, a agenda das consultoras se mostrar
confiável; caso contrário o agente registra a intenção e escala.

Junto com ele, em produção, o **laço de aprendizado**: cada atendimento gera registro de
resultado (venda, reunião agendada, satisfação/insatisfação, fracasso) que alimenta uma
base a partir da qual o agente refina o atendimento seguinte.

O mapa termina com isso **rodando**, não com uma spec.

## Notes

**Este mapa carrega execução, não só decisão.** É um override explícito do padrão do
wayfinder: o destino é o agente funcionando, então tickets de construção são legítimos
aqui — mas só entram depois que a decisão que os governa estiver fechada.

**Projeto limpo.** O `.env` deste repositório é tratado como **cofre de credenciais e nada
mais** (Supabase `ewxmjbvaolfiafhghxbn` / us-east-1, Postgres, Gemini via kie.ai). Toda a
arquitetura, parâmetros, numeração de decisões e a ideia de plataforma multi-loja que
estavam escritos nos comentários do `.env` e do `.env.example` pertencem a um projeto
anterior e foram **descartados por decisão do usuário**. Não são fonte, não são
precedente, não voltam pela porta dos fundos. Dados no Supabase do projeto anterior devem
ser apagados.

**O negócio.** Lais Aliski Casa — loja de decoração e mobiliário (vasos, bandejas, taças,
móveis). Dona: **Lais Aliski**, que **não faz atendimento**; quem atende são **três
consultoras** — Pamella, Gabriela (Gabi), Joslaine — em rodízio puro (fatos confirmados na
grelha do 014, 2026-09-02, propagados à trunk em 2026-09-11 — detalhe em `CONTEXT.md` → "A
loja"). Ticket de R$ 2.000 a R$ 50.000. Dois públicos distintos: **consumidor final** e
**arquiteto**, que manda uma planilha com uma lista de itens desejados. Três sistemas em
uso: **WhatsApp Business** (no celular de todas as consultoras), **Maino** (cotação e nota
fiscal) e uma **planilha compartilhada** (uma aba por consultora com os clientes dela,
mais uma aba de datas importantes tipo aniversários).

**Restrições duras**, a respeitar em toda decisão:

- **Não existe controle de estoque.** O que está à vista na loja é o estoque, conferido a
  olho pelas consultoras. O agente não pode afirmar disponibilidade de produto.
- **O tom das consultoras não muda.** O agente se adapta ao atendimento que já existe; o
  atendimento não se adapta ao agente.
- **Fase 1 é só qualificação.** Enquanto não estiver treinado, o agente coleta dados e
  escala. Não vende, não negocia, não resolve dúvida complexa.

**Vocabulário do domínio:** [`CONTEXT.md`](../CONTEXT.md) na raiz do repositório. É a
linguagem única do projeto — vale para tickets, código e schema. Leia antes de nomear
qualquer coisa.

**Escalar é o produto, não o plano B.** Conferir disponibilidade é ato físico: a informação
não existe até uma consultora andar pela loja e olhar. Boa parte dos atendimentos termina
numa consultora **por definição do negócio**, não por falha do agente. Medir o agente por
"conversas resolvidas sozinho" seria medir a coisa errada.

**Skills a consultar em toda sessão:** `/grilling` e `/domain-modeling`. Em tickets de
prototipagem, `/prototype`. Em tickets de research, `/research` como subagente.

**Idioma:** português, em tudo — tickets, resoluções e handover.

## Decisions so far

<!-- índice: uma linha por ticket fechado -->

- [Inicializar o repositório e proteger os segredos](tickets/001-repositorio-e-protecao-dos-segredos.md)
  — repositório em `main` no GitHub (`Jota-12-svg/Agente-lais`), `.env` fora do histórico
  desde antes do primeiro commit, `.env.example` reescrito do zero e `CLAUDE.md` com as
  convenções de trabalho e de git. A rotação das credenciais ficou para depois da limpeza do
  Supabase.
- [Como levar o agente ao WhatsApp sem tirar o Business das consultoras](tickets/005-caminho-de-integracao-com-o-whatsapp.md)
  — **Coexistence** via parceiro oficial da Meta: o mesmo número fica no app das consultoras
  e na Cloud API ao mesmo tempo, com histórico e contatos preservados. A premissa de
  exclusividade que originou o ticket estava errada. Custo da fase 1 é praticamente zero
  (agente reativo vive dentro da janela de 24h, onde mensagem fora de template é grátis).
  Provedores não-oficiais descartados por risco de banimento do número.
- [O que a integração com Google Calendar exige](tickets/006-integracao-com-google-calendar.md)
  — recomendação **condicional**: com Workspace, conta de serviço com delegação de domínio;
  com Gmail comum, compartilhamento `freeBusyReader` para uma conta única do projeto. OAuth
  individual descartado (token expira em 7 dias sem verificação). Se as consultoras não
  usarem agenda no Google, não construir integração na fase 1 — grade fixa mais confirmação
  humana. Reserva de horário é sempre nossa: a API não tem hold.
- [O Maino tem API? O que dá para ler de lá](tickets/007-maino-tem-api.md)
  — tem, e resolve duas coisas: `GET /produtos` entrega catálogo com preço, dimensão e
  imagem (fonte do conhecimento de produto do agente), e `GET /notas_fiscais_emitidas`
  entrega a venda concretizada (sinal objetivo para o aprendizado, por polling). Os campos
  de estoque da API não valem nada aqui e não mudam a regra de não afirmar disponibilidade.
- [Contrato real da API do Gemini via kie.ai](tickets/008-contrato-da-api-do-gemini.md)
  — function calling existe na kie.ai (o medo estrutural não se confirmou), **mas a
  recomendação é ir direto à Gemini API da Google, tier pago**, por LGPD (o tier pago não
  treina com os dados; a kie.ai não tem DPA) e por cache de contexto, que a kie.ai não tem e
  que anula o desconto dela. Modelo `gemini-3-flash`, sempre com raciocínio em `low`. Custo
  não é a variável decisiva — a diferença é de ~R$ 90/mês.

- [Como funciona o atendimento da Lais Aliski Casa hoje, ponta a ponta](tickets/009-como-funciona-o-atendimento-hoje.md)
  — o fluxo real está descrito e o vocabulário do domínio virou [`CONTEXT.md`](../CONTEXT.md).
  Quatro pessoas num número compartilhado, **rodízio** para contato novo e cliente que volta
  furando a fila. Agente **24/7** com a loja em horário comercial, prometendo **a loja e nunca
  a pessoa**. **Só consumidor final** na fase 1 — planilha e lista longa escalam na hora, e na
  dúvida escala, porque o erro barato é escalar demais. Transparência com nome próprio, sem
  fingir ser gente e sem se anunciar robô. Agendamento **condicional** à agenda ser confiável,
  o que resolve a contradição que o destino carregava. Abriu os tickets 019, 020 e 021.
- [Inventariar e limpar o projeto Supabase](tickets/002-limpar-o-projeto-supabase.md) —
  reaproveitado o projeto atual (`ewxmjbvaolfiafhghxbn`), em vez de criar um novo: o resíduo
  do projeto anterior era pequeno e nomeado (schema `app`, dois papéis de login). Nenhum dado
  era da Lais Aliski Casa. `DROP SCHEMA app CASCADE` e os dois `DROP ROLE` confirmados — banco em
  estado virgem. Desbloqueou a rotação das credenciais (015).
- [Escolher o parceiro Meta para o onboarding do WhatsApp](tickets/016-escolher-parceiro-meta.md)
  — **reverte a recomendação de Coexistence do ticket 005.** O parceiro mais barato viável
  (~R$300/mês) foi considerado inviável para o orçamento da loja. Depois de seis researches
  (custo dos parceiros; "6 dispositivos" da loja não são Coexistence; caminho sem parceiro;
  arquitetura self-hosted; número dedicado descartado por isolar o agente do ecossistema e
  exigir duas contas de WhatsApp; mecanismo real de banimento via tokens de protocolo), a
  decisão foi **agente self-hosted (Baileys/Evolution API) como dispositivo adicional no
  número atual da loja**, sem parceiro Meta, sem número novo — risco de banimento real mas
  mitigável, concentrado no número de produção, aceito conscientemente no lugar do custo.
  Abriu o ticket [027](tickets/027-testar-self-hosted-no-numero-atual.md) para validar antes
  de produção; pausou o [019](tickets/019-companion-windows-ponto-cego.md), específico do
  ponto cego de Coexistence.
- [Quando e como o agente escala para uma consultora](tickets/012-quando-e-como-o-agente-escala.md)
  — **o agente não roteia, produz fila.** Ele nunca decide quem atende: lança o chamado numa
  aba nova da planilha compartilhada (marcado com a dona, se houver, mas sem trava — qualquer
  consultora pode pegar), preservando o rodízio como algo que elas controlam, não o agente.
  Gatilhos automáticos: compra concreta, planilha de arquiteto, pedido de pessoa, irritação,
  negociação de preço; disponibilidade **não** escala sozinha (resposta padrão primeiro). O
  agente anuncia a passagem sem nome; quem se identifica é a consultora. Handoff é definitivo,
  com janela curta de retomada cujo número fica para o [013](tickets/013-sinal-de-sucesso-do-aprendizado.md).
  Freio de mão adiado para o [027](tickets/027-testar-self-hosted-no-numero-atual.md), mesma
  pergunta técnica. Abriu o [029](tickets/029-canal-de-notificacao-da-fila.md) (canal de
  notificação, não pode ser WhatsApp ativo).
- [Conseguir a exportação das conversas das consultoras](tickets/003-exportacao-das-conversas-das-consultoras.md)
  — **a exportação não foi viável.** Fechado com um substituto, por decisão do dono do projeto:
  a análise que ele mesmo fez de como as consultoras respondem, alimentada nas sessões de
  grilling (010, 013) e no protótipo (014). Troca deliberada de fidelidade (sem corpus real
  para o 014 comparar linha a linha, nem material bruto para o laço de aprendizado calibrar)
  por desbloqueio. Mitigado em parte pela planilha de clientes do ticket 004, já acessível.
  Se as conversas aparecerem depois, revisar 010/013/014 contra elas.
- [O que é um lead qualificado e que dados o agente extrai](tickets/010-o-que-e-um-lead-qualificado.md)
  — **o agente não é formulário: é atendente que entrega valor aos dois lados.** Campos:
  núcleo (nome, o que procura, para quando, modo do atendimento) + oportunistas (orçamento,
  origem, e-mail, intenção de visita) + lookup automático de "já é cliente" pela planilha.
  **Nada é obrigatório a ponto de barrar um contato**; cada campo oportunista é tentado uma
  vez, encaixado na conversa. Quatro regras de condução (responde o cliente primeiro, sem
  pergunta isolada, uma leva curta por vez, na dúvida escala); a redação fica para o 014.
  Arquiteto → escala imediata sem coletar nada. Cliente conhecido → qualificação leve, escala
  para a dona. **Destino dos dados:** Supabase é a memória interna do agente (todo atendimento,
  inclusive os que esfriam) — as consultoras não mexem nele; o chamado escalado vira um
  **relance** na fila do 012 (telefone, nome, o que quer, para quando, orçamento, novo/cliente,
  horário, gatilho), nunca a conversa inteira (essa fica no próprio WhatsApp); o agente jamais
  escreve nas abas das consultoras. Vocabulário: `Atendimento qualificado` no `CONTEXT.md`.
  **Addendum 2026-09-01** (grilling, após o 004): o lookup por telefone não alcança consumidor
  final — vira match best-effort contra o diretório de arquitetos (sinal de classificação, não
  "já é cliente"). "Cliente conhecido → escala para a dona" cai para consumidor final: fase 1
  trata todo consumidor final como contato novo (rodízio); reconhecer cliente pré-agente é da
  consultora. A pergunta do modo passa a ser deliberada — turno 1 sempre, as duas categorias
  (casa própria / arquiteto) nomeadas explicitamente.
- [Canal de notificação da fila de chamados](tickets/029-canal-de-notificacao-da-fila.md) —
  **e-mail via Apps Script, disparado por trigger de tempo (time-driven, até 1x/minuto)**, não
  pelas Notificações nativas do Sheets nem por `onEdit`/`onChange`: a documentação oficial do
  Apps Script confirma que gravação via API (como o agente vai escrever o chamado, via Sheets
  API v4) não dispara esses eventos, e nada garante que as Notificações nativas se comportem
  diferente. O time-driven trigger contorna o problema por completo, lendo o estado da planilha
  a cada execução — custo zero dentro das quotas oficiais, latência de até 1 minuto. SMS, apps de
  terceiro (Zapier/Make) e sinal físico na loja descartados por escrito. **Atualização 2026-09-02
  (035):** o **enunciado** vale — avisar sem WhatsApp ativo, e a lacuna "o celular avisa quando
  chega e-mail?" continua de pé —, mas a **conclusão cai**: a fila saiu da planilha, então Apps
  Script varrendo Sheet não se aplica; a notificação passa a ser Database Webhook do Supabase no
  `INSERT` → Edge Function → e-mail. Abriu o
  [031](tickets/031-implementar-escrita-do-chamado-na-fila.md) (a metade do lado do agente —
  escrever o chamado na fila) e o [030](tickets/030-implementar-notificacao-da-fila.md) (fechado
  em 2026-09-02, absorvido pelo 037).

- [Inspecionar a planilha de carteira/mailing de clientes](tickets/004-acesso-a-planilha-e-ao-catalogo.md)
  — **o ticket 004 foi dividido**: a planilha foi inspecionada e fechou aqui; catálogo do Mainô
  e planilhas de arquiteto foram para o [032](tickets/032-catalogo-do-maino-e-planilha-de-arquiteto.md).
  `CARTEIRA+MAILLING.xlsx` é, na maior parte, **diretório de arquitetos + mailing + registro de
  relacionamento**, não um CRM de consumidor final. 8 abas; formato **não uniforme** entre as
  consultoras (só 3 abas de consultora, nenhuma para a 4ª pessoa); sem aba isolada de datas
  importantes. **O "lookup por telefone: já é cliente?" do ticket 010 não se sustenta para
  consumidor final** — onde há telefone confiável são arquitetos (serve como sinal de
  classificação, não de "já é cliente"). Dono confirmou: é a planilha viva (cópia local; acesso
  ao Google Sheets vem no setup na loja) e a 4ª consultora não atende, então 3 abas está certo.
  `CONTEXT.md` corrigido. Pendências: acesso de edição à planilha (escopo do 031) e um ajuste
  na resolução do 010 (lookup "já é cliente" não alcança consumidor final). Desbloqueou 030 e 031.

- [Decidir o provedor de LLM e habilitar o billing](tickets/017-provedor-de-llm-e-billing.md)
  — **provedor confirmado, modelo re-decidido.** A `GEMINI_API_KEY` já no `.env` (formato
  `AQ.…`, o formato atual do AI Studio) foi testada: responde e devolve `serviceTier:
  "standard"` — o projeto Google por trás dela **já está no tier pago** (exigência de LGPD
  satisfeita), sem precisar criar chave nova nem vincular billing. Modelo: **`gemini-3.6-flash`**
  (o `gemini-3-flash` do 008 deixou de existir — `404` em set/2026), id fixo, sempre
  `thinking_level: "minimal"` (contrato dos modelos 3.x, não o `reasoning_effort` da era 2.5).
  Plano B a validar com ~20–30 casos reais: `gemini-3.5-flash-lite`; fallback multimodal
  pontual: `gemini-3-flash-preview`. Custo não decidiu — no volume real (~10/dia informado
  pela dona) são ~R$ 15–40/mês, diferença entre os dois modelos ~R$ 8–42/mês. Research em
  [`017-escolha-do-modelo-gemini.md`](research/017-escolha-do-modelo-gemini.md) (seções 1–10:
  escolha; 11: custeio no volume real). Desbloqueou o 018.

- [Validar empiricamente o contrato do LLM](tickets/018-validar-contrato-do-llm.md)
  — **as duas consequências arquiteturais fecharam a favor do caminho simples.** (1)
  *Function calling* funciona em HTTP cru: ciclo de três `POST`, com uma regra dura — o
  `thoughtSignature` de cada part `functionCall` tem de voltar verbatim no histórico ou é
  **HTTP 400** (parts de texto não exigem). (2) Áudio **OGG/Opus do WhatsApp entra inline
  sem transcodificar** — o runtime **não precisa de ffmpeg/binário nativo** por causa de
  áudio, some a restrição que a Névoa registrava. Também confirmado por chamada real:
  `systemInstruction`, saída estruturada (`responseSchema`), HEIC do iPhone, caching
  explícito (mínimo **1024** tokens, não 4096), `generateContent` síncrono. Campo de
  raciocínio é `generationConfig.thinkingConfig.thinkingLevel`; `minimal` custa 0 tokens de
  pensamento vs ~540 e 3× a latência no `low` — `.env` corrigido de `low` para `minimal`.
  `gemini-3.5-flash-lite` tem contrato idêntico. Fica pendente (não era escopo): teste de
  qualidade `3.6-flash × flash-lite` com conversas reais.

- [Sinal de sucesso — o que se mede e como é capturado](tickets/013-sinal-de-sucesso-do-aprendizado.md)
  — **na fase 1 o agente é medido pela qualidade da qualificação (Camada 1), não pelo desfecho de
  negócio (Camada 2)**, que acontece depois e fora do controle dele. Taxonomia de `terminal_state`
  (`escalado` / `resolvido_sem_escalada` / `esfriado` / `fora_de_escopo`) + `business_outcome`
  quando escala. Captura automática onde dá (escalada, timer de esfriamento, polling de venda no
  Mainô *best-effort*); o **julgamento da consultora** (`advisor_verdict`) é manual, é o único
  sinal que treina a qualidade do agente e o de maior peso. **`sem_venda` / `perdido` / `esfriado`
  são neutros** — de propósito, para não ensinar o agente a evitar cliente difícil. Sem rateio de
  atribuição. Satisfação nunca perguntada ao cliente na fase 1. **Número único de 3 dias** para
  "atendimento esfriado" e "janela de retomada" pós-escalada (addendum no 012). `CONTEXT.md` ganhou
  `Sinal de sucesso` e `Atendimento esfriado`. O veículo do `advisor_verdict` é o ticket
  [035](tickets/035-plataforma-central-das-consultoras.md). Fechado numa branch paralela e
  integrado à trunk na reconciliação de 2026-09-02.

- [Plataforma central das consultoras — substrato da fila e desfecho](tickets/035-plataforma-central-das-consultoras.md)
  — **uma tela web única sobre o Supabase** onde a consultora vê a fila de chamados do agente,
  **assume**, **fecha** e registra `business_outcome` + `advisor_verdict` (o veredito do 013).
  Vite + framework leve, mobile-first, **sem backend de aplicação** (fala direto com o Supabase
  via RLS); login **Google** com allow-list de 4 e-mails; Realtime para a fila ao vivo.
  Notificação **só por e-mail** (Database Webhook no `INSERT` → Edge Function → Resend) — SMS
  fica como adição futura; risco de proeminência do e-mail registrado, pergunta 34 no 020.
  Sinal secundário: o agente marca a conversa como **não lida** no WhatsApp ao escalar (a
  validar no 027). Esquema da tabela `handoffs` fixado (fila ≠ memória do agente); chamado
  fechado **some da fila**, fica arquivado. Dado de cliente protegido por RLS; purga fica para
  a decisão de LGPD. **Construção espera o runtime do agente.** Fecha o 029 na conclusão,
  fecha o [030](tickets/030-implementar-notificacao-da-fila.md) (absorvido), reenquadra o
  [031](tickets/031-implementar-escrita-do-chamado-na-fila.md) (alvo → Supabase), abre o
  [037](tickets/037-construir-plataforma-consultoras-v1.md) (build). `CONTEXT.md` ganhou
  `Chamado` e `Plataforma das consultoras`.

- [Perguntas a levar às consultoras](tickets/020-perguntas-para-as-consultoras.md) —
  **fechado sem nova rodada**, por decisão do dono: não haverá informação adicional por este
  canal. O Levantamento 1 (2026-08-11) segue como está, já distribuído aos tickets de
  origem. Ficam sem resposta e sem previsão: 18b (agenda), 25/32 (exemplos, perderam peso
  depois do 013), 31. A pergunta 34 (celular avisa e-mail?) segue como risco em aberto do 037,
  registrado à parte, sem reabrir o ticket.
- [Obter o catálogo do Mainô e exemplos de planilha de arquiteto](tickets/032-catalogo-do-maino-e-planilha-de-arquiteto.md)
  — **fechado sem buscar os dois materiais.** O sinal de sucesso já vem do `advisor_verdict`
  na plataforma das consultoras (013/035/037), que rebaixou a venda no Mainô a reforço
  best-effort — não vale mais o esforço de integrar o catálogo. Arquiteto já escala sem
  coleta (010), então a planilha de arquiteto também deixa de ser necessária. **Derruba a
  premissa do 011** (conhecimento de produto viria do catálogo do Maino) e o desbloqueia —
  mas a pergunta de origem do conhecimento de produto segue sem resposta.
- [Como o agente soa — protótipo de atendimento no tom das consultoras](tickets/014-como-o-agente-soa.md)
  — **fechado em 2026-09-11**, reconciliando uma branch paralela parada desde 2026-09-02.
  Nome do agente: **Manu**. Especificação de tom v1 + sete transcrições, todas as sete
  perguntas de tom respondidas pelo dono (preço nunca, áudio nunca, 1–3 min de atraso, emoji
  como proposto, sempre "você", sempre se apresenta) — nenhuma mudou a proposta original.
  Ambiente de teste ao vivo em `prototipo-tom-014/`. A correção de nome e contexto da loja
  (Lais Aliski Casa, dona Lais Aliski, três consultoras nomeadas) veio junto e está em
  `CONTEXT.md` → "A loja". Abriu o [039](tickets/039-laco-de-contexto-do-agente.md) (laço de
  contexto, refinamento não urgente); desbloqueou o 034.
- [Manual do agente para as consultoras — que forma toma](tickets/033-manual-do-agente-para-as-consultoras.md)
  — **grilling da forma, não da redação.** Um documento só, duas partes: **A "O que o agente
  faz"** (estável) e **B "No dia a dia"** (operacional, com data no cabeçalho). Público: as 3
  consultoras que atendem + a dona, registro de referência consultável. Fonte markdown no
  repo, entregue como Google Doc. Tom concreto, segunda pessoa, sem jargão, com prints reais
  do 014. Pede **quatro coisas** à consultora (assumir da fila; marcar desfecho + veredito;
  avisar erro; responder pelo WhatsApp de sempre), abrindo pelo que o agente faz por elas.
  Seção própria para o **freio de mão** (kill switch do 036) como feature que a consultora
  aciona — o que **fecha "quem aciona" do 036** incluindo as consultoras. Dono do manual:
  João Victor. Entrega: Parte A antes do piloto + demo ao vivo; Parte B no arranque do
  piloto. Abriu o [034](tickets/034-redigir-o-manual-do-agente.md) (redação), bloqueado por
  011, 014, 036, 037 e pela estratégia de rollout.

- [O que o agente pode afirmar sobre produto e disponibilidade](tickets/011-o-que-o-agente-pode-dizer-sobre-produto.md)
  — **ratificou, como decisão explícita, o que já estava implementado de fato no protótipo
  do 014.** Nunca preço, medida ou material/acabamento de peça específica (só
  categoria/posicionamento genérico); foto de produto nunca é reconhecida, sempre escala;
  alçada de desconto é zero; contenção de erro é o mecanismo pós-hoc do 038 (sem revisão
  antes de enviar), com um acréscimo: erro de afirmação de produto ganha **prioridade mais
  alta** dentro do canal "reportar problema" (não é canal novo). Fecha o item 4 do gate de
  entrada do 038; desbloqueia o 034 (perde "011" do `blocked-by`); deixa requisito de
  conteúdo registrado no 037 (rótulo de prioridade no "reportar problema").

- [Decidir a rotação das credenciais expostas](tickets/015-rotacao-das-credenciais.md) —
  **senha do banco rotacionada** (nunca tinha sido trocada desde a criação do projeto), via
  o endpoint dedicado `PATCH .../database/password` (o genérico `database/query` recusa
  `ALTER USER` no papel `postgres`). `SUPABASE_ACCESS_TOKEN` e `GEMINI_API_KEY` mantidos —
  já limpos (o primeiro rotacionado em 08/2026 após exposição em chat; o segundo confirmado
  pelo dono como criado manualmente e funcionando). `KIE_API_KEY` removido — a kie.ai nunca
  saiu do papel de fallback não usado (addendum no 008). `AGENT_DB_PASSWORD`/
  `DATABASE_URL_AGENT` e `PLATFORM_DB_PASSWORD`/`DATABASE_URL_PLATFORM` removidas do `.env`:
  apontavam para papéis que o ticket 002 já tinha derrubado, o segundo também resíduo da
  plataforma multi-loja descartada. Onde as credenciais moram em produção segue sem decisão,
  condicionado à stack de runtime (névoa). Achado incidental: o projeto Supabase pausa
  sozinho no plano free após ~1 semana sem uso.

- [Stack e hospedagem do runtime do agente](tickets/042-stack-e-hospedagem-do-runtime.md) —
  **a última névoa grande de arquitetura do mapa fechou.** Processo único (WhatsApp +
  qualificação + Gemini) num **segundo serviço no mesmo projeto Railway** da plataforma das
  consultoras — always-on por padrão, WebSocket isento dos limites de timeout do Railway.
  Sessão do WhatsApp e estado da conversa persistidos no **Supabase** (não em disco), sem
  adapter oficial de Baileys pra isso — quem implementar escreve um adapter fino. Freio de mão
  ([036](tickets/036-freio-de-mao-global.md)) integra via **Realtime** numa tabela do Supabase.
  Watchdog do fallback "agente caiu" ([038](tickets/038-estrategia-de-rollout.md)) é **uptime
  monitoring externo** (UptimeRobot/Better Stack) com alerta SMS/Telegram direto, não o
  healthcheck nativo do Railway (só atua no deploy, não monitora produção). Segredos em
  variáveis de ambiente do serviço Railway do runtime, isoladas da plataforma — resolve a
  pendência deixada pelo [015](tickets/015-rotacao-das-credenciais.md). Deploy via GitHub com
  rollback de um clique; janela curta de reconexão em cada redeploy aceita como risco
  residual, mesmo espírito do risco de banimento aceito no [016](tickets/016-escolher-parceiro-meta.md).
  Dá o lugar concreto onde a chamada de escrita do [031](tickets/031-implementar-escrita-do-chamado-na-fila.md)
  vai morar.
- [Construir a plataforma das consultoras — v1](tickets/037-construir-plataforma-consultoras-v1.md)
  — **implantada em produção e testada de ponta a ponta em 2026-09-11**, no Railway (não
  Cloudflare Pages — decisão do dono, sem domínio próprio):
  **https://plataforma-consultoras-production.up.railway.app**. Login Google (mesmo projeto do
  Gemini, modo Testing), migração `handoffs`/RLS aplicada no Supabase de produção, fluxo
  completo validado (fila → assumir → fechar com desfecho+veredito → some da fila). Dois bugs
  reais corrigidos no caminho: `skip_nonce_check` duplicada no `config.toml` e histórico de
  migração órfão do projeto anterior. **Canal de aviso por e-mail (Resend) caiu do escopo do
  v1** — decisão do dono: as consultoras não checam e-mail, o sinal real é o "não lida" do
  WhatsApp (item 6 do 027, ainda não validado); responde de quebra a pergunta 34 do 020.
  Allow-list com 2 dos 4 e-mails reais (falta o da Lais; a Pamella usa Outlook sem Conta Google
  vinculada, não entra como está). Perde "037" do `blocked-by` do 034.
- [Confirmar se a GEMINI_API_KEY é do tipo "auth" antes do prazo de setembro/2026](tickets/040-tipo-da-chave-gemini.md)
  — **é "auth", nada a trocar.** O AI Studio não mostra a coluna "Tipo de chave" que a
  documentação descreve (rollout gradual da Google); confirmado pelo caminho alternativo — o
  console do Google Cloud mostra a chave com uma **conta de serviço vinculada**
  (`ais-gemini-key-...@...iam.gserviceaccount.com`), que é a definição de chave "auth". A
  chave sobrevive ao corte de setembro/2026 sem ação. Achado à parte, sem relação com o tipo
  da chave: aviso de conta de faturamento pedindo migração para pré-pagamento — abriu o
  [041](tickets/041-billing-pre-pagamento.md).
- [Botão "Devolver ao agente" nos chamados da plataforma](tickets/045-devolver-chamado-ao-agente.md)
  — **construído em 2026-09-12, direto em cima do runtime provisório** (o dono pediu pra
  funcionar já, revertendo a decisão original de esperar o 044). Novo status
  `returned_to_agent` no enum `handoff_status`; correlação por uma coluna nova (`contact_jid`,
  jid bruto do WhatsApp) em vez de Realtime — `handoffs` carrega dado real de cliente, abrir
  `SELECT` público pra chave anônima do runtime exporia isso; em vez disso, RPC estreita
  secret-gated (`handoffs_status_for_jids`, só devolve jid+status) consultada por poll a cada
  15s. Mesmo mecanismo resolve o pedido irmão: "fechar chamado" agora reinicia o atendimento do
  zero na próxima mensagem (addendum no 012, distinto da janela de retomada de 3 dias — aquele
  é antes de fechar, este é depois). Efeito colateral do mesmo pedido: telefone resolvido
  best-effort para contato `@lid` (antes mostrava "LID:..." na plataforma).
- [Colocar a conta de faturamento do Gemini em pré-pagamento antes que o serviço pare](tickets/041-billing-pre-pagamento.md)
  — **fechado com decisão consciente de não converter agora.** A Google está migrando contas
  de pós-pagamento pra pré-pagamento (rollout de março/2026); a conta do projeto é Tier 1
  (baixo histórico de pagamento), alvo típico dessa migração — o banner "Ação necessária" já
  está ativo. Investigado antes da decisão: a troca é via de mão única, exige comprar crédito
  não reembolsável, mas **confirmado direto na tela da Google** que não afeta rate limit nem o
  `serviceTier: standard` que o 017/018 validaram pra LGPD. Risco aceito: se não converter, a
  Google avisa "interrupções no serviço" (o Gemini pode parar de responder a Manu); dono opta
  por trocar reativamente se o problema aparecer, não preventivamente.
- [Construir o runtime do agente — v1](tickets/044-construir-runtime-do-agente.md) —
  **fechado adotando o runtime provisório (`agente-runtime/`) como a v1**, em vez do build
  formal que o ticket descrevia item a item: o critério "Resolvido quando" já tinha sido
  cumprido ao vivo em produção (WhatsApp real → Gemini → chamado real na fila → `/health`),
  validado em 2026-09-11/12. Três entregas ficaram de fora de propósito — estado de conversa
  em Supabase (esbarra no esquema de `engagements`, ainda não decidido), idempotência na
  escalada, deploy via GitHub — e viraram o ticket
  [046](tickets/046-endurecer-runtime-estado-idempotencia-deploy.md). Desbloqueia o item 7 do
  gate de entrada do [038](tickets/038-estrategia-de-rollout.md); o [031](tickets/031-implementar-escrita-do-chamado-na-fila.md)
  segue aberto, agora bloqueado só pela idempotência do 046.
- [Testar a conexão self-hosted como dispositivo adicional](tickets/027-testar-self-hosted-no-numero-atual.md)
  — **testado ao vivo, os seis pontos passaram.** Desvio consciente do plano: sem chip de
  teste comprado a tempo (research 043), o dono testou no **próprio número pessoal**, WhatsApp
  comum. Pareamento sem travar no passkey, dispositivos sobreviventes, evento de companion
  confirmado, sem erro 463, sem sinal de risco em ~20min, marca de não-lida sincronizando.
  **Recomendação: viável ir para o número real da loja.** Ressalva: não replica o arranjo
  social de várias consultoras num só número. Efeito em cadeia: o dono decidiu conectar o
  número real da loja no mesmo dia, via runtime provisório (`agente-runtime/`), sem esperar o
  044 formal — ver handover de 2026-09-11/12.
- [Estratégia de rollout do agente — piloto, horário, fallback, canal de erro](tickets/038-estrategia-de-rollout.md)
  — **fechado em 2026-09-14.** Forma decidida no grilling de 2026-09-10: **24/7 com as três
  consultoras desde o dia 1** (sem "madrinha do piloto", sem horário restrito — ambos
  rejeitados pelo dono), 4 semanas de piloto com checagem obrigatória ao fim, freio de mão
  como fallback para alucinação em série, canal de aviso de erro = tela "reportar problema" na
  plataforma (admin-only) + e-mail, sem SMS. As duas últimas pontas de implementação (migration
  `problem_reports` + deploy do `advisor-platform/web`) ficaram bloqueadas o dia inteiro por um
  classificador de permissão do harness ("Protected-Scope IaC Apply"/"Permission Grant") — só
  destravou numa sessão nova (pós-`/clear`), com o dono aplicando a migration manualmente.
  Achado no fechamento: o rótulo de prioridade que o 037 exigia (erro de preço/disponibilidade
  é mais urgente) tinha ficado de fora da implementação original — corrigido antes de fechar.
  Desbloqueia o [034](tickets/034-redigir-o-manual-do-agente.md) (só falta o 036 agora).
- [Endurecer o runtime do agente — estado, idempotência e deploy automático](tickets/046-endurecer-runtime-estado-idempotencia-deploy.md)
  — **fechado em 2026-09-14**, os três itens completos e validados ao vivo. **Estado**:
  esquema `engagements` no Supabase (histórico em JSONB, uma linha por atendimento com índice
  único parcial, segredo no Vault em vez de hardcoded) — restart não perde mais conversa em
  andamento. **Idempotência**: guarda em memória (`st.status !== 'escalado'`) evita duas
  escaladas concorrentes duplicarem o chamado na fila; reforço no banco descartado — achado
  que `handoffs.engagement_id` nunca foi populado pelo `handoffs_insert`, e mexer nessa função
  (não versionada, já vazou segredo 2x) fica fora de escopo. **Deploy automático**: serviço
  `agente-runtime` do Railway ligado ao GitHub (branch `main`, raiz `/agente-runtime`) — achado
  no caminho que **`main` nunca tinha recebido PR** desde a fase de pesquisa do projeto (todo
  o trabalho real vivia só em `wayfinder/atendimento-hoje`); corrigido com o dono, PR #1
  (aberto desde 2026-08-10) squash-mergeado trazendo `main` em dia.
- **Agente liberado para clientes reais** — 2026-09-14, decisão explícita do dono. Removida
  a variável `ALLOWED_JID` do serviço `agente-runtime` em produção (Railway) e forçado um
  redeploy; log de boot confirmou `>>> Runtime conectado — Manu responde clientes reais a
  partir de agora.` e `/health` respondeu `{"status":"conectado","agentEnabled":true}`.
  Verificado antes de mexer, via `railway logs`, que o número já conectado era o **da loja**
  (não o pessoal do dono, como os handovers de 09-12 registravam — reconexão física, fora de
  qualquer sessão, nunca chegou a ser documentada em git). Feito com **dois itens do gate de
  entrada do [038](tickets/038-estrategia-de-rollout.md) ainda abertos** (item 8, extração
  estruturada da qualificação; item 9, Parte A do manual entregue + demo ao vivo) e o
  [036](tickets/036-freio-de-mao-global.md) só parcialmente comprovado (falta o teste com
  mensagem real) — decisão consciente do dono, registrada aqui e nos tickets 036/038, não
  decisão tomada por conta própria.

## Not yet specified

Névoa em escopo, ainda sem nitidez para virar ticket:

- **Desenho do mecanismo de aprendizado.** Que forma exatamente a "base de treinamento"
  toma — prompt que evolui, recuperação de casos parecidos, memória por cliente,
  fine-tune? O sinal de sucesso já foi definido (ticket 013): o alvo é a qualidade da
  qualificação, o `advisor_verdict` da consultora é o sinal de maior peso, e desfecho de
  negócio negativo é neutro. Falta a forma do mecanismo — depende de ver conversas reais e
  de a superfície do 035 existir para o `advisor_verdict` acumular.
- **Modelo de dados no Supabase — parcialmente resolvido.** O esquema da memória do agente
  (`engagements`) fechou no [046](tickets/046-endurecer-runtime-estado-idempotencia-deploy.md)
  (item 1, 2026-09-14) — ver `Decisions so far`. Falta ainda: como o catálogo de produtos é
  representado (fase 2, sem material à vista desde que o 032 fechou sem buscar planilhas
  reais); qualificação estruturada (nome/orçamento/prazo como campos, não só texto livre no
  histórico JSONB) segue como pendência aberta, item 8 do gate de entrada do
  [038](tickets/038-estrategia-de-rollout.md).
- **Fluxo do arquiteto.** O agente recebe uma planilha com dezenas de itens — o que ele faz
  com ela é um segundo fluxo inteiro, não uma variação do primeiro. Na fase 1 ele escala
  imediato, sem coleta (010); o ticket [032](tickets/032-catalogo-do-maino-e-planilha-de-arquiteto.md)
  fechou (2026-09-11) sem buscar planilhas reais, então este fluxo fica parado como fase 2,
  sem material novo à vista.
- **Superfície para as consultoras.** **Fatia v1 fechada e implantada** —
  [035](tickets/035-plataforma-central-das-consultoras.md) (desenho, 2026-09-02) e
  [037](tickets/037-construir-plataforma-consultoras-v1.md) (build + deploy, 2026-09-11):
  plataforma web única sobre o Supabase, no ar no Railway — ver a fila de chamados, assumir,
  fechar, registrar `business_outcome` + `advisor_verdict`. Login Google. **Sem notificação por
  e-mail** (caiu do escopo do v1, decisão do dono — ver 037). Só entra em uso real com dado de
  verdade quando o runtime do agente existir ([031](tickets/031-implementar-escrita-do-chamado-na-fila.md)
  escreve o chamado). **Continua na névoa:** ver e **corrigir a conversa** do agente dentro da
  plataforma, e o fluxo de "assumir uma conversa em andamento" (retomar o controle no meio).
  O caminho **inverso** (devolver um chamado assumido de volta pro agente) **saiu da névoa,
  construído** em 2026-09-12 — [045](tickets/045-devolver-chamado-ao-agente.md), não é a
  mesma névoa, mas morava na mesma superfície. Reenquadrou 029/030/031.
- **LGPD.** Consentimento, retenção e o que pode ser guardado de conversa de cliente.
- **Migração da planilha compartilhada.** Se os clientes saem da planilha para o Supabase,
  ou se os dois coexistem.

## Out of scope

- **Fase 2 do agente** — venda direta, negociação e dúvidas complexas. É a evolução
  declarada do agente, mas depois deste destino; volta como mapa novo.
- **Gestão de estoque de verdade.** A loja não tem e este mapa não vai construir.
- **Substituir o Maino ou a planilha compartilhada.** O agente convive com eles.
