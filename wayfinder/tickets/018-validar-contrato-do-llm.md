---
id: "018"
title: Validar empiricamente o contrato do LLM
labels: [wayfinder:task]
status: closed
assignee: sessão 2026-09-02
blocked-by: ["017"]
---

## Question

O [research do contrato do Gemini](008-contrato-da-api-do-gemini.md) levantou tudo o que a
documentação responde — e deixou uma fila de perguntas que **nenhuma documentação fecha**.
Elas precisam de chave e `curl`. Duas delas mudam a arquitetura do runtime, então precisam
ser respondidas **antes** de decidir stack e hospedagem, não depois.

Bloqueado por [Decidir o provedor de LLM e habilitar o billing](017-provedor-de-llm-e-billing.md)
porque os testes se fazem contra o provedor escolhido.

**Prioridade máxima — muda a arquitetura:**

1. **Ciclo completo de function calling.** Declarar a ferramenta → receber `functionCall` →
   devolver o resultado → receber a resposta final. Inclui descobrir a forma exata do turno de
   volta e o que fazer com o `thoughtSignature` que vem nos modelos Gemini 3 — a Google diz
   que os SDKs cuidam disso automaticamente, e falando HTTP cru **não há SDK para fazer isso
   por você**. Se o turno de volta não funcionar, function calling é meia-funcionalidade e o
   agente não consegue consultar agenda nem catálogo no meio da conversa.
2. **Áudio OGG/Opus do WhatsApp**, em base64 inline. Aceita direto? Precisa transcodificar
   para mp3/wav? Qual o tamanho e a duração máximos reais? **Se precisar de ffmpeg, isso muda
   o ambiente de hospedagem** — deixa de ser um runtime qualquer e passa a exigir binário
   nativo.

**Importantes, mas sem efeito estrutural:**

3. Prompt de sistema na superfície nativa — `systemInstruction` existe e funciona?
4. Custo real de um áudio e de uma imagem, medido, não estimado.
5. Streaming versus não-streaming: `stream: false` funciona? A resposta de chat é síncrona?
6. Latência medida (p50/p95, tempo até o primeiro token) do servidor onde o agente vai rodar.
7. HEIC passa? Cliente de iPhone manda foto em HEIC por padrão.

**Resolvido quando** os sete pontos tiverem resposta verificada com chamada real, e as duas
consequências arquiteturais (function calling utilizável, necessidade de transcodificação de
áudio) estiverem decididas. A resolução registra os comandos que funcionaram — eles viram a
base do cliente de LLM.

---

## Resolução

Testado com `curl`/HTTP cru contra a Gemini API da Google (`generativelanguage.googleapis.com/v1beta`),
`gemini-3.6-flash`, chave `GEMINI_API_KEY` do `.env`, em **2026-09-02**, de uma conexão
residencial no Brasil. Toda resposta trouxe `usageMetadata.serviceTier: "standard"` — tier
pago confirmado de novo, em todas as chamadas.

### As duas consequências arquiteturais

**1. Function calling é utilizável em HTTP cru — com uma regra dura de estado.**
O ciclo completo funciona: declarar `tools[].functionDeclarations` → o modelo devolve uma
part `functionCall` (com `name`, `args`, `id` e um `thoughtSignature`) → você reenvia todo o
histórico incluindo o turno `model` com essa `functionCall` **e** uma part
`functionResponse` (role `user`) com o resultado → o modelo devolve o texto final.

**O `thoughtSignature` da part `functionCall` é obrigatório no reenvio.** Omiti-lo é
**HTTP 400**, não "degradação":

```
"Function call is missing a thought_signature in functionCall parts. This is required
for tools to work correctly [...] position 2."
```

Regra para o cliente de LLM: **persistir o `thoughtSignature` de cada part `functionCall`
e devolvê-lo verbatim** no turno `model` correspondente sempre que aquele turno voltar no
histórico. Não é preciso interpretá-lo nem decodificá-lo — é opaco, só trafega de volta.
Parts de **texto** do modelo também vêm com `thoughtSignature`, mas para essas **não é
exigido** no reenvio (histórico de texto puro funciona sem). A exigência é só das
`functionCall`.

Nenhum SDK necessário: o ciclo é três `POST` de JSON. O medo do ticket ("sem SDK não há
quem faça isso por você") se resolve com uma linha de bookkeeping.

**2. Áudio OGG/Opus do WhatsApp entra direto — sem ffmpeg, sem transcodificação.**
`inlineData` com `mimeType: "audio/ogg"` **e** `mimeType: "audio/opus"` foram ambos aceitos
(HTTP 200) com arquivos gerados por `ffmpeg -c:a libopus` (mesmo codec da nota de voz do
WhatsApp). A transcrição sai pedindo no prompt. **O ambiente de hospedagem não precisa de
binário nativo por causa de áudio** — cai a restrição que a "Névoa" do mapa registrava
sobre stack/hospedagem.

- **Tokens de áudio (medido):** **25 tokens/segundo** de áudio, não os 32/s da doc. Áudio
  de 30 s → 750 tokens; de 6 s → 150. Contados como `promptTokensDetails[].modality: "AUDIO"`,
  à parte do texto.
- **Tamanho/duração máximos (medido):** a doc fala em teto de 20 MB por request para dados
  inline. **Na prática não bateu:** um corpo de request de ~108 MB base64 (66 min de áudio,
  100.000 tokens) passou (HTTP 200, ~34 s de latência). Ou seja, para nota de voz de
  WhatsApp (o app já limita a ~16 MB) **inline resolve com folga**; o limite real, se existe,
  está acima de qualquer áudio que o caso de uso vai ver. Files API (documentada, 48 h,
  grátis) fica como caminho alternativo não exercido aqui.
- **Sem sobretaxa de áudio aparente:** o áudio entra como tokens de entrada comuns
  (`modality: AUDIO`), sem multiplicador na contagem. Confirmação 100% só no faturamento
  fechado do mês — mas a contagem de tokens não mostra pedágio.

### Contrato — o que o cliente de LLM precisa saber

**Endpoint e forma:**
- `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`
- Header `x-goog-api-key: <GEMINI_API_KEY>` (não `?key=`), `Content-Type: application/json`.
- **Síncrono.** `generateContent` devolve a resposta inteira num JSON. Não existe `stream`
  no corpo; streaming é outro endpoint (`:streamGenerateContent?alt=sse`, testado, TTFT
  ~1,15 s, eventos `data:` SSE). Para a fila de qualificação, **não-streaming** é o caminho —
  resposta curta, e o WhatsApp não renderiza token a token.

**`thinkingLevel` — nome exato e efeito:**
- O campo é `generationConfig.thinkingConfig.thinkingLevel` (camelCase, aninhado em
  `thinkingConfig`). **`thinking_level` solto ou no topo de `generationConfig` → HTTP 400**
  ("Unknown name"). Foi o primeiro tropeço do teste.
- Valores aceitos: `minimal`, `low`, `medium`, `high`. `off` → HTTP 400 (piso é `minimal`
  nos 3.x — confirma o research).
- **Efeito medido (mesmo prompt):** `minimal` → 0 tokens de pensamento, ~2 s. `low` → 542
  tokens, ~5,6 s. `medium` → 805, ~7,5 s. `high` → 1023, ~8,7 s. Tokens de pensamento vêm
  em `usageMetadata.thoughtsTokenCount` e são **cobrados como saída** ($3,75/1M no 3.6).
  → **`minimal` em toda chamada** (decisão do 017) não é só preferência: `low` seria ~540
  tokens de saída a mais **por invocação** e **3× a latência**. O `.env` está com
  `LLM_THINKING_LEVEL=low` — **corrigir para `minimal`** (feito nesta sessão; `.env` não
  vai para o git).

**`systemInstruction`:** funciona. `{"systemInstruction":{"parts":[{"text":"..."}]}}` no
topo do corpo (camelCase; `system_instruction` snake também é aceito). Respeitado nos testes.

**Saída estruturada:** `generationConfig.responseMimeType: "application/json"` +
`generationConfig.responseSchema: {…}` (JSON Schema) devolve JSON limpo, sem cercas de
código. Testado com o esquema de qualificação (nome/procura/prazo/modo com `enum`) — saiu
exato. É o caminho para a extração de campos do ticket 010.

**Imagem:** `inlineData` com `image/png`, `image/jpeg` e **`image/heic`** — todos HTTP 200.
**HEIC do iPhone passa direto** (ponto 7 do ticket resolvido; no teste o HEIC até leu o
texto melhor que o PNG). Tokenização medida: imagem ~1200×1600 → **1064 tokens**, igual nos
três formatos. Foto de planilha A4 fica nessa ordem de grandeza (~1k tokens), barata; o
risco dela é qualidade de leitura, não custo — e isso é o teste `3.6-flash × flash-lite`
com dado real, que continua pendente (não é este ticket).

**Context caching (explícito) — funciona em HTTP cru e o mínimo é menor que o previsto:**
- `POST /v1beta/cachedContents` com `{"model":"models/gemini-3.6-flash","systemInstruction":{...},"ttl":"600s"}`
  → devolve `{"name":"cachedContents/<id>","usageMetadata":{"totalTokenCount":N}}`.
- Usar: `generateContent` com `{"cachedContent":"cachedContents/<id>", "contents":[...]}`.
  A resposta traz `usageMetadata.cachedContentTokenCount` e `cacheTokensDetails` → hit
  confirmado, cobrado na tarifa de cache ($0,075/1M no 3.6 vs $0,75 normal).
- `DELETE /v1beta/cachedContents/<id>` → HTTP 200.
- **Mínimo real: `min_total_token_count=1024`** (mensagem de erro literal ao tentar cachear
  261 tokens), **não 4096** como o research 017 §5 assumiu. Vale para `gemini-3.6-flash`,
  `gemini-3.7-flash` e `gemini-3.5-flash-lite` (todos deram o mesmo número). → o system
  prompt do agente é cacheável mesmo se ficar em ~1,5k tokens; não precisa ser inflado a 4k.
- TTL default 1 h; custom via `ttl`.

**Plano B `gemini-3.5-flash-lite`:** contrato **idêntico** — mesmo endpoint, mesmo
`thinkingConfig`, mesmo caching, mesma contagem de áudio (25 tok/s). Trocar é uma linha
(`LLM_MODEL`). Latência de texto curto **menor** que a do 3.6 (~0,7 s vs ~1,2 s). Default
de thinking já é `minimal`.

**Campos de `usageMetadata` que o cliente deve logar:** `promptTokenCount`,
`candidatesTokenCount`, `thoughtsTokenCount` (só aparece quando > 0),
`cachedContentTokenCount`, `promptTokensDetails[].modality` (TEXT/AUDIO/IMAGE),
`serviceTier`, e `modelVersion` + `responseId` da raiz (para rastrear no faturamento).

### Latência (baseline, não o número de produção)

Medida desta máquina (Brasil, conexão residencial) — **o servidor onde o agente vai rodar
ainda não existe** (Névoa do mapa), então isto é piso de referência, a refazer no host:

| Chamada | p50 | p95 |
|---|---|---|
| Texto curto, `minimal` | ~1,2 s | ~1,9 s |
| Imagem (planilha JPEG) + resposta curta | ~1,5 s | ~2,0 s |
| Áudio 30 s (transcrição) | ~2,6 s | ~2,9 s |
| Streaming SSE (TTFT) | ~1,15 s | — |

`low`/`medium`/`high` de thinking sobem isso para 5–9 s — outra razão para `minimal`.

### Divergências documentação × realidade (registradas para corrigir o research)

| Doc (research 017/008) | Medido em 2026-09-02 |
|---|---|
| `thinking_level` no topo de `generationConfig` | é `generationConfig.thinkingConfig.thinkingLevel` |
| Áudio: 32 tokens/segundo | **25 tokens/segundo** |
| Inline: teto de 20 MB por request | corpo de ~108 MB passou; teto real (se há) muito acima do caso de uso |
| Mínimo de cache: 4096 tokens | **1024 tokens** (`min_total_token_count=1024`) |

### O que este ticket NÃO fecha (e não era escopo)

- **Qualidade `gemini-3.6-flash` × `gemini-3.5-flash-lite`** em áudio com sotaque / planilha
  fotografada / regra de escalar — precisa de ~20–30 conversas reais, que ainda não existem
  (ticket 003 fechou sem exportação). Continua como pendência do 017, vira ticket quando
  houver material.
- **RPM/TPM/RPD reais do projeto** — só no painel do AI Studio; não é decisão de arquitetura.
- **Faturamento fechado** confirmando ausência de pedágio de áudio — só no fim do mês.
- **Latência no host de produção** — o host ainda não foi decidido.

### Comandos que funcionaram

Salvos como scripts de teste no scratchpad da sessão (`call.py` + os `curl` deste
documento). O corpo mínimo de uma chamada de qualificação:

```json
POST /v1beta/models/gemini-3.6-flash:generateContent
x-goog-api-key: $GEMINI_API_KEY
{
  "systemInstruction": { "parts": [ { "text": "<prompt da Lais>" } ] },
  "contents": [ { "role": "user", "parts": [ { "text": "<msg do cliente>" } ] } ],
  "tools": [ { "functionDeclarations": [ /* checar_agenda, etc. */ ] } ],
  "generationConfig": {
    "thinkingConfig": { "thinkingLevel": "minimal" },
    "temperature": 0.7
  }
}
```

Turno de volta de function calling (o histórico inteiro reenviado):

```json
"contents": [
  { "role": "user",  "parts": [ { "text": "..." } ] },
  { "role": "model", "parts": [ { "functionCall": { "name": "checar_agenda", "args": {...}, "id": "call_x" },
                                 "thoughtSignature": "<verbatim da resposta anterior>" } ] },
  { "role": "user",  "parts": [ { "functionResponse": { "name": "checar_agenda", "id": "call_x",
                                                        "response": { ... } } } ] }
]
```
