---
id: "011"
title: O que o agente pode afirmar sobre produto e disponibilidade
labels: [wayfinder:grilling]
status: closed
assignee: sessão-grilling-011
blocked-by: ["009"]
---

> **032 fechou (2026-09-11) sem trazer o catálogo do Mainô** — decisão do dono, o sinal de
> sucesso já vem melhor da plataforma das consultoras (013/035/037), não valia o esforço. Isso
> derruba a premissa de trabalho abaixo ("o que ele afirmar tem de vir do catálogo do Maino").
> Ticket desbloqueado (só restava o 009, já fechado).
>
> **Resposta recuperada da reconciliação da branch do 014 (2026-09-11):** essa mesma pergunta
> já tinha sido respondida numa grelha com o dono em 2026-09-02, nessa branch paralela, que
> nunca chegou à trunk — ver `## Fonte do conhecimento de produto` abaixo. O resto da pergunta
> deste ticket (fronteira do que afirmar sobre preço/dimensão/material, reconhecimento de
> foto, contenção de erro) **segue aberto**.

## Question

A Lais Aliski Casa **não tem controle de estoque**: o que está à vista na loja é o estoque, e as
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

## Fonte do conhecimento de produto — grelha do 014 (2026-09-02, recuperado 2026-09-11)

O Mainô **não tem catálogo de produtos mantido** (o dono confirmou na grelha do
[014](014-como-o-agente-soa.md) — ver a resolução do [032](032-catalogo-do-maino-e-planilha-de-arquiteto.md)).
A resposta de trabalho acima, que apontava o Mainô como fonte, cai. No lugar:

- **Categorias e posicionamento** da loja, escritos em `CONTEXT.md` → "A loja" (vasos,
  esculturas, quadros, cestos, aromas, mobiliário… alto padrão, curadoria, clássico).
- **O site** (<https://www.laisaliskicasa.com.br/>) como referência de estilo e catálogo
  parcial — o agente **manda o link** quando o cliente quer explorar, **não navega** nem
  consulta o site em runtime na fase 1.
- Qualquer pergunta de produto **específico** (peça, preço, medida, disponibilidade) escala
  para a consultora — não é a categoria/posicionamento que responde isso, é motivo de
  escalar.

Isso fecha a pergunta "de onde vem o conhecimento de produto". **Não fecha o ticket**: falta
ainda a fronteira do que o agente pode afirmar dentro desse conhecimento (preço? dimensão?
material?), o reconhecimento de foto, e como o erro é contido — ver `## Question` acima.

---

## Resolução (2026-09-11, grilling — 4 perguntas, 1 rodada)

O grilling ratificou, como decisão explícita, o que já estava implementado de fato no
`prototipo-tom-014/system-prompt.md` (construído para o 014 sem ter passado por decisão
formal sob este ticket) e amarrou o único ponto genuinamente novo — prioridade do erro de
produto dentro do canal do 038.

- **Fronteira do que o agente afirma: nunca preço, medida ou material/acabamento de uma
  peça específica** — qualquer pergunta desse tipo escala. A única coisa que o agente fala de
  cabeça é **categoria/posicionamento da loja** (`CONTEXT.md` → "A loja"), já fechado pela
  "Fonte do conhecimento de produto" acima — não é uma exceção nova, é o mesmo limite.
  Disponibilidade segue com a fórmula "vou verificar e te retorno" (020), escalando só se o
  cliente insistir (012).
- **Foto de produto: o agente nunca tenta reconhecer**, mesmo quando a categoria parece óbvia
  (ex.: um vaso claramente do estilo clássico da loja). Descreve o que vê para registro e
  escala sempre — o custo de uma identificação visual errada supera o valor de evitar uma
  escalada.
- **Alçada de desconto: zero.** Nenhuma margem automática (nem "10% à vista"); preço e
  condição são sempre da consultora — consistente com "preço nunca" (014).
- **Contenção de erro: o mecanismo do [038](038-estrategia-de-rollout.md) basta** como
  containment estrutural — sem revisão humana antes de enviar; erro isolado cai no canal
  "reportar problema" (pós-hoc), série de erros aciona o freio de mão ([036](036-freio-de-mao-global.md)).
  **Acréscimo deste ticket:** dentro desse mesmo canal (não é canal novo), afirmação de
  produto/disponibilidade errada recebe **prioridade mais alta** que outros tipos de erro —
  é o risco que abriu este ticket ("temos sim" sobre um item de R$ 30 mil). Fica registrado
  aqui como requisito de conteúdo para quando a peça "reportar problema" for construída no
  [037](037-construir-plataforma-consultoras-v1.md) (junto com o incremento que o 038 já
  previu lá).

**Efeito em cadeia:**
- O `prototipo-tom-014/system-prompt.md` já reflete esta decisão sem precisar de mudança —
  era extrapolação minha durante o 014, agora é decisão confirmada.
- Fecha o item 4 do gate de entrada do [038](038-estrategia-de-rollout.md) ("011 fechado —
  o agente sabe o que pode e não pode afirmar sobre produto/disponibilidade").
- O [034](034-redigir-o-manual-do-agente.md) perde "011" do `blocked-by`.
