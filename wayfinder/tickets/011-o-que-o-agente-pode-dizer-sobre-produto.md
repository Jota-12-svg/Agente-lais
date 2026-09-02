---
id: "011"
title: O que o agente pode afirmar sobre produto e disponibilidade
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: ["009", "032"]  # ambos closed — ticket desbloqueado (ver ## Direção)
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

---

## Direção — desbloqueado (2026-09-02)

O ticket [032](032-catalogo-do-maino-e-planilha-de-arquiteto.md) fechou: **o Mainô não tem
catálogo mantido.** Isso derruba a premissa "o conhecimento de produto vem do Mainô" e
resolve metade deste ticket por eliminação. O que ficou decidido na grelha do
[014](014-como-o-agente-soa.md) com o dono, e que este ticket só precisa formalizar:

- **De onde vem o conhecimento de produto:** as **categorias** e o **posicionamento** da loja,
  escritos no contexto do agente (`CONTEXT.md` → "A loja"), + o **site**
  (<https://www.laisaliskicasa.com.br/>) como referência. O agente **não consulta o site em
  runtime** na fase 1.
- **O que o agente afirma:** que a loja trabalha com tal categoria ("temos bastante coisa de
  vaso e escultura", "trabalhamos com mobiliário sim"), o estilo da loja, e o link do site/IG
  para o cliente explorar. Nada além disso.
- **O que o agente nunca afirma:** preço, medida, material, acabamento, prazo,
  disponibilidade — nem "de cabeça" (a resposta 5 do 020 confirma que nem as consultoras
  dão isso sem levantar). Fórmula de ouro do 020 para disponibilidade: *"vou verificar se
  temos essa peça e já te retorno"*.
- **O agente nunca diz "não sei":** pergunta que ele não pode responder → *"vou verificar
  isso com a consultora e te retorno"* + escala. Nunca "não tenho essa informação".
- **Foto de produto de outro lugar:** o agente **não tenta reconhecer** — registra ("cliente
  mandou foto de uma luminária de arco preta") e escala. Custo de errar > valor de acertar na
  fase 1.
- **Fechamento de pedido / compra:** sempre da consultora.

**Ainda aberto para uma grelha curta** (não bloqueante): como o erro é contido quando o
agente afirma algo — a consultora revê antes do cliente, ou o agente fala direto? Depende do
desenho da escalada (012, fechado) e do runtime (névoa). Pode ser resolvido junto com o
desenho do runtime.

`status` segue `open` — a resolução formal (a regra escrita, "resolvido quando") ainda pode
ser puxada, mas o ticket **não bloqueia mais nada**.
