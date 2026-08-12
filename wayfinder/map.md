---
labels: [wayfinder:map]
title: Agente de WhatsApp da Lais Casa
---

# Agente de WhatsApp da Lais Casa

## Destination

Um agente de WhatsApp **em produção** atendendo clientes reais da Lais Casa: recebe o
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

**O negócio.** Lais Casa — loja de decoração e mobiliário (vasos, bandejas, taças,
móveis). Ticket de R$ 2.000 a R$ 50.000. Dois públicos distintos: **consumidor final** e
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
  que anula o desconto dela. Modelo pinado `gemini-3-flash-preview`, sempre com raciocínio em
  `low`. Custo não é a variável decisiva — a diferença é de ~R$ 90/mês. **Correção
  2026-08-12** (ver [ticket 017](tickets/017-provedor-de-llm-e-billing.md)): esse modelo foi
  aposentado pela Google em 2026-07-15; substituto é `gemini-3.6-flash`, com custo bem maior
  (~R$650–780/mês no mesmo volume).

- [Como funciona o atendimento da Lais Casa hoje, ponta a ponta](tickets/009-como-funciona-o-atendimento-hoje.md)
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
  era da Lais Casa. `DROP SCHEMA app CASCADE` e os dois `DROP ROLE` confirmados — banco em
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
- [Escolher o modelo Gemini certo para a solução](tickets/030-escolher-modelo-gemini-ideal.md)
  — comparação real entre os candidatos vivos da API nativa da Google recomenda **trocar
  `gemini-3.6-flash` por `gemini-3.5-flash-lite`**: aceita áudio/imagem (incl. HEIC),
  function calling e `thinkingLevel` `low`/`high` confirmados, ~75% mais barato (~R$87 vs.
  ~R$353/mês em 500 atendimentos). `gemini-3.1-pro-preview` tem function calling nativo na
  Google (a limitação era só do wrapper kie.ai). Troca ainda **não aplicada** em
  `.env.example`/ticket 017 — fica para sessão de acompanhamento.

## Not yet specified

Névoa em escopo, ainda sem nitidez para virar ticket:

- **Desenho do mecanismo de aprendizado.** Que forma exatamente a "base de treinamento"
  toma — prompt que evolui, recuperação de casos parecidos, memória por cliente,
  fine-tune? Só fica nítido depois de existir um sinal de sucesso definido e de eu ver
  conversas reais.
- **Modelo de dados no Supabase.** Esquema de clientes, conversas, produtos e aprendizado.
  Depende de saber que campos a qualificação extrai e como o catálogo é representado.
- **Stack e hospedagem do runtime.** Onde o agente roda, como recebe webhook, como
  sobrevive a reinício no meio de uma conversa. Já se sabe uma restrição: se o áudio OGG/Opus
  do WhatsApp precisar de transcodificação, o ambiente terá de suportar binário nativo
  (ffmpeg) — o que elimina boa parte das opções serverless. Depende de
  [Validar empiricamente o contrato do LLM](tickets/018-validar-contrato-do-llm.md).
- **Fluxo do arquiteto.** O agente recebe uma planilha com dezenas de itens — o que ele faz
  com ela é um segundo fluxo inteiro, não uma variação do primeiro.
- **Superfície para as consultoras.** Como elas veem, corrigem e assumem uma conversa do
  agente; como marcam que uma venda aconteceu.
- **LGPD.** Consentimento, retenção e o que pode ser guardado de conversa de cliente.
- **Estratégia de rollout.** Piloto com uma consultora, horário limitado, fallback quando
  o agente falha.
- **Migração da planilha compartilhada.** Se os clientes saem da planilha para o Supabase,
  ou se os dois coexistem.

## Out of scope

- **Fase 2 do agente** — venda direta, negociação e dúvidas complexas. É a evolução
  declarada do agente, mas depois deste destino; volta como mapa novo.
- **Gestão de estoque de verdade.** A loja não tem e este mapa não vai construir.
- **Substituir o Maino ou a planilha compartilhada.** O agente convive com eles.
