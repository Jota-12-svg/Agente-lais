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

`612ms · gemini-3.6-flash · in 1768 / out 52 · $0.00149 · R$ 0,0082`

- **tempo** da chamada · **modelo** que respondeu · **tokens** entrada / saída (/ pensamento)
- **custo estimado** da chamada, em US$ e R$

## Tracking de custo

Toda chamada à API é estimada e registrada. Fontes de preço: research 017 §11.1
(`pricing.mjs`). Três formas de olhar:

| Onde | O quê |
|---|---|
| **barra no topo do chat** | acumulado da sessão do servidor + desta conversa + nº de respostas |
| **`http://localhost:4014/custos`** | painel: total, média por conversa / por mensagem, por modelo, projeção mensal |
| **`node custos.mjs`** | o mesmo resumo no terminal |
| **`custos.jsonl`** | log linha a linha (uma por chamada) — fora do git, some no `.gitignore` |

**É estimativa** — token count × preço de tabela × câmbio ~R$ 5,50/US$. O número da **fatura
real** está no painel do [Google AI Studio](https://aistudio.google.com/). A projeção mensal
do painel fica *abaixo* do research 017 §11.4 (~R$ 28/mês típico) de propósito: o protótipo
não usa cache de prefixo nem tool calls, que pesam em produção.

`pricing.mjs` é reaproveitável: quando o runtime de produção existir, a mesma lógica de custo
por chamada entra na interface fina de LLM.

## Anotações para a próxima sessão

O que sair deste teste (tom aprovado, ajustes no prompt, respostas às 8 perguntas abertas)
volta para o ticket `014-como-o-agente-soa.md`. Este diretório pode ser apagado depois.
