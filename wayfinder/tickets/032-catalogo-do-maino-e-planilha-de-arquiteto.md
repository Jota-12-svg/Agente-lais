---
id: "032"
title: Obter o catálogo de produtos do Mainô e exemplos de planilha de arquiteto
labels: [wayfinder:task]
status: closed
assignee: sessão 2026-09-11
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

## Resolução — 2026-09-11

**Fechado sem buscar os dois materiais. Decisão do dono: não vamos precisar do Mainô.**

O sinal de sucesso/fracasso do agente já não depende dele: o 013 fixou o `advisor_verdict`
(veredito da consultora) como o sinal de **maior peso** do aprendizado, capturado direto na
plataforma das consultoras (035/037) — e rebaixou o polling de venda no Mainô a reforço
*best-effort*, neutro. Com o parâmetro que importa vindo de um lugar melhor, ir atrás do
catálogo do Mainô (`GET /produtos`, ticket 007) deixa de valer o esforço.

**As duas partes do ticket fecham juntas:**

- **Catálogo do Mainô** — não será buscado. Consequência direta em aberto: o
  [011](011-o-que-o-agente-pode-dizer-sobre-produto.md) presumia esse catálogo como a fonte
  do conhecimento de produto do agente ("o que ele afirmar sobre produto tem de vir do
  catálogo do Maino, não de imitar resposta de cabeça" — nota do próprio 011). Essa premissa
  **cai** junto com este fechamento; o 011 precisa de uma resposta nova para "de onde vem o
  conhecimento de produto", que não é este ticket quem decide.
- **Planilha de arquiteto** — também não será buscada. Consistente com o que o 010 já havia
  fixado: na fase 1 o arquiteto **escala imediato, sem coleta** — não há qualificação nem
  resposta de produto que dependa de conhecer o formato da planilha antes da escalada.

**Efeito no mapa:** o [011](011-o-que-o-agente-pode-dizer-sobre-produto.md) perde a
dependência deste ticket em `blocked-by` (só sobra 009, já fechado) e volta para a
fronteira. A névoa **"Fluxo do arquiteto"** no `map.md` fica sem buscar mais material por
este canal; segue como fluxo de fase 2, fora do escopo atual.

### Addendum — 2026-09-11 (reconciliação da branch do ticket 014)

A branch paralela `wayfinder/como-o-agente-soa-014` já tinha fechado este mesmo ticket em
**2026-09-02**, numa grelha própria com o dono, por um motivo complementar que nunca chegou à
trunk: **o Mainô não tem catálogo de produtos mantido** — o `GET /produtos` do research 007
existe como endpoint, mas a loja usa o Mainô só para cotação e nota, não cadastra produto lá.
Puxar uma amostra não traria nada de útil de qualquer forma.

Essa sessão também já respondeu a pergunta que este fechamento deixava em aberto para o 011
("de onde vem o conhecimento de produto, já que não é do Mainô"): **o site da loja**
(<https://www.laisaliskicasa.com.br/>) como referência de estilo e catálogo parcial, mais as
**categorias e o posicionamento** escritos em `CONTEXT.md` → "A loja". O agente não consulta o
site em runtime na fase 1 — conhece as categorias, compartilha o link quando o cliente quer
explorar, e escala qualquer pergunta específica de produto. Aplicado ao 011 nesta
reconciliação.
