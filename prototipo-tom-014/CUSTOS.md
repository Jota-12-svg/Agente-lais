# Custo da API — o que dá pra economizar (validado 2026-09-02)

> Nota de referência para o desenho do **runtime de produção** (névoa do `wayfinder/map.md`:
> "Stack e hospedagem do runtime", "Modelo de dados no Supabase"). Base: research
> `wayfinder/research/017-escolha-do-modelo-gemini.md` (§5, §6, §11) + validação desta sessão
> contra `ai.google.dev` e testes reais com a chave.
>
> **Lembrete de proporção:** no volume real (~10 atendimentos/dia), a conta de API inteira é
> **~R$ 15–40/mês** (research 017 §11.4). "Uma venda de um vaso cobre ~1 ano de API." O valor
> destes levers **quase nunca é o R$ economizado** — é (a) disciplina de arquitetura cara de
> retrofitar, (b) proteção se o volume crescer, (c) latência e tom. Onde um lever troca risco
> de negócio por centavos, é mau negócio.

## A pergunta: "e se eu salvar o contexto no banco?"

**Não baixa o custo da chamada.** O modelo é **sem estado** — para saber o que já foi dito, o
histórico vai **dentro de cada request**, não importa de onde você o carregou (Supabase,
arquivo, RAM). Confirmado na doc: *"maintain the conversation history as an array of steps on
the client side... In subsequent requests, pass the accumulated steps"*
(`ai.google.dev/gemini-api/docs/text-generation`).

Salvar a conversa no Supabase **é necessário** (memória do agente + laço de aprendizado —
tickets 010/013). Só que serve pra outra coisa, não pra cortar custo de API. O equivalente a
"a API lembrar" é o **cache de contexto** (lever 1).

## Onde o dinheiro vai hoje (medido no protótipo)

Conversa de qualificação de ~4–7 turnos, `gemini-3.6-flash` a preço cheio ($1,50/$7,50 — a
promo de 2026 não vale nesta conta):

| Parcela | % da conta | Por quê |
|---|---|---|
| **system-prompt.md reenviado a cada chamada** | **~80%** | 1.676 tokens × nº de turnos. A API não tem memória. |
| Histórico da conversa + mensagens do cliente | ~8% | cresce a cada turno; na Fase 1 fica curto |
| Respostas da Manu (saída) | ~12% | saída custa 5× a entrada por token |

A mensagem de texto do cliente é ~30 tokens. **O que pesa é o "manual" que viaja junto.**

---

## Os levers

### Lever 1 — Cache de contexto (prefix caching) · ✅ maior retorno, menor risco

**O que é:** registra o prefixo estável (system prompt + catálogo + few-shot) num objeto
`CachedContent`, referencia por id nas chamadas. Token cacheado ≈ **1/10** do preço de entrada
**no `gemini-3.6-flash`**.

**Verificado nesta sessão (teste real com a chave):**
- `POST /v1beta/cachedContents` com `{"model":"models/gemini-3.6-flash","systemInstruction":{parts:[{text:…}]},"ttl":"120s"}` → **cria com 1.675 tokens**. O mínimo documentado de 4.096 **não foi aplicado** — o `system-prompt.md` atual já é cacheável hoje, sem inchar. (A doc diz 4.096; a API aceitou 1.675. Confirmar o piso real lendo a mensagem de erro se um prompt menor falhar.)
- A chamada seguinte com `{"cachedContent":"cachedContents/<id>","contents":[…]}` devolve `usageMetadata.cachedContentTokenCount: 1675` — **hit confirmado**. O `pricing.mjs` já lê esse campo.
- `systemInstruction` **é cacheável** junto com `contents` e `tools` no mesmo objeto.
- Preço do hit no `gemini-3.6-flash`: **$0,075/1M** (promo) / **$0,15/1M** (cheio) vs $0,75 / $1,50 de entrada normal → **10×**. Armazenamento $0,50/1M/hora (promo) / $1,00 (cheio) — desprezível (~R$ 3–10/mês pra um prefixo quente o dia todo).
- **`gemini-3.5-flash-lite`: o cache FUNCIONA na API** (testado: cria, devolve `cachedContentTokenCount`), **mas a página de preços diz `Context caching: Not available`**. Leitura provável: sem desconto (token cacheado cobrado como entrada normal). **Não conte com economia de cache no plano B** até a fatura confirmar. `pricing.mjs` agora estima o cache do lite sem desconto.

**Efeito:** os ~80% da conta viram ~8%. **Medido no protótipo (`cache de prefixo` na barra):**
`gemini-3.6-flash`, mensagem de qualificação — **sem cache R$ 0,0172, com cache R$ 0,0046
(–73%)**. Com 5 turnos de histórico o `cachedContentTokenCount` fica **constante** (1.675) — o
hit no prefixo aguenta a conversa crescer.

**A disciplina que tem de nascer com o runtime — prefixo estável × contexto dinâmico:**
o protótipo (`run.mjs`) cola um bloco `## Contexto agora` (data/hora, dentro/fora do
expediente) **dentro do `systemInstruction`**. Isso mudaria o prefixo a cada chamada e
**mataria o cache** (explícito e implícito). Em produção: **system prompt (+ catálogo)
estático e cacheado; data/hora e estado da loja como primeira entrada em `contents`.** É
decisão de design cara de retrofitar — o protótipo já demonstra o erro.

**Implementação:** o cliente fino de LLM ganha um gerenciador de prefixo — cria o
`CachedContent` no boot, guarda o id (variável em memória se processo longo; store externo se
serverless), renova o TTL antes de expirar, recria on-`404`. Cada chamada referencia o id no
lugar do `systemInstruction`.

**Conflitos:** praticamente nenhum. Transparente ao conteúdo — hit e miss produzem a **mesma
saída**, então não toca escala (012), aprendizado (013) nem tom (014). **Risco LGPD a evitar:**
nunca colocar resumo da conversa ou campos extraídos **dentro** do prefixo cacheado — aí dado
pessoal residiria num cache Google. O prefixo é só material estático da loja.

**Interface fina de LLM:** o `cachedContents` é conceito Google; o fallback kie.ai não tem
equivalente (research 008). A interface precisa de um terceiro conceito além de `system` e
`messages` — um "prefixo estável" que ela cacheia (Google) ou manda inline (kie.ai) por
dentro. Decisão de design explícita, não improviso.

**Prematuro?** Não. A separação prefixo × dinâmico é dia 1. O objeto `cachedContents` são ~30
linhas, logo depois do esqueleto do cliente de LLM.

---

### Lever 2 — Debounce de mensagens · ✅ cedo, quase de graça

**O que é:** cliente fragmenta no WhatsApp ("oi" / "tudo bem?" / "queria ver" / "um sofá").
Em vez de 4 chamadas (cada uma carregando o prefixo), esperar ~3–5 s e juntar num turno só.

**Implementação:** buffer por `contact` (telefone). Evento do WhatsApp → anexa ao buffer e
(re)arma timer de 3–5 s; bolha nova reinicia o timer; fim da janela → uma chamada com as
bolhas concatenadas. Em **processo longo** (que o self-hosted do WhatsApp — tickets 016/027 —
já força): `Map` + `setTimeout`, trivial. Serverless exigiria fila com delay — mais um
argumento pra stack de processo longo.

**Conflitos — favorável em quase tudo:**
- **Escala (012):** melhora. Ver a irritação inteira ("isso é um absurdo" + "quero uma
  pessoa" + "não acredito" em 3 bolhas) antes de responder = decisão de escalar melhor. A
  regra "uma leva curta de perguntas por vez" (010) também.
- **Tom (014):** melhora. As consultoras respondem "em alguns minutos", não instantâneo;
  "instantâneo denuncia máquina". Debounce aproxima do ritmo humano.
- **Aprendizado (013):** risco leve — se o transcript salvar as bolhas juntas, perde-se como
  o cliente fragmenta. Mitigação: salvar as bolhas cruas com timestamps; concatenar **só** pro
  modelo.
- **Limite:** janela > ~8 s faz o agente parecer travado → irrita → gatilho de escala. Manter
  3–5 s. E: buffer só em memória + processo cai = mensagens somem. Decidir durabilidade do
  buffer junto com "sobreviver a reinício" (névoa).

**Prematuro?** Não. Logo depois do loop básico webhook→modelo→resposta.

---

### Lever 3 — Resumo em vez de histórico cru · ⚠️ prematuro na Fase 1, risco sobre a escala

**O que é:** mandar (resumo do miolo antigo) + (últimos 2–3 turnos crus) + msg nova, em vez
de todos os turnos.

**Realidade da Fase 1:** a conversa de qualificação quase nunca fica longa (research §11.2:
~5 turnos típico, arquiteto escala em ~2, "pesado" chega a 8). O histórico cru quase não pesa
— ~4.800 tokens somados nas invocações vs ~35.000 de prefixo. **Ganho pequeno.**

**Risco sério — o gatilho "conversa longa sem avanço" (012):** depende de o modelo **perceber
a estagnação** ("perguntei o prazo 3× e o cliente desviou 3×"). Um resumo genérico ("cliente
quer sofá, sem prazo") **apaga essa textura** e esconde o giro em falso → o agente insiste com
um cliente de ticket alto que devia ter escalado (o pior caso que o 012 existe pra evitar).
Se o resumo entrar, tem de carregar **estado explícito dos gatilhos** (contador de perguntas
sem resposta, irritação acumulada) **ou** manter sempre ~3 turnos crus.

**Risco — aprendizado (013):** "o fracasso também é sinal", todo atendimento gera registro
(010). **Nunca resumir e descartar o cru.** Transcript cru imutável e retido no Supabase;
resumo é derivado e descartável.

**Risco — re-perguntar (010 regra 4):** o agente "esquece" o nome ou o orçamento de 6 turnos
atrás e re-pergunta → vira interrogatório. Mitigação: os campos (nome, o que procura, para
quando, modo + oportunistas) vivem como **estado estruturado** (via `responseSchema`),
reinjetado cru em toda chamada, nunca dependente do resumo.

**Prematuro?** Sim, pra Fase 1. Fazer só com: (i) dado real de conversas longas frequentes;
(ii) 013 fechado; (iii) schema maduro. **Agora:** só os campos como estado estruturado
separado (isso sim, dia 1) + um teto bobo de "últimos ~15 turnos crus".

---

### Lever 4 — Modelo mais barato / `gemini-3.5-flash-lite` · ⛔ trocar agora seria erro

**Economia:** ~R$ 8–42/mês (research §11.6). **Custo do erro:** perder um cliente de
R$ 2.000–50.000.

**Contrato (model card + doc de thinking, 2026-09-02):** o lite aceita todos os thinking
levels e **já vem em `minimal`**; function calling, structured output, áudio/imagem, batch =
suportados. **Sem bloqueio de capacidade.** Cache: funciona na API mas sem preço de desconto
(lever 1).

**Caveat de qualidade DOCUMENTADO:** a Google posiciona o lite para *"subagent tasks and
document parsing"*, *"simple data extraction"*, *"where latency and API cost are the primary
constraints"* — **não** como modelo de julgamento. O `gemini-3.6-flash` é *"general agentic
and everyday tasks"*. A tarefa da Lais Aliski Casa (decidir **quando escalar**, ler planilha
fotografada sem trocar R$ 3.000 por R$ 30.000, entender áudio com sotaque) é exatamente onde
"simple data extraction" é um aviso.

**Conflitos:** escala (012) — modelo mais fraco pode não pegar irritação sutil, intenção de
compra indireta, ou que uma lista é planilha de arquiteto. Áudio com sotaque → relance furado.
Aprendizado (013) — o laço aprende sobre um agente pior. Tom (014) — pode aderir menos às
regras de condução.

**Prematuro?** Sim, e o projeto **já decidiu duas vezes** (017; research §9 e §11.6):
produção vai de `gemini-3.6-flash`; o lite é plano B **atrás da interface fina**, validável
com o teste de ~20–30 casos reais (áudio, planilha, regra de escalar) — que depende de
conversas reais que não existem (ticket 003 fechou sem exportação). **O seletor de modelo no
protótipo serve pra comparar o TOM agora; não é permissão pra trocar em produção.**

---

### Lever 5 — Saída curta · ✅ já feito, calibrar com o tom

`generationConfig.maxOutputTokens` (protótipo usa 800; produção ~400–500) + a instrução de
concisão no system prompt ("1 a 3 linhas"). **Delicado:** a resposta do 020 no 014 diz
"mensagens mais completas" — `maxOutputTokens` é **rede de segurança** contra textão, não a
ferramenta de tom (essa é o system prompt). Baixo demais → corta a resposta no meio
(`finishReason: MAX_TOKENS`), pior que textão. E a "fórmula de disponibilidade" e o anúncio de
escala são textos fixos relativamente longos — testar que cabem. Calibrar junto com a
validação de tom do 014.

---

### Lever 6 — `thinking_level: "minimal"` · ✅ decidido, mas MEDIR contra a escala

**Correção à doc atual (verificado 2026-09-02):** o default do `gemini-3.6-flash` é
**`medium`** (a doc de thinking diz "On (medium)"; o research 017 §6 dizia "dinâmico"). →
**é obrigatório setar `thinkingConfig.thinkingLevel: "minimal"` explicitamente em toda
chamada** ao 3.6-flash; sem isso cai em `medium` e a conta de saída (5× a entrada) dispara. O
lite já vem em `minimal`; o 3.7-flash rejeita `minimal` (piso `low`).

**Medido nesta sessão:** com `minimal`, `thoughtsTokenCount` volta ausente/0. Com `high`, ~1.147.

**Risco — escala (012):** `minimal` = raciocínio mínimo. "Ainda pensa o suficiente pra
decidir escalar" é **asserção do research §6, não medição**. O teste de qualidade tem de
rodar o eixo "regra de escalar" **com `minimal`**. Se falhar, subir pra `low` custa tokens
irrelevantes + ~alguns segundos (ainda dentro do "alguns minutos" do 014). **Trade-off barato
— registrar, não tratar como fé.**

---

### Lever 7 — Batch API para o laço de aprendizado · ✅ correto, mas distante

**Verificado:** *"50% of the standard cost"*. `gemini-3.6-flash` batch = $0,375/$1,875
(promo) → $0,75/$3,75 (2027). `gemini-3.5-flash-lite` batch = **$0,15/$1,25**. Endpoint
`:batchGenerateContent`, entrada JSONL `{"key","request"}`, turnaround alvo 24 h (expira em
48 h), 100 jobs concorrentes, resultados guardados 6 semanas, multimodal e caching suportados.
Chat ao vivo continua Standard.

**Uso:** classificar/anotar conversas passadas (desfecho: venda / reunião / satisfação /
fracasso — tickets 010/013) em lote noturno, a metade do preço. Job agendado que lê do
Supabase e escreve de volta.

**LGPD:** o job envia transcrições de clientes em lote. **Anonimização antes do batch** é
viável aqui (offline, sem pressão de latência) e alinhada ao `CLAUDE.md` ("anonimizadas
sempre que o uso permitir"). Jobs Batch têm retenção própria do lado da Google — verificar.

**Prematuro?** Muito. Depende do **mecanismo de aprendizado** (névoa), do **sinal de sucesso**
(013, aberto), do **schema Supabase**, e de **volume de conversas**. Por último.

---

## Sequência recomendada

**Fase 0 — o chão (não são levers):**
1. Decidir stack/hospedagem (névoa). Self-hosted do WhatsApp (016/027) empurra pra **processo
   longo** → debounce e cache-id triviais (em memória).
2. Cliente fino de LLM com: conceito de "prefixo estável" separado das mensagens; parâmetro
   `thinkingConfig.thinkingLevel`; todos os campos de `usageMetadata` logados.

**Fase 1 — primeiro runtime:**
3. `thinking: "minimal"` + `maxOutputTokens` (levers 6, 5) — dia 1, grátis, já decidido.
4. **Separação prefixo estável × contexto dinâmico** (data/hora e estado da loja em `contents`,
   nunca no `systemInstruction`) — dia 1, cara de retrofitar.
5. Campos extraídos como **estado estruturado** (`responseSchema`), reinjetados crus toda
   chamada — pré-requisito da qualificação (010) e de qualquer resumo futuro.
6. **Debounce** (lever 2, janela 3–5 s) — cedo; custo + tom + escala ao mesmo tempo. Bolhas
   cruas no transcript.
7. **Cache de prefixo explícito** (lever 1) — logo depois de (4). ~30 linhas, retorno alto em
   proporção, risco ~zero. Enriquece quando o catálogo (011/032) entrar.

**Fase 2 — depois de conversas reais + 013 fechado:**
8. Teste de qualidade `3.6-flash` × `flash-lite` nos 3 eixos. **Só trocar (lever 4) se empatar
   no eixo escala.** Até lá, `gemini-3.6-flash`.

**Fase 3 — quando o mecanismo de aprendizado existir:**
9. Resumo de histórico (lever 3) — só com evidência de conversas longas; desenhado com os
   gatilhos do 012 à frente; transcript cru sempre retido.
10. Batch API (lever 7) para a análise offline.

## Veredito

- **Fazer cedo, risco baixo:** cache de prefixo (lever 1) + a disciplina prefixo × dinâmico;
  debounce (lever 2). Levers 5 e 6 já feitos — obrigação é **medi-los contra a regra de
  escalar**, não assumir que não a degradam.
- **Não fazer agora:** modelo mais barato (lever 4 — o mapa já rejeitou 2×; precisa de
  conversas reais); resumo de histórico (lever 3 — prematuro na Fase 1, risco sobre a escala).
- **Distante:** Batch (lever 7 — depende de toda a névoa do aprendizado).
- **Proporção:** a conta inteira é ~R$ 15–40/mês. O trabalho se justifica pela **arquitetura**
  e pela **proteção de escala**, não pelo R$ de hoje.

## Lacunas — só teste com a chave / dado real fecha

1. **Cache do `flash-lite` tem desconto?** API cria e dá hit (testado); preço diz "Not
   available". Rodar um job e olhar a fatura: cobra o token cacheado a quanto? (`pricing.mjs`
   assume = entrada, sem desconto.)
2. **Piso real de tokens do cache.** Doc diz 4.096; a API aceitou 1.675 (testado). Testar um
   prompt menor e ler o número exato no erro.
3. ~~Hit de prefixo com histórico crescente.~~ **CONFIRMADO** — 5 turnos referenciando o mesmo
   `cachedContent`, `cachedContentTokenCount` constante em 1.675. (Implementado no protótipo.)
4. **`thoughtsTokenCount` com `minimal`** ao longo de ~20 chamadas reais de qualificação — 0
   sempre, ou às vezes dispara?
5. **Preço real desta conta** — a promo de 2026 não está sendo aplicada (billing = preço
   cheio). Reconciliar com a fatura do AI Studio.
6. **`toolUsePromptTokenCount`** — o `pricing.mjs` não soma esse campo; ver em que bucket a
   Google fatura os tokens de function calling.
7. **`gemini-3.5-flash-lite` × `gemini-3.6-flash`** nos 3 eixos (escala, áudio com sotaque,
   planilha) — o teste que decide o lever 4. Precisa de conversas reais.

## Fontes primárias (ai.google.dev, 2026-09-02)

Caching: `/gemini-api/docs/caching` · `/gemini-api/docs/generate-content/caching` ·
`/api/caching` (REST `CachedContent`) · `/api/generate-content` (`usageMetadata`).
Batch: `/gemini-api/docs/batch-mode`. Preço: `/gemini-api/docs/pricing`.
Thinking: `/gemini-api/docs/thinking`. Long context: `/gemini-api/docs/long-context`.
Multi-turn: `/gemini-api/docs/text-generation`. Model cards: `/gemini-api/docs/models/gemini-3.6-flash`,
`/gemini-api/docs/models/gemini-3.5-flash-lite`.
