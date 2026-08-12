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

---

## Respostas — ticket 020 (2026-08-11, resposta 1 de 4)

- **"Vocês têm esse vaso?"** — resposta padrão antes de conferir: *"Bom dia, vou verificar se
  eu tenho essa peça e logo te retorno."* É a formulação de ouro que o ticket 020 já apontava:
  não afirma, não nega, e mantém o cliente no gancho. Copiar quase literalmente para o agente,
  em vez de inventar frase nova.
- **Já prometeu e não tinha:** "Raramente" — o erro existe, mas a prática de "vou verificar" já
  contém bem o risco.
- **O que responde de cabeça, sem levantar:** **"Nenhuma dessas informações"** — nem preço, nem
  medida, nem material/acabamento, nem prazo, nem disponibilidade. Achado forte, se confirmado
  nas outras respostas: não há base humana para o agente "herdar" essas respostas rápidas — o
  que ele afirmar sobre produto tem de vir do catálogo do Maino ([007](007-maino-tem-api.md)),
  não de imitar uma resposta de cabeça que a própria consultora não dá.
- **Foto de produto visto em outro lugar:** "Às vezes" — não é raro, não é constante.

**Falta:** confirmar se a resposta 5 (nada de cabeça) se repete nas outras três pessoas — uma
consultora não é a amostra toda, e isso muda o quanto o agente pode se apoiar no catálogo do
Maino sozinho.
