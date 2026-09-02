# Validação dos mecanismos de economia contra a doc oficial da Google

> **Backing detalhado do [`CUSTOS.md`](CUSTOS.md).** Este documento é o levantamento contra a
> doc; o `CUSTOS.md` é o resumo curado e corrigido. Confirmado por **teste real com a chave**
> (2026-09-02): (1) `cachedContents` cria com **1.675 tokens** nos dois modelos e o hit
> devolve `cachedContentTokenCount`; (2) `gemini-3.5-flash-lite` — cache funciona na API mas o
> preço diz "Not available" (sem desconto); (3) default de thinking do `gemini-3.6-flash` é
> **`medium`** (setar `minimal` é obrigatório); (4) Batch do lite = $0,15/$1,25.
>
> **Escopo.** Valida, contra `ai.google.dev/gemini-api/docs/*` (fontes primárias),
> os levers listados em `CUSTOS.md` e as afirmações do research
> `wayfinder/research/017-escolha-do-modelo-gemini.md` (§5, §6, §11).
> **Não** repete o que o 017 já fechou (preço geral, thinking, churn, multimodal) —
> aprofunda cache, batch, contrato do `lite` e preenche lacunas.
>
> **Data da consulta:** 2026-09-02. Modelo de produção: `gemini-3.6-flash`;
> plano B: `gemini-3.5-flash-lite`. Tier pago, REST `v1beta`.
>
> Câmbio citado ~R$ 5,50/US$ — só ordem de grandeza.

---

## Resumo dos vereditos

| # | Mecanismo | Veredito | Observação de maior peso |
|---|---|---|---|
| 1 | Context caching explícito (`gemini-3.6-flash`) | **Funciona** | Mín. documentado 4.096 tok; TTL padrão 1 h; `cachedContent` na request. |
| 1b| Context caching no `gemini-3.5-flash-lite` | **PARCIAL / risco** | Model card diz "Supported"; **a página de preços diz "Context caching: Not available"** para o `lite`. O `cacheHit: 0.03` do `pricing.mjs` e do research 017 §5 **não tem respaldo na tabela de preços atual.** |
| 1c| Invalidação por prefixo exato | **Não confirmado pela doc** | A doc só diz "cached content is a prefix to the prompt". Nenhuma frase primária confirma "muda 1 caractere → perde o cache" nem "prefixo continua batendo enquanto `contents` cresce". Fórum confirma o comportamento de *threshold* mas não o resto. |
| 2 | Batch API a ~50% | **Funciona** | `gemini-3.6-flash` batch: **$0,375 in / $1,875 out** (promo 2026) → $0,75 / $3,75 (2027). Turnaround alvo 24 h. Serve para o laço de aprendizado. |
| 3 | `gemini-3.5-flash-lite` — contrato | **Funciona, com ressalvas** | Aceita `minimal` (default `minimal`); function calling, structured output, thinking, batch, áudio/imagem/PDF = Supported. Caching = ver 1b. Caveat de qualidade documentado: sim, redação nova (abaixo). |
| 4 | Truncar/resumir histórico + debounce | **Decisão de app** | A doc **não** dá regra de truncamento. Mas há uma restrição dura: no modo stateless "**you must preserve and resend all model-generated steps** ... exactly as received" quando há thinking/tools. |
| 5 | Outros levers | Ver seção 5 | `candidateCount=1` (default), `responseSchema` sem custo extra, Flex tier = mesmo desconto do Batch, Interactions API (stateful) só tem cache implícito. |

---

## 1. Context caching

Fontes:
- https://ai.google.dev/gemini-api/docs/caching
- https://ai.google.dev/gemini-api/docs/generate-content/caching
- https://ai.google.dev/api/caching (referência REST do recurso `CachedContent`)
- https://ai.google.dev/api/generate-content (campos de `usageMetadata` e `cachedContent`)
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/long-context

### 1.1. Cache explícito — mecânica REST (confirmada)

**Recurso:** `CachedContent`. Cinco métodos: `create`, `list`, `get`, `patch`, `delete`.

**Endpoint base:** `https://generativelanguage.googleapis.com/v1beta/cachedContents`

**Criar (POST `/v1beta/cachedContents?key=...`):**
```json
{
  "model": "models/gemini-3.6-flash",
  "system_instruction": {
    "parts": [{ "text": "<instruções + catálogo — o prefixo estável>" }],
    "role": "system"
  },
  "contents": [
    { "parts": [{ "text": "<few-shot / documento estável>" }], "role": "user" }
  ],
  "ttl": "3600s"
}
```

- Campos do recurso: `contents[]`, `tools[]`, `systemInstruction`, `model`
  (todos *input only / immutable*), `displayName` (≤128 chars), `name`
  (*output only*, formato `cachedContents/{id}`), `ttl` (*input only*),
  `expireTime` (RFC 3339), `usageMetadata` (*output only*).
- **`systemInstruction` É cacheável** — junto com `contents` e `tools` no mesmo
  objeto. A doc mostra exemplos "system instruction + video file" e "system
  instruction + text file". → dá para cachear exatamente o "prefixo estável" que o
  `CUSTOS.md` descreve (instruções + catálogo + few-shot) num só `CachedContent`.

**Referenciar numa chamada normal:** campo `cachedContent` na `GenerateContentRequest`,
com o valor de `name` (`"cachedContents/abc123"`). O `contents` da request carrega
só o que vem **depois** do prefixo (a conversa).

**TTL:**
- Padrão: *"If not set, the TTL defaults to 1 hour."*
- Formato: duração em segundos terminando em `s` (`"3600s"`, aceita fração).
- Estender/renovar: `PATCH` no recurso com `updateMask` cobrindo `ttl` **ou**
  `expireTime`. Corpo ex.: `{"ttl": "600s"}`. Sem limite máximo de TTL documentado.
- Deletar: `DELETE /v1beta/cachedContents/{id}`.

**Mínimo de tokens para criar (tabela oficial, `docs/generate-content/caching`):**

| Modelo | Mínimo documentado |
|---|---|
| Gemini 3.7 Flash | 4.096 |
| **Gemini 3.6 Flash** | **4.096** |
| Gemini 3.5 Flash | 4.096 |
| Gemini 2.5 Flash / Pro | 2.048 |

- **A tabela oficial NÃO lista o `gemini-3.5-flash-lite`** (nem o 3.5-flash-lite,
  nem "3.x lite"). O research 017 §5 já tinha registrado isso e assumido 4.096.
- **Fórum (fonte secundária, marcada):** em
  https://discuss.ai.google.dev/t/real-explicit-cache-limit/134499 um usuário
  criou cache com 1.024 tokens no Gemini 3.1 Pro e recebeu, ao tentar 151 tokens,
  o erro *"The minimum token count to start caching is 1024."* — ou seja, **o
  mínimo real aplicado pela API pode ser menor que o documentado, e a mensagem de
  erro diz o número exato.** Não confie na tabela; teste e leia o erro.
- Implicação para o projeto: o `system-prompt.md` atual tem 1.676 tokens
  (`CUSTOS.md`) — abaixo dos 4.096 documentados. Pode ser que a API aceite mesmo
  assim (como no relato do fórum), mas **isso é aposta**. O caminho seguro
  continua sendo o do `CUSTOS.md`: só cachear quando o catálogo entrar e o prefixo
  cruzar folgadamente os 4.096.

### 1.2. Cache implícito

Fonte: https://ai.google.dev/gemini-api/docs/caching

- *"Implicit caching is enabled by default for all Gemini 2.5 and newer models."*
  Automático, sem gerenciar objeto.
- **Mínimo de tokens (mesma tabela do implícito):** 3.7 / 3.6 / 3.5 Flash =
  **4.096**; 2.5 = 2.048. O `lite` **não aparece** aqui também.
- **Campo do hit:** a prosa da doc diz `usage.total_cached_tokens` (nomenclatura
  SDK Python/JS). Na **resposta REST `v1beta`** o campo é
  **`usageMetadata.cachedContentTokenCount`** (confirmado em
  https://ai.google.dev/api/generate-content, junto de `promptTokenCount`,
  `candidatesTokenCount`, `toolUsePromptTokenCount`, `thoughtsTokenCount`,
  `totalTokenCount`). O `pricing.mjs` já lê `cachedContentTokenCount` — **correto
  para REST.**
- Dicas oficiais para maximizar hit implícito: *"put large and common contents at
  the beginning of your prompt"* e *"send requests with similar prefix in a short
  amount of time"*.
- **Dá para confiar sem cache explícito?** Parcialmente. O implícito dá desconto
  quando o prefixo repete e está quente, mas **não há garantia de hit** e o TTL é
  gerido pela Google (mais curto e opaco). Para um prefixo que você sabe que é
  estável e quer garantir 10× de desconto, o explícito é o certo. O implícito é a
  rede de segurança — e o `pricing.mjs` já desconta o campo quando aparece.

### 1.3. Preço do cache

Fonte: https://ai.google.dev/gemini-api/docs/pricing (2026-09-02)

**`gemini-3.6-flash`:**
| Item | Promo (até 31/12/2026) | A partir de 01/01/2027 |
|---|---|---|
| Cache hit / 1M | **$0,075** | $0,15 |
| Armazenamento / 1M / hora | **$0,50** | $1,00 |
| (entrada normal / 1M, p/ comparação) | $0,75 | $1,50 |

→ hit = **1/10 da entrada normal**, confirmado. Bate com research 017 §5.

**`gemini-3.5-flash-lite`:**
> **A tabela de preços mostra, para o `lite`, `Context caching price: Not available`**
> (Standard e Batch). Não há linha de cache hit nem de armazenamento para o `lite`.

Isto **contradiz**:
- a model card do `lite` (https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite),
  que lista `Context caching: Supported`;
- o research 017 §5, que assumiu cache hit $0,03 / armazenamento $1,00;
- o `pricing.mjs`, que tem `'gemini-3.5-flash-lite': { ..., cacheHit: 0.03 }`.

**Leitura provável** (não confirmada): o `lite` participa do cache **implícito**
(daí "Supported" na model card) mas a Google **não cobra/oferece cache explícito
gerenciável** para ele — ou cobra o hit no mesmo preço da entrada (sem desconto).
Em qualquer hipótese, **não conte com 10× de desconto de cache no plano B** até
testar com a chave. Isso torna a economia de cache um argumento **só do
`gemini-3.6-flash`**, não do `lite`.

### 1.4. Invalidação / correspondência por prefixo — **lacuna da doc**

O que a doc primária diz, literalmente:
- *"Cached content is a prefix to the prompt."* (`docs/generate-content/caching`)
- *"The primary optimization when working with long context ... is to use context
  caching."* (`docs/long-context`)

O que a doc **não** responde (e o `CUSTOS.md` afirma como certo):
- Se o prefixo cacheado continua sendo *hit* enquanto o resto de `contents` cresce
  a cada turno da conversa. (É o desenho do `CUSTOS.md` e o comportamento
  esperado de prefix caching — mas nenhuma frase primária confirma.)
- Se mudar 1 caractere do `systemInstruction` invalida o cache inteiro. Como o
  `CachedContent` é **imutável** (`systemInstruction` é *input only / immutable*),
  na prática **mudar o system prompt = criar um novo `CachedContent`** — o antigo
  não muda, você passa a referenciar outro `name`. Então "perde o cache" no
  sentido de que o conteúdo novo não estava pré-registrado; não há "edição
  parcial".
- Fórum (secundária): em
  https://discuss.ai.google.dev/t/resolved-gemini-api-context-cache-not-hit/169570
  a causa de "cache não bate" foi o usuário ter **podado o prompt abaixo do
  mínimo de tokens** — reforça que o gatilho é o *threshold*, e que otimizar
  tamanho pode desligar o cache sem querer.

**Recomendação de projeto** (mantém o `CUSTOS.md`): tratar o prefixo como
**estático e versionado byte a byte**; tudo dinâmico (data/hora, estado da loja,
resumo da conversa) vai em `contents`, **nunca** no bloco cacheado. Confirmar o
comportamento de hit-com-histórico-crescente no primeiro teste real.

---

## 2. Batch API

Fontes:
- https://ai.google.dev/gemini-api/docs/batch-mode
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits

**Veredito: funciona e serve para o laço de aprendizado (análise offline de
conversas passadas). Não serve para o chat ao vivo (assíncrono).**

- **Preço:** *"50% of the standard cost"*. Confirmado na tabela para o
  `gemini-3.6-flash`:
  - Batch input: **$0,375** (promo 2026) → $0,75 (2027)
  - Batch output: **$1,875** (promo 2026) → $3,75 (2027)
  - **Flex tier = idêntico ao Batch** (mesmo desconto de 50%, mas síncrono com
    filas). **Priority tier = +80%** sobre o Standard ($1,35 in / $6,75 out promo).
  - Para o `lite`: a tabela de preços mostra Standard e Flex ($0,15 in / $1,25
    out), **sem uma seção Batch nomeada explícita** — mas a model card lista
    `Batch API: Supported` e a tabela de rate limits dá limite de *enqueued
    tokens* para o `lite` no Batch (ver abaixo). Ou seja: **batch funciona no
    `lite`**; a representação na página de preços é confusa. Assumir ~50%
    (= preço Flex) e confirmar na fatura.
- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:batchGenerateContent`.
  Via SDK: `client.batches.create()`.
- **Formato de entrada:** JSONL, uma linha por request:
  `{"key": "<id>", "request": { <GenerateContentRequest completo> }}` — cada
  `request` é uma `GenerateContentRequest` normal (`contents`, `generation_config`,
  etc.).
- **Envio:** inline (`< 20 MB`) ou arquivo enviado via Files API (`≤ 2 GB`;
  limite de armazenamento de arquivos 20 GB).
- **Recuperar resultado:** *polling* do estado do job pelo `name` retornado.
  Estados: `JOB_STATE_PENDING`, `_RUNNING`, `_SUCCEEDED`, `_FAILED`,
  `_CANCELLED`, `_EXPIRED`. Resultados ficam disponíveis por **6 semanas**.
- **Latência / SLA:** *"Target turnaround time is 24 hours, but in majority of
  cases, it is much quicker."* Job **expira em 48 h** se ficar preso em
  pending/running.
- **Limites:**
  - **100** batch requests concorrentes.
  - Arquivo de entrada 2 GB; inline 20 MB.
  - Sem teto de nº de requests por arquivo documentado — o gargalo é o total de
    *enqueued tokens*: **Tier 1** → `gemini-3.6-flash` **3.000.000**,
    `gemini-3.5-flash-lite` **10.000.000**; Tier 2 → 400M / 500M; Tier 3 → 1B / 1B.
- **Multimodal:** suportado (imagens, vídeo, áudio nos exemplos). Mesmos modelos
  do Standard.
- **Caching no Batch:** *"Context caching is supported for batch requests"*, com
  as tarifas de cache normais.

**Uso no projeto:** classificar/anotar conversas passadas (venda, reunião,
satisfação, fracasso — tickets 010/013) em lote noturno, a metade do preço. O
volume da Lais Aliski Casa (~10 atendimentos/dia) cabe com folga absurda em qualquer tier.

---

## 3. `gemini-3.5-flash-lite` — contrato vs. `gemini-3.6-flash`

Fontes:
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- https://ai.google.dev/gemini-api/docs/thinking
- https://ai.google.dev/gemini-api/docs/pricing

### 3.1. Capacidades (model card)

| Capacidade | `gemini-3.5-flash-lite` | `gemini-3.6-flash` |
|---|---|---|
| Entrada | Texto, Imagem, Vídeo, Áudio, PDF | idem |
| Saída | Só texto | Só texto |
| Function calling | Supported | Supported |
| Structured output / JSON | Supported | Supported |
| Context caching | **Supported (na card) — mas ver §1.3** | Supported |
| Thinking | Supported | Supported |
| Batch API | Supported | Supported |
| Search grounding | Supported | Supported |
| Code execution | Supported | Supported |
| Computer use | Supported (Preview) | Supported (Preview) |
| File search | Supported | Supported |
| Live API / geração de áudio/imagem | Não | Não |
| Limite in / out | 1.048.576 / 65.536 | 1.048.576 / 65.536 |
| Última atualização | Julho/2026 | Julho/2026 |

Nenhum bloqueio de capacidade para o caso de uso (áudio de WhatsApp, foto de
planilha, function calling para agenda, saída estruturada).

### 3.2. `thinking_level` (doc de thinking, consultada 2026-09-02)

| Modelo | Níveis aceitos | Default |
|---|---|---|
| `gemini-3.7-flash` | `low`, `medium`, `high` — **rejeita `minimal`** | `medium` |
| `gemini-3.6-flash` | `minimal`, `low`, `medium`, `high` | **`medium`** |
| `gemini-3.5-flash-lite` | `minimal`, `low`, `medium`, `high` | **`minimal`** |

- **O `lite` aceita `minimal` e já vem em `minimal` por default.** O 3.7-flash é o
  único que rejeita `minimal` (piso `low`). Confirma o research 017 §6.
- **Correção ao research 017 §6:** o 017 registrou o default do 3.6-flash como
  "dinâmico". A doc atual diz **`medium`**. → **é obrigatório setar
  `thinking_level: "minimal"` explicitamente em toda chamada** ao 3.6-flash; sem
  isso, cai em `medium` e a conta de saída dispara. O `system-prompt`/runtime
  precisa fixar isso no código, não confiar no default.
- Não dá para **desligar** thinking em nenhum modelo 3.x (só o 2.5-flash-lite tem
  `off`). `minimal` é o piso.
- **Billing:** *"response pricing is the sum of output tokens and thinking
  tokens."* Campo na resposta REST: **`usageMetadata.thoughtsTokenCount`** (a
  prosa da doc de thinking usa `total_thought_tokens`, nomenclatura SDK). O
  `CUSTOS.md` afirma que com `minimal` o `thoughtsTokenCount` volta 0 — isso é
  **medição do protótipo, não garantia da doc**; a doc só diz que `minimal` é o
  menor nível, não que zera. Monitorar na fatura.
- Resumos de pensamento: `thinking_summaries: "auto"` (ou `"none"`). Manter
  desligado.

### 3.3. Caveat de qualidade documentado — **SIM, existe**

A model card do `lite` (2026-09-02) descreve o modelo como:

> *"a low-latency, cost-effective multimodal model optimized for high-throughput,
> low-cost execution for **subagent tasks and document parsing**"*, para
> *"high-volume agentic workflows, **simple data extraction**"* onde *"latency and
> API cost are the primary constraints."*

E a model card do `gemini-3.6-flash`: *"Balances speed and multimodal capabilities
across **general agentic and everyday tasks**."*

Ou seja: a Google posiciona o `lite` para **subagente / extração simples / parsing
de documento sob restrição de custo e latência** — não como o modelo de
julgamento. A tarefa da Lais Aliski Casa (decidir **quando escalar**, ler planilha
fotografada sem trocar R$ 3.000 por R$ 30.000, entender áudio com sotaque) é
exatamente o eixo onde o "simple data extraction" do `lite` é um aviso. Isso
**reforça** a recomendação do research 017 §9: `lite` é plano B a validar com
~20–30 casos reais, não escolha default.

Não há benchmark numérico "lite perde X% para o flash" na doc — a comparação
quantitativa continua sendo lacuna que só teste fecha.

### 3.4. Rate limits e deprecação

- Rate limits de RPM/TPM/RPD **não são mais publicados na doc** (research 017 §7
  segue válido) — só no painel https://aistudio.google.com/rate-limit.
- Batch *enqueued tokens* Tier 1: `lite` = 10.000.000 (vs. 3.000.000 do 3.6-flash).
- **Deprecação:** a page de deprecations (research 017 §8) tinha
  `gemini-3.1-flash-lite` com shutdown em 07/05/2027 e substituto
  `gemini-3.5-flash-lite`. O `gemini-3.5-flash-lite` em si estava
  *"no shutdown date announced"* em 2026-09-01 (research 017). Não reconferido
  hoje campo a campo — assumir estável, revalidar antes de produção.

---

## 4. Truncar/resumir histórico e debounce — o que a doc informa

Fontes:
- https://ai.google.dev/gemini-api/docs/long-context
- https://ai.google.dev/gemini-api/docs/text-generation

**São decisões de aplicação — a doc não dá regra.** Mas há três fatos primários
que restringem o desenho:

1. **A API é stateless (modo `generateContent`).** *"maintain the conversation
   history as an array of steps on the client side"* / *"In subsequent requests,
   pass the accumulated steps."* → confirma o ponto de abertura do `CUSTOS.md`:
   salvar no Supabase não corta custo; o histórico vai dentro de cada request.

2. **Restrição dura ao truncar:** *"If the model uses 'thinking' or tools, you
   **must** preserve and resend all model-generated steps ... exactly as
   received."* → **você não pode resumir/descartar livremente turnos que contêm
   tool calls no meio de uma cadeia de raciocínio ativa.** O resumo de histórico
   do `CUSTOS.md` (lever 3) é seguro para turnos **antigos e fechados**, não para
   a janela recente onde há function calling em andamento. O desenho "resumo +
   últimos 2–3 turnos crus" precisa garantir que os 2–3 turnos crus incluam
   qualquer passo de tool/thinking não resolvido.

3. **Caching é a otimização recomendada para contexto repetido:** *"The primary
   optimization when working with long context and the Gemini models is to use
   context caching."* A doc de long-context cita economia de *"~4x less than the
   standard input cost"* com contexto cacheado (número conservador; a tabela de
   preços dá 10× no 3.6-flash). Nenhuma recomendação oficial de "trunque em N
   tokens".

4. **Debounce:** nenhuma menção na doc (é puramente do lado do app). O ganho do
   `CUSTOS.md` (juntar bolhas do WhatsApp em 1 chamada) é real porque **cada
   chamada re-processa o prefixo não-cacheado + paga o mínimo de saída/thinking**.
   Com prefixo cacheado o ganho encolhe (o prefixo vira 1/10), mas ainda há a
   saída + thinking `minimal` de cada chamada evitada.

**Alternativa que a doc oferece (ver §5): Interactions API** — histórico gerido no
servidor via `previous_interaction_id`. Não é lever de custo (ainda processa os
tokens do histórico), e **só suporta cache implícito**. Pode simplificar código,
ao custo de perder o cache explícito. Provavelmente **não vale** para este
projeto, que quer o cache explícito do prefixo.

---

## 5. Outros mecanismos de economia

Fonte: https://ai.google.dev/api/generate-content · https://ai.google.dev/gemini-api/docs/pricing

- **`candidateCount`** — default efetivo 1. A doc não afirma explicitamente que
  `candidateCount > 1` multiplica a cobrança de saída, mas é o comportamento
  universal (paga cada candidato). **Manter em 1 / não setar.** (Lacuna menor: a
  doc não deixa isso explícito.)
- **`maxOutputTokens` + `stopSequences`** — tetos de saída. Saída custa 5× a
  entrada por token no 3.6-flash ($3,75 vs $0,75 promo). O `CUSTOS.md` já aplica
  ("1–3 linhas"). `stopSequences` corta geração no marcador — útil se o formato
  de saída tiver delimitador previsível.
- **`responseMimeType: "application/json"` + `responseSchema`** (structured
  output) — **sem sobretaxa** na tabela de preços. Não é custo; é confiabilidade
  de parsing. Reduz retries (que seriam chamadas inteiras novas), então
  indiretamente economiza.
- **Flex tier** — mesmo desconto do Batch (~50%) mas com filas/latência variável e
  síncrono. Não citado no `CUSTOS.md`. **Não serve para chat ao vivo** (SLA
  incerto), mas é uma terceira opção (além de Batch e Standard) para trabalho
  offline sensível a latência-de-horas.
- **Priority tier** — +80% sobre Standard. É o oposto de economia; citado só para
  descartar.
- **Sem cobrança "por imagem"** para os Flash de texto (research 017 §4) —
  reconfirmado: a linha "$X por imagem" da tabela de preços é só dos modelos de
  geração de imagem.
- **`toolUsePromptTokenCount`** — campo separado em `usageMetadata`. O
  `pricing.mjs` hoje **não** soma esse campo; se function calling gerar prompt de
  ferramenta faturado à parte, a estimativa do protótipo pode subestimar. Checar
  na fatura real qual bucket a Google usa para os tokens de tool call.

---

## Lacunas — só teste com a chave (e com dado real) fecha

1. **Cache explícito no `gemini-3.5-flash-lite`.** Model card diz "Supported";
   página de preços diz **"Context caching: Not available"**. Testar
   `POST /v1beta/cachedContents` com `model: models/gemini-3.5-flash-lite` e
   ~4.200 tokens: (a) a API cria o objeto? (b) uma chamada seguinte retorna
   `cachedContentTokenCount > 0`? (c) a fatura cobra esses tokens a que preço
   (0,03? 0,30? grátis)? **Enquanto não fechar, o `cacheHit: 0.03` do
   `pricing.mjs` é chute — e a economia de cache é argumento só do 3.6-flash.**

2. **Mínimo real de tokens do cache.** Doc diz 4.096 para os 3.x; fórum mostra API
   aceitando 1.024 e devolvendo o número exato no erro. Testar com o
   `system-prompt.md` atual (1.676 tok) e ver se a API aceita ou qual número ela
   exige. Decide se dá para cachear **antes** de o catálogo entrar.

3. **Hit de prefixo com histórico crescente.** Criar cache do prefixo, rodar 5
   turnos de conversa (cada um com `contents` maior) referenciando o mesmo
   `cachedContent`, e confirmar que `cachedContentTokenCount` volta ~constante
   (= tamanho do prefixo) em **todos** os turnos, não só no primeiro.

4. **Sensibilidade a mudança no prefixo.** Confirmar que, trocado o `name` do
   `CachedContent` (novo system prompt), o primeiro turno não tem hit e os
   seguintes voltam a ter — e medir o custo de "aquecer" um cache novo a cada
   deploy de system prompt.

5. **Preço real desta conta.** `pricing.mjs` (nota de 2026-09-02) registra que **a
   promo de $0,75/$3,75 NÃO está sendo aplicada a esta conta** — o billing
   observado bateu com o preço cheio ($1,50/$7,50). A tabela de preços pública diz
   que a promo vale até 31/12/2026. **Reconciliar com a fatura do AI Studio antes
   de confiar em qualquer estimativa** — pode ser projeto novo fora da promo,
   região, ou lag de propagação.

6. **`thoughtsTokenCount` com `thinking_level: "minimal"`.** `CUSTOS.md` afirma
   que volta 0; a doc não garante. Medir em ~20 chamadas reais de qualificação
   qual a distribuição (0? 50? 300?) — é o item mais incerto da conta de saída
   (research 017 §11.5).

7. **Batch para o `lite`.** Model card e rate limits dizem que funciona; a página
   de preços não mostra seção Batch nomeada para o `lite`. Confirmar o desconto
   real (50%? preço Flex?) rodando um job pequeno e olhando a fatura.

8. **Bucket de faturamento dos tokens de function calling** (`toolUsePromptTokenCount`
   vs `promptTokenCount`) — ajustar `pricing.mjs` depois de ver a fatura.

9. **Nomenclatura dos campos de `usageMetadata` na resposta REST real** — a doc
   mistura `usage.total_cached_tokens` / `total_thought_tokens` (prosa, SDK) com
   `cachedContentTokenCount` / `thoughtsTokenCount` (referência REST). O
   `pricing.mjs` usa os nomes REST. Confirmar com um dump de resposta real que são
   esses os campos (e não `cached_content_token_count` snake_case).

---

## Fontes

**Primárias (Google, `ai.google.dev`) — consultadas 2026-09-02:**

- Caching (guia): https://ai.google.dev/gemini-api/docs/caching
- Caching com generateContent: https://ai.google.dev/gemini-api/docs/generate-content/caching
- Referência REST do recurso CachedContent: https://ai.google.dev/api/caching
- Referência REST generateContent / GenerationConfig / usageMetadata: https://ai.google.dev/api/generate-content
- Batch mode: https://ai.google.dev/gemini-api/docs/batch-mode
- Pricing: https://ai.google.dev/gemini-api/docs/pricing
- Rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Thinking: https://ai.google.dev/gemini-api/docs/thinking
- Long context: https://ai.google.dev/gemini-api/docs/long-context
- Text generation / multi-turn: https://ai.google.dev/gemini-api/docs/text-generation
- Model card 3.6-flash: https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash
- Model card 3.5-flash-lite: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite

**Secundárias (fórum oficial `discuss.ai.google.dev` — valor menor, usadas só para
comportamento observado do cache):**

- Mínimo real do cache explícito: https://discuss.ai.google.dev/t/real-explicit-cache-limit/134499
- Cache não bate após podar prompt: https://discuss.ai.google.dev/t/resolved-gemini-api-context-cache-not-hit/169570
