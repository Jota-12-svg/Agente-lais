---
id: "013"
title: Sinal de sucesso — o que se mede e como é capturado
labels: [wayfinder:grilling]
status: closed
assignee: sessão 2026-09-02 (grilling com o dono do projeto)
blocked-by: ["009", "003"]
---

> **Reconciliação de branch — 2026-09-02.** Este ticket foi fechado numa sessão paralela
> (branch `wayfinder/sinal-de-sucesso-013`) que rodou ao mesmo tempo que o 018 e não chegou a
> ser integrada na `wayfinder/atendimento-hoje`. O conteúdo do grilling foi trazido para a
> trunk sem alteração; a única mudança é que as referências à "superfície das consultoras"
> apontam agora para o ticket [035](035-plataforma-central-das-consultoras.md) (ver "Onde a
> consultora registra o `advisor_verdict`" no fim). A branch e o PR #3 foram encerrados.

## Question

Este é o ticket que decide **o que o agente vai perseguir**. Escolher o sinal errado é a
falha mais cara possível do projeto: um agente que otimiza para "reunião agendada" aprende
a agendar reunião com quem não vai comprar, e ninguém percebe por meses.

O usuário nomeou três sinais — vendas, reuniões agendadas, e notas de satisfação ou
insatisfação — e fez questão de dizer que **o fracasso também é sinal**: contatos que não
deram certo e feedback ruim devem ser acompanhados com o mesmo cuidado.

A decidir:

- **Definir cada sinal com precisão.** "Venda" é a nota emitida no Maino, ou o "quero
  comprar" na conversa? "Reunião agendada" conta se o cliente não apareceu? Quanto tempo
  depois da conversa uma venda ainda é atribuível ao agente?
- **Como o sinal chega ao sistema.** Automático (nota fiscal no Maino, evento no Calendar)
  ou manual (a consultora marca)? Todo sinal que depende de alguém lembrar de marcar tende
  a não existir — o desenho precisa contar com isso.
- **Satisfação e insatisfação.** Perguntar ao cliente é intrusivo numa venda de R$ 50 mil.
  Alternativas: inferir da conversa, colher da consultora, ou pedir só em casos
  específicos. Decidir uma.
- **O sinal negativo.** Como se distingue "o agente errou" de "esse cliente nunca ia
  comprar"? Sem essa distinção, o agente aprende a evitar clientes difíceis.
- **O julgamento da consultora.** Ela é a melhor fonte de sinal que existe — ela sabe se o
  agente mandou bem. Como capturar isso com atrito quase zero, dentro do WhatsApp que ela
  já usa?
- **Atribuição.** Uma conversa passa pelo agente e depois pela consultora e vira venda. De
  quem foi o mérito, e o que exatamente o agente aprende desse caso?

**Resolvido quando** cada sinal tiver definição, fonte e mecanismo de captura — e estiver
claro o que se aprende com o fracasso, não só com o sucesso. É este ticket que dissolve boa
parte da névoa sobre o mecanismo de aprendizado.

---

## Nota — dependência do ticket 012

O ticket [012](012-quando-e-como-o-agente-escala.md) (fechado em 2026-08-12) passou a depender
do limiar de "contato perdido" decidido aqui para um segundo uso: a **janela de retomada** após
um handoff — quanto tempo o agente ainda reafirma "a consultora já vai te atender" antes de
tratar um contato que volta como atendimento novo do zero. É o mesmo conceito, dois usos; ao
fechar este ticket, decidir um único número serve para os dois, não dois números separados.

---

## Respostas — ticket 020 (2026-08-11, resposta 1 de 4)

- **Atendimento bom mesmo sem venda:** *"Quando o cliente tirou todas as dúvidas de forma
  clara e objetiva sem fazer o cliente perder tempo."* Candidato a definição operável:
  dúvidas resolvidas + sem enrolação para o cliente — não depende de venda nem de reunião
  marcada.
- **Tempo sem resposta = cliente sumiu:** **"2-3 dias"** — mais curto do que a hipótese
  inicial do ticket. Define a janela para considerar um contato esfriado, para fins de
  aprendizado.
- **Processo quando o cliente decide comprar:** *"Informam o preço diretamente na
  conversa"* — não manda PDF nem print da cotação do Mainô, o preço é digitado no chat.
  Importa para onde procurar o sinal de "orçamento passado": no texto da conversa, não num
  anexo.
- **Quando a nota fiscal é emitida:** **"Depende da situação"** — não há regra fixa. Enfraquece
  um pouco a aposta de nota fiscal como sinal objetivo e *imediato*; falta entender os
  "depende de quê" com mais detalhe antes de fechar o desenho do sinal.
- **Tempo até fechar venda:** "Alguns dias" tanto para cliente comum quanto para arquiteto —
  resposta na mesma faixa grosseira para os dois; não há diferença aparente nesta resposta.
- **Telefone na cotação do Mainô:** **"Sempre"** — boa notícia para a chave de atribuição. Se o
  telefone está sempre na cotação, ele é candidato a campo em comum entre a conversa (que tem
  telefone) e a venda (cuja nota tem CPF/nome) — desde que cotação e nota fiquem ligadas dentro
  do Mainô.

**Pendente, sem resposta utilizável ainda:**

- **Pergunta 25** (exemplo de nota fiscal) voltou "Opção 1" — não é um arquivo, provavelmente
  indica intenção de mandar pelo WhatsApp. **O arquivo, que é o que decide se a nota fiscal dá
  para ligar de volta à conversa, ainda não chegou.**
- **Pergunta 32** (exemplos de bons atendimentos) voltou "Por favor, enviar por WhatsApp" —
  também ainda não chegou.

⚠️ Nenhum dado pessoal foi recebido nesta rodada. Quando a nota fiscal e os exemplos de
atendimento chegarem, valem as regras de manuseio do ticket
[020](020-perguntas-para-as-consultoras.md): vão para `/dados/` ou `/conversas/`, nunca para o
repositório — só o padrão observado (campos da nota, condução da conversa) sobe para este
ticket.

---

## Resolução

Fechado por grilling com o dono do projeto — 3 rodadas, 2026-09-02.

### O sinal, em uma frase

Na fase 1 o agente é medido pela **qualidade da qualificação** (Camada 1), não pelo desfecho
de negócio (Camada 2), que acontece depois e fora do controle dele. Confundir as duas é a
falha que este ticket existia para evitar — "otimizar para reunião agendada ensina a agendar
com quem não vai comprar".

### As duas camadas

- **Camada 1 — qualidade do trabalho do agente (o alvo da fase 1):** a consultora assumiu sem
  recomeçar? Os dados estavam certos? A classificação arquiteto/consumidor estava certa?
  Escalou na hora certa — nem cedo demais, nem tarde demais?
- **Camada 2 — desfecho de negócio (contexto, peso baixo):** venda / visita / perdido —
  registrado por atendimento, **nunca alvo de treino na fase 1**. O agente não controla isso,
  e o volume (~10/dia) com atraso de "alguns dias" é fino e defasado demais para treinar com
  segurança. Vira alvo na fase 2, quando o agente vende.

### Taxonomia de desfecho de um atendimento

**`terminal_state`** — o que o agente controla:

| Valor (pt · `en`) | Significado |
|---|---|
| `escalado` · `escalated` | o handoff aconteceu — **condição de sucesso do agente na fase 1** |
| `resolvido_sem_escalada` · `resolved` | dúvidas respondidas; o contato não pediu pessoa nem falou em comprar (o "atendimento bom sem venda" que a consultora descreveu) |
| `esfriado` · `cooled` | sem resposta do contato por 3 dias, nunca escalou |
| `fora_de_escopo` · `out_of_scope` | engano, spam, não é cliente |

**`business_outcome`** — sub-desfecho, só quando `escalado`; preenchido pela consultora (ticket
[035](035-plataforma-central-das-consultoras.md)) ou pelo polling do Mainô: `virou_venda` ·
`virou_visita` · `sem_venda` · `perdido`.

### Fonte e captura, por sinal

O ticket é duro nisso: *todo sinal que depende de alguém lembrar de marcar tende a não existir.*

| Sinal | Fonte | Captura |
|---|---|---|
| `escalado` | o agente | **automático** — ele cria o chamado, ele sabe |
| `esfriado` | timer | **automático** — 3 dias |
| `resolvido_sem_escalada` | o agente | **automático best-effort** — a conversa morre sem escalar e sem sinal de perda |
| `virou_venda` | Mainô | **automático best-effort** — polling de `notas_fiscais_emitidas` casando telefone; **assume perder casos** (destinatário CPF, ciclo longo). É reforço, não sinal único de venda |
| `virou_visita`, confirmação de venda, `advisor_verdict`, tom | consultora | **manual**, um canal só, atrito quase zero — ver ticket [035](035-plataforma-central-das-consultoras.md) |

A fase 1 vive com sinal de venda **incompleto** de propósito. Esperar o Mainô fechar 100%
travaria o ticket num ponto que o research 007 já diz ser incerto — e o que a consultora
marcar à mão cobre o buraco nos casos que importam.

### O julgamento da consultora

`advisor_verdict` ∈ { nulo, `agente_mandou_bem` (`agent_did_well`), `agente_atrapalhou`
(`agent_hindered`) } + nota livre opcional. **É o único sinal que treina a qualidade do
agente**, em especial no lado negativo, e tem o **peso mais alto** na hierarquia.

Fase 1 fixa apenas que esse julgamento **é capturado** e **com que peso**. *Onde* e *como* a
consultora faz isso é o ticket [035](035-plataforma-central-das-consultoras.md). Pode
vir quase sempre nulo enquanto a superfície não existir — aceitável: o laço de aprendizado
ainda é névoa no mapa e a fase 1 é só qualificação. Adesão baixa é um achado que alimenta o
035 e o [014](014-como-o-agente-soa.md), não um bloqueio.

### O sinal negativo — o que se aprende com o fracasso

Decisão deliberada, revertida uma vez durante o grilling e reafirmada: **`sem_venda`,
`perdido` e `esfriado` são fatos neutros**, não falha do agente. Tratá-los como sinal
negativo ensinaria o agente a **evitar cliente difícil** — o risco que este ticket nomeia.

O que se aprende com o fracasso na fase 1 passa **só pelo `advisor_verdict`**: ou um humano
registra que houve erro, ou não há erro. **Não há análise automática de causa de fracasso na
fase 1** — um campo `failure_review` chegou a ser cogitado no grilling e foi descartado pelo
mesmo motivo.

Freio que fica registrado para quando o laço de aprendizado for desenhado: **escalar nunca é
falha.** Um `perdido` depois de um handoff limpo é "nada que o agente pudesse fazer" — desfecho
válido, não problema a corrigir.

### Atribuição

Sem rateio. A unidade é o `atendimento`; o desfecho é um **atributo** dele. O agente não
"ganha uma fração da venda". De um caso que virou venda, o agente carrega o retrato da própria
qualificação (o que coletou, como classificou, quando escalou) marcado com o desfecho como
contexto de peso baixo. O mérito operacional da venda é da consultora e não precisa ser
modelado.

### Satisfação / insatisfação

**Não se pergunta ao cliente na fase 1** — intrusivo num ticket de R$ 2 mil a R$ 50 mil. Três
vias: (1) o agente infere o tom da conversa, grosso — `conversation_sentiment` ∈ { `neutro`,
`irritado`, `positivo` }; (2) o `advisor_verdict`; (3) reclamação explícita do cliente
("demoraram demais", "isso é péssimo") sempre vira `insatisfação` registrada. Sem CSAT, sem
"de 0 a 10".

### O número — janela de retomada e atendimento esfriado

**3 dias**, um número só para os dois usos (instrução da nota deste ticket):

- sem resposta do contato por 3 dias, sem ter escalado → `esfriado`;
- depois de um handoff, um contato que volta em até 3 dias segue **no mesmo atendimento** ("a
  consultora já vai te atender"); passando de 3 dias, começa **atendimento novo, do zero, no
  rodízio**.

Arredonda para cima o "2–3 dias" da consultora (levantamento 1 do 020) — não declarar perdido
rápido demais. Registrado como addendum no [012](012-quando-e-como-o-agente-escala.md), que
esperava esse número.

### Campos de desfecho no Supabase (ponto de partida)

`terminal_state`, `business_outcome`, `advisor_verdict`, `advisor_verdict_note`,
`conversation_sentiment`, `escalated_at`, `last_contact_at`, `closed_at`, `sale_link` (nº da
nota, valor, data — quando o polling do Mainô casar). O schema completo do Supabase segue
como névoa no mapa; aqui ficam só os campos que o **sinal** exige.

### Pendências que não bloqueiam

- **Exemplo de nota fiscal — pergunta 25 do [020](020-perguntas-para-as-consultoras.md):**
  quando chegar, calibra a implementação do casamento telefone↔venda. **Não reabre o 013** —
  a venda é reforço best-effort, não sinal central, então uma chave frágil não muda o desenho.
- **Adesão das consultoras ao `advisor_verdict`:** se confirma no protótipo de tom
  ([014](014-como-o-agente-soa.md)) e no ticket [035](035-plataforma-central-das-consultoras.md).

### Onde a consultora registra o `advisor_verdict` — ticket 035

Este ticket fixou **que** o julgamento da consultora é capturado e **com que peso**; *onde* e
*como* ela o registra é o ticket [035](035-plataforma-central-das-consultoras.md) (plataforma
central das consultoras — v1: fila de chamados + marcação de desfecho). Ver a nota de
reconciliação no topo deste arquivo: o fechamento deste ticket (madrugada de 2026-09-02) tinha
aberto um ticket `033-superficie-das-consultoras-para-o-agente` para essa superfície; ele
convergiu com a decisão do dono do mesmo dia (a fila sai da planilha, vira plataforma sobre o
Supabase) e foi **consolidado no 035**. Não reabre o
[029](029-canal-de-notificacao-da-fila.md) — o canal de aviso é decidido dentro do 035.
