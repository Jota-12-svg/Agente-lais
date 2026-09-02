---
ticket: "029"
title: Canal de notificação da fila de chamados — nativo do Sheets, Apps Script, e por que não WhatsApp nem sinal físico
tipo: research
data: 2026-08-12
---

# Research — Como avisar a consultora de que a fila de chamados mudou, sem WhatsApp ativo

Ticket: [029](../tickets/029-canal-de-notificacao-da-fila.md) · Investigado em 2026-08-12 · Aberto
pelo ticket [012](../tickets/012-quando-e-como-o-agente-escala.md), que já decidiu que o agente
lança chamados numa aba nova da planilha compartilhada e **nunca** manda WhatsApp ativo para
avisar — decisão apoiada nos research [026](026-o-que-causa-banimento.md) e
[028](028-casos-de-banimento-e-estimativa-de-risco.md), que documentam, com fonte técnica de
protocolo, que iniciar contato (o que um aviso ativo para a consultora seria, tecnicamente, do
ponto de vista do WhatsApp) é o gatilho mais consistente de banimento.

> **Base desta investigação.** Prioridade a documentação oficial — `support.google.com` (Ajuda do
> Editores do Google Docs, que cobre Sheets) e `developers.google.com/apps-script` — sobre
> comportamento e limites documentados de produto. Onde a doc oficial não responde algo
> especificamente (existe pelo menos um caso central, marcado abaixo), a lacuna é declarada como
> tal, e a leitura mais próxima vem de fonte secundária, marcada **[secundária]**, nunca
> apresentada como confirmação. Nenhuma fonte aqui é blog vendendo um produto concorrente, exceto
> onde citado a título de descrever preço/limite de um serviço de terceiro (Zapier, Make, Twilio) —
> nesses casos o objetivo é só mapear a opção, não avaliar se ela é boa.

---

## Resposta direta ao ponto crítico do ticket

**O agente vai escrever o chamado via Sheets API v4 (service account/OAuth), não editando na UI
do navegador. Isso muda tudo, e a resposta é conclusiva:**

**A documentação oficial do Apps Script confirma, em texto explícito, que gravações feitas por
API/script — não só as do próprio Apps Script, mas qualquer aplicação externa gravando via Sheets
API — não disparam `onEdit` nem `onChange`, seja a versão simples ou a instalável.** A página de
[Triggers instaláveis](https://developers.google.com/apps-script/guides/triggers/installable),
na sua seção de restrições, traz a mesma frase que a página de
[Triggers simples](https://developers.google.com/apps-script/guides/triggers/) já trazia para o
caso simples — e a estende, porque a seção de restrições do doc de instaláveis é onde ela aparece
de novo, cobrindo ambos os tipos:

> **[primária, developers.google.com/apps-script/guides/triggers/installable, seção
> "Restrictions"]** *"Script executions and API requests don't cause triggers to run. For
> example, calling `FormResponse.submit()` to submit a new form response doesn't cause the form's
> submit trigger to run."*

E, na página de triggers simples, a mesma regra, com o exemplo já no domínio de planilha:

> **[primária, developers.google.com/apps-script/guides/triggers/, seção "Restrictions"]**
> *"Script executions and API requests don't cause triggers to run. For example, calling
> `Range.setValue()` to edit a cell does not cause the spreadsheet's `onEdit` trigger to run."*

**Conclusão direta: `onEdit`/`onChange`, simples ou instalável, estão descartados como mecanismo
de disparo para este projeto**, porque o evento que precisamos capturar — o agente gravando uma
linha nova via Sheets API — é exatamente o tipo de gravação que a própria documentação diz que
**não** dispara o evento. Isso não é uma leitura pessimista de um caso ambíguo: é a frase da
documentação oficial, com o mesmo verbo ("don't cause triggers to run") repetido nas duas páginas
que descrevem os dois tipos de trigger que existem.

A implicação prática mais importante: **qualquer solução baseada em reagir a um evento de edição
está descartada por documentação, não por suposição.** A solução tem que ser algo que não dependa
de um evento disparar — ver [recomendação](#recomendação-final) abaixo.

---

## 1. O que o Google Sheets oferece nativamente — e por que há duas features diferentes, não uma

Existem **dois recursos nativos distintos** no Google Sheets hoje, frequentemente confundidos
entre si (inclusive nos títulos de busca, porque a UI mudou de nome ao longo do tempo). O ticket
029 os chama de "Regras de notificação"; a investigação encontrou que esse nome corresponde ao
recurso mais antigo, e que existe um segundo recurso, mais novo, com comportamento e restrição de
conta diferentes.

### 1.1 — "Notification settings" (o recurso clássico, `Ferramentas → Notificações` / antigo
"Set notification rules")

**[primária, support.google.com/docs/answer/91588 — "Manage your notifications"]**

- **Gatilhos disponíveis:** exatamente dois — **"Any changes are made"** (qualquer edição na
  planilha inteira) e **"A user submits a form"** (só se houver um Google Forms associado à
  planilha). Não há opção de restringir a uma aba específica: o gatilho "Any changes are made" é
  **a planilha inteira**, não uma aba.
- **Frequência:** duas opções — **"Email - right away"** (um e-mail por mudança) e **"Email -
  daily digest"** (resumo consolidado uma vez por dia). A doc oficial não especifica um número de
  minutos de latência para a opção "right away"; **[secundária, howtogeek.com e outros guias de
  terceiro consultados]** relatam de forma consistente que "right away" chega tipicamente em
  minutos, não instantaneamente, mas isso não é confirmado por texto oficial com número exato.
- **Conteúdo do e-mail:** a documentação oficial não descreve explicitamente se o corpo do e-mail
  reproduz o valor da célula/linha alterada. Ela confirma que a notificação informa **quem** fez a
  mudança e **quando**, com um link para abrir o documento — não confirma nem nega, em texto
  literal, se o conteúdo da edição aparece no corpo do e-mail. **[secundária, múltiplos guias de
  terceiro convergentes]** descrevem o e-mail como relativamente genérico (nome de quem editou,
  timestamp, link "Ver alterações") — não um extrato formatado da linha, ao contrário do recurso
  mais novo descrito abaixo.
- **Disponibilidade de conta:** nenhuma restrição de tipo de conta encontrada — este recurso está
  disponível tanto para conta pessoal (`@gmail.com`) quanto para Google Workspace. Relevante
  porque as consultoras usam `@gmail.com` pessoal (ticket [020](../tickets/020-perguntas-para-as-consultoras.md)).

### 1.2 — "Conditional notifications" (o recurso novo, `Ferramentas → Notificações condicionais`,
lançado em 2025)

**[primária, support.google.com/docs/answer/14099459 — "Use conditional notifications"; e
Google Workspace Updates blog, setembro de 2025]**

- **Gatilho:** um único tipo de evento — "quando uma célula muda" —, mas com **condições**
  configuráveis por cima (ex.: "o texto é exatamente 'Pendente'"), até **20 regras por
  planilha**.
- **Restrição por aba:** **sim, este recurso permite restringir a uma aba/intervalo específico**
  ("In this table" / intervalo de colunas). Isso resolve exatamente a pergunta que o ticket 029
  levantou sobre restringir à aba de chamados — mas só neste recurso, não no clássico (1.1).
- **Conteúdo do e-mail:** mais rico que o clássico — inclui o valor da célula que mudou, células
  adjacentes da mesma linha, quem mudou, e valor anterior/novo.
- **Latência:** **[primária, mesma página de suporte]** — a notificação **"pode levar até 30
  minutos para chegar"**, e múltiplas mudanças em pouco tempo podem ser agrupadas num único
  e-mail. Esse número de 30 minutos é o único valor de latência com fonte oficial encontrado nesta
  pesquisa, e é maior, não menor, que o esperado de um recurso chamado "condicional" — relevante
  para dimensionar expectativa.
- **Disponibilidade de conta — a restrição mais importante encontrada nesta seção:**
  **[primária, Google Workspace Updates, setembro de 2025]** este recurso está disponível
  **apenas para contas Google Workspace Business, Enterprise ou Education** — **contas pessoais
  `@gmail.com` não têm acesso**, tanto para configurar quanto (segundo relatos de usuário na
  comunidade oficial de suporte, **[secundária]**) mesmo como destinatário em alguns fluxos.

**Consequência prática para a Lais Casa:** o recurso mais rico (restrição por aba, conteúdo
detalhado) só existe se **quem é dona/editora da planilha compartilhada** tiver conta Google
Workspace paga. O ticket [004](../tickets/004-acesso-a-planilha-e-ao-catalogo.md), ainda aberto,
não confirmou em que tipo de conta a planilha vive — só se sabe que as consultoras individualmente
usam `@gmail.com` pessoal (ticket 020, pergunta 19). **Isso é uma lacuna de confirmação que
precede qualquer decisão de usar Notificações Condicionais** — não é possível hoje saber se esse
recurso está sequer disponível para esta planilha.

### 1.3 — O ponto que a Seção 0 já resolve para os dois: firing em cima de gravação por API

**Nenhuma das duas páginas oficiais (91588 ou 14099459) menciona, em nenhum sentido, gravação
via API externa** — ambas descrevem o gatilho em termos de "alguém edita" / "a cell changes",
linguagem de usuário humano, sem qualquer menção a Sheets API, Apps Script, ou aplicação externa.
Isso é diferente da documentação de Apps Script (seção acima), que **é explícita** sobre API não
disparar evento.

Essa ausência de menção **não é uma confirmação de que funciona** — é simplesmente a pergunta não
sendo respondida na fonte primária correspondente a esse recurso específico. A investigação
buscou ativamente por confirmação em um ou outro sentido e não achou fonte primária que resolva
isso para as Notificações (clássicas ou condicionais) especificamente. O que existe é:

- **[secundária, múltiplos relatos convergentes em busca sobre Zapier/Sheets/automação]** — o
  padrão relatado por quem tenta automatizar em cima de planilhas é que gatilhos nativos de
  "mudança" (nesse ecossistema, de forma geral) **tendem a não disparar de forma confiável** para
  edição feita por API/scripts, mesmo quando o recurso em si não é tecnicamente idêntico ao
  `onEdit` do Apps Script.
- **O argumento de engenharia mais forte disponível**, ainda que indireto: as Notificações
  (clássica e condicional) do Sheets são, do ponto de vista de arquitetura do Google Workspace,
  construídas em cima da mesma camada de eventos de edição de documento que alimenta o Apps
  Script — não há indício, em nenhuma fonte consultada, de que existam **dois sistemas de
  detecção de edição independentes** dentro do Sheets, um que vê edição via API e outro que não.
  Dado que o sistema confirmadamente documentado (Apps Script) **não** vê edição via API, a leitura
  mais prudente de engenharia é tratar as Notificações nativas com a mesma suposição, até prova em
  contrário — **não confiar nelas como mecanismo primário para dado escrito por API**, mesmo sem
  uma frase oficial que feche essa dúvida especificamente para as Notificações.

**Isto é uma lacuna explícita desta pesquisa**, registrada também na seção de lacunas abaixo: não
existe teste real documentado, nem nesta pesquisa nem em fonte de terceiro confiável, gravando via
Sheets API v4 numa planilha com Notificação (clássica ou condicional) configurada e observando se
o e-mail chega. **A única forma de fechar essa lacuna com certeza é testar**, assim que o ticket
004 der acesso real à planilha — mas a arquitetura recomendada abaixo não depende de fazer esse
teste primeiro, porque contorna o problema inteiro.

---

## 2. Por que a solução correta contorna o problema em vez de testá-lo

Dado o achado da Seção 0 (Apps Script confirma, por documentação, que API não dispara `onEdit`/
`onChange`) e a lacuna da Seção 1.3 (Notificações nativas, sem confirmação em qualquer direção,
mas com razão de engenharia para tratar como igualmente não confiáveis), a escolha de desenho mais
sólida é **não depender de nenhum evento de edição disparar** — usar, em vez disso, um mecanismo
que **verifica o estado da planilha periodicamente**, independente de como/quem escreveu nela.

### Time-driven trigger + `MailApp`/`GmailApp` — o mecanismo recomendado

**[primária, developers.google.com/apps-script/guides/triggers/installable, seção "Time-driven
triggers"]**

> *"Time-driven triggers let scripts execute at a particular time or on a recurring interval, as
> frequently as every minute or as infrequently as once per month."*

Um script Apps Script vinculado à planilha, com um trigger de tempo (ex.: a cada 5 minutos, ou a
cada 1 minuto se a latência precisar ser mais curta), que:

1. Lê a aba de chamados pendentes (a mesma aba criada pela decisão do ticket 012).
2. Identifica linhas novas/ainda-não-notificadas desde a última varredura (ex.: uma coluna de
   controle "notificado: sim/não", ou comparar contra o timestamp da última execução).
3. Manda um e-mail formatado via `MailApp.sendEmail()` (ou `GmailApp.sendEmail()`, que também
   permite HTML) com o conteúdo do chamado, para os e-mails das consultoras.

**Por que isso resolve o ponto crítico:** o script **não está esperando um evento de edição** —
ele lê o conteúdo atual da planilha a cada execução, não importa se a linha foi escrita por um
humano na UI, por outro Apps Script, ou pela Sheets API v4 do agente. Não há dependência de
`onEdit`/`onChange` disparando, então a restrição documentada na Seção 0 deixa de ser relevante.

**Quotas relevantes, oficiais:**

**[primária, developers.google.com/apps-script/guides/services/quotas]**

| Recurso | Conta pessoal (Gmail comum) | Google Workspace |
|---|---|---|
| E-mails via `MailApp`/`GmailApp` (destinatários/dia) | 100/dia | 1.500/dia (2.000/dia dentro do domínio) |
| Tempo total de execução de triggers | 90 min/dia | 6 h/dia |
| Nº de triggers por usuário/script | 20 | 20 |

Para o volume da Lais Casa — uma fila de chamados escalados de uma loja de médio porte, quase
certamente na casa de poucas unidades por dia, não centenas — **essas quotas sobram com folga
larga**, mesmo no plano de conta pessoal `@gmail.com` mais restrito (relevante, porque tanto as
consultoras quanto, possivelmente, a conta dona da planilha usam Gmail comum, não Workspace, como
já registrado). Uma execução a cada minuto, mesmo rodando o dia inteiro, consome poucos minutos de
tempo total de execução — o script em si é uma leitura de planilha e, quando há linha nova, um
envio de e-mail; nenhuma dessas operações é lenta.

### Latência típica deste mecanismo

Configurável diretamente: **de 1 em 1 minuto** é o intervalo mínimo documentado para trigger de
tempo. Isso é **menor** que os 30 minutos documentados para Notificações Condicionais (Seção 1.2)
e do que os relatos não-oficiais de "alguns minutos" para o recurso clássico (Seção 1.1) — o
mecanismo baseado em Apps Script, além de contornar o problema de firing por API, também é o mais
rápido dos três, por documentação oficial.

---

## 3. SMS — não existe caminho nativo do Google; qualquer opção de SMS é integração de terceiro

**[primária, ausência confirmada]** A documentação de serviços do Apps Script
(`developers.google.com/apps-script/guides/services/`) não lista nenhum serviço de envio de SMS.
Não existe `SmsApp` nem equivalente no conjunto de serviços nativos do Google Apps Script — a
busca confirma que este é um ponto sem controvérsia: **[secundária, convergência de múltiplas
fontes técnicas sobre a ausência]** todo caminho de SMS a partir de Apps Script passa por chamar a
API REST de um provedor terceiro (o mais citado é a Twilio) dentro da própria função do script,
usando `UrlFetchApp` para fazer a chamada HTTP.

**Isso conta como "hospedagem própria nova"?** Não no sentido de infraestrutura própria (não é
preciso subir servidor, é uma chamada de API de dentro do mesmo Apps Script que já resolveria o
e-mail) — mas **conta como uma dependência nova**: uma conta paga de terceiro (Twilio cobra por
SMS enviado e por número), uma segunda credencial a gerenciar, e uma superfície de falha adicional
fora do controle do Google. Não é gratuito nem "zero-config" da forma que o e-mail via
`MailApp` é. **Avaliação desta pesquisa: viável tecnicamente, mas desproporcional ao problema**
enquanto o e-mail não tiver sido testado e reprovado na prática pelas consultoras — o tipo de
degrau que faz sentido subir só se o degrau de baixo (e-mail) já tiver sido tentado e confirmado
insuficiente.

---

## 4. Apps de terceiros conectados ao Sheets (Zapier, Make, IFTTT)

Descrição da opção, sem teste (conforme escopo do ticket):

- **Como funcionaria:** esses serviços conectam à planilha via a própria Sheets API (o mesmo
  caminho que o agente usaria) e, tipicamente, **fazem polling periódico** em vez de depender de
  evento de edição — o que, na prática, **provavelmente também contorna** o problema da Seção 0,
  pelo mesmo motivo que o time-driven trigger contorna: não dependem de `onEdit`/`onChange`
  disparando. Uma vez detectada uma linha nova, podem disparar e-mail, notificação push (app
  próprio do Zapier/Make no celular), Slack, ou SMS via integração com Twilio/similares.
- **Custo/limites típicos (2026), a título de referência, não de recomendação:**
  - **Zapier:** plano gratuito com 100 tarefas/mês, mas **zaps de um único passo apenas**
    (gatilho + uma ação), o que já cobriria "linha nova → e-mail" ou "linha nova → SMS", mas nada
    mais elaborado; planos pagos a partir de ~US$ 20–30/mês para zaps multi-passo.
  - **Make.com:** plano gratuito com 1.000 operações/mês, limitado a 2 cenários ativos e
    intervalo mínimo de 15 minutos entre execuções no plano grátis (mais lento que o time-driven
    trigger do Apps Script, que chega a 1 minuto); planos pagos a partir de ~US$ 16/mês removem
    esses dois limites.
  - **IFTTT:** modelo similar, gratuito com poucos "applets" e limites de frequência.
- **Avaliação:** **não recomendado como canal primário.** Resolve o mesmo problema que o Apps
  Script já resolve de graça e dentro do próprio Google, mas introduz uma conta de terceiro nova,
  uma superfície de custo recorrente, e uma dependência de serviço externo para algo que não
  precisa de um — sem ganho compensador, a não ser que o canal desejado seja algo que o Apps
  Script não alcança nativamente (ex.: notificação push num app de celular, ou SMS, sem escrever
  código de integração à mão). Fica registrado como **alternativa de segunda linha**, útil se o
  canal e-mail (recomendação principal) se confirmar insuficiente e SMS via Twilio direto parecer
  complexo demais para configurar sem essas plataformas de meio de campo.

---

## 5. Sinal físico na loja (luz, campainha) — descartado por escrito

Conforme pedido explicitamente no ticket, o descarte:

- **A loja já tem consultoras revezando atendimento e olhando celular durante o expediente** —
  registrado no ticket 009/020 (rotatividade por cronologia, WhatsApp é o canal de trabalho
  principal). Um sinal físico resolveria um problema que a loja não tem hoje: ninguém por perto
  para notar. O gargalo real, se existir, é "ninguém checa e-mail", não "ninguém está na loja".
- **É a única opção das quatro investigadas que exige hardware/infraestrutura nova de verdade**
  (um dispositivo de luz/som, cabeamento ou Wi-Fi próprio, manutenção física) — o oposto exato do
  critério do ticket ("sem exigir uma superfície nova construída do zero"). As outras três opções
  (nativo do Sheets, Apps Script, apps de terceiro) rodam inteiramente em cima de contas e
  serviços que já existem.
- **Não resolve o problema fora do horário comercial ou quando a loja está vazia entre clientes**
  — um sinal físico só ajuda quem está fisicamente lá; e-mail/SMS chegam independente de estar na
  loja.

**Descartado.** Nenhuma das razões acima é "não dá para fazer" — é "resolve o problema errado, ao
custo mais alto entre as opções avaliadas".

---

## Addendum — "chamativo" e onde a fila vive de fato, compartilhada entre todas

Pergunta de acompanhamento (2026-08-12, dono do projeto): a notificação, além de disparar
independente da origem da gravação (Seção 2), precisa ser **(a)** chamativa o suficiente para que
a consultora bata o olho no celular/computador, e **(b)** a fila em si precisa viver num lugar
único, compartilhado, que todas acessam — não só a consultora que recebeu o e-mail.

**(b) já está resolvido por arquitetura, e é independente do canal de notificação escolhido.** O
ticket [012](../tickets/012-quando-e-como-o-agente-escala.md) já decidiu onde a fila vive: **uma
aba nova na mesma planilha compartilhada que as consultoras já usam todo dia** para os clientes
delas, com a linha em vermelho enquanto o chamado está pendente. Esse é o "lugar físico" único e
compartilhado que a pergunta busca — já existe hoje, é a mesma superfície que elas já abrem no
navegador ou no app do Sheets no celular, e **nenhuma decisão de canal de notificação muda isso**.
A notificação (e-mail, SMS, o que for) **não é a fila** — é só o toque no ombro que manda alguém
abrir essa aba. Qualquer uma das quatro pessoas (3 consultoras + dona) vê a mesma fila, ao vivo,
assim que abre a planilha; o e-mail (ou SMS) avisa que ela mudou, não duplica o conteúdo.

**(a) é onde a escolha de canal realmente compete**, e vale destacar com honestidade: a
recomendação principal (e-mail) venceu nos critérios de **custo, confiabilidade técnica com escrita
via API, e latência documentada** — não foi avaliada, até este addendum, pelo critério "quão
provável é chamar atenção no celular". Ranqueando as opções já mapeadas por esse critério
especificamente:

| Canal | Quão chamativo | Custo/complexidade extra |
|---|---|---|
| **SMS** (via Twilio, Seção 3) | Alto — som/vibração/tela de bloqueio quase sempre ativos; hábito de checar é maior que e-mail | Conta paga de terceiro, credencial extra, sem cobertura nativa do Google |
| **Push de app terceiro** (Zapier/Make → Pushover, Telegram etc., Seção 4) | Alto, mas depende de instalar e manter notificação ligada num app novo | Conta de terceiro nova, custo recorrente |
| **E-mail** (recomendação principal, Seção 2) | **Depende de configuração do celular de cada consultora** — se o Gmail tiver push ativado (comportamento padrão, mas não garantido), aparece como notificação comum; se não, só aparece quando alguém abre o app | Zero |
| **Notificações nativas do Sheets** (Seção 1) | Mesmo problema de proeminência do e-mail — é o mesmo canal de saída, e ainda carrega a incerteza técnica da Seção 1.3/2 | Zero, mas não confirmado que funciona com escrita via API |

**O ponto central: "chamativo" para e-mail não é uma propriedade do mecanismo, é uma configuração
de celular que ninguém confirmou ainda** — exatamente a mesma lacuna já registrada na Seção "Lacunas"
(item 3) e no ticket [020](../tickets/020-perguntas-para-as-consultoras.md): não basta saber se
elas checam e-mail, é preciso saber se o celular **avisa** quando chega um. Isso é validação
humana, fora do escopo técnico deste research, mas decide diretamente se a resposta a esta pergunta
do dono do projeto é "sim, o e-mail já resolve" ou "não, precisa subir para SMS".

**Isso muda a recomendação técnica?** Não muda o mecanismo de disparo (time-driven trigger,
Seção 2) — continua sendo a única peça comprovada por documentação a funcionar com escrita via
API, e é pré-requisito de qualquer um dos quatro canais da tabela acima, não só do e-mail. Muda,
potencialmente, **qual canal de saída o último passo do script usa** — e o desenho já foi pensado
para trocar isso sem redesenhar o resto (ver Recomendação final). A rota mais barata para resolver
essa dúvida na prática: implementar com e-mail primeiro (grátis, testável assim que o
[004](../tickets/004-acesso-a-planilha-e-ao-catalogo.md) der acesso), perguntar explicitamente às
consultoras se o celular avisa quando chega e-mail durante o expediente, e só then subir para SMS
(Seção 3) se a resposta for "não percebo".

---

## Lacunas que esta pesquisa não fecha

1. **Se as Notificações nativas do Sheets (clássica ou condicional) disparam para gravação via
   Sheets API v4** — nenhuma fonte primária confirma ou nega isso especificamente. A leitura desta
   pesquisa (Seção 1.3) é uma inferência de engenharia razoável, não uma confirmação — e por isso
   a recomendação final não depende de resolver essa lacuna.
2. **Que tipo de conta Google hospeda a planilha compartilhada** (pessoal `@gmail.com` ou
   Workspace) — decide se Notificações Condicionais chegam a ser uma opção disponível. Fica para o
   ticket [004](../tickets/004-acesso-a-planilha-e-ao-catalogo.md) confirmar, mas não bloqueia a
   recomendação desta pesquisa, que não depende desse recurso.
3. **Se e-mail é canal que as consultoras de fato checam no fluxo de trabalho real** — fora do
   escopo técnico deste research por decisão explícita do ticket. Precisa de confirmação humana
   antes de fechar a decisão só em e-mail; ver ticket
   [020](../tickets/020-perguntas-para-as-consultoras.md), que já registrou que o e-mail delas é
   `@gmail.com` pessoal, mas não perguntou frequência de checagem durante o expediente. Recomenda-se
   incluir essa pergunta na próxima rodada do 020.
4. **Latência real do recurso clássico de Notificações ("right away")** — não existe número oficial
   documentado; só relatos de terceiro de "alguns minutos". Se algum dia esse recurso for testado na
   prática, vale medir e registrar.

---

## Recomendação final

**Canal recomendado: e-mail via Apps Script, disparado por trigger de tempo (time-driven), não
por evento de edição — não os recursos nativos "Regras/Condições de notificação" do Sheets.**

**Por quê, resumido:**

1. **É o único mecanismo, entre os quatro investigados, que tem confirmação por documentação
   oficial de funcionar independente de como a linha foi escrita** — porque não escuta evento de
   edição, só lê o estado atual da planilha em intervalos. Isso resolve diretamente o ponto crítico
   do ticket: o agente escreve via Sheets API, e `onEdit`/`onChange` (simples ou instalável) **não
   disparam** para isso, confirmado em texto explícito da documentação do Apps Script (Seção 0).
2. **As Notificações nativas do Sheets ficam descartadas como mecanismo primário — não porque
   estejam confirmadas como quebradas, mas porque não há confirmação de que funcionem** para o
   caso de uso exato deste projeto (gravação por API), e a opção mais rica delas (Notificações
   Condicionais, com restrição por aba) tem uma trava adicional: é exclusiva de conta Google
   Workspace paga, que não se sabe ainda se a planilha tem (lacuna 2 acima).
3. **Custo zero, dentro de quotas confirmadas por documentação** (100 destinatários/dia em conta
   pessoal Gmail, folgado para o volume esperado da fila de chamados), **sem introduzir
   dependência de terceiro** (ao contrário de SMS via Twilio ou de Zapier/Make/IFTTT).
4. **Latência configurável até 1 minuto**, documentada oficialmente — mais rápido que os 30
   minutos documentados para Notificações Condicionais e que os relatos de "alguns minutos" do
   recurso clássico.
5. **Alternativas descartadas, com razão registrada:** SMS nativo não existe no Google (teria que
   ser Twilio, dependência nova, desproporcional antes de e-mail ser testado e reprovado — Seção
   3); apps de terceiro (Zapier/Make/IFTTT) resolvem o mesmo problema com custo recorrente e conta
   externa nova, sem ganho sobre o Apps Script — reservados como plano B (Seção 4); sinal físico na
   loja descartado por resolver o problema errado ao maior custo de infraestrutura entre as quatro
   opções (Seção 5).

**Fica pendente, e não é técnico:** confirmar com as consultoras se e-mail é canal que elas
checam durante o expediente (ver ticket [020](../tickets/020-perguntas-para-as-consultoras.md)).
Se a resposta for "não checamos e-mail no dia a dia", a arquitetura acima continua válida como
mecanismo de disparo — só muda o canal de saída do último passo do script, de `MailApp.sendEmail`
para uma chamada Twilio (Seção 3) ou uma integração via Zapier/Make (Seção 4), sem precisar
redesenhar o resto (leitura periódica da fila, deduplicação de chamados já notificados). **Testável
assim que o ticket [004](../tickets/004-acesso-a-planilha-e-ao-catalogo.md) der acesso real à
planilha.**
