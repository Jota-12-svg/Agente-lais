# Custo da API — o que dá pra economizar

> Nota de referência para quando o **runtime de produção** for desenhado (é névoa no
> `wayfinder/map.md` — "Stack e hospedagem do runtime"). Números e mecânica vêm do
> **research 017** (`wayfinder/research/017-escolha-do-modelo-gemini.md`), seções 5, 6, 9, 11.

## A pergunta que sempre aparece: "e se eu salvar o contexto no banco?"

**Não baixa o custo da chamada.** O modelo é **sem estado** — ele não lembra de nada entre
requests. Para ele saber o que já foi dito, o histórico tem que ir **dentro de cada request**,
não importa de onde você carregou (Supabase, arquivo, RAM). O banco é a *sua* memória; ele não
muda o que a Google recebe e fatura.

Salvar a conversa no Supabase **é necessário** de qualquer forma (memória do agente + laço de
aprendizado — tickets 010/013). Só que serve pra outra coisa, não pra cortar custo de API.

O equivalente a "a API lembrar" chama-se **cache de contexto** (abaixo).

## Onde o dinheiro vai hoje (medido no protótipo, 02/09/2026)

Numa conversa de qualificação de ~4–7 turnos, com `gemini-3.6-flash` a preço cheio
($1,50/1M entrada, $7,50/1M saída):

| Parcela | % da conta | Por quê |
|---|---|---|
| **system-prompt.md reenviado a cada chamada** | **~80%** | 1.676 tokens × nº de turnos. A API não tem memória. |
| Histórico da conversa + mensagens do cliente | ~8% | cresce a cada turno |
| Respostas da Manu (saída) | ~12% | saída custa 5× a entrada por token, mas são poucas |

A mensagem de texto do cliente é ~30 tokens. **O que pesa é o "manual" que viaja junto.**

## Os levers, em ordem de impacto

### 1. Cache de contexto (prefix caching) — o grande lever

Registra o prefixo estável **uma vez**, referencia por ID nas chamadas seguintes. Token
cacheado = **~1/10** do preço de entrada (research 017 §5):

| | entrada normal | cache hit | armazenamento |
|---|---|---|---|
| `gemini-3.6-flash` (preço cheio) | $1,50/1M | **$0,15/1M** | $1,00/1M/hora |
| `gemini-3.5-flash-lite` | $0,30/1M | **$0,03/1M** | $1,00/1M/hora |

- **Cachear:** system prompt + (quando existir) catálogo de produtos + exemplos few-shot.
- **Mínimo:** o prefixo precisa ter **≥ 4.096 tokens** nos modelos 3.x. O system prompt hoje
  tem 1.676 — **não é cacheável ainda**. Quando o catálogo entrar (tickets 011/032), cruza os
  4k e passa a ser.
- **Idêntico byte a byte:** o cache só bate se o prefixo não mudar. O protótipo cola um bloco
  "Contexto agora" (data/hora) no system prompt — isso quebraria o cache. **Em produção:**
  system prompt estático cacheado + data/hora como primeira mensagem separada em `contents`.
- **TTL** padrão 1 hora, renovável. Armazenamento de um prefixo de 5k quente o dia todo ≈
  R$ 3–6/mês (desprezível).
- **Cache implícito** (automático, 2.5+; mínimo 4.096 nos 3.x) dá algum desconto sem gerenciar
  nada — hits aparecem em `usageMetadata.cachedContentTokenCount`. O `pricing.mjs` já desconta
  esse campo quando aparece.
- **Efeito:** os ~80% da conta viram ~8%. Conversa de 4 turnos: R$ 0,07 → **~R$ 0,03**.

### 2. Debounce de mensagens

Cliente fragmenta no WhatsApp: "oi" / "tudo bem?" / "queria ver" / "um sofá" em 4 bolhas.
Em vez de 4 chamadas (cada uma carregando o prefixo inteiro), esperar ~3–5s e juntar numa só.
**~20–40% menos chamadas.**

### 3. Resumo em vez de histórico cru

Conversa longa = histórico sem limite. Guardar o transcript inteiro no Supabase, mas mandar
pro modelo só um resumo compacto ("João, quer luminária de chão, pra semana que vem") + os
últimos 2–3 turnos. **Aqui o banco entra de verdade** — como fonte do resumo, não pra baixar
o custo por si só.

### 4. Modelo mais barato

`gemini-3.5-flash-lite`: entrada 5× mais barata, saída 3×. Plano B do research 017 §9, a
validar com ~20–30 casos reais (áudio com sotaque, planilha fotografada, regra de escalar).
Seletor de modelo no chat compara o tom.

### 5. Saída curta

`maxOutputTokens` + instrução de concisão (já feito — "1–3 linhas"). Saída é $7,50/1M, 5× a
entrada por token. Multi-bolha custa um pouco mais.

### 6. `thinking_level: "minimal"`

Já feito. Confirmado: com `minimal`, `thoughtsTokenCount` volta 0 (com `high`, ~1.100).

### 7. Batch API para o laço de aprendizado

A análise **offline** das conversas passadas (não o chat ao vivo) roda no Batch a ~50% do
preço (research 017 §2.1). O chat ao vivo tem que ser Standard.

## Estimativa somando os levers (10 atendimentos/dia)

| Cenário | ~R$/mês |
|---|---|
| Hoje (protótipo, sem otimização, sem cache) | 22–30 |
| + cache de prefixo + debounce | 8–15 |
| + `gemini-3.5-flash-lite` | 4–8 |

Contexto: uma venda de um vaso cobre ~1 ano de API. Custo **não é** a variável decisiva
(research 017 §9 e §11.6) — mas os levers 1 e 2 são baratos de implementar e valem a pena.

## Para o desenho do runtime

- **Interface fina de LLM** (já na decisão do ticket 017): troca de modelo = uma linha.
  A lógica de custo do `pricing.mjs` entra aqui.
- **Prefixo estável e versionado:** system prompt + catálogo num blob que muda raramente,
  cacheado; tudo dinâmico (hora, estado da loja, resumo da conversa) fora do prefixo.
- **Estado da conversa no Supabase** (transcript completo) ≠ **o que vai pro modelo**
  (resumo + turnos recentes). Dois artefatos diferentes.
