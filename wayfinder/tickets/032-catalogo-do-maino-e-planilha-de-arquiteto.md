---
id: "032"
title: Obter o catálogo de produtos do Mainô e exemplos de planilha de arquiteto
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

> **Nasceu da divisão do ticket [004](004-acesso-a-planilha-e-ao-catalogo.md) em 2026-08-30.**
> O 004 pedia três amostras reais; a planilha de clientes foi inspecionada e o 004 fechou.
> Este ticket carrega as duas partes que continuavam sem material: o catálogo do Mainô e as
> planilhas de arquiteto.

## Question

O agente precisa **conhecer produtos** e **entender o que um arquiteto manda**. Os dois
dados moram fora de qualquer banco hoje. Este ticket é conseguir olhar para eles como são
de verdade.

**O catálogo de produtos.** O research [007](007-maino-tem-api.md) já confirmou que o Mainô
tem API e que `GET /produtos` entrega catálogo com preço, dimensão e imagem. Falta o passo
concreto: **puxar uma amostra real** e ver o que vem de fato — foto, descrição, dimensão,
material, ou só o mínimo fiscal? Quantos produtos há? Como estão nomeados? Pode ser uma
exportação manual do Mainô ou uma chamada de API (depende do acesso disponível).

**A planilha do arquiteto.** Conseguir dois ou três exemplos reais das planilhas que
arquitetos mandam, para ver como a lista de itens é escrita e o quanto ela se parece (ou
não) com o catálogo da loja. A pergunta 32 do ticket [020](020-perguntas-para-as-consultoras.md)
já pede exemplos de atendimento; este é o pedido específico das **planilhas de itens**.

**Resolvido quando** eu tiver visto amostras reais dos dois. A resolução registra o formato
de cada um, o volume e onde estão. Dados pessoais que aparecerem (nome de cliente numa
planilha de arquiteto) seguem as regras de `/dados/` — só o padrão sobe para o ticket.

## Desbloqueia

- [011](011-o-que-o-agente-pode-dizer-sobre-produto.md) — precisa saber de onde vem o
  conhecimento de produto do agente, o que depende de ver o catálogo do Mainô.
- Névoa **"Fluxo do arquiteto"** no [`map.md`](../map.md) — o segundo fluxo só ganha nitidez
  depois de ver planilhas reais.
