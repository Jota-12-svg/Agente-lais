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

`420ms · gemini-3.6-flash · campo: thinkingConfig.thinkingLevel · in 812 / out 96 / thinking 41`

- **tempo** da chamada
- **modelo** que respondeu (versão real devolvida pela API)
- **campo** que funcionou para passar o `thinking_level` — dado direto para o **ticket 018**
  (a doc não fixa se é `generationConfig.thinkingLevel` ou `...thinkingConfig.thinkingLevel`)
- **tokens** de entrada / saída / pensamento

## Anotações para a próxima sessão

O que sair deste teste (tom aprovado, ajustes no prompt, respostas às 8 perguntas abertas)
volta para o ticket `014-como-o-agente-soa.md`. Este diretório pode ser apagado depois.
