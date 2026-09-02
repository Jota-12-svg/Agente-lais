---
ticket: "017"
title: Qual modelo Gemini usar (revisão da decisão de modelo)
tipo: research
data: 2026-09-01
atualiza: "Substitui a escolha de modelo do ticket 017 (Decisão de 2026-08-10) e do research 008, que fixaram `gemini-3-flash`."
---

# Escolha do modelo Gemini — descobertas

> **Por que este documento existe.** O [ticket 017](../tickets/017-provedor-de-llm-e-billing.md)
> (decisão de 2026-08-10) e o [research 008](../tickets/008-contrato-da-api-do-gemini.md)
> fixaram **`gemini-3-flash`, sempre com raciocínio em `low`**. Em setembro/2026 esse id
> **não existe mais**: `v1beta/models/gemini-3-flash:generateContent` devolve 404, e
> `gemini-2.5-flash` devolve *"no longer available to new users"*. O provedor (Gemini API
> da Google, tier pago) **continua valendo** — o que mudou foi só o modelo. Este research
> re-decide o modelo contra a documentação oficial da Google, consultada em **2026-09-01**.
>
> Fatos do repositório usados: o `.env.example` tem `GEMINI_API_KEY`; a Fase 1 é só
> qualificação; volume estimado ~500 atendimentos/mês (ticket 008); entrada multimodal
> (texto + áudio OGG/Opus do WhatsApp + imagem); function calling é requisito; cache de
> contexto é requisito; raciocínio sempre no nível mínimo.

---

## 0. Resumo executivo

1. **Candidatos GA (estáveis) hoje:** `gemini-3.7-flash` ("New Stable"), `gemini-3.6-flash`
   ("Stable"), `gemini-3.5-flash` ("legacy", caro), `gemini-3.5-flash-lite` ("Stable").
   `gemini-3-flash-preview` existe e é excelente em multimodal, mas é **Preview** — fora do
   critério de estabilidade.
2. **Recomendação: `gemini-3.6-flash` como modelo principal**, id fixo (nunca o alias
   `gemini-flash-latest`), com `thinking_level: "minimal"`. Manter `gemini-3.5-flash-lite`
   como alternativa mais barata a ser comparada com **dado real** antes de produção.
3. Os três candidatos Flash aceitam **áudio, imagem, vídeo, PDF e texto** como entrada, com
   **function calling, saída estruturada, cache e thinking** — nenhum bloqueio de capacidade.
4. **OGG/Opus do WhatsApp agora é aceito direto** (`audio/ogg` e `audio/opus` estão na lista
   oficial): a dúvida "Ogg Vorbis vs Opus" do research 008 está resolvida — **não precisa
   transcodificar**.
5. **Custo é irrelevante para decidir.** Na faixa de 500 atendimentos/mês, 3.6 Flash sai
   ~R$ 130/mês e 3.5 Flash‑Lite ~R$ 60/mês. A diferença (~R$ 70/mês) não paga o risco de
   qualidade pior numa tarefa que inclui ler planilha fotografada e decidir quando escalar.
6. **Churn é real:** `gemini-2.5-flash` ficou indisponível para novos usuários ~3 meses
   antes da data oficial de shutdown, e teve uma queda de produção de 50 min por "config
   change". Preview tem só **2 semanas** de aviso. Daí: id **estável e fixado**, atrás de
   uma interface fina, com um segundo modelo já testado como plano B.

---

## 1. Candidatos e status de estabilidade

Teste empírico nesta máquina (endpoint `v1beta/models`, chave do projeto, 2026-09):
respondem a `generateContent` hoje — `gemini-3-flash-preview`, `gemini-3.5-flash`,
`gemini-3.5-flash-lite` (versão `3.5-flash-lite-07-2026`, `thinking: true`,
`createCachedContent`, `inputTokenLimit` 1.048.576), `gemini-3.6-flash`, `gemini-3.7-flash`,
e os aliases `gemini-flash-latest` (→ 3.7-flash) e `gemini-flash-lite-latest` (→
3.5-flash-lite). `gemini-3-flash` (sem sufixo) → 404. `gemini-2.5-flash` → 404 *"no longer
available to new users"*.

| Modelo | Status oficial | Descrição da Google | Entrada | Limite in/out | Última atualização |
|---|---|---|---|---|---|
| `gemini-3.7-flash` | **"New Stable"** (GA) | *"Our latest and most capable Flash model, built for complex coding, agentic workflows, and reliable multi-step execution."* | Texto, imagem, vídeo, áudio, PDF | 1.048.576 / 65.536 | Ago/2026 |
| `gemini-3.6-flash` | **"Stable"** (GA) | *"Balances speed and multimodal capabilities across general agentic and everyday tasks."* | Texto, imagem, vídeo, áudio, PDF | 1.048.576 / 65.536 | Jul/2026 |
| `gemini-3.5-flash` | **"Stable"** (GA), *"legacy"* | *"Our legacy Flash model, providing baseline speed and foundational performance for routine, high-throughput workloads."* | Texto, imagem, vídeo, áudio, PDF | 1.048.576 / 65.536 | — |
| `gemini-3.5-flash-lite` | **"Stable"** (GA) | *"Our fastest, most cost-effective 3.5 model for high-throughput execution."* | Texto, imagem, vídeo, áudio, PDF | 1.048.576 / 65.536 | Jul/2026 |
| `gemini-3-flash-preview` | **"Preview"** | *"Frontier-class performance rivaling larger models at a fraction of the cost"* / *"the best model in the world for multimodal understanding"* | Texto, imagem, vídeo, áudio, PDF | 1.048.576 / 65.536 | Dez/2025 |

Capacidades declaradas (todas as páginas de modelo abaixo): **function calling, structured
outputs, caching, thinking, search grounding, batch** — "Supported" nos cinco. Saída: só
texto (nenhum gera áudio/imagem, nenhum tem Live API).

Fontes:
- https://ai.google.dev/gemini-api/docs/models (lista e rótulos "New Stable" / "Stable" / "Preview")
- https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash
- https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- https://ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview

---

## 2. Preço por 1M tokens (tier pago)

Fonte única desta seção, salvo indicação: https://ai.google.dev/gemini-api/docs/pricing
(consultada em 2026-09-01). Conversão para BRL a **~R$ 5,50/US$ — aproximação, só para
ordem de grandeza**.

### 2.1. Tabela comparativa — tier "Standard"

| Modelo | Input / 1M | Output / 1M (inclui thinking) | Cache hit / 1M | Armazenamento de cache |
|---|---|---|---|---|
| `gemini-3.7-flash` | **$0,75** → US$1,50 em 01/01/2027 <br>(R$ ~4,13 → ~8,25) | **$3,75** → $7,50 em 2027 <br>(R$ ~20,63 → ~41,25) | **$0,075** → $0,15 em 2027 <br>(R$ ~0,41) | **$0,50** → $1,00/1M/hora em 2027 |
| `gemini-3.6-flash` | **$0,75** → $1,50 em 2027 <br>(R$ ~4,13 → ~8,25) | **$3,75** → $7,50 em 2027 <br>(R$ ~20,63 → ~41,25) | **$0,075** → $0,15 em 2027 <br>(R$ ~0,41) | **$0,50** → $1,00/1M/hora em 2027 |
| `gemini-3.5-flash` | **$1,50** (R$ ~8,25) | **$9,00** (R$ ~49,50) | **$0,15** (R$ ~0,83) | **$1,00**/1M/hora |
| `gemini-3.5-flash-lite` | **$0,30** — *text / image / video / audio* (R$ ~1,65) | **$2,50** (R$ ~13,75) | **$0,03** (R$ ~0,17) | **$1,00**/1M/hora |
| `gemini-3-flash-preview` | **$0,50** (texto/img/vídeo) · **$1,00** (áudio) <br>(R$ ~2,75 / ~5,50) | **$3,00** (R$ ~16,50) | **$0,05** (texto/img/vídeo) · **$0,10** (áudio) | **$1,00**/1M/hora |

Observações extraídas literalmente da tabela de preços:

- **3.6 e 3.7 Flash estão em promoção até 31/12/2026** — a linha diz textualmente
  *"$0.75 through December 31, 2026. $1.50 starting January 1, 2027."* (idem output e cache).
  A partir de 2027 o preço dobra. Mesmo dobrado, é barato para este volume (§9).
- **3.6 e 3.7 Flash não listam preço separado de áudio.** Onde a Google cobra áudio à parte,
  ela escreve `(audio)` explicitamente — como faz no `gemini-3-flash-preview`
  (*"$0.50 (text / image / video) $1.00 (audio)"*) e no 2.5 Flash. A ausência dessa linha
  nos 3.x Flash implica **áudio cobrado na tarifa de entrada padrão**, sem multiplicador.
  *(Confirmar no faturamento após um teste real — é a única forma de fechar 100%.)*
- **3.5 Flash‑Lite tem tarifa unificada** — a própria linha diz
  *"$0.30 (text / image / video / audio)"*: áudio, imagem e texto pelo mesmo preço. É o
  preço de entrada mais limpo da lista para carga multimodal.
- **Não há cobrança "por imagem"** para os modelos Flash de texto. A nota
  *"N tokens ou $X por imagem"* da tabela de preços vale só para os modelos de **geração**
  de imagem (Nano Banana etc.), não para estes. Imagem entra como tokens (ver §4).
- **Modos alternativos** (mesma fonte): **Batch** e **Flex** = ~50% do preço Standard;
  **Priority** = ~1,8× o Standard. Para atendimento em tempo real, o modo é o **Standard**
  (Batch é assíncrono; serve para o laço de aprendizado offline, não para o chat).

### 2.2. LGPD — a razão de estar no tier pago continua de pé

A tabela de preços marca, para toda a linha: *"Used to improve our products: Free Tier —
**Yes** / Paid Tier — **No"**.* Conversa real de cliente **só no tier pago**. O free tier
serve para protótipo com dado sintético — exatamente o que o ticket 017 já decidiu.
Fonte: https://ai.google.dev/gemini-api/docs/pricing

---

## 3. Áudio nativo

Fonte: https://ai.google.dev/gemini-api/docs/audio (consultada em 2026-09-01)

- **Entrada de áudio direta** (inline base64 ou File API) é suportada pelos modelos Gemini
  3.x Flash. Os exemplos da página usam `gemini-3.7-flash`; a capacidade "áudio como
  entrada" consta nas páginas de modelo de 3.6, 3.7 e 3.5‑Lite (§1).
- **MIME types aceitos** (lista literal): `audio/wav`, `audio/mp3`, `audio/aiff`,
  `audio/aac`, **`audio/ogg`**, `audio/flac`, `audio/mpeg`, `audio/m4a`, `audio/l16`,
  **`audio/opus`**, além de WebM.
- **OGG/Opus do WhatsApp:** a nota de voz do WhatsApp é `audio/ogg; codecs=opus`. Como
  **`audio/ogg` e `audio/opus` estão ambos na lista**, o áudio vai **direto, sem
  transcodificar**. Isto fecha a dúvida levantada no research 008 (que citava a doc antiga
  descrevendo `audio/ogg` só como "Ogg Vorbis"). *Ainda vale um teste real com um `.ogg`
  de WhatsApp de verdade — mas a doc não pede mais ffmpeg.*
- **Tokens:** *"32 tokens per second of audio (1 minute = 1,920 tokens)"* — uniforme para
  todos os formatos. Nota de voz de 30 s ≈ 960 tokens; de 2 min ≈ 3.840 tokens.
- **Máximo:** *"9.5 hours of audio per prompt"*.
- **Tamanho:** inline → *"Maximum request size is 20 MB total (including prompts and all
  files)"*; acima disso, **Files API** (arquivos ficam 48 h, gratuita —
  https://ai.google.dev/gemini-api/docs/files). Uma nota de voz típica tem < 1 MB, então
  inline resolve.
- **Transcrição não é automática** — é preciso pedir no prompt.

---

## 4. Imagem

Fonte: https://ai.google.dev/gemini-api/docs/image-understanding (consultada em 2026-09-01)

- **Entrada de imagem** suportada por todos os modelos Gemini (todos multimodais),
  incluindo os candidatos.
- **MIME types:** `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif`
  (HEIC/HEIF importa — iPhone manda HEIC).
- **Tokenização:** imagem com as duas dimensões ≤ 384 px → **258 tokens**. Imagem maior é
  ladrilhada em blocos de **768×768**, **258 tokens por bloco**. Fórmula citada:
  aproximadamente `floor(min(width, height) / 1.5)` como unidade de corte.
  → Foto de planilha A4 (~1500×2000) ≈ 6–9 blocos ≈ **~1.500–2.300 tokens**.
- **Máximo:** *"a maximum of 3,600 image files per request"*.
- **Tamanho:** mesmo teto de **20 MB** por request para dados inline; acima, Files API.

Leitura para o caso de uso: o arquiteto manda **planilha fotografada**. Isso é OCR denso +
estrutura de tabela numa única imagem — a tarefa multimodal mais exigente do fluxo. O custo
em tokens é baixo; o risco é de **qualidade de leitura**, e é aí que o porte do modelo pesa
(§9).

---

## 5. Context caching

Fontes:
- https://ai.google.dev/gemini-api/docs/caching
- https://ai.google.dev/gemini-api/docs/generate-content/caching

- **Cache explícito** (`CachedContent` / `createCachedContent`, você cria e gerencia o
  objeto) é suportado por "most models"; os exemplos citam **3.7 Flash, 3.6 Flash, 3.5
  Flash, 3.1 Pro Preview, 2.5 Flash, 2.5 Pro**. As páginas de modelo de 3.6, 3.7 e 3.5‑Lite
  marcam *Caching: Supported*, e o teste empírico confirma `createCachedContent` no
  3.5‑Lite.
- **Mínimo de tokens para criar um cache:**

  | Modelo | Mínimo |
  |---|---|
  | Gemini 3.7 Flash | **4.096** |
  | Gemini 3.6 Flash | **4.096** |
  | Gemini 3.5 Flash | **4.096** |
  | Gemini 3.1 Pro Preview | 4.096 |
  | Gemini 2.5 Flash / Pro | 2.048 |

  A tabela oficial não lista o 3.5 Flash‑Lite; pelo padrão da geração 3.x, assumir **4.096**
  (a confirmar). → **O system prompt precisa ter ≥ ~4.100 tokens** para ser cacheável.
- **TTL:** *"If not set, the TTL defaults to 1 hour."* Custom via parâmetro `ttl` (ex.:
  `ttl="300s"`). Dá para renovar/estender.
- **Cache implícito** existe e é automático para "all Gemini 2.5 and newer models", com
  mínimo de **4.096 tokens** nos modelos 3.x — hits aparecem em
  `usage.total_cached_tokens`. Ou seja, há algum desconto mesmo sem gerenciar cache; o
  explícito garante o hit no prefixo estável.
- **Como o preço muda (tier pago, do §2):**
  - `gemini-3.6-flash`: token cacheado custa **$0,075/1M** vs **$0,75/1M** normal → **10× mais
    barato** no prefixo. Armazenamento **$0,50/1M/hora** (promo; $1,00 em 2027).
  - `gemini-3.5-flash-lite`: cacheado **$0,03/1M** vs **$0,30/1M** → 10×. Armazenamento
    **$1,00/1M/hora**.
  - Exemplo de armazenamento: um system prompt de 5.000 tokens mantido quente 24/7 no 3.6
    Flash ≈ 5.000/1e6 × $0,50 × 24 × 30 ≈ **$1,8/mês** (~R$ 10). Desprezível.

---

## 6. Thinking / reasoning

Fonte: https://ai.google.dev/gemini-api/docs/thinking (consultada em 2026-09-01)

- O parâmetro atual é **`thinking_level`** (campo em `generationConfig` /
  `generation_config`; nas libs, ex. Python `generation_config={"thinking_level": "..."}`).
  O antigo `thinking_budget` / `reasoning_effort` / `include_thoughts` da era 2.5 **não é o
  contrato dos modelos 3.x** — a decisão do ticket 017 (que falava em `reasoning_effort:
  "low"` e `include_thoughts: false`) precisa ser reescrita nesses termos.
- **Níveis por modelo:**

  | Modelo | Default | Níveis aceitos |
  |---|---|---|
  | `gemini-3.7-flash` | dinâmico | **`low`, `medium`, `high`** — *"minimal returns an error"* |
  | `gemini-3.6-flash` | dinâmico | **`minimal`**, `low`, `medium`, `high` |
  | `gemini-3.5-flash` | dinâmico | `minimal`, `low`, `medium`, `high` |
  | `gemini-3.5-flash-lite` | **`minimal`** | `minimal`, `low`, `medium`, `high` |
  | `gemini-3-flash-preview` | dinâmico | `minimal`, `low`, `medium`, `high` |
  | `gemini-2.5-flash-lite` | **`off`** | pode ser desligado (off) |

- **Não dá para desligar thinking (budget 0) em nenhum modelo 3.x** — o mínimo é
  `"minimal"`. Só a linha 2.5‑Lite tem "off". Mas 2.5‑Lite está no caminho do churn
  (indisponível para novos usuários), então não é opção real.
- **`gemini-3.7-flash` é o único candidato que NÃO aceita `"minimal"`** — seu piso é
  `"low"`, que gasta mais tokens de pensamento. Para uma tarefa onde queremos o mínimo, isso
  torna o 3.6 Flash estritamente mais barato por chamada que o 3.7 Flash **pelo mesmo preço
  de tabela**.
- **Tokens de pensamento são cobrados como saída:** *"When thinking is turned on, response
  pricing is the sum of output tokens and thinking tokens"* / *"Pricing is based on the full
  thought tokens the model needs to generate, despite only the summary being output"*.
- **Resumos de pensamento:** controlados por `thinking_summaries` (ex. `"auto"`); manter
  desligado/`auto` para não pagar/transmitir o que não se usa.

**Config recomendada para o agente:** `thinking_level: "minimal"` em toda chamada (com
`gemini-3.6-flash`). Qualificação não é raciocínio pesado; e o "minimal" ainda deixa o
modelo pensar o suficiente para decidir escalar.

---

## 7. Rate limits no tier pago

Fonte: https://ai.google.dev/gemini-api/docs/rate-limits (consultada em 2026-09-01)

- **A Google não publica mais as tabelas de RPM/TPM/RPD na documentação.** A página agora
  diz: *"Rate limits depend on a variety of factors (such as your usage tier) and can be
  viewed in Google AI Studio"* e manda para https://aistudio.google.com/rate-limit. O que
  resta na doc é a tabela de **Batch enqueued tokens** (que inclui 3.7/3.6/3.5 Flash e
  3.5 Flash‑Lite) e os tetos de gasto.
- **Como subir de tier:** Free → **Tier 1** = *"Set up and link an active billing account"*
  (instantâneo); **Tier 2** = *"Paid $100 + 3 days from first successful payment"*;
  **Tier 3** = *"Paid $1,000 + 30 days"*.
- **Tetos de gasto (janela móvel de 10 min):** Tier 1 = **$10**, Tier 2 = $50, Tier 3 =
  $200. (A página também menciona um cap de projeto de $250 no Tier 1.)
- **Ordem de grandeza para o Tier 1 (fóruns oficiais, fonte secundária):** para
  `gemini-3.5-flash` no Tier 1, relatos citam **~1.000 RPM / ~1–2M TPM** e RPD alto.
  Fonte: https://discuss.ai.google.dev/t/rpm-tpm-rpd-and-quota-exceed/111179
- **Isto não é gargalo para a Lais Casa.** 500 atendimentos/mês, ~10 turnos cada = ~5.000
  chamadas/mês ≈ **~7 chamadas/hora em média**, dezenas no pico. Qualquer tier pago cobre
  com folga de várias ordens de grandeza. O número real do projeto está no painel do AI
  Studio depois que o billing entra — **confirmar lá, não é decisão de arquitetura**.

---

## 8. Estabilidade e churn — o padrão da Google

Fonte: https://ai.google.dev/gemini-api/docs/models (versionamento) e
https://ai.google.dev/gemini-api/docs/deprecations

- **Quatro tipos de versão:**
  - **Stable** — *"Stable models usually don't change. Most production apps should use a
    specific stable model."* Ex.: `gemini-3.6-flash`.
  - **Preview** — *"may be used for production... might come with more restrictive rate
    limits and will be deprecated with at least 2 weeks notice."*
  - **Latest** (`gemini-flash-latest`) — *"can be a stable, preview or experimental
    release... hot-swapped with every new release"*; mudança que quebra compatibilidade tem
    **2 semanas** de aviso por e-mail. **Não usar em produção** — o comportamento muda sob
    seus pés.
  - **Experimental** — não é para produção.
- **Política de descontinuação (texto oficial):** *"The shutdown dates listed in the table
  indicate the earliest possible dates on which a model might be retired. We will
  communicate the exact shutdown date to users with advance notice."* **A doc não fixa um
  número de meses** para modelos estáveis (só o "≥ 2 semanas" dos Preview/Latest).
- **Tabela de deprecations (2026-09):** `gemini-3.7-flash`, `gemini-3.6-flash`,
  `gemini-3.5-flash` — todos *"No shutdown date announced"*. `gemini-3.1-flash-lite` já tem
  shutdown marcado (07/05/2027 → substituto `gemini-3.5-flash-lite`). `gemini-2.0-flash`
  desligado em 01/06/2026 (→ `gemini-3.6-flash`).
- **O churn é observável, não teórico:**
  - `gemini-2.5-flash` / `gemini-2.5-pro` passaram a responder *"no longer available to new
    users"* enquanto a tabela oficial ainda dizia *"no shutdown date"* / apontava
    16/10/2026. Ou seja: **a Google fecha o modelo para novos projetos meses antes do
    shutdown formal.** Fonte:
    https://discuss.ai.google.dev/t/gemini-2-5-pro-returns-no-longer-available-to-new-users-contradicts-official-deprecation-date-oct-16-2026/176380
  - Em 09/07/2026 o `gemini-2.5-flash` sumiu por ~50 min (404 *"no longer available"*) por
    um *"config change issue"*, com rollback e pedido de desculpas de um funcionário da
    Google. Fonte:
    https://discuss.ai.google.dev/t/gemini-2-5-flash-deprecated-without-warning-earlier-than-shutdown-date/174217
- **Ritmo de lançamento:** 3.5 Flash (mai/2026) → 3.6 Flash (jul/2026) → 3.7 Flash
  (ago/2026). Um Flash novo a cada ~1–2 meses. O id que você fixa hoje continua servido por
  bastante tempo (não há shutdown anunciado), mas **vira "legacy" rápido** e um dia entra na
  fila. Consequência de projeto: **interface fina de LLM + id fixado + um segundo modelo já
  validado**, para que trocar seja questão de uma linha de config.

---

## 9. Recomendação fundamentada

### Modelo principal: `gemini-3.6-flash`, id fixo, `thinking_level: "minimal"`

Aplicando a ordem de prioridade do pedido — **(1) estabilidade, (2) custo‑benefício,
(3) eficiência multimodal**:

**Estabilidade.** É **GA ("Stable")**, sem data de shutdown, com ~2 meses de estrada e um
sucessor já publicado (3.7) — o que normalmente significa que a Google não vai mexer nele
tão cedo. Descarta-se:
- `gemini-3-flash-preview` — é **Preview**, 2 semanas de aviso, rate limit mais apertado.
  É o melhor em multimodal segundo a Google, mas o critério nº 1 o elimina como principal.
- `gemini-flash-latest` — hot-swap a cada release; comportamento instável por definição.
- `gemini-3.5-flash` — GA, mas *"legacy"* e **caro** ($1,50 in / $9,00 out): 2× a entrada e
  2,4× a saída do 3.6 Flash, sem vantagem que justifique.

**Custo‑benefício.** 3.6 e 3.7 Flash têm **preço de tabela idêntico**, mas **3.6 aceita
`thinking_level: "minimal"` e 3.7 não** (piso `"low"`, *"minimal returns an error"*). Como o
thinking é cobrado como saída, o 3.6 no piso é estritamente mais barato por chamada. Além
disso o 3.7 é descrito para *"complex coding, agentic workflows, multi-step execution"* —
altitude errada para qualificação; o 3.6 é *"general agentic and everyday tasks"*, que é
exatamente a tarefa. Estimativa para **500 atendimentos/mês** (premissas do research 008:
~10 turnos, system prompt ~2k cacheado, ~40k tokens de entrada faturada/atendimento, 1–2
notas de voz, 1–2 fotos, ~4k de saída com thinking minimal):

| Modelo | ~US$/atendimento | ~US$/mês (500) | ~R$/mês |
|---|---|---|---|
| `gemini-3.6-flash` (promo 2026) | ~$0,047 | ~$23 | **~R$ 130** |
| `gemini-3.6-flash` (preço 2027) | ~$0,09 | ~$45 | ~R$ 250 |
| `gemini-3.5-flash-lite` | ~$0,022 | ~$11 | ~R$ 60 |
| `gemini-3-flash-preview` | ~$0,05 | ~$25 | ~R$ 140 |

*(estimativa, não medição — calibrar com conversa real; câmbio ~R$ 5,50/US$)*

A diferença 3.6 Flash × Flash‑Lite é **~R$ 70/mês** — irrelevante para uma loja de ticket
R$ 2.000–50.000. **Custo não decide este ticket** (a mesma conclusão do research 008).

**Eficiência multimodal.** 3.6 Flash lê áudio, imagem e texto na mesma chamada, com
function calling e cache. O áudio não tem sobretaxa listada (§2.1). A leitura de planilha
fotografada — a tarefa mais dura — se beneficia de um modelo de porte "flash" cheio, não
"lite".

### Plano B a validar com dado real: `gemini-3.5-flash-lite`

É GA, tem **tarifa unificada** ($0,30 text/image/video/audio — o preço multimodal mais
limpo da lista), default já em `minimal`, e sai ~55% mais barato. **A dúvida é só
qualidade**, e ela não se resolve na documentação:
- entender **áudio com sotaque** e ruído de nota de voz de WhatsApp;
- ler uma **planilha fotografada** de arquiteto (OCR denso + estrutura) sem inventar linha
  nem trocar número — e num negócio de ticket alto, trocar um "R$ 3.000" por "R$ 30.000" é
  um bug caro;
- **seguir a regra de quando escalar** (não vender, não afirmar disponibilidade, passar
  para a consultora no caso certo).

**Ação recomendada:** montar um conjunto de ~20–30 casos reais (áudios, fotos de planilha,
conversas de texto) e rodar 3.6 Flash × 3.5 Flash‑Lite lado a lado nesses três eixos. Se o
Flash‑Lite empatar, cai-se para ele e economiza-se ~R$ 70/mês + latência. Se não, fica o
3.6 Flash. Enquanto o teste não existe, **produção vai com `gemini-3.6-flash`** — o custo
do erro (qualificação ruim, escala perdida) é maior que a economia.

### Terceiro nível (opcional): `gemini-3-flash-preview` para casos multimodais difíceis

A Google chama o `gemini-3-flash-preview` de *"the best model in the world for multimodal
understanding"*. Não como principal (é Preview), mas atrás da mesma interface, para
**reprocessar uma planilha fotografada que o modelo principal não conseguiu ler** — um
fallback de qualidade acionado pontualmente, não o caminho padrão.

### O que muda na decisão do ticket 017

| Antes (2026-08-10) | Agora |
|---|---|
| Modelo `gemini-3-flash` | **`gemini-3.6-flash`** (id fixo; `gemini-3-flash` deixou de existir) |
| `reasoning_effort: "low"` | **`thinking_level: "minimal"`** (contrato novo dos modelos 3.x) |
| `include_thoughts: false` | `thinking_summaries` desligado/`auto` |
| — | Plano B validável: `gemini-3.5-flash-lite`. Fallback multimodal: `gemini-3-flash-preview`. |
| — | System prompt precisa de **≥ ~4.096 tokens** para ser cacheável (mínimo do cache nos 3.x) |

Continua igual: **provedor Gemini API da Google, tier pago** (LGPD — free tier treina com
os dados); **interface fina de LLM** para tornar a troca de modelo barata; kie.ai só
protótipo/fallback com dado sintético.

---

## 10. Lacunas — o que só teste com a chave e com dado real fecha

1. **Áudio OGG/Opus de WhatsApp de verdade** em base64 inline — a doc diz que aceita;
   confirmar com um `.ogg` real e conferir tokens/segundo no faturamento.
2. **Sobretaxa de áudio no 3.6/3.7 Flash** — a tabela não lista `(audio)` à parte; confirmar
   no faturamento após um teste que a entrada de áudio é cobrada na tarifa padrão.
3. **Mínimo de tokens de cache do 3.5 Flash‑Lite** — não está na tabela oficial; assumido
   4.096. Testar `createCachedContent` com um conteúdo de ~4.100 tokens.
4. **Qualidade 3.6 Flash × 3.5 Flash‑Lite** nos três eixos (áudio com sotaque, planilha
   fotografada, regra de escalar) — o teste que decide o plano B. Precisa de dado real.
5. **RPM/TPM/RPD reais do projeto** — só aparecem no painel do AI Studio depois do billing.
6. **Preço pós-01/01/2027** — 3.6/3.7 Flash dobram. Reavaliar Flash‑Lite vs Flash quando a
   promoção acabar (ainda assim, ~R$ 250/mês não muda a recomendação).

---

## Fontes primárias (Google)

- Modelos e status GA/Preview: https://ai.google.dev/gemini-api/docs/models
- `gemini-3.7-flash`: https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash
- `gemini-3.6-flash`: https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash
- `gemini-3.5-flash-lite`: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- `gemini-3-flash-preview`: https://ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview
- Preço: https://ai.google.dev/gemini-api/docs/pricing
- Áudio: https://ai.google.dev/gemini-api/docs/audio
- Imagem: https://ai.google.dev/gemini-api/docs/image-understanding
- Files API: https://ai.google.dev/gemini-api/docs/files
- Cache: https://ai.google.dev/gemini-api/docs/caching · https://ai.google.dev/gemini-api/docs/generate-content/caching
- Thinking: https://ai.google.dev/gemini-api/docs/thinking
- Rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Deprecations: https://ai.google.dev/gemini-api/docs/deprecations

Fontes secundárias (fórum oficial, valor menor — usadas só para o padrão de churn e ordem
de grandeza de rate limit):

- https://discuss.ai.google.dev/t/gemini-2-5-flash-deprecated-without-warning-earlier-than-shutdown-date/174217
- https://discuss.ai.google.dev/t/gemini-2-5-pro-returns-no-longer-available-to-new-users-contradicts-official-deprecation-date-oct-16-2026/176380
- https://discuss.ai.google.dev/t/rpm-tpm-rpd-and-quota-exceed/111179
