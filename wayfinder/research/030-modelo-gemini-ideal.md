---
ticket: "030"
title: Qual modelo Gemini pinar — comparação real entre os candidatos vivos
tipo: research
data: 2026-08-12
---

# Qual modelo Gemini pinar — descobertas

> ⚠️ **Recomendação diverge do modelo pinado hoje.** Este research recomenda trocar
> `gemini-3.6-flash` por **`gemini-3.5-flash-lite`**. Isso muda `.env.example` e o
> [ticket 017](../tickets/017-provedor-de-llm-e-billing.md), que ficam para uma sessão de
> acompanhamento decidir se atualiza — não mexi em nenhum dos dois aqui. Ver §7 para o
> porquê e §8 para o que ainda falta confirmar empiricamente antes de trocar de verdade.

> **Base desta investigação.** Tudo aqui foi levantado contra a documentação oficial da
> Google (`ai.google.dev`) — páginas de modelo (`/gemini-api/docs/models/<id>`), pricing,
> deprecations, thinking, function-calling, audio e image-understanding. Fontes secundárias
> (blog oficial do Google, `artificialanalysis.ai`) foram usadas só para triangular
> benchmark e confirmar preço batido contra `ai.google.dev` — nunca como fonte única de um
> número. Não reabro a escolha de **provedor** (Google direta vs. kie.ai, decidida no
> [ticket 017](../tickets/017-provedor-de-llm-e-billing.md)) nem ressuscito
> `gemini-3-flash-preview`, aposentado em 2026-07-15 (já registrado no
> [research 008](008-gemini-kie-ai.md) e no ticket 017).

---

## Resumo executivo

1. **Os dois candidatos Flash-Lite da geração atual aceitam áudio, imagem (inclusive HEIC)
   e vídeo** — a preocupação do ticket de que Flash-Lite "corta multimodal" não se
   confirmou para esta geração. Ambos têm function calling e thinking.
2. **`gemini-3.1-pro-preview` TEM function calling na API nativa da Google.** A limitação
   que o research 008 achou (`functionCalling: false`) era **do wrapper da kie.ai**, não do
   modelo — confirmado no card oficial do modelo.
3. **`gemini-3-pro-preview` está completamente desativado** (shutdown em 2026-03-09,
   substituído por `gemini-3.1-pro-preview`). Não dá mais para criar chave nova para ele —
   não sobrou como candidato, nem como referência de preço atual.
4. **Custo entre os candidatos varia até ~5,5×** para o mesmo perfil de atendimento: de
   ~R$64/mês (`gemini-3.1-flash-lite`) a ~R$353/mês (`gemini-3.6-flash`), em 500
   atendimentos/mês.
5. **`gemini-3.5-flash-lite` é o ponto de equilíbrio**: aceita todo o multimodal exigido,
   tem `thinkingLevel` com `"low"`/`"high"` **confirmados** na tabela oficial de thinking
   (o que `gemini-3.1-flash-lite` não tem — ver §8), custa ~25% do que `gemini-3.6-flash`
   custa hoje, e é descrito pela própria Google como voltado a extração de dado e tarefas de
   subagente — exatamente o perfil da fase 1 (qualificação, não raciocínio pesado).
6. **O risco de formato de áudio (OGG/Opus do WhatsApp) é o mesmo para todos os candidatos**
   — a doc da Google continua listando só "OGG Vorbis", não Opus, para nenhum modelo desta
   geração. Não é um fator que diferencia os candidatos entre si; é um teste empírico
   pendente que vale para qualquer um deles (carregado do research 008, ainda não fechado).

---

## 1. Quais candidatos estão vivos hoje (2026-08-12)

Fonte: https://ai.google.dev/gemini-api/docs/deprecations, cruzado com
https://ai.google.dev/gemini-api/docs/pricing e https://ai.google.dev/gemini-api/docs/changelog

| Modelo | Lançamento | Status em 2026-08-12 | Substituto |
|---|---|---|---|
| `gemini-3-flash-preview` | 2025-12-17 | ❌ Desativado 2026-07-15 (já registrado no ticket 017) | `gemini-3.6-flash` |
| `gemini-3-pro-preview` | 2025-11-18 | ❌ Desativado 2026-03-09 | `gemini-3.1-pro-preview` |
| `gemini-3.1-flash-lite-preview` | 2026-03-03 | ❌ Desativado 2026-05-25 | `gemini-3.1-flash-lite` (GA) |
| `gemini-3.1-flash-lite` | 2026-05-07 | ✅ GA, vivo | — |
| `gemini-3.1-pro-preview` | (refinamento do 3-pro) | ✅ Preview, vivo | — |
| `gemini-3.5-flash` | 2026-05-19 | ✅ GA, vivo | — |
| `gemini-3.5-flash-lite` | 2026-07-21 | ✅ GA, vivo | — |
| `gemini-3.6-flash` | 2026-07-21 | ✅ GA, vivo (default atual do projeto) | — |

Fonte de cada data: https://ai.google.dev/gemini-api/docs/changelog (entradas de lançamento
de cada modelo) e https://ai.google.dev/gemini-api/docs/deprecations (tabela de shutdown).

**Ficam de fora da comparação por já estarem mortos:** `gemini-3-flash-preview` (fora de
escopo por decisão do ticket) e `gemini-3-pro-preview` (não é mais possível criar chave —
não sobra como "teto de referência" útil; quem faz esse papel agora é
`gemini-3.1-pro-preview`).

**Candidatos vivos comparados abaixo:** `gemini-3.6-flash`, `gemini-3.5-flash`,
`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.1-pro-preview` (teto).

---

## 2. Multimodal — áudio e imagem

### 2.1. Formatos aceitos (mesmos para todos os modelos desta geração)

Fonte: https://ai.google.dev/gemini-api/docs/audio e
https://ai.google.dev/gemini-api/docs/image-understanding — os limites de formato são do
endpoint de compreensão de áudio/imagem, não variam por modelo Flash/Flash-Lite/Pro.

- **Áudio:** `audio/wav`, `audio/mp3`, `audio/aiff`, `audio/aac`, `audio/ogg` (documentado
  como **OGG Vorbis**), `audio/flac`. 32 tokens/segundo (1 min = 1.920 tokens). Até 9,5h de
  áudio por prompt. Teto de 20 MB por request para dado inline em base64 (acima disso, Files
  API).
- **Imagem:** `image/png`, `image/jpeg`, `image/webp`, **`image/heic`, `image/heif`**
  (HEIC do iPhone é aceito explicitamente). 258 tokens por imagem ≤384px, ladrilhada em
  blocos de 768×768 (258 tokens/bloco) para imagens maiores. Até 3.600 imagens por request.

> 🚩 **Risco não resolvido, herdado do research 008, e igual para qualquer candidato.** A
> doc de áudio da Google continua descrevendo `audio/ogg` como **"OGG Vorbis"**, não Opus. O
> áudio de nota de voz do WhatsApp é **OGG com codec Opus**. Uma busca em
> `discuss.ai.google.dev` não achou confirmação nem negação específica sobre Opus dentro de
> OGG na API nativa — só uma menção secundária de que a documentação da **Vertex AI** (não
> a AI Studio, produto diferente) lista `audio/opus` como MIME type separado para
> `gemini-2.0-flash`, sem detalhar se isso cobre Opus dentro de contêiner OGG.
> Fonte: https://discuss.ai.google.dev/t/more-audio-file-type-support-in-openai-compatible-api/77438
> **Isso não muda a escolha entre os candidatos** (o mesmo teste vale para todos) — mas
> continua sendo o item de maior prioridade para validação empírica antes de produção.

### 2.2. Suporte por modelo — confirmado individualmente

Fonte: card de cada modelo em `ai.google.dev/gemini-api/docs/models/<id>`.

| Modelo | Entrada aceita | Saída | Fonte |
|---|---|---|---|
| `gemini-3.6-flash` | Texto, imagem, vídeo, áudio, PDF | Texto | https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash |
| `gemini-3.5-flash` | Texto, imagem, vídeo, áudio, PDF | Texto | https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash |
| `gemini-3.5-flash-lite` | Texto, imagem, vídeo, áudio, PDF | Texto | https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite |
| `gemini-3.1-flash-lite` | Texto, imagem, vídeo, áudio, PDF | Texto | https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite |
| `gemini-3.1-pro-preview` | Texto, imagem, vídeo, áudio, PDF | Texto | https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview |

**Achado central do ticket:** os dois Flash-Lite desta geração (3.5 e 3.1) **não cortam
multimodal**. O medo do ticket ("muitos Flash-Lite cortam multimodal") não se confirmou
para `gemini-3.x`.

---

## 3. Reasoning, thinking e risco de alucinação

### 3.1. Controle de `thinkingLevel` por modelo

Fonte: tabela de suporte a thinking em https://ai.google.dev/gemini-api/docs/thinking.

| Modelo | Thinking padrão | Níveis suportados (confirmados na doc) |
|---|---|---|
| `gemini-3.6-flash` | ligado | `minimal, low, medium, high` |
| `gemini-3.5-flash` | ligado (assumido "high" por padrão como os demais Gemini 3) | não detalhado na tabela consultada |
| `gemini-3.5-flash-lite` | ligado, default **minimal** (não desliga totalmente) | `minimal, low, medium, high` |
| `gemini-3.1-flash-lite` | ligado (card do modelo diz "Thinking: Supported") | **não aparece na tabela de thinking** — só a variante `gemini-3.1-flash-lite-image` aparece, com `minimal, high` |
| `gemini-3.1-pro-preview` | ligado, default **high** | `low, medium, high` |

> ⚠️ **Gap de doc que pesa na recomendação.** A tabela oficial de thinking não lista uma
> linha para `gemini-3.1-flash-lite` (o modelo de chat, sem sufixo `-image`) — só para
> `gemini-3.1-flash-lite-image`, que é outra variante. Não dá para confirmar pela doc que
> `thinkingLevel: "low"`/`"high"` (exigência do ticket) funcione em `gemini-3.1-flash-lite`
> tal como funciona, comprovadamente, em `gemini-3.5-flash-lite`. Fonte:
> https://ai.google.dev/gemini-api/docs/thinking

**Nota sobre a nomenclatura:** a doc oficial usa `thinking_level` com quatro valores
(`minimal`/`low`/`medium`/`high`), mais granular do que o par `"low"`/`"high"` citado no
ticket 017 e no research 008. Isso não é uma restrição a menos — os dois valores exigidos
pelo ticket (`"low"` e `"high"`) **estão dentro** do conjunto suportado por
`gemini-3.6-flash`, `gemini-3.5-flash-lite` e `gemini-3.1-pro-preview`.

### 3.2. Reasoning "bom o bastante para não alucinar" — o que a doc diz

Não existe benchmark oficial de "taxa de alucinação em extração de dado de cliente" — não é
uma métrica que a Google publica por modelo. O que dá para triangular:

- A própria Google posiciona os modelos por caso de uso, não por confiabilidade bruta:
  `gemini-3.5-flash-lite` é descrito como *"low-latency, cost-effective multimodal model
  optimized for high-throughput execution for subagent tasks and document parsing"*
  (https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) — extração de dado
  estruturado é exatamente esse perfil, não raciocínio aberto.
- `gemini-3.1-pro-preview` é o único com thinking padrão em **"high"** — os Flash e
  Flash-Lite não têm esse default agressivo, o que é esperado: são o andar de baixo da
  família, não o de cima.
- Benchmark de terceiros (Artificial Analysis, triangulado, não fonte primária) mostra uma
  diferença real de "índice de inteligência" entre `gemini-3.6-flash` (score 52, thinking
  high) e `gemini-3.5-flash-lite` (score 37) —
  https://artificialanalysis.ai/models/comparisons/gemini-3-5-flash-lite-vs-gemini-3-6-flash.
  Preço batido contra `ai.google.dev`: bateu exato ($1,50/$7,50 para o 3.6-flash;
  $0,30/$2,50 para o 3.5-flash-lite), o que dá confiança nos outros números da mesma página.
- Isso é uma diferença de capacidade **real**, não desprezível — mas o ticket já delimita o
  que é exigido: "não precisa ser raciocínio pesado tipo Pro; fase 1 é só qualificação
  conversacional" (extrair nome, público, ambiente, orçamento; decidir escalar). Não há
  medição oficial nem de terceiros específica para esse tipo de tarefa — **fica como item
  de validação empírica antes de ir para produção** (ver §8), não como algo que a doc
  resolve sozinha.

---

## 4. Function calling

Fonte: https://ai.google.dev/gemini-api/docs/function-calling e cards individuais de
modelo.

| Modelo | Function calling (API nativa Google) |
|---|---|
| `gemini-3.6-flash` | ✅ Supported |
| `gemini-3.5-flash` | ✅ Supported |
| `gemini-3.5-flash-lite` | ✅ Supported |
| `gemini-3.1-flash-lite` | ✅ Supported |
| `gemini-3.1-pro-preview` | ✅ **Supported** |

**Resposta à pergunta que o ticket faz explicitamente:** o research 008 descartou
`gemini-3.1-pro` **na kie.ai** por `functionCalling: false`. No card oficial do modelo na
API nativa da Google, function calling aparece listado como **"Supported"**
(https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview) — **confirmado: a
limitação era do wrapper da kie.ai, não do modelo.** Isso não muda a recomendação de
provedor (já fechada no ticket 017), só fecha essa dúvida específica.

---

## 5. Custo — preço oficial e estimativa por atendimento

### 5.1. Preço padrão (tier pago, standard), por modelo

Fonte: https://ai.google.dev/gemini-api/docs/pricing (tier Standard, pago — os tiers Batch,
Flex e Priority existem mas não são a configuração assumida pelo projeto hoje).

| Modelo | Entrada / 1M | Saída / 1M (inclui thinking) | Cache de contexto |
|---|---|---|---|
| `gemini-3.6-flash` | **$1,50** | **$7,50** | $0,15/1M + $1,00/1M/hora |
| `gemini-3.5-flash` | **$1,50** | **$9,00** | $0,15/1M + $1,00/1M/hora |
| `gemini-3.5-flash-lite` | **$0,30** | **$2,50** | $0,03/1M + $1,00/1M/hora |
| `gemini-3.1-flash-lite` | **$0,25** (texto/img/vídeo) · $0,50 (áudio) | **$1,50** | $0,025/1M (texto) · $0,05/1M (áudio) + $1,00/1M/hora |
| `gemini-3.1-pro-preview` | **$2,00** (≤200k) · $4,00 (>200k) | **$12,00** (≤200k) · $18,00 (>200k) | $0,20/1M + $4,50/1M/hora |

`gemini-3.1-flash-lite` é o único candidato vivo que ainda separa preço de áudio (2× o
preço de texto/imagem) — os demais (`3.6-flash`, `3.5-flash`, `3.5-flash-lite`,
`3.1-pro-preview`) cobram o mesmo preço por token independente da modalidade de entrada.

### 5.2. Estimativa por atendimento (mesma metodologia do research 008)

Premissas idênticas às do research 008 (não recalibradas — seguem sendo estimativa, não
medição): 12 turnos, prompt de sistema + tom + catálogo ≈ 2.000 tokens reenviados por turno,
entrada média ≈ 4.500 tokens/turno → **~54.000 tokens de entrada de texto**; **+1.920
tokens de áudio** (2 notas de voz de 30s); **+~1.000 tokens de imagem** (2 fotos de
produto) → **~57.000 tokens de entrada** no atendimento inteiro; **~6.000 tokens de
saída** (150 tokens úteis/turno + tokens de pensamento, com `thinkingLevel: "low"`).

| Modelo | Custo/atendimento | 500 atendimentos/mês | vs. `gemini-3.6-flash` |
|---|---|---|---|
| `gemini-3.1-flash-lite` | ≈ $0,024 (~R$0,13) | **≈ $12 (~R$64)** | **−82%** |
| `gemini-3.5-flash-lite` | ≈ $0,032 (~R$0,17) | **≈ $16 (~R$87)** | **−75%** |
| `gemini-3.6-flash` (default atual) | ≈ $0,131 (~R$0,70) | ≈ $65 (~R$353) | baseline |
| `gemini-3.5-flash` | ≈ $0,140 (~R$0,75) | ≈ $70 (~R$378) | +7% |
| `gemini-3.1-pro-preview` (≤200k, teto) | ≈ $0,186 (~R$1,00) | ≈ $93 (~R$502) | +43% |

*(câmbio de referência ~R$5,40/US$, igual ao research 008 — só para ordem de grandeza)*

`gemini-3.1-flash-lite` usa a divisão de preço de áudio/texto (§5.1) no cálculo acima; os
demais usam preço único por token de entrada.

> **Nota sobre o número do ticket 017.** A atualização de 2026-08-12 do ticket 017 estimou
> "R$650–780/mês" para `gemini-3.6-flash` em 500 atendimentos, descrita lá como "ordem de
> grandeza", não um recálculo pela metodologia do research 008. Recalculando com essa
> metodologia (mesmas premissas de tokens do research 008, só trocando a tarifa), o número
> fica em **~R$353/mês** — abaixo da faixa do ticket 017. Reporto os dois: o do ticket 017
> fica registrado lá como estava; o daqui é o recálculo pedido por este ticket, com a
> mesma metodologia usada para todos os candidatos, para comparação em pé de igualdade.

---

## 6. Tabela comparativa consolidada

| Critério | `gemini-3.6-flash` | `gemini-3.5-flash` | `gemini-3.5-flash-lite` | `gemini-3.1-flash-lite` | `gemini-3.1-pro-preview` (teto) |
|---|---|---|---|---|---|
| Áudio (WAV/MP3/AIFF/AAC/OGG/FLAC) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Imagem (inclui HEIC/HEIF) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Function calling nativo | ✅ | ✅ | ✅ | ✅ | ✅ |
| `thinkingLevel` com `low`/`high` confirmado na doc | ✅ (`minimal/low/medium/high`) | parcial (thinking suportado, níveis não detalhados na tabela consultada) | ✅ (`minimal/low/medium/high`) | ⚠️ não confirmado (só a variante `-image` aparece na tabela) | ✅ (`low/medium/high`) |
| Reasoning — perfil declarado pela Google | agentic/multimodal, workhorse atual | "mais inteligente" da linha 3.5 | extração/subagente/alto volume | tarefas leves de alta frequência | raciocínio complexo, thinking default high |
| Custo/atendimento (500/mês) | ~R$353/mês | ~R$378/mês | **~R$87/mês** | **~R$64/mês** | ~R$502/mês |
| Status | GA, default atual | GA | GA | GA | Preview |

---

## 7. Recomendação

**Trocar `gemini-3.6-flash` por `gemini-3.5-flash-lite`.**

Motivos, em ordem de peso:

1. **Atende integralmente os quatro critérios obrigatórios do ticket.** Áudio (incl. OGG),
   imagem (incl. HEIC), function calling e `thinkingLevel` com `"low"`/`"high"` **confirmados
   na doc oficial** — o mesmo nível de confirmação que `gemini-3.6-flash` tem hoje, não um
   nível inferior.
2. **O perfil de reasoning declarado pela própria Google bate com o escopo da fase 1.** A
   Google posiciona esse modelo para extração de dado e tarefas de subagente de alto
   volume — é qualificação conversacional, não raciocínio aberto. O ticket já delimitou que
   fase 1 não precisa de raciocínio pesado tipo Pro.
3. **Custo ~75% menor que o modelo pinado hoje** (~R$87/mês vs. ~R$353/mês em 500
   atendimentos/mês), com a mesma metodologia de estimativa usada no research 008.
4. **Entre os dois Flash-Lite, prefiro `3.5` a `3.1` apesar do `3.1` ser ~25% mais barato**,
   porque o `thinkingLevel` de `gemini-3.1-flash-lite` **não está confirmado na doc oficial**
   (§3.1, §8) — arriscaria violar a exigência explícita do ticket por uma diferença de
   ~R$23/mês, que não importa para uma loja de ticket R$2.000–50.000. `gemini-3.5-flash-lite`
   também é a opção mais recente (lançada no mesmo dia que `gemini-3.6-flash`, 2026-07-21,
   como par "lite" da geração atual), o que reduz o risco de ficar comparando contra uma
   linhagem que a própria Google já não está mais atualizando.

**O que NÃO recomendo:**

- **Não subir para `gemini-3.1-pro-preview`.** É Preview (não GA), custa 43% a mais que
  `gemini-3.6-flash` e a fase 1 não precisa do raciocínio adicional que ele oferece.
- **Não usar `gemini-3.1-flash-lite`** apesar do custo levemente menor, pelo motivo do
  item 4 acima — falta de confirmação de `thinkingLevel` na doc.

### O que fica pendente para quem decidir aplicar esta troca

- **Atualizar `.env.example` e o ticket 017** trocando `gemini-3.6-flash` por
  `gemini-3.5-flash-lite` — deliberadamente **não fiz isso aqui**, por instrução explícita
  deste ticket (mudança de modelo pinado é decisão de outra sessão/do dono do projeto).
- **Validar empiricamente antes de produção** (ver §8): teste de alucinação/fidelidade em
  cima de transcrições de qualificação (reais ou sintéticas) comparando
  `gemini-3.5-flash-lite` com thinkingLevel `"low"` contra o comportamento atual de
  `gemini-3.6-flash`, para checar se a diferença de "índice de inteligência" observada em
  benchmark de terceiros (§3.2) se traduz em erro real neste caso de uso específico.

---

## 8. Lacunas — o que a doc não fecha

1. **Formato OGG/Opus do WhatsApp** — vale para qualquer candidato, não só o recomendado.
   A doc de áudio da Google só documenta "OGG Vorbis". Segue sem confirmação — mesmo item
   já registrado como pendente no research 008, ainda não fechado.
2. **`thinkingLevel` exato de `gemini-3.1-flash-lite`** (o modelo de chat, não a variante
   `-image`) não aparece na tabela oficial de suporte a thinking. Foi o motivo decisivo para
   preferir `gemini-3.5-flash-lite` no lugar dele (§7).
3. **Taxa de alucinação/fidelidade em tarefa de qualificação conversacional** não é medida
   publicada por nenhuma fonte (nem primária, nem secundária) para nenhum destes modelos.
   O que existe são benchmarks genéricos de coding/agentic (SWE-Bench, MRCR, etc.), que não
   testam diretamente "inventar disponibilidade de produto" ou "inventar dado de cliente".
   Fica como validação empírica a fazer antes de produção, não como algo que a doc responde.
4. **Preço em Reais e câmbio** seguem sendo estimativa de ordem de grandeza (mesmo caveat do
   research 008) — não são cotação em tempo real.
