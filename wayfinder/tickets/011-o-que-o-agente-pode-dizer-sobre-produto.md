---
id: "011"
title: O que o agente pode afirmar sobre produto e disponibilidade
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: ["009", "004"]
---

## Question

A Lais Casa **não tem controle de estoque**: o que está à vista na loja é o estoque, e as
consultoras conferem a olho. Isso cria o risco mais concreto do projeto — um agente
respondendo "temos sim" sobre um item de R$ 30 mil que não existe, para um arquiteto que
vai montar um projeto em cima disso.

A decidir, com franqueza sobre o limite:

- **A fronteira do que o agente pode afirmar.** Preço ele pode dizer? Dimensão, material,
  acabamento? Disponibilidade, claramente não — mas então **como ele responde** "vocês têm
  esse vaso?" sem parecer inútil nem mentir?
- **De onde vem o conhecimento de produto.** Do catálogo do Maino (ticket 007), de uma base
  montada à mão, ou das fotos e descrições que as consultoras já mandam nas conversas?
- **Foto.** O cliente manda foto de um produto e pergunta se a loja tem algo parecido. O
  agente tenta reconhecer, ou escala na hora? O Gemini lê imagem nativamente — a pergunta é
  se *deve*, dado o custo de errar.
- **Preço numa faixa de R$ 2 mil a R$ 50 mil.** O agente fala preço, ou preço é sempre
  assunto de consultora? Existe desconto, e o agente tem alguma alçada? (Na fase 1,
  presumivelmente nenhuma — confirmar.)
- **Como o erro é contido.** Se o agente afirmar algo errado, o que acontece: a consultora
  vê antes de o cliente ver? Existe revisão? Ou o agente fala direto com o cliente?

**Resolvido quando** houver uma regra clara do que o agente afirma, do que ele nunca afirma
e de como ele formula a resposta quando não pode afirmar.
