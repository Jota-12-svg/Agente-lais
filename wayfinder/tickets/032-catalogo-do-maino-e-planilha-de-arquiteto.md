---
id: "032"
title: Obter o catálogo de produtos do Mainô e exemplos de planilha de arquiteto
labels: [wayfinder:task]
status: closed
assignee: sessão 2026-09-02 (grelha do ticket 014)
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

---

## Resolução

Fechado na grelha do ticket [014](014-como-o-agente-soa.md) com o dono do projeto, 2026-09-02.
**As duas metades caíram por motivos diferentes:**

**1. Catálogo do Mainô — não existe.** O dono confirmou: o Mainô **não tem catálogo de
produtos mantido**. O `GET /produtos` do research [007](007-maino-tem-api.md) existe como
endpoint, mas a loja usa o Mainô só para cotação e nota — não cadastra os produtos lá. Puxar
uma amostra traria pouco ou nada. **O conhecimento de produto do agente passa a vir de outra
fonte:** o **site** da loja (<https://www.laisaliskicasa.com.br/>) como referência de estilo e
catálogo parcial, mais as **categorias e o posicionamento** escritos no contexto do agente
(ver `CONTEXT.md` → "A loja"). O agente **não consulta o site em runtime** na fase 1 — ele
conhece as categorias, compartilha o link quando o cliente quer explorar, e **escala qualquer
pergunta específica de produto** para a consultora. Isso é o escopo do
[011](011-o-que-o-agente-pode-dizer-sobre-produto.md), agora desbloqueado.

**2. Planilhas de arquiteto — adiadas.** Continuam sem material, mas **não bloqueiam nada na
fase 1**: o agente escala arquiteto na hora, sem interpretar planilha (tickets 009/010). O
pedido de 2–3 exemplos reais volta para a névoa **"Fluxo do arquiteto"** do
[`map.md`](../map.md), a ser puxado quando esse segundo fluxo (fase 2) for desenhado.

**Consequência:** [011](011-o-que-o-agente-pode-dizer-sobre-produto.md) sai de Bloqueados.
`CONTEXT.md` atualizado (entradas "A loja" e "Catálogo").
