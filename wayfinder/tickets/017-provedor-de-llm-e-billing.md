---
id: "017"
title: Decidir o provedor de LLM e habilitar o billing
labels: [wayfinder:task]
status: open
assignee: Claude
blocked-by: []
---

## Question

O [research do contrato do Gemini](008-contrato-da-api-do-gemini.md) recomendou **ir direto à
Gemini API da Google, no tier pago**, em vez de usar a kie.ai. A recomendação está fundamentada,
mas a execução depende de duas coisas que só o dono do projeto pode fazer ou autorizar — não
são chute a codificar.

**1. Autorizar billing na Google (AI Studio, tier pago).**

Não é opcional, e o motivo é LGPD, não performance: a tabela de preços da Google marca, linha
a linha, que o **free tier usa os dados para melhorar os produtos** e o **tier pago não usa**.
Conversa real de cliente da Lais Casa no free tier significa entregar dado pessoal para
treinamento. O free tier serve para protótipo com dado sintético, e só.

Basta uma API key do AI Studio e uma conta de cobrança vinculada — não exige projeto GCP nem
service account. O custo estimado é de ordem de **R$ 130/mês para 500 atendimentos**, e cai
bastante com cache de contexto.

**2. Decidir se conversa real de cliente pode passar pela kie.ai enquanto isso não existir.**

Leitura do research: **não**, até haver DPA ou anonimização. A kie.ai retém logs com
parâmetros de entrada por 2 meses e não publica contrato de tratamento de dados, jurisdição
nem lista de subprocessadores. Mas a decisão de aceitar ou não esse risco é do dono do
projeto, que responde por ela.

**Consequência prática de cada caminho:**

- **Billing autorizado** → Google direto desde o começo; a chave da kie.ai vira ferramenta de
  protótipo e provedor de fallback atrás da mesma interface.
- **Billing recusado ou adiado** → o desenvolvimento roda na kie.ai ou no free tier **com dado
  sintético**, e a data de entrada em produção passa a depender desta decisão. Não é
  bloqueador para construir; é bloqueador para atender cliente de verdade.

**Resolvido quando** o provedor estiver escolhido e, se for a Google, a chave criada e o
billing ativo. A resolução registra qual provedor, qual modelo, e onde a credencial mora.

---

## Decisão tomada — 2026-08-10

O dono do projeto **acatou as duas recomendações**:

1. **Provedor: Gemini API da Google (AI Studio), tier pago.** Modelo `gemini-3-flash`, sempre
   com `reasoning_effort: "low"` e `include_thoughts: false` explícitos.
2. **Conversa real de cliente NÃO passa pela kie.ai.** A kie.ai fica restrita a protótipo com
   **dado sintético** e, mais adiante, a provedor de fallback atrás da mesma interface — nunca
   com dado pessoal, enquanto não houver DPA ou anonimização.

**O ticket segue aberto** porque a parte executável depende de ação no console da Google, que
só o dono da conta pode fazer:

- [ ] Criar a API key no Google AI Studio (https://aistudio.google.com/apikey)
- [ ] Vincular conta de cobrança para sair do free tier — **o free tier usa os dados para
      treinar**, e é essa a razão de existir esta etapa
- [ ] Confirmar no painel que o projeto está no tier pago
- [ ] Colocar a chave no `.env` como `GEMINI_API_KEY` (o `.env.example` já tem o campo)

Enquanto isso não acontece, o desenvolvimento pode rodar na kie.ai ou no free tier **com dado
sintético**. O que fica bloqueado é atender cliente de verdade, não construir.

---

## Atualização — 2026-08-12 — modelo corrigido para `gemini-3.6-flash`

Ao criar a chave no AI Studio, o dono do projeto encontrou `gemini-3.6-flash`, não
`gemini-3-flash`. Verificado: **`gemini-3-flash-preview`** (a escolha original deste ticket e
do research 008) **foi aposentado pela Google em 2026-07-15** — não é mais possível criar
chave para ele. `gemini-3.6-flash` é o substituto atual, lançado em 2026-07-21.

- **ID correto na API: `gemini-3.6-flash`** (com ponto — `gemini-3-6-flash`, com traço, é
  rejeitado). `.env.example` corrigido.
- **`thinkingLevel: "low"` continua controlável** nativamente na API da Google para este
  modelo — a preocupação do research 008 (linha 357, "`gemini-3-6-flash` perde o
  `reasoning_effort`") valia só para o wrapper da kie.ai, não para a API nativa.
- **Custo mudou de patamar.** Preço oficial da Google: **US$1,50/1M tokens de entrada,
  US$7,50/1M de saída** — contra US$0,25/US$1,50 do `gemini-3-flash-preview`. A estimativa de
  ~R$130/mês (500 atendimentos) do research 008 está desatualizada; ordem de grandeza real
  fica perto de R$650–780/mês no mesmo volume. Não há alternativa mais barata no mesmo nível
  de capacidade — o modelo antigo não existe mais — mas o custo revisado fica registrado aqui
  para quem for orçar.
- **Modelo pinado agora: `gemini-3.6-flash`.** Ticket 018 (validação empírica do contrato)
  deve testar contra ele, não contra o preview aposentado.

Fontes: [Google AI — deprecations](https://ai.google.dev/gemini-api/docs/deprecations),
[Google AI — thinking](https://ai.google.dev/gemini-api/docs/thinking),
[GitHub Changelog — Gemini 3 Flash deprecated](https://github.blog/changelog/2026-07-31-gemini-2-5-pro-and-gemini-3-flash-deprecated/).

---

## Atualização — 2026-08-12 (2) — modelo trocado para `gemini-3.5-flash-lite`

O [ticket 030](030-escolher-modelo-gemini-ideal.md) (research dedicado, ver
[research 030](../research/030-modelo-gemini-ideal.md)) comparou de verdade os candidatos
vivos da família Gemini — a atualização acima só tinha corrigido o pinado por eliminação
(modelo antigo aposentado), não por comparação. Resultado: **`gemini-3.6-flash` não é a
melhor opção**; `gemini-3.5-flash-lite` atende os mesmos requisitos obrigatórios por ~25% do
custo. Decisão do dono do projeto: **trocar**.

- **Atende os quatro requisitos obrigatórios do ticket**, com o mesmo nível de confirmação
  na doc oficial que o `gemini-3.6-flash` tem: áudio (todos os formatos, incl. risco OGG/Opus
  pendente — ver ticket 018), imagem (**incl. HEIC**), function calling, e `thinkingLevel`
  com `"low"`/`"high"` confirmados em https://ai.google.dev/gemini-api/docs/thinking.
- **Perfil declarado pela própria Google bate com a fase 1**: *"low-latency, cost-effective
  multimodal model optimized for high-throughput execution for subagent tasks and document
  parsing"* — extração de dado estruturado, não raciocínio aberto.
- **Preço oficial, tier Standard/pago, confirmado em
  https://ai.google.dev/gemini-api/docs/pricing (2026-08-12), texto exato da tabela:**
  - Input: **"$0.30 (text / image / video / audio)"** por 1M tokens — mesmo preço pra
    qualquer modalidade de entrada, sem sobretaxa de áudio/imagem.
  - Output: **"$2.50"** por 1M tokens.
  - Context caching: **"$0.03"** por 1M tokens de input + **"$1.00 / 1,000,000 tokens per
    hour"** de armazenamento.
  - Free tier: "Free of charge" em tudo — fora de cogitação pelo motivo de LGPD já registrado
    nesta ticket.
- **Custo estimado (500 atendimentos/mês, mesma metodologia do research 008): ~R$87/mês**,
  contra ~R$353/mês recalculado para `gemini-3.6-flash` na mesma metodologia — **~75% mais
  barato**. Números seguem sendo estimativa de uso (turnos, duração de áudio, nº de fotos por
  chamado variam bastante e não estão medidos); o que é **dado concreto, não estimativa**, é a
  tarifa em si, confirmada acima.

**Modelo pinado agora: `gemini-3.5-flash-lite`.** `.env.example` e o wizard de setup
atualizados. Ticket 018 (validação empírica) deve testar contra este modelo.

Fontes: [research 030](../research/030-modelo-gemini-ideal.md),
[Google AI — pricing](https://ai.google.dev/gemini-api/docs/pricing),
[Google AI — thinking](https://ai.google.dev/gemini-api/docs/thinking),
[Google AI — modelo gemini-3.5-flash-lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).
