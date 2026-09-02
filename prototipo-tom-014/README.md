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

- Modelo e nível de _thinking_ vêm do `.env` (`LLM_MODEL`, `LLM_THINKING_LEVEL`); o padrão é
  `gemini-3.6-flash` / `minimal`.
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

Marque **"fora do horário de atendimento"** na barra de cima para testar o caminho de
madrugada (ela promete a loja, não a pessoa).

Clique em **"ver instruções da Manu"** para ler o system prompt. Ajuste o `system-prompt.md`,
salve, clique em **"Reiniciar conversa"** e prove de novo — o servidor relê o arquivo a cada
mensagem.

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

### Preço e calibração — importante

A doc da Google lista um preço **promocional** de 2026 para o `gemini-3.6-flash`
($0,75 in / $3,75 out). **Essa promo não estava valendo nesta conta** em 02/09/2026: o
billing real subiu ~2× mais rápido que a estimativa promocional. Por isso o `pricing.mjs`
usa o **preço cheio** ($1,50 in / $7,50 out), que bateu com o billing.

Para deixar exato na sua conta: converse um pouco, veja o total em `/custos`, compare com o
delta do painel do [Google AI Studio](https://aistudio.google.com/) (tem ~10 min de atraso) e,
se divergir, ajuste no `.env`:

```
COST_CALIBRATION=0.5      # se a promo valer pra você (metade do preço cheio)
# ou, granular:
GEMINI_PRICE_IN=0.75
GEMINI_PRICE_OUT=3.75
```

Continua sendo **estimativa** — o número que conta é o do painel do AI Studio.

### Comparar modelos

O seletor **modelo** na barra do chat troca entre `gemini-3.6-flash` (produção),
`gemini-3.5-flash-lite` (~4× mais barato — plano B do research 017 §9) e `gemini-3.7-flash`.
Serve para ver, na mesma conversa, se o `lite` mantém o tom por uma fração do custo.

`pricing.mjs` é reaproveitável para a interface de LLM de produção.

## Anotações para a próxima sessão

O que sair deste teste (tom aprovado, ajustes no prompt, respostas às 8 perguntas abertas)
volta para o ticket `014-como-o-agente-soa.md`. Este diretório pode ser apagado depois.
