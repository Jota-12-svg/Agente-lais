---
ticket: "008"
title: Contrato real da API do Gemini via kie.ai
tipo: research
data: 2026-08-10
---

# Contrato da API do Gemini via kie.ai — descobertas

> **Nota — 2026-08-12.** O modelo recomendado abaixo, `gemini-3-flash-preview`, foi aposentado
> pela Google em 2026-07-15. Substituto e custo revisado em
> [ticket 017 — Atualização 2026-08-12](../tickets/017-provedor-de-llm-e-billing.md). Esta
> pesquisa fica como registro do que se sabia em 2026-08-10, não reescrita.

> **Base desta investigação.** Tudo aqui foi levantado do zero contra a documentação da
> própria kie.ai (`docs.kie.ai`, `kie.ai`) e da Google (`ai.google.dev`,
> `docs.cloud.google.com`). Nenhum comentário herdado do `.env` foi usado como fonte.
> O único fato tirado do repositório é que o projeto tem `KIE_API_KEY`,
> `KIE_BASE_URL=https://api.kie.ai` e `LLM_MODEL` (vazio) no `.env.example`.

---

## Resumo executivo

1. **Function calling existe** na kie.ai, nas duas superfícies que ela expõe. Não é o
   bloqueio estrutural que o ticket temia — **mas vem com exclusões mútuas** que atrapalham
   (busca XOR ferramenta; saída estruturada XOR ferramenta) e pelo menos um modelo listado
   como **sem** function calling.
2. A kie.ai expõe **duas superfícies distintas**: uma compatível com OpenAI
   (`/v1/chat/completions`) e uma **nativa do Gemini** (`contents`/`parts`,
   `functionDeclarations`, `inline_data`). Para este projeto, a nativa é claramente a
   melhor — é a única que documenta **áudio/imagem em base64 inline**.
3. **Áudio é o ponto mais frágil.** A superfície OpenAI da kie.ai só aceita mídia **por
   URL pública**; a nativa aceita base64. E a kie.ai **não publica preço de token de
   áudio** — na Google, áudio custa 2× o texto.
4. **A kie.ai não oferece cache de contexto** (`cachedTokens: false` em todos os modelos
   Gemini). Isso corrói boa parte do desconto de 70–75%, porque o prompt de sistema +
   catálogo seria reenviado inteiro a cada turno.
5. **Ir direto à Google custa quase nada em esforço** — uma chave do AI Studio, sem GCP,
   sem billing obrigatório — e o **Gemini 3 Flash tem free tier gratuito**. A objeção
   "custa caro falar direto com a Google" não se sustenta na doc.
6. **A própria kie.ai declara, por escrito, que sua estabilidade é menor que a dos
   provedores oficiais** e que isso é uma escolha consciente.

**Recomendação (detalhada no fim): ir direto à Google (Gemini API via AI Studio), no tier
pago, e manter a kie.ai como fallback opcional.** Os motivos decisivos são LGPD e cache,
não preço.

---

## 1. Endpoints, formato e autenticação

### 1.1. A kie.ai expõe DUAS superfícies para o Gemini

Isso não está dito em lugar nenhum de forma destacada — foi descoberto comparando as
páginas de modelo. O índice lateral da doc lista pares como `gemini-3-6-flash` e
`gemini-3-6-flash-openai`, que são **contratos diferentes**.

| Superfície | Endpoint | Formato do corpo |
|---|---|---|
| **Nativa do Gemini** | `POST https://api.kie.ai/gemini/v1/models/<modelo>:streamGenerateContent` | `contents` / `parts`, `tools[].functionDeclarations`, `generationConfig` |
| **Compatível com OpenAI** | `POST https://api.kie.ai/<modelo>/v1/chat/completions` | `messages` / `content[]`, `tools[].function`, `reasoning_effort` |

Fontes:
- https://docs.kie.ai/market/gemini/gemini-3-6-flash (nativa)
- https://docs.kie.ai/market/gemini/gemini-3-5-flash (nativa)
- https://docs.kie.ai/market/gemini/gemini-3-flash-v1beta (nativa)
- https://docs.kie.ai/market/gemini/gemini-3-pro (OpenAI)
- https://docs.kie.ai/market/gemini/gemini-3-1-pro (OpenAI)
- https://docs.kie.ai/market/gemini/gemini-3-6-flash-openai (OpenAI)
- https://docs.kie.ai/market/gemini/gemini-2-5-pro (OpenAI)
- https://docs.kie.ai/market/gemini/gemini-2-5-flash (OpenAI)

### 1.2. Autenticação

`Authorization: Bearer <API_KEY>` + `Content-Type: application/json`, em toda requisição.
Fonte: https://docs.kie.ai/ (seção "4. Required Request Headers") e o campo
`securitySchemes.BearerAuth` do OpenAPI em https://docs.kie.ai/market/gemini/gemini-3-pro.md

Header errado devolve:

```json
{ "code": 401, "msg": "You do not have access permissions" }
```

Fonte: https://docs.kie.ai/

> ⚠️ **Contradição na doc.** A página nativa diz: *"Use the auth configuration for
> `X-Goog-Api-Key`. Do not add it as a regular request parameter."* — mas o exemplo de
> cURL da mesma página usa `Authorization: Bearer <token>`. Precisa ser testado na
> prática. Fonte: https://docs.kie.ai/market/gemini/gemini-3-6-flash.md

### 1.3. Exemplo verificado — superfície NATIVA (a recomendada)

Copiado literalmente da doc (https://docs.kie.ai/market/gemini/gemini-3-6-flash):

```bash
curl --location 'https://api.kie.ai/gemini/v1/models/gemini-3-6-flash:streamGenerateContent' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data '{
    "stream": true,
    "contents": [
        {
            "role": "user",
            "parts": [ { "text": "What is the weather in Beijing today?" } ]
        }
    ],
    "tools": [
        {
            "functionDeclarations": [
                {
                    "name": "get_weather_forecast",
                    "description": "Get the weather forecast for a given location",
                    "parameters": {
                        "type": "OBJECT",
                        "properties": {
                            "location": { "type": "STRING", "description": "The city name, e.g. Beijing" }
                        },
                        "required": ["location"]
                    }
                }
            ]
        }
    ],
    "generationConfig": {
        "thinkingConfig": { "includeThoughts": true, "thinkingLevel": "high" }
    }
}'
```

Resposta de exemplo da mesma página (function call):

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [
          {
            "functionCall": { "args": { "location": "Beijing" }, "name": "get_weather_forecast", "id": "gp737npz" },
            "thoughtSignature": "Es8CCswCAb4example"
          }
        ]
      },
      "finishReason": "STOP"
    }
  ]
}
```

### 1.4. Exemplo verificado — superfície OpenAI

Copiado literalmente de https://docs.kie.ai/market/gemini/gemini-3-pro:

```bash
curl --location 'https://api.kie.ai/gemini-3-pro/v1/chat/completions' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data '{
    "messages": [
        {
            "role": "user",
            "content": [
                { "type": "text", "text": "What is in this image?" },
                { "type": "image_url", "image_url": { "url": "https://.../imagem.png" } }
            ]
        }
    ],
    "tools": [ { "type": "function", "function": { "name": "googleSearch" } } ],
    "stream": true,
    "include_thoughts": true,
    "reasoning_effort": "high"
}'
```

Papéis aceitos em `messages[].role`: `developer`, `system`, `user`, `assistant`, `tool`.
Fonte: schema `Message` em https://docs.kie.ai/market/gemini/gemini-3-pro.md

### 1.5. Streaming e não-streaming

- **`stream` tem default `true`** nas duas superfícies. Se você não mandar `stream: false`
  explicitamente, recebe SSE. Fonte: OpenAPI de
  https://docs.kie.ai/market/gemini/gemini-3-pro.md (`stream: {type: boolean, default: true}`).
- Streaming vem como `Content-Type: text/event-stream`, linhas `data: <json>`, deltas
  incrementais, evento final com `finish_reason`.
  Fonte: https://docs.kie.ai/market/gemini/gemini-3-pro
- **Na superfície nativa a kie.ai só documenta `:streamGenerateContent`.** Não há página
  para `:generateContent` (não-streaming), que existe na API oficial da Google. Se
  `"stream": false` funciona no endpoint `:streamGenerateContent` da kie.ai, a doc não diz.
  **Precisa ser testado.**

### 1.6. Parâmetros que a kie.ai NÃO expõe (lacunas relevantes)

O OpenAPI da superfície nativa lista **apenas** `contents`, `tools`, `generationConfig`
(só com `thinkingConfig`) e `stream`. Não aparecem:

- `systemInstruction` — não há campo documentado de prompt de sistema na superfície nativa.
  (Na superfície OpenAI existe `role: "system"`/`"developer"`, o que a torna mais viável
  nesse ponto.)
- `temperature`, `topP`, `topK`
- `maxOutputTokens` — a página de produto marca explicitamente
  `"maxTokens": {"supported": false}` para **todos** os modelos Gemini da kie.ai
- `safetySettings`
- `toolConfig` / `functionCallingConfig` (modos AUTO/ANY/NONE)
- `cachedContent` — cache de contexto

Fontes: https://docs.kie.ai/market/gemini/gemini-3-6-flash.md (OpenAPI) e o JSON
`chatModelConfig` embutido em https://kie.ai/gemini-3-pro, https://kie.ai/gemini-3-flash,
https://kie.ai/gemini-3-6-flash, https://kie.ai/gemini-3-1-pro.

Para efeito de comparação, a API oficial documenta todos esses parâmetros —
https://ai.google.dev/gemini-api/docs/function-calling descreve inclusive
`tool_choice` (`auto` / `any` / `none` / `validated`) em `generation_config`, que a kie.ai
não expõe. Sem `tool_choice`, não dá para **forçar** o modelo a chamar a ferramenta de
agenda num ponto do fluxo — só torcer para o `auto` acertar.

---

## 2. Multimodal — áudio e imagem

### 2.1. Superfície OpenAI da kie.ai: só URL

A doc é enfática sobre um "formato unificado de mídia":

> *"To simplify integration, all media types (Images, Videos, Audio, or Documents) in the
> messages array share the exact same JSON structure: The `type` field is fixed as
> `"image_url"`; the `image_url` key name remains unchanged for all file types; only the
> `url` value points to your specific media file."*

```json
// Example for Video/Audio/PDF/Image:
{ "type": "image_url", "image_url": { "url": "https://..." } }
```

Fonte: https://docs.kie.ai/market/gemini/gemini-3-pro

No schema OpenAPI, esse campo é `url: {type: string, format: uri}`. **Não há menção a
base64 nem a `data:` URI.** Fonte: https://docs.kie.ai/market/gemini/gemini-3-pro.md

**Consequência prática séria:** para mandar um áudio de WhatsApp por essa superfície, o
áudio precisaria estar **numa URL pública**. Isso significa hospedar mídia de cliente em
endereço acessível pela internet — um problema de LGPD que o `CLAUDE.md` deste projeto já
proíbe em espírito ("conversas de clientes são dado pessoal, acesso restrito").

### 2.2. Superfície nativa da kie.ai: base64 inline (é o caminho)

O OpenAPI da superfície nativa descreve `parts` como aceitando três formas:

| Forma | Campos | Descrição na doc |
|---|---|---|
| texto | `text` | *"Plain text input."* |
| binário inline | `inline_data.mime_type` + `inline_data.data` | *"Inline binary payload."* / `data`: *"Base64 content."* |
| arquivo remoto | `file_data.mime_type` + `file_data.file_uri` | *"file mime type"* / URI do arquivo |

Fonte: https://docs.kie.ai/market/gemini/gemini-3-6-flash.md

Exemplo montado a partir desse schema (**não é exemplo oficial — a doc não fornece um para
mídia na superfície nativa; precisa ser testado**):

```json
{
  "stream": true,
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "O cliente mandou este áudio. Transcreva e resuma o pedido." },
        { "inline_data": { "mime_type": "audio/ogg", "data": "<BASE64>" } }
      ]
    }
  ]
}
```

> ⚠️ A kie.ai **não documenta nenhum limite de tamanho, duração ou lista de MIME types**
> para mídia — nem na superfície nativa nem na OpenAI. Não há como saber, pela doc dela, se
> ela repassa os limites da Google ou impõe os seus. **Isso é uma lacuna que só teste
> empírico fecha.**

### 2.3. Limites reais, pela documentação da Google

Como a kie.ai é um repasse do Gemini, os limites do modelo valem no mínimo como teto.

**Áudio** — https://ai.google.dev/gemini-api/docs/audio

- MIME types aceitos: `audio/wav`, `audio/mp3`, `audio/aiff`, `audio/aac`, `audio/ogg`
  (Ogg Vorbis), `audio/flac`
- **32 tokens por segundo de áudio** → 1 minuto = 1.920 tokens
- **Máximo de 9,5 horas de áudio por prompt**
- Base64 inline serve para arquivos pequenos; **o request inteiro (prompt + arquivos) fica
  limitado a 20 MB** — acima disso, Files API
- Transcrição não é automática: *"To get a transcript, ask for it in the prompt."*

> 🚩 **Risco concreto para o WhatsApp.** O áudio de nota de voz do WhatsApp é
> **OGG com codec Opus** (`audio/ogg; codecs=opus`). A doc da Google lista `audio/ogg`
> descrito como **"OGG Vorbis"**. Se Opus dentro de OGG for aceito, ótimo; se não,
> **será necessário transcodificar** (ffmpeg → mp3/wav) antes de enviar. Isso muda a
> arquitetura do runtime (precisa de ffmpeg no ambiente) e **precisa ser testado antes de
> qualquer decisão de stack.**

**Imagem** — https://ai.google.dev/gemini-api/docs/image-understanding

- MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif`
  (HEIC/HEIF importa: iPhone manda HEIC)
- **Máximo de 3.600 imagens por request**
- Tokenização: **258 tokens** se ambas as dimensões ≤ 384 px; imagens maiores são
  ladrilhadas em blocos de 768×768, **258 tokens por bloco**. Ex.: 960×540 → 6 blocos.
- Mesmo teto de **20 MB** por request para dados inline

> Nota: a tabela de preços da Google usa outro número para os modelos Gemini 3 —
> *"Image input is set at 560 tokens or $0.0011 per image"*
> (https://ai.google.dev/gemini-api/docs/pricing, rodapé do Gemini 3 Pro Image). Os dois
> números convivem na doc da Google; para estimativa, 258–560 tokens por foto é a faixa.

**Files API** — https://ai.google.dev/gemini-api/docs/files

- Até **20 GB por projeto**, **2 GB por arquivo**
- Arquivos ficam **48 horas**
- Obrigatória quando o request total passa de **100 MB** (50 MB para PDF)
- Gratuita

A kie.ai **não expõe a Files API**. O campo `file_data.file_uri` existe no schema dela, mas
não há endpoint de upload documentado — presumivelmente espera uma URL comum. Ou seja:
**pela kie.ai, mídia grande não tem caminho documentado.**

---

## 3. Modelos disponíveis via kie.ai e diferença prática

Modelos Gemini de chat listados no índice da doc
(https://docs.kie.ai/market/gemini/gemini-3-pro, menu lateral):

`gemini-2-5-flash`, `gemini-2-5-pro`, `gemini-3-flash`, `gemini-3-flash-v1beta`,
`gemini-3-pro`, `gemini-3-1-pro`, `gemini-3-5-flash`, `gemini-3-5-flash-openai`,
`gemini-3-6-flash`, `gemini-3-6-flash-openai`.

Capacidades declaradas pela própria kie.ai (JSON `chatModelConfig` embutido nas páginas de
produto em kie.ai — fontes: https://kie.ai/gemini-3-pro, https://kie.ai/gemini-3-flash,
https://kie.ai/gemini-3-6-flash, https://kie.ai/gemini-3-1-pro):

| Modelo (id na kie.ai) | Formato | Function calling | Saída estruturada | Google Search | `reasoning_effort` | Cache | `maxTokens` |
|---|---|---|---|---|---|---|---|
| `gemini-3-pro` | openai | ✅ | ✅ | ✅ | ✅ low/high | ❌ | ❌ |
| `gemini-3.1-pro` | openai | **❌** | ❌ | ✅ | ✅ low/high | ❌ | ❌ |
| `gemini-3-flash` | openai | ✅ | ❌ | ❌ | ✅ low/high | ❌ | ❌ |
| `gemini-3-flash-v1betamodels` | gemini (nativo) | ✅ | ❌ | ✅ | ✅ low/high | ❌ | ❌ |
| `gemini-3-6-flash` | gemini (nativo) | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `gemini-3-6-flash-openai` | openai | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |

Leitura prática para **este** agente (qualificação conversacional em português, com
consulta a agenda e catálogo):

- **`gemini-3.1-pro` está descartado**: a própria kie.ai declara `functionCalling: false`.
  O modelo mais caro do catálogo dela é o único que não serve ao requisito estrutural.
- **Um Flash resolve.** Fase 1 é qualificação — extrair nome, público (consumidor final vs.
  arquiteto), ambiente, faixa de interesse, e decidir escalar. Não é raciocínio pesado.
  Um Pro seria pagar 3–4× por capacidade que a fase 1 não usa.
- **`gemini-3-flash` (superfície nativa `-v1beta`) é o candidato natural**: tem function
  calling, `reasoning_effort` controlável e é o mais barato da lista (§4).
- **`gemini-3-6-flash` perde o `reasoning_effort`** (`supported: false`) — o que significa
  que ele pensa no default, e **tokens de pensamento são cobrados como saída** na Google
  (https://ai.google.dev/gemini-api/docs/pricing: *"Output price (including thinking
  tokens)"*). Para um chat de latência baixa, perder esse botão é ruim de custo e de tempo.

### Parâmetros de raciocínio

| Superfície | Parâmetro | Valores |
|---|---|---|
| OpenAI | `reasoning_effort` | `"low"` \| `"high"` — **default `"high"`** |
| OpenAI | `include_thoughts` | boolean — **default `true`** |
| Nativa | `generationConfig.thinkingConfig.thinkingLevel` | `"low"` \| `"high"` |
| Nativa | `generationConfig.thinkingConfig.includeThoughts` | boolean |

Descrição literal: *"Low effort is faster to respond, high effort is slower to respond but
solves more complex problems. Default is `"high"`."*
Fonte: https://docs.kie.ai/market/gemini/gemini-3-pro.md

> 🚩 **Armadilha de custo e de latência.** Os dois defaults (`reasoning_effort: high` e
> `include_thoughts: true`) são os caros. Para atendimento de WhatsApp, o agente deve
> mandar **`"low"`** e **`include_thoughts: false`** explicitamente em toda chamada.

---

## 4. Custo

### 4.1. Preço na kie.ai

A kie.ai cobra em créditos. Pelas páginas de produto: **100 créditos ≈ US$ 0,50 → 1 crédito
= US$ 0,005**.

| Modelo | Entrada / 1M tokens | Saída / 1M tokens | Fonte |
|---|---|---|---|
| Gemini 3 Pro | 100 cr ≈ **$0,50** | 700 cr ≈ **$3,50** | https://kie.ai/gemini-3-pro |
| Gemini 3.1 Pro | 100 cr ≈ **$0,50** | 700 cr ≈ **$3,50** | https://kie.ai/gemini-3-1-pro |
| Gemini 3 Flash | 30 cr ≈ **$0,15** | 180 cr ≈ **$0,90** | https://kie.ai/gemini-3-flash |
| Gemini 3.6 Flash | 90 cr ≈ **$0,45** | 450 cr ≈ **$2,25** | https://kie.ai/gemini-3-6-flash |

Recargas de valor alto dão +10% de bônus, o que reduz o preço efetivo em ~10%
(ex.: Gemini 3 Flash → ~$0,135 / ~$0,81). Mesmas fontes.

> ⚠️ **A kie.ai não publica preço separado para áudio nem para imagem.** Só "input" e
> "output". Não dá para saber pela doc se áudio é cobrado no preço de entrada de texto (o
> que seria vantajoso, já que a Google cobra 2× por áudio) ou se há um multiplicador não
> divulgado. **Verificar em https://kie.ai/logs após um teste real com áudio** — a doc diz
> que essa página é *"the source of truth"* para consumo de créditos
> (https://docs.kie.ai/).

### 4.2. Preço oficial da Google (mesma data)

Fonte: https://ai.google.dev/gemini-api/docs/pricing (tier pago, padrão)

| Modelo | Entrada / 1M | Saída / 1M (inclui thinking) | Cache de contexto |
|---|---|---|---|
| Gemini 3 Flash Preview | **$0,50** (texto/imagem/vídeo) · **$1,00** (áudio) | **$3,00** | $0,05 (texto/img) · $0,10 (áudio) + $1,00/1M/hora de armazenamento |
| Gemini 3.6 Flash | **$1,50** | **$7,50** | $0,15 + $1,00/1M/hora |
| Gemini 3.1 Pro Preview | **$2,00** (≤200k) · $4,00 (>200k) | **$12,00** (≤200k) · $18,00 | $0,20 · $0,40 + $4,50/1M/hora |
| Gemini 2.5 Flash | $0,30 (texto/img/vídeo) · $1,00 (áudio) | $2,50 | $0,03 + $1,00/1M/hora |

**O Gemini 3 Flash Preview tem free tier: "Free of charge" para entrada e saída.**
(Com a contrapartida — ver §7.3.)

Conferindo: o desconto da kie.ai é real e bate com o que ela anuncia — 3 Flash $0,15 vs
$0,50 = 70% off; 3.6 Flash $0,45 vs $1,50 = 70% off; Pro $0,50 vs $2,00 = 75% off.

### 4.3. Estimativa de um atendimento típico

Premissas (a serem calibradas com conversa real; hoje são estimativa, não medição):

- 12 turnos de conversa
- Prompt de sistema + tom das consultoras + trecho de catálogo ≈ 2.000 tokens, **reenviados
  a cada turno**
- Histórico acumulando → entrada média ≈ 4.500 tokens/turno → **~54.000 tokens de entrada**
  no atendimento inteiro
- 2 notas de voz de 30 s = 2 × 30 × 32 = **1.920 tokens de áudio** (e que voltam no
  histórico a cada turno seguinte, se não forem transcritas uma vez e descartadas)
- 2 fotos de produto ≈ 258–560 tokens cada ≈ **~1.000 tokens**
- Saída: 150 tokens úteis/turno + tokens de pensamento → **~6.000 tokens de saída** com
  `reasoning_effort: low`

| Cenário | Entrada | Saída | **Total por atendimento** | 500 atendimentos/mês |
|---|---|---|---|---|
| kie.ai · Gemini 3 Flash | 57k × $0,15/M = $0,0086 | 6k × $0,90/M = $0,0054 | **≈ $0,014** (~R$ 0,08) | ~$7 (~R$ 38) |
| kie.ai · Gemini 3 Pro | $0,029 | $0,021 | **≈ $0,050** (~R$ 0,27) | ~$25 |
| Google · Gemini 3 Flash (pago) | $0,029 | $0,018 | **≈ $0,047** (~R$ 0,25) | ~$23 (~R$ 127) |
| Google · Gemini 3 Flash (free tier) | — | — | **$0** | $0 |
| Google · Gemini 3.1 Pro | $0,114 | $0,072 | **≈ $0,19** (~R$ 1,00) | ~$93 |

*(câmbio de referência ~R$ 5,40/US$ — apenas para ordem de grandeza)*

**A leitura que importa:** a diferença entre kie.ai e Google direto, no modelo Flash, é de
**~R$ 90 por mês** em 500 atendimentos. Para uma loja com ticket de R$ 2.000 a R$ 50.000,
isso é irrelevante. **Custo de API não é a variável que deve decidir este ticket.**

### 4.4. O cache muda a conta — e a kie.ai não tem

Todos os modelos Gemini da kie.ai declaram `"cachedTokens": false`
(fontes: JSON embutido em https://kie.ai/gemini-3-pro, https://kie.ai/gemini-3-flash,
https://kie.ai/gemini-3-6-flash, https://kie.ai/gemini-3-1-pro).

Na Google, o prefixo cacheado do Gemini 3 Flash custa **$0,05/1M** em vez de $0,50/1M —
**10× mais barato** (https://ai.google.dev/gemini-api/docs/pricing). O prompt de sistema
+ tom + catálogo é exatamente o tipo de prefixo estável que o cache existe para atender, e
ele é a maior parte da entrada.

Com cache, a Google direta chega perto ou abaixo do preço da kie.ai sem cache. **O desconto
de 70% da kie.ai é em cima de um preço que a Google já sabe reduzir por outro caminho.**

---

## 5. Limites de taxa, erros e latência

### 5.1. Limites da kie.ai

Fonte: https://docs.kie.ai/ (seção "8. Rate Limits & Concurrency")

- **Até 20 novas requisições a cada 10 segundos**, aplicado **por conta** (não por chave)
- Isso costuma permitir 100+ tarefas concorrentes
- Estourou: **HTTP 429**, e *"rejected requests will not enter the queue"* — não há fila,
  o request é simplesmente perdido; **o retry é responsabilidade do cliente**
- Limite maior só por pedido ao suporte, e *"approvals are handled cautiously"*

Além disso, a chave em si tem tetos configuráveis de crédito: *"Maximum credits that can be
consumed in any rolling 60-minute window. Requests are paused once the cap is reached."* e
um teto diário 00:00–24:00 UTC (fonte: painel descrito em https://kie.ai/gemini-3-pro).
Útil como trava de segurança contra loop de custo — vale configurar.

**20 req/10 s é folgado para o volume da Lais Casa.** Não é o gargalo.

### 5.2. Erros

Superfície OpenAI (https://docs.kie.ai/market/gemini/gemini-3-pro.md):

| Código | Significado | Corpo |
|---|---|---|
| 400 | parâmetros inválidos | `{"error": {"message": "...", "type": "invalid_request_error"}}` |
| 401 | chave inválida/ausente | `{"error": {"type": "authentication_error"}}` |
| 429 | limite estourado | `{"error": {"type": "rate_limit_error"}}` |
| 500 | falha no request | `{"code": ..., ...}` |
| 501 | falha de geração | (listado em https://docs.kie.ai/market/gemini/gemini-2-5-pro) |

**Não há `Retry-After` documentado**, nem política de retry do lado da kie.ai, nem
idempotência. O runtime terá que implementar backoff próprio.

### 5.3. Latência

**Nenhuma das duas documentações publica latência típica.** Não há SLA na kie.ai. O que dá
para dizer com base na doc:

- Streaming é o default nas duas superfícies — o primeiro token chega antes da resposta
  completa, o que ajuda numa UX de WhatsApp (dá para mandar a mensagem só no fim, mas o
  time-to-first-token indica saúde da chamada).
- `reasoning_effort: "high"` é explicitamente descrito como *"slower to respond"*.
- Há um salto de rede adicional (cliente → kie.ai → Google) que não existe indo direto.
  Quanto isso custa em ms, só medindo.

> ⚠️ **Atenção a uma contradição na doc da kie.ai.** A página de introdução afirma:
> *"All generation tasks on KIE are asynchronous. A successful request returns HTTP 200 and
> a `task_id`. A 200 OK response only means the task was successfully created."*
> (https://docs.kie.ai/). Mas as páginas do Gemini descrevem resposta síncrona/streaming
> com corpo `choices`/`candidates` — **sem** `task_id`. A afirmação de assincronismo parece
> valer para os modelos de mídia (imagem/vídeo/música) e não para os de chat. **Confirmar
> empiricamente antes de desenhar o runtime**, porque as duas arquiteturas são diferentes
> (resposta direta vs. webhook/polling).

---

## 6. Function calling — a pergunta estrutural do ticket

### ✅ Existe, nas duas superfícies.

**Superfície nativa** — `tools[].functionDeclarations[]`, com `name`, `description` e
`parameters` (`type: OBJECT`, `properties`, `required`) — todos obrigatórios. A resposta
volta em `candidates[].content.parts[].functionCall` com `args`, `name` e `id`.
Fonte: https://docs.kie.ai/market/gemini/gemini-3-6-flash.md

**Superfície OpenAI** — `tools[].function`, formato OpenAI. Descrição literal:
*"Define your own functions with name, description, and parameters. You can define multiple
functions in the array. Functions are defined using JSON (specifically, a selected subset of
OpenAPI schema format)."*
Fonte: https://docs.kie.ai/market/gemini/gemini-3-pro.md

Isso cobre o requisito do ticket: o agente **pode** declarar `consultar_agenda` e
`buscar_produto` e ser chamado no meio da conversa.

### ⚠️ Mas com quatro restrições que a doc declara explicitamente

1. **Google Search XOR function calling.**
   *"Google Search and function calling are mutually exclusive - you cannot use both in the
   same request."* (https://docs.kie.ai/market/gemini/gemini-3-pro.md)
   Impacto: baixo — o agente não precisa de busca na web em fase 1.

2. **`response_format` XOR function calling.**
   *"Function calling and `response_format` are also mutually exclusive."* (mesma fonte)
   Impacto: **médio-alto**. A qualificação quer extrair um objeto estruturado (nome,
   público, ambiente, orçamento) *e* consultar agenda. Com a kie.ai, isso não cabe na mesma
   chamada — vira duas chamadas, ou a extração passa a ser feita por uma *função* declarada
   (truque conhecido, mas menos confiável que JSON Schema estrito).

3. **`gemini-3.1-pro` não suporta function calling** na kie.ai (`functionCalling: false`,
   https://kie.ai/gemini-3-1-pro).

4. **Não há `toolConfig`/`tool_choice`.** A API oficial permite forçar chamada de ferramenta
   com `tool_choice: any` e desligar com `none`
   (https://ai.google.dev/gemini-api/docs/function-calling). A kie.ai não documenta
   equivalente — só o comportamento automático.

### Lacuna importante: como devolver o resultado da função

**A doc da kie.ai não mostra o turno de volta.** Não há exemplo de `functionResponse`
(nativo) nem de mensagem `role: "tool"` com `tool_call_id` (OpenAI). O papel `tool` existe
no enum de `role`, mas o schema de `Message` só descreve `content` como array de
`text`/`image_url` — **não há `tool_call_id` no schema documentado**.
Fonte: https://docs.kie.ai/market/gemini/gemini-3-pro.md

A doc oficial da Google descreve o ciclo completo: a aplicação executa a função localmente e
devolve um passo `function_result` com o id da chamada, o nome e o conteúdo do resultado
(https://ai.google.dev/gemini-api/docs/function-calling).

> 🚩 **Este é o teste número 1 a fazer com a chave da kie.ai:** um ciclo completo de
> function calling — declarar, receber `functionCall`, devolver o resultado, receber a
> resposta final. Se o turno de volta não funcionar, function calling na kie.ai é uma
> meia-funcionalidade. Note também o `thoughtSignature` que aparece na resposta: nos
> modelos Gemini 3, essa assinatura precisa ser devolvida junto para a cadeia de raciocínio
> se manter — a Google diz que *"SDKs automatically handle thought signatures for you"*
> (https://ai.google.dev/gemini-api/docs/function-calling), e falando HTTP cru pela kie.ai
> **não há SDK para fazer isso por você**.

---

## 7. Confiabilidade da kie.ai vs. falar direto com a Google

### 7.1. O que a própria kie.ai declara

Fonte primária, seção "10. Stability Expectations" de https://docs.kie.ai/ — citação
literal:

> *"We provide access to top-tier, highly competitive APIs at very aggressive pricing. That
> said: We are not perfect. Our overall stability may be slightly lower than official
> providers. This is a conscious trade-off. In practice, KIE is stable enough to support
> production workloads and long-term business growth, but we believe in setting realistic
> expectations upfront."*

E na seção 11: *"KIE is built by a small startup team... Not everything is perfect. We can't
satisfy every use case immediately."*

Outros fatos declarados que pesam:

- **Retenção**: mídia gerada por 14 dias, logs/metadados por 2 meses, depois apagados
  automaticamente (https://docs.kie.ai/, seção 6)
- **Suporte**: Discord/Telegram, horário **UTC 21:00 – UTC 17:00** — ou seja, há uma janela
  diária sem cobertura; e-mail é explicitamente *"not the preferred or fastest option"*
  (https://docs.kie.ai/, seção 9)
- **Sem status page, sem SLA, sem DPA/contrato de tratamento de dados** encontrados na
  documentação pública

### 7.2. O que se lê fora da doc (fontes secundárias, valor menor)

Reviews de terceiros de 2026 relatam instabilidade recorrente em alguns modelos (com
destaque para os de vídeo), créditos consumidos em gerações que falharam, e suporte
concentrado em fuso asiático. Também apontam o risco óbvio de intermediário: se a kie.ai
cai, sua aplicação cai mesmo com a Google no ar — e recomendam retry, monitoramento de
falhas e um provedor de backup para aplicações voltadas ao cliente.
Fontes (secundárias, não verificadas de forma independente):
https://www.bitdoze.com/kie-ai-review/ · https://aireiter.com/blog/kie-ai-review-2026 ·
https://aiinsightsnews.net/kie-ai-review/

Registro honesto: essas queixas se concentram em modelos de **mídia**, não nos de chat.
Não encontrei relato específico sobre a superfície Gemini de chat.

### 7.3. Quanto custa falar direto com a Google

**Opção A — Gemini API (Google AI Studio).** É o caminho mais próximo do que já existe.

- Basta uma **API key** do AI Studio. Sem projeto GCP, sem service account.
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/<modelo>:generateContent`
  (e `:streamGenerateContent`) — **o mesmo `contents`/`parts` que a kie.ai já imita**.
- Há também endpoint compatível com OpenAI oficial da Google:
  `https://generativelanguage.googleapis.com/v1beta/openai/`, com suporte a streaming,
  function calling, imagem, áudio, saída estruturada e `reasoning_effort`
  (https://ai.google.dev/gemini-api/docs/openai) — a doc avisa que o suporte às libs
  OpenAI *"is still in beta"* e recomenda chamar a API direto.
- **Free tier**: Gemini 3 Flash Preview é *"Free of charge"* em entrada e saída
  (https://ai.google.dev/gemini-api/docs/pricing).
- Tiers de limite: Free → Tier 1 (basta vincular conta de cobrança, upgrade "instantly") →
  Tier 2 ($100 pagos + 3 dias) → Tier 3 ($1.000 + 30 dias). Os números exatos de RPM/TPM
  não são publicados na página; ficam no painel do AI Studio
  (https://ai.google.dev/gemini-api/docs/rate-limits).

**Esforço de migração kie.ai → Google direto: trocar a base URL, o header de auth e o nome
do modelo.** O corpo `contents`/`parts` é o mesmo. É trabalho de uma tarde, não de uma
sprint — desde que o código seja escrito atrás de uma interface fina desde já.

**Opção B — Vertex AI (Google Cloud).** Exige projeto GCP, **billing habilitado**,
autenticação por service account / Application Default Credentials, e escolha de região
(https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal).
É mais cerimônia e só se justifica se o projeto vier a precisar de residência de dados,
SLA contratual, VPC ou faturamento corporativo. **Nada disso é requisito hoje.**

### 7.4. O ponto de LGPD, que é o mais pesado

Este projeto vai processar **conversa de cliente real** — dado pessoal, e o `CLAUDE.md`
trata isso como restrição dura.

- **Free tier da Google: os dados são usados para melhorar os produtos.** A tabela de preços
  marca, linha a linha, *"Used to improve our products: Free Tier — **Yes** / Paid Tier —
  **No**"* (https://ai.google.dev/gemini-api/docs/pricing). Ou seja: o free tier é ótimo
  para **protótipo com dado sintético**, e inaceitável para conversa real de cliente.
- **kie.ai**: retém logs (inclusive parâmetros de entrada — a página de logs mostra *"Input
  parameters"*) por 2 meses (https://docs.kie.ai/, seções 5 e 6), e **não publica DPA,
  política de subprocessadores nem jurisdição de tratamento**. Nada na documentação diz o
  que a kie.ai faz com o conteúdo dos prompts, nem se ela repassa ao Google com que
  garantias.

**Conclusão desse eixo:** para dado real de cliente, o intermediário adiciona um terceiro
não contratado ao tratamento, sem contrato e sem transparência. Isso não é um detalhe de
engenharia — é exposição jurídica que o dono do projeto precisa decidir conscientemente.

---

## 8. Lacunas que a documentação não fecha (fila de testes empíricos)

Nada abaixo dá para responder lendo doc. Precisa de chave e de `curl`.

1. **Ciclo completo de function calling** pela kie.ai: declarar → receber `functionCall` →
   devolver resultado → receber resposta final. Inclui descobrir a forma do turno de volta
   e o que fazer com `thoughtSignature`. **Prioridade máxima.**
2. **Áudio OGG/Opus do WhatsApp**, em base64 inline pela superfície nativa. Aceita? Precisa
   transcodificar? Qual o tamanho máximo real?
3. **Prompt de sistema na superfície nativa** — há `systemInstruction`, mesmo não
   documentado? Se não, a superfície OpenAI (com `role: system`) vira a única opção, e aí
   perde-se o base64.
4. **Custo real de um áudio** — rodar um teste e conferir o consumo em https://kie.ai/logs.
5. **`stream: false` funciona** no `:streamGenerateContent`? E o chat é mesmo síncrono, ou
   devolve `task_id` como a introdução afirma?
6. **Latência medida** (p50/p95, time-to-first-token) — kie.ai vs. Google direto, do
   servidor onde o agente vai rodar.
7. **HEIC** (foto de iPhone) passa pela kie.ai?

---

## 9. Recomendação

### Resposta direta ao ticket

**A kie.ai atende ao requisito estrutural — function calling existe.** O medo do ticket não
se confirmou. Mas ela **não é a melhor escolha para este projeto**, e o motivo não é o que
se esperava (preço), é a combinação de LGPD, ausência de cache e opacidade da doc.

### O que eu recomendo

**1. Ir direto à Gemini API da Google (AI Studio), tier pago, superfície nativa
`contents`/`parts`.**

Razões, em ordem de peso:

- **LGPD.** O tier pago da Google declara por escrito que **não** usa os dados para treinar
  (https://ai.google.dev/gemini-api/docs/pricing). A kie.ai não declara nada equivalente e
  não tem DPA público. Conversa de cliente da Lais Casa passa a trafegar por um
  intermediário não contratado — isso é risco jurídico, não economia.
- **Cache de contexto.** O agente vai reenviar prompt de sistema + tom das consultoras +
  catálogo a cada turno. Com cache, a Google cobra $0,05/1M em vez de $0,50/1M — 10×
  (https://ai.google.dev/gemini-api/docs/pricing). A kie.ai não tem cache. A economia
  nominal de 70% dela evapora nessa conta.
- **Contrato completo.** `systemInstruction`, `maxOutputTokens`, `safetySettings`,
  `tool_choice`, Files API, `:generateContent` não-streaming, tratamento automático de
  `thoughtSignature` pelo SDK — a Google documenta tudo isso; a kie.ai não expõe nada disso.
  Num agente que precisa **forçar** consulta de agenda e **limitar** resposta, isso importa.
- **Estabilidade declarada.** A própria kie.ai escreve que sua estabilidade é menor que a
  dos provedores oficiais. Num agente que atende cliente em tempo real, cada salto extra é
  um ponto de falha a mais — e o suporte dela tem janela diária descoberta.
- **Custo de ir direto é irrelevante.** ~R$ 90/mês de diferença em 500 atendimentos, numa
  loja de ticket R$ 2.000–50.000.

**Modelo sugerido: `gemini-3-flash`** — mais barato, tem function calling, tem
`reasoning_effort` controlável. Fase 1 é qualificação, não raciocínio pesado. Sempre com
`reasoning_effort: "low"` e `include_thoughts: false` explícitos, porque os defaults são os
caros e os lentos.

**2. Usar a kie.ai onde ela é boa: protótipo e fallback.**

- A chave da kie.ai **já está em mãos** — serve perfeitamente para prototipar hoje, com
  **dado sintético**, sem esperar decisão de billing.
- Depois, mantê-la como **provedor de fallback** atrás da mesma interface. Se a Google
  devolver 429 ou 5xx, cair para a kie.ai é barato — o corpo `contents`/`parts` é o mesmo.

**3. Escrever o código atrás de uma interface fina de LLM desde a primeira linha.**

`enviar(mensagens, ferramentas) → resposta | chamada_de_ferramenta`. Duas implementações
(Google, kie.ai) por trás. Como as duas falam `contents`/`parts`, a interface é natural, não
forçada. Isso torna a escolha de provedor **reversível**, e uma decisão reversível não
precisa ser perfeita agora.

**4. Não ir para o Vertex AI agora.** Exige GCP, billing, service account e região. Só se
justifica com requisito de residência de dados, SLA ou faturamento corporativo — nenhum
deles existe neste mapa hoje.

### O que precisa do dono do projeto (não é chute a codificar)

- **Autorizar billing na Google** (AI Studio, tier pago). Sem isso, ou se roda no free tier
  — que treina com os dados, inaceitável para conversa real — ou fica na kie.ai.
- **Decidir se conversa real de cliente pode passar pela kie.ai** enquanto não houver
  billing. Minha leitura: **não**, até existir DPA ou anonimização.
