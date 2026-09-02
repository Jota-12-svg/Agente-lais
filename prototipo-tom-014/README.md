# Protótipo de tom — teste ao vivo com a "Manu" (ticket 014)

> **Protótipo descartável.** Não é o runtime do agente. Serve para uma coisa só: você
> conversar com a Manu como se fosse um cliente e sentir se o tom está certo. A decisão de
> stack de produção é outra história (névoa do mapa, depende do ticket 018).

O que está sendo testado é o **`system-prompt.md`** — as instruções da Manu, destiladas dos
tickets 009, 010 (+ addendum), 012 e 014. O resto é encanamento.

## Como rodar

Precisa de **Node 20+** (já tem: 22.20) e da `GEMINI_API_KEY` do `.env` do projeto (a mesma
do ticket 017, tier pago).

```sh
cd "C:\Agente Lais\.claude\worktrees\wayfinder+como-o-agente-soa-014\prototipo-tom-014"
node --env-file="C:\Agente Lais\.env" run.mjs
```

Se preferir não passar o `--env-file`, só `node run.mjs` também funciona — o script procura o
`.env` do projeto sozinho. Se não achar, ele diz o que fazer.

Depois abra **http://localhost:4014** no navegador.

- **Modelo padrão do protótipo: `gemini-3.5-flash-lite`** (teste de tom + custo). O
  `gemini-3.6-flash` do `.env` é o default de *produção* (ticket 017) — aqui é desacoplado.
  Trocar: seletor de modelo no chat, ou `PROTOTIPO_MODEL=gemini-3.6-flash` no ambiente.
- _thinking_ vem do `.env` (`LLM_THINKING_LEVEL`), padrão `minimal`.
- Porta: `4014` (mude com `PROTOTIPO_PORT=xxxx` se precisar).

## Como testar

Você é o **cliente**. Digite e mande. Sugestões de roteiro (batem com os 7 cenários do
`014-prototipo-tom.html`):

1. Só "oi, bom dia" e deixe ela puxar a conversa.
2. "sou arquiteta, tô com um projeto, vou te mandar a lista de itens" — ela deve escalar na hora.
3. "vocês têm aquele vaso grande de cerâmica bege que vi no insta?" — ela **não pode** dizer que tem.
4. "quanto custa a poltrona de couro da vitrine?" — ela **não pode** dar preço.
5. Deixe a conversa chegar ao ponto de escalar e veja como ela passa a bola.
6. "isso é um robô?" — ela confirma na hora.
7. "já mandei mensagem 3 vezes e ninguém responde, quero falar com uma PESSOA" — irritação = escala.

Marque **"fora do horário"** na barra de cima para testar o caminho de madrugada (ela
promete a loja, não a pessoa).

### Imagem e áudio

- **📎** anexa um arquivo de imagem (`image/*`) ou áudio (`audio/*`) — máx ~15 MB, pode
  anexar mais de um. Aparece um chip acima da caixa de texto; o **✕** remove.
- **🎤** grava uma nota de voz pelo microfone (clique para começar, clique de novo para
  parar). Pede permissão do navegador.
- Você pode mandar mídia com ou sem texto junto.
- A mídia vai pra Gemini como `inlineData` e conta na `in` da linha cinza (imagem
  ~260–2.300 tokens, áudio ~960/30s). A linha mostra `📎N` quando o turno levou anexo.
- Roteiros de mídia (cenário 6 do `014-prototipo-tom.html`): foto de um produto (ela **não**
  identifica, descreve e escala), foto de um ambiente (ela usa pra entender o pedido), print
  de uma lista de itens (= arquiteto, escala), nota de voz (ela devolve o entendimento por
  escrito).

### Passagem para a consultora (handoff)

O que se garante aqui: **a Manu nunca responde ao mesmo tempo que a consultora.** Regras dos
tickets 009 e 012.

- Barra de baixo, **enviar como: [Cliente] [Consultora]**. Trocar para **Consultora** e
  mandar uma mensagem = uma consultora humana entrou na conversa (balão com borda dourada).
- A partir daí a Manu fica **em silêncio** nessa conversa — se o cliente escrever, aparece
  uma linha "a Manu está em silêncio", não um balão dela.
- A Manu também pode **escalar sozinha**: quando um gatilho do ticket 012 aparece (compra
  concreta, pediu uma pessoa, irritação, negociação de preço, planilha de arquiteto…), ela
  manda o aviso de passagem e emite um sinal interno `[[ESCALAR: motivo]]` (removido antes
  de chegar ao cliente). O estado vira **escalado** e ela para de responder.
- O chip acima do chat mostra o estado: `qualificando` → `escalado` → `com a consultora`.
- **retomada (cliente volta dias depois):** marque a checkbox e mande como cliente — a Manu
  responde **só uma vez**, reafirmando que a consultora vai atender, sem retomar a
  qualificação. O número exato de dias dessa janela é decisão do ticket 013.
- **ponto cego** (checkbox na barra de cima — ticket 009 / research 019): simula a consultora
  respondendo de um dispositivo que o agente não enxerga (WhatsApp para Windows). A mensagem
  dela não gera evento, a Manu **não sabe** que ela assumiu e **responde por cima** — é o
  risco que o projeto ainda tem que resolver (provável saída: WhatsApp Web).

Clique em **"instruções"** para ler o system prompt. Ajuste o `system-prompt.md`, **reinicie
o servidor** (Ctrl+C e rode de novo — ele lê o arquivo no boot), e prove de novo.

## O que a linha cinza embaixo de cada resposta quer dizer

`612ms · gemini-3.6-flash · in 1768 / out 52 · ~$0.00304 · ~R$ 0,017`

- **tempo** da chamada · **modelo** que respondeu · **tokens** entrada / saída (/ pensamento)
- **custo estimado** da chamada, em US$ e R$ (o `~` lembra que é estimativa — ver calibração)

## Tracking de custo

Toda chamada é estimada (a partir dos tokens **reais** que a API devolve) e registrada:

| Onde | O quê |
|---|---|
| **barra no topo do chat** | acumulado da sessão + desta conversa + nº de respostas + preço usado |
| **linha cinza sob cada resposta** | `~$0.0032 · ~R$ 0,018` da chamada |
| **`http://localhost:4014/custos`** | painel: total, médias, por modelo, projeção mensal, como calibrar |
| **`node custos.mjs`** | o mesmo resumo no terminal |
| **`custos.jsonl`** | log linha a linha — fora do git |

### Por que 4 mensagens custam ~R$ 0,07

Não é a sua mensagem de texto (essa é ~30 tokens). O que pesa: **a API não tem memória**, então
**toda** chamada reenvia (a) o `system-prompt.md` inteiro — ~1.680 tokens, as instruções da
Manu — e (b) a conversa toda até ali. Numa conversa de 4 turnos, o system prompt sozinho é
**~80% dos tokens de entrada** (ele vai 4 vezes). Daí ~R$ 0,018/resposta.

**Em produção isso cai muito:** o system prompt vira *cache de prefixo* — a parte fixa custa
1/10 do preço (research 017 §5). Aí a conversa de 4 turnos sai por ~R$ 0,03 em vez de R$ 0,07.
O protótipo não faz isso de propósito (é throwaway). O `gemini-3.5-flash-lite` também corta
~4× — teste no seletor de modelo.

### Preço e calibração

A doc da Google lista preço **promocional** 2026 para o `gemini-3.6-flash` ($0,75/$3,75), mas
**essa promo não está valendo nesta conta** — o billing real bate com o **preço cheio**
($1,50/$7,50), que é o padrão do `pricing.mjs`. Medição de 02/09: estimativa a preço cheio
ficou dentro de ~8% do billing (fator ×0,92).

**Para confirmar / ajustar na sua conta** — medição limpa contra o billing:

```
node calibrar.mjs start                  # zera o log, explica o passo a passo
# ... anota o billing, conversa com a Manu, espera ~15 min, anota de novo ...
node calibrar.mjs 0,88 0,97               # compara e diz o fator
```

Se o fator sair longe de 1, ponha no `.env`:

```
COST_CALIBRATION=0.92     # multiplica todas as estimativas
# ou granular:
GEMINI_PRICE_IN=1.34
GEMINI_PRICE_OUT=6.70
```

Continua **estimativa** — o número que conta é o do painel do [AI Studio](https://aistudio.google.com/).

### Comparar modelos

O seletor **modelo** na barra do chat troca entre `gemini-3.6-flash` (produção),
`gemini-3.5-flash-lite` (~4× mais barato — plano B do research 017 §9) e `gemini-3.7-flash`.
Serve para ver, na mesma conversa, se o `lite` mantém o tom por uma fração do custo.

### Cache de prefixo (implementado)

A chave **"cache de prefixo"** na barra do chat (ligada por padrão) usa um objeto
`cachedContents` da Google com o **system prompt estático** — o resto (data/hora, estado da
loja) vai em `contents`, nunca no prefixo. Medido: `gemini-3.6-flash`, mensagem de
qualificação — **sem cache R$ 0,017, com cache R$ 0,005 (–73%)**. A linha cinza mostra
`cache 1675` quando há hit. No `gemini-3.5-flash-lite` o cache funciona mas **sem desconto de
preço** (a tabela da Google diz "Not available"). Estado dos caches: `/cache`. Os objetos são
apagados no Ctrl+C e varridos no boot (marcados com displayName `prototipo-tom-014`).

### Como economizar de verdade

Ver **[`CUSTOS.md`](CUSTOS.md)** — por que salvar contexto no banco não baixa o custo (o
modelo é sem estado), e os levers que baixam: cache de prefixo (feito), debounce de mensagens,
resumo em vez de histórico cru, `flash-lite`, Batch para o laço de aprendizado. Backing
detalhado da validação contra a doc: [`CUSTOS-api-referencia.md`](CUSTOS-api-referencia.md).

`pricing.mjs` é reaproveitável para a interface de LLM de produção.

## Anotações para a próxima sessão

O que sair deste teste (tom aprovado, ajustes no prompt, respostas às 8 perguntas abertas)
volta para o ticket `014-como-o-agente-soa.md`. Este diretório pode ser apagado depois.
