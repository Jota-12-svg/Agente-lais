---
id: "012"
title: Quando e como o agente escala para uma consultora
labels: [wayfinder:grilling]
status: open
assignee: Claude
blocked-by: ["009"]
---

## Question

O escalonamento é o mecanismo de segurança de todo o projeto: enquanto o agente souber
reconhecer que está fora da sua alçada e passar a bola, o pior caso é ele ser inútil, não
prejudicial. Se ele **não** souber, o pior caso é perder um cliente de R$ 50 mil.

A decidir:

- **Os gatilhos.** O que faz o agente entregar a conversa? O usuário citou "informação mais
  pessoal ou entendimento mais personalizado" — isso precisa virar critério operável.
  Candidatos: pergunta sobre disponibilidade, negociação de preço, cliente irritado,
  planilha de arquiteto, cliente pedindo pessoa, agente sem confiança na própria resposta,
  conversa longa demais sem avanço.
- **Para qual consultora.** Se o cliente já é de alguém, vai para ela — e se ela estiver
  fora, ou se for cliente novo? Rodízio, disponibilidade na agenda, quem estiver online?
- **Como a consultora é avisada**, e o que ela recebe junto: a conversa inteira, um resumo,
  os campos já qualificados?
- **O que o cliente vê.** O agente anuncia a passagem ("vou chamar a Fulana") ou a troca é
  silenciosa? O cliente sabia que estava falando com um agente? — decisão de transparência
  que também tem lado jurídico.
- **O caminho de volta.** Depois que a consultora assume, o agente volta a atuar naquela
  conversa? Em que condição?
- **Quando ninguém atende.** A consultora não responde em X tempo — o que acontece com o
  cliente pendurado?
- **O freio de mão.** Existe um jeito de a consultora desligar o agente numa conversa, ou
  em todas, na hora?

**Resolvido quando** os gatilhos, o roteamento, o que a consultora recebe e o comportamento
de falha estiverem definidos.

---

## Grilling em andamento — 2026-08-11

Decidido até aqui:

- **Gatilhos:** além dos já fixados em 009 (modo arquiteto/planilha; agenda não confiável),
  também disparam escalada — cliente pede explicitamente por uma pessoa; cliente frustrado;
  negociação de preço/desconto; pergunta sobre disponibilidade **pontual** de item específico
  (wording exata fica para o ticket [011](011-o-que-o-agente-pode-dizer-sobre-produto.md));
  agente sem confiança na própria resposta. **"Qualificação completa" ainda não entra** —
  depende do ticket [010](010-o-que-e-um-lead-qualificado.md), bloqueado.
- **Routing:** a escalada nunca decide roteamento do zero. Entrega para a consultora já dona
  (rodízio ou cliente que volta, per 009); se a conversa começou fora do expediente sem
  atribuição, a escalada é o gatilho que dispara o rodízio adiado nesse momento.
- **Mecanismo de detecção do handoff:** qualquer mensagem enviada na conversa que não veio do
  agente é o sinal de que um humano assumiu — natural pela arquitetura de número
  compartilhado, sem precisar de comando dedicado (ressalva conhecida: ponto cego do
  WhatsApp Windows, ticket [019](019-companion-windows-ponto-cego.md)).
- **Transparência da passagem:** o agente anuncia a troca, sem nome ("vou pedir pra alguém da
  equipe olhar isso com você"), antes de ficar em silêncio — mantém "a loja, nunca a pessoa".
- **Timeout — ninguém atende:** o agente não volta a responder e não reatribui
  automaticamente. No máximo manda **uma** mensagem de espera reforçando a mesma promessa,
  sem prometer pessoa nem horário. O limiar de tempo exato é pergunta operacional das
  consultoras, não decisão de arquitetura — subiu como pergunta **34** no ticket
  [020](020-perguntas-para-as-consultoras.md).

### ⚠️ Em aberto — aguardando resposta das consultoras

**Notificação da escalada — desenho final (revisado 2026-08-11, seção 7 do research).**
A primeira recomendação (template pago pro número pessoal, sempre) presumia atribuição fixa
no momento da escalada — errado, porque o rodízio entre as quatro é combinado informalmente
e se reorganiza ao longo do dia (per 009). Uma segunda rodada de research
([research/012](../research/012-notificacao-de-escalada.md), seção 7) checou como a
indústria resolve handoff bot→humano com escala fluida (Chatwoot, Botpress, Intercom — todas
usam fila visível de onde quem está livre **puxa**, não push pra pessoa fixa) e concluiu que
a planilha compartilhada que a loja já usa é a ferramenta certa pra sustentar isso, sem
exigir nada novo.

**Desenho aceito:**
1. A cada escalada, o agente escreve uma linha numa aba nova ("Aguardando atendimento") —
   cliente, resumo, horário, coluna "responsável" vazia. Mesma conta de serviço já prevista
   pro Google Calendar em [006](006-integracao-com-google-calendar.md).
2. Formatação condicional (configurada uma vez) pinta a linha de vermelho enquanto
   "responsável" estiver vazio.
3. Quem for atender escreve o nome na coluna — some o vermelho, as outras três sabem que já
   foi pega. Captura por convenção/visibilidade, não trava técnica — mesma limitação que os
   produtos de mercado têm (nenhum trava de verdade, confirmado na seção 7.3 do research).
4. E-mail automático impessoal ("tem gente esperando", não "é sua") reforça o aviso.
5. **O template pago pro número pessoal não sai do desenho — muda de papel.** Vira rede de
   segurança de **timeout**: só dispara se a linha ficar sem "responsável" por tempo demais.

Perguntas **33 a 33e**, reescritas pra esse desenho, subiram para o ticket
[020](020-perguntas-para-as-consultoras.md): se a mecânica da fila funciona pra elas (33), se
olham a planilha ao longo do dia ou só no fim do expediente — decide se o e-mail é reforço ou
essencial (33b), se o e-mail de trabalho chega rápido (33c), e se aceitam o aviso de timeout
no número pessoal / se esse número é distinto do da loja (33d, 33e — a pergunta original,
agora só pro caso de timeout).

**Este ticket não fecha até a resposta das consultoras voltar** — o resto da árvore de
decisão (freio de mão, caminho de volta) segue sendo trabalhado em paralelo.
