---
ticket: 006-integracao-com-google-calendar
tipo: research
data: 2026-08-10
---

# O que a integração com Google Calendar exige

Investigação do ticket [006](../tickets/006-integracao-com-google-calendar.md), feita contra
a documentação oficial da Google Calendar API e das plataformas alternativas. Cada
afirmação carrega a URL da fonte.

> **A pergunta que não é técnica.** O mapa registra três sistemas em uso na Lais Casa —
> WhatsApp Business, Maino e a planilha compartilhada. O Google Calendar **não está entre
> eles**. Tudo que segue está escrito supondo que a resposta a "as consultoras mantêm agenda
> no Google hoje?" ainda é desconhecida. A seção final trata explicitamente dos dois
> cenários, porque eles produzem decisões diferentes — não versões da mesma decisão.

---

## 1. Autenticação para ler a agenda de várias pessoas

Há dois caminhos, e a escolha entre eles **não é técnica: depende de a loja ter Google
Workspace ou contas Gmail comuns**.

### 1.1. Conta de serviço com delegação em todo o domínio (domain-wide delegation)

Uma conta de serviço passa a poder **personificar** qualquer usuário do domínio, sem que
ninguém clique em nada. É o caminho limpo — e o mais restrito em pré-requisitos.

Requisitos exatos:

- **Exige uma organização Google Workspace.** A delegação serve para "acessar dados do
  Google Workspace em nome de vários usuários individuais **na sua organização**", e a
  concessão é feita "no Google Admin console **usando uma conta de Super Admin**".
  Fonte: <https://developers.google.com/workspace/guides/create-credentials>
- O **client ID** da conta de serviço precisa ser cadastrado em "Manage Domain Wide
  Delegation" no Admin console, junto com a **lista de escopos separada por vírgula**.
  Mesma fonte.
- A propagação "pode levar até 24 horas, mas normalmente é mais rápida". Mesma fonte.

**Consequência para a Lais Casa:** se as consultoras usam Gmail pessoal
(`@gmail.com`), **este caminho não existe**. Não há Admin console, não há Super Admin, não
há domínio a delegar. A documentação do Google não descreve delegação sobre contas de
consumidor — a funcionalidade é definida em termos de organização Workspace.
Fonte: <https://developers.google.com/workspace/guides/create-credentials>

O que pede da consultora: **nada**. Ela não autoriza, não instala, não clica. É a maior
vantagem — e por isso vale perguntar ao dono do projeto se a loja tem Workspace antes de
descartar.

### 1.2. OAuth por consultora

Cada consultora abre uma tela de consentimento do Google, aprova os escopos, e o sistema
guarda um **refresh token** por pessoa.

Requisitos e armadilhas — todas relevantes para um projeto pequeno:

- **Os escopos de Calendar são "sensíveis".** O Google cita literalmente "ler eventos
  armazenados no Google Calendar" como exemplo de escopo sensível, e escopos sensíveis
  "exigem revisão do Google antes que qualquer Conta Google possa conceder acesso".
  Fonte: <https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification>
- A verificação de escopo sensível "pode levar até 10 dias". Mesma fonte.
- Para verificar, é preciso: **domínio verificado no Google Search Console**, homepage no
  domínio verificado descrevendo o app, **política de privacidade** hospedada no mesmo
  domínio e linkada na tela de consentimento, justificativa por escopo, e um **vídeo não
  listado no YouTube** demonstrando o fluxo OAuth e o uso real dos dados.
  Fontes: <https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification>
  e <https://support.google.com/cloud/answer/13464321>
- **Enquanto o app estiver em "Testing":** limite de **100 test users** cadastrados na tela
  de consentimento, e "a autorização de um test user expira sete dias após o consentimento.
  Se o cliente OAuth pedir `offline` e receber um refresh token, esse token também expira".
  Fonte: <https://support.google.com/cloud/answer/15549945>
  Confirmado também em <https://developers.google.com/identity/protocols/oauth2>: "um projeto
  com tela de consentimento de tipo externo e status de publicação 'Testing' recebe refresh
  token que expira em 7 dias".
- **Isto é o ponto de dor prático:** com o app em Testing, cada consultora teria de
  reautorizar **a cada 7 dias**. Inaceitável em produção. Ou seja, OAuth por consultora
  **obriga** a passar pela verificação de escopo sensível.
- Limite de **100 refresh tokens por Conta Google por client ID OAuth**; ao estourar, o mais
  antigo é invalidado silenciosamente. Um refresh token também morre por **6 meses sem uso**
  ou por revogação do usuário.
  Fonte: <https://developers.google.com/identity/protocols/oauth2>

O que pede da consultora: **um consentimento inicial** no navegador com a conta Google dela
— e, se a verificação não estiver concluída, uma tela de aviso de "app não verificado" e
reautorização semanal.

### 1.3. Terceiro caminho: compartilhamento de calendário (ACL)

Alternativa que evita tanto Workspace quanto OAuth por pessoa: **uma única conta Google do
projeto**, com quem cada consultora compartilha o próprio calendário pelo app do Google
Calendar. Só essa conta faz OAuth.

Os papéis de ACL disponíveis:

| Papel | O que permite |
|---|---|
| `freeBusyReader` | "ver se o calendário está livre ou ocupado num dado horário, **sem** acesso aos detalhes do evento" |
| `reader` | ver os eventos |
| `writerWithoutPrivateAccess` | ler e escrever eventos não privados; eventos privados aparecem só como bloco de ocupado |
| `writer` | leitura e escrita completas |
| `owner` | tudo, mais gerir permissões |

Fonte: <https://developers.google.com/workspace/calendar/api/concepts/sharing>

Detalhe operacional citado na mesma fonte: "compartilhar um calendário com um usuário **não
insere mais automaticamente** o calendário no `CalendarList` dele" — o app precisa chamar
`CalendarList: insert` explicitamente.

**Este é provavelmente o caminho de menor atrito se as consultoras usarem Gmail comum**, e
`freeBusyReader` é exatamente o papel que a restrição de privacidade do ticket pede. A
limitação: `freeBusyReader` **não** deixa criar evento; para agendar é preciso `writer` (ou
`writerWithoutPrivateAccess`) — ver seção 3.

---

## 2. Free/busy — disponibilidade sem ler o conteúdo dos eventos

Existe endpoint dedicado, e ele resolve o requisito de privacidade do ticket.

- **Requisição:** `POST https://www.googleapis.com/calendar/v3/freeBusy`
- **Escopos aceitos (basta um):** `.../auth/calendar.freebusy`,
  `.../auth/calendar.events.freebusy`, `.../auth/calendar.readonly`, `.../auth/calendar`.
  O primeiro é o mais estreito — pede só disponibilidade, nunca conteúdo.
- **Corpo:** `timeMin` e `timeMax` (RFC3339), `timeZone` (opcional, **default UTC**),
  `items[]` com o `id` de cada calendário, `calendarExpansionMax` (máx. **50** calendários
  por requisição) e `groupExpansionMax` (máx. 100).
- **Resposta:** objeto `calendar#freeBusy` com `calendars`, e para cada calendário a lista
  de intervalos ocupados com `start` e `end`. **Sem título, sem descrição, sem convidados.**

Fonte: <https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query>

Isso significa: **a disponibilidade de todas as consultoras da loja cabe numa única chamada**
(50 calendários é folga enorme para o tamanho do time), e o agente jamais vê que a
consultora tem consulta médica às 15h — só que às 15h ela está ocupada.

Escolha de escopo recomendada, pelo princípio de menor privilégio que a própria
documentação prega ("solicite os escopos que exigem o mínimo de acesso necessário"):
`calendar.freebusy` para leitura. Fonte:
<https://developers.google.com/identity/protocols/oauth2/scopes>

---

## 3. Criar, alterar e cancelar evento em nome de outra pessoa

### Criar

`POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`
(`calendarId` = e-mail da consultora, ou `primary`).

Campos que importam aqui:

- **Horário e fuso:** `start.dateTime` / `end.dateTime` em RFC3339, com
  `start.timeZone` / `end.timeZone` como **identificador IANA** (`America/Sao_Paulo`).
  Para evento de dia inteiro, `start.date` / `end.date` em `yyyy-mm-dd`.
- **Convite ao cliente:** `attendees[]`, com `email` obrigatório, mais `displayName`,
  `optional` e `responseStatus`.
- **Envio do convite:** parâmetro de query `sendUpdates`, com valores `all`,
  `externalOnly` ou `none`. Para o cliente da loja (que não é do domínio), `all` ou
  `externalOnly` disparam o e-mail.
- **Estado:** `status` aceita `confirmed`, `tentative` ou `cancelled`.
- **Bloqueio de horário:** `transparency` = `opaque` (ocupa) ou `transparent` (não ocupa).
  Para segurar slot, tem de ser `opaque` — ver seção 4.
- **Privacidade do evento:** `visibility` = `default`, `public`, `private`, `confidential`.
- **Google Meet:** `conferenceData.createRequest` com um `requestId` aleatório, e o
  parâmetro de query `conferenceDataVersion=1`. A resposta volta `pending` e depois vira
  `success`.

Fontes: <https://developers.google.com/workspace/calendar/api/v3/reference/events/insert>
e <https://developers.google.com/workspace/calendar/api/guides/create-events>

Nota relevante para a experiência do cliente: "o evento criado aparece em todos os Google
Calendars primários dos convidados incluídos, com o mesmo ID de evento".
Fonte: <https://developers.google.com/workspace/calendar/api/guides/create-events>
Só que **o cliente da loja provavelmente não tem Google Calendar** — chega por WhatsApp. Na
prática, o convite útil é o **e-mail** disparado por `sendUpdates`, e mesmo esse depende de
o agente ter capturado o e-mail do cliente na qualificação. Se não tiver, a confirmação
efetiva é a mensagem no próprio WhatsApp, e o evento no Calendar serve à consultora, não ao
cliente. **Isto é um requisito de produto, não um detalhe de API.**

### Alterar / remarcar

- `events.patch` — "os valores de campo que você especifica substituem os existentes;
  campos não especificados permanecem inalterados". Remarcar = patch em `start` e `end`.
- **Atenção a custo de cota:** "cada requisição patch consome **três unidades de cota**;
  prefira um `get` seguido de `update`."
- `sendUpdates` também vale em patch e delete — mesmos valores.

Fonte: <https://developers.google.com/workspace/calendar/api/v3/reference/events/patch>

### Cancelar

Duas formas: `events.delete` (remove) ou `patch` com `status: "cancelled"` (preserva o
registro). Para o laço de aprendizado do projeto — que precisa registrar "reunião agendada"
e distinguir de "reunião cancelada" — **preservar com `status: cancelled` é melhor que
apagar**, mas o registro canônico do resultado deve ficar no nosso banco, não no Calendar.

### Permissão necessária

Criar/alterar evento no calendário de outra pessoa exige, no modelo de compartilhamento,
papel `writer` ou `writerWithoutPrivateAccess` — `freeBusyReader` não basta.
Fonte: <https://developers.google.com/workspace/calendar/api/concepts/sharing>

**Implicação de desenho:** dá para separar os dois níveis. Ler disponibilidade de todas com
`freeBusyReader`, e pedir `writer` só onde o agente realmente agenda. Se o agendamento for
feito num **calendário próprio da loja** (criado pelo projeto) em vez de no calendário
pessoal da consultora, o agente nunca precisa de `writer` na agenda pessoal de ninguém — e
a consultora só precisa assinar esse calendário compartilhado. É a configuração mais
respeitosa das duas restrições do mapa (privacidade e "o processo da loja não se dobra ao
agente").

---

## 4. Reserva temporária de horário — a API não oferece

**Não existe hold nativo.** Levantamento:

- A Calendar API **não expõe endpoint para agendas de compromisso / páginas de reserva**
  (appointment schedules). Os `eventType` documentados são `default`, `birthday`,
  `fromGmail` e os de status (focus time, out of office, working location); nenhum deles é
  agenda de reserva, e não há método para criar ou gerir booking pages.
  Fonte: <https://developers.google.com/workspace/calendar/api/guides/event-types>
- Não há TTL, expiração automática nem "tentative hold" com prazo. O mais próximo é criar o
  evento com `status: "tentative"` e `transparency: "opaque"`, o que **ocupa o horário** e
  o marca como não confirmado.
  Fonte: <https://developers.google.com/workspace/calendar/api/v3/reference/events/insert>

**O que teria de ser resolvido do nosso lado — e é trabalho real:**

1. Tabela de `holds` no Postgres/Supabase (consultora, início, fim, `conversation_id`,
   `expires_at`).
2. **Exclusão mútua na escrita.** Duas conversas simultâneas podem pedir o mesmo slot; a
   API do Google não impede overbooking. Isso se resolve com constraint no banco
   (`EXCLUDE USING gist` sobre um `tstzrange` por consultora, ou índice único por slot
   discretizado), não com lógica no agente.
3. **Expiração.** Job que varre holds vencidos e apaga o evento tentative correspondente.
4. **Disponibilidade = free/busy do Google MENOS holds ativos nossos.** Toda consulta de
   horário passa a ser a interseção das duas fontes.
5. Promoção do hold a confirmado quando o cliente responde no WhatsApp:
   `patch` para `status: "confirmed"` + `sendUpdates`.

Ou seja: **mesmo no cenário "as consultoras já usam Google Calendar", uma parte do sistema
de agendamento é nossa de qualquer jeito.** O Google Calendar é fonte de verdade da
*ocupação*, não do *processo de reserva*.

---

## 5. Limites de cota

Para um agente que consulta agenda a cada conversa, os números são confortáveis:

- **10.000 requisições/minuto por projeto**
- **600 requisições/minuto por usuário por projeto**
- **1.000.000 requisições/24h por projeto** antes de qualquer cobrança
- Cota calculada em **janela deslizante** — picos curtos disparam limitação na janela
  seguinte
- Estouro retorna **403 `usageLimits`** ou **429 `usageLimits`**; o Google prescreve
  **backoff exponencial** com jitter: `min(((2^n)+random_ms), maximum_backoff)`, com
  `maximum_backoff` tipicamente 32–64s

Fonte: <https://developers.google.com/workspace/calendar/api/guides/quota>

**Leitura para o nosso caso:** uma loja com um punhado de consultoras não chega perto
desses tetos. O risco real não é volume — é **um bug de retry em loop** consumindo cota, ou
`patch` consumindo 3 unidades onde `get`+`update` consumiria menos
(<https://developers.google.com/workspace/calendar/api/v3/reference/events/patch>). Um
free/busy único cobrindo todas as consultoras (50 calendários por chamada, seção 2) torna o
custo por conversa essencialmente **uma requisição**.

Recomendação prática: cachear a resposta de free/busy por poucos minutos e revalidar antes
de confirmar qualquer agendamento. O free/busy é para *mostrar opções*; a confirmação
sempre relê.

---

## 6. Alternativas, se as consultoras não usarem Google

### 6.1. Calendly

- Tem API pública, com **Scheduling API** para "construir agendamento dentro do seu app,
  sem redirect, iframe ou UI hospedada pelo Calendly".
  Fonte: <https://developer.calendly.com/api-docs>
- Autenticação por **personal access token** (recomendado para "aplicação interna que só
  seu time usa") ou **OAuth**.
  Fonte: <https://developer.calendly.com/how-to-authenticate-with-personal-access-tokens>
- **Exige plano pago:** webhooks e os endpoints da Scheduling API requerem assinatura paga
  em **Professional, Standard, Teams ou Enterprise**.
  Fonte: <https://calendly.com/help/calendly-api-overview>
- Webhooks disponíveis: `invitee.created` (novo agendamento), `invitee.canceled`
  (cancelamento), submissão de routing form.
  Fonte: <https://help.calendly.com/hc/en-us/articles/223195488-Webhooks-overview>
- Endpoints cobrem availability schedules, event types, scheduled events e **single-use
  scheduling links**.
  Fonte: <https://developer.calendly.com/api-docs>

**Custo real:** licença paga **por consultora**, mensal, para sempre. E — o ponto que
importa mais que o preço — **introduz um quarto sistema** na loja. O mapa diz que o
processo da loja não se dobra ao agente; obrigar cada consultora a manter uma agenda no
Calendly, que ela não usa hoje, é exatamente dobrar o processo.

O `single-use scheduling link`, porém, é interessante: o agente qualificaria e mandaria um
link no WhatsApp, e o **cliente** escolheria o horário. Isso troca "o agente agenda" por "o
agente entrega um link" — menos poder, muito menos risco, e resolve reserva temporária de
graça (o Calendly cuida da concorrência). **Vale considerar como fase intermediária**, se
as consultoras aceitarem o Calendly.

### 6.2. Cal.com / cal.diy (open source)

- API v2 expõe **bookings, event types, schedules, availability, slots, webhooks, OAuth,
  teams, organizations**, com fluxos recurring, seated e round-robin.
  Fonte: <https://cal.com/docs/self-hosting/installation>
- O código livre foi relançado como **cal.diy sob licença MIT**, sem "Enterprise Edition"
  proprietária. Fonte: <https://cal.com/blog/cal-diy-open-source-to-closed-source>
- **Atenção:** o próprio projeto diz que o cal.diy é "estritamente recomendado para uso
  pessoal, não de produção"; para self-host comercial do Cal.com é preciso **comprar uma
  license key**. Fonte: <https://cal.com/docs/self-hosting/license-key>

**Custo real:** zero de licença no papel, mas o custo migra para **operação** — subir e
manter uma instância, banco, atualizações. Para uma loja de decoração com um agente em
fase 1, é infraestrutura desproporcional.

### 6.3. Agenda própria em Postgres/Supabase com painel

O projeto **já tem Supabase provisionado** (o mapa registra o projeto
`ewxmjbvaolfiafhghxbn`), e já vai precisar de tabela de holds de qualquer forma (seção 4).

O que seria preciso construir:

- Tabela de janelas de atendimento por consultora (regra semanal + exceções).
- Tabela de agendamentos, com constraint de exclusão para impedir overbooking.
- Painel onde a consultora marca folga, bloqueia horário e vê os agendamentos.
- Notificação para a consultora quando um agendamento cai — provavelmente no próprio
  WhatsApp, que é onde ela já está.

**Custo real:** nenhum custo recorrente novo, controle total, nenhum sistema a mais para a
consultora aprender **se a notificação chegar pelo WhatsApp**. Em troca: é **a opção que
mais exige de nós construir**, e o painel é software de verdade — não um endpoint.

E há um risco que nenhuma tabela resolve: **a agenda só é confiável se alguém a mantiver
atualizada.** Se a consultora combina uma visita por WhatsApp e não registra em lugar
nenhum, um sistema próprio erra tanto quanto um Google Calendar vazio. Esse risco é o mesmo
em todas as alternativas e é **de processo, não de tecnologia**.

### Comparação

| | Esforço nosso | Custo recorrente | Pede o quê da consultora | Overbooking resolvido? |
|---|---|---|---|---|
| **Google Calendar** (se já usam) | Médio (holds são nossos) | Zero | Compartilhar calendário, uma vez | Não — nosso |
| **Google Calendar** (se não usam) | Médio + adoção | Zero | **Adotar uma agenda nova** | Não — nosso |
| **Calendly** | Baixo | Assinatura por consultora | Adotar e manter agenda nova | Sim, nativo |
| **Cal.com self-host** | Alto (infra) | Licença comercial | Adotar e manter agenda nova | Sim, nativo |
| **Supabase próprio** | Alto (painel) | Zero | Manter disponibilidade no painel | Sim, nosso |

---

## 7. O que muda se as consultoras NÃO usarem Google Calendar hoje

Esta é a bifurcação do ticket, e ela **não é um detalhe de implementação — muda a natureza
da decisão**.

**Se usarem** (cada consultora com agenda ativa no Google, seja Workspace ou Gmail):
"verificar disponibilidade" é **integração**. O trabalho é o descrito nas seções 1–5:
escolher o modelo de autenticação (Workspace → conta de serviço com delegação; Gmail →
compartilhamento com `freeBusyReader` para uma conta única do projeto), chamar free/busy,
criar evento, e construir só a camada de holds. Semanas, não meses. Nenhum sistema novo
entra na vida da consultora.

**Se não usarem**, três coisas mudam de uma vez:

1. **Deixa de ser integração e vira sistema a construir.** Não há fonte de verdade sobre
   disponibilidade para ler. Free/busy num calendário vazio responde "livre" sempre — o que
   é pior que não responder, porque o agente marcaria em cima de compromisso real. Este é
   o mesmo tipo de falha que a restrição de estoque do mapa proíbe: **afirmar com confiança
   algo que não se sabe.**
2. **O custo se desloca para adoção, não para código.** Qualquer alternativa — Google,
   Calendly, Cal.com ou painel próprio — exige que a consultora passe a registrar
   disponibilidade em algum lugar. Isso colide com "o processo da loja não se dobra ao
   agente". A pergunta deixa de ser "qual API?" e passa a ser **"a loja aceita adotar uma
   agenda?"** — que é decisão do dono do projeto, não do research.
3. **Abre-se uma saída que não precisa de agenda nenhuma:** o agente qualifica, propõe
   horários de uma **grade fixa da loja** (ex.: horário comercial em blocos de 1h) e
   **escala para a consultora confirmar**. A confirmação humana absorve o que o sistema não
   sabe. É perfeitamente coerente com "Fase 1 é só qualificação" — o agente coleta e
   escala, não decide. E não exige integração de calendário alguma.

---

## 8. Recomendação

**Primeiro, e antes de qualquer código: perguntar ao dono do projeto duas coisas.**

1. As consultoras mantêm agenda no Google Calendar hoje — de verdade, atualizada?
2. A loja tem **Google Workspace** (e-mail em domínio próprio) ou contas **Gmail** comuns?

Essas duas respostas decidem tudo o que segue. O research não pode e não deve chutá-las.

**Se usam Google + Workspace:** conta de serviço com delegação em todo o domínio. Zero
atrito para a consultora, sem tela de consentimento, sem verificação de escopo sensível, sem
refresh token para gerir.
(<https://developers.google.com/workspace/guides/create-credentials>)

**Se usam Google + Gmail comum:** **compartilhamento de calendário com uma conta única do
projeto** — `freeBusyReader` de cada consultora para ler disponibilidade, e um calendário
da loja onde o agente cria os eventos. Só essa conta faz OAuth, então a verificação de
escopo sensível some do caminho crítico e a armadilha do refresh token de 7 dias não
atinge as consultoras.
(<https://developers.google.com/workspace/calendar/api/concepts/sharing>)

Evitar OAuth individual por consultora: os 7 dias de validade em Testing e os até 10 dias
de verificação transformam um detalhe de auth num bloqueio de projeto.
(<https://support.google.com/cloud/answer/15549945>,
<https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification>)

**Se não usam Google:** **não construir integração de calendário agora.** Recomendação:
fase 1 do agente propõe horários de uma grade fixa e escala para a consultora confirmar.
Registrar em `Not yet specified` que a agenda real é decisão posterior, dependente de a loja
querer adotar um sistema de agenda. Se e quando quiser, o comparativo da seção 6 é o insumo
— e Calendly com single-use link é o caminho de menor construção, agenda própria no Supabase
o de menor custo recorrente.

**Em qualquer cenário, três coisas são nossas e não vêm de graça de API nenhuma:**

- a tabela de **holds** com constraint de exclusão, porque nenhuma API do Google impede
  overbooking (seção 4);
- a revalidação de disponibilidade **imediatamente antes de confirmar**, porque free/busy
  cacheado envelhece;
- o registro do resultado do agendamento **no nosso banco**, porque é ele que alimenta o
  laço de aprendizado do mapa — o Calendar é fonte de ocupação, não de aprendizado.

---

## Fontes

- Free/busy: <https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query>
- Escopos de Calendar: <https://developers.google.com/workspace/calendar/api/auth>
- Escopos OAuth do Google: <https://developers.google.com/identity/protocols/oauth2/scopes>
- Criar evento (referência): <https://developers.google.com/workspace/calendar/api/v3/reference/events/insert>
- Criar evento (guia): <https://developers.google.com/workspace/calendar/api/guides/create-events>
- Alterar evento: <https://developers.google.com/workspace/calendar/api/v3/reference/events/patch>
- Tipos de evento: <https://developers.google.com/workspace/calendar/api/guides/event-types>
- Cotas: <https://developers.google.com/workspace/calendar/api/guides/quota>
- Compartilhamento e ACL: <https://developers.google.com/workspace/calendar/api/concepts/sharing>
- Credenciais e delegação de domínio: <https://developers.google.com/workspace/guides/create-credentials>
- Tela de consentimento OAuth: <https://developers.google.com/workspace/guides/configure-oauth-consent>
- OAuth 2.0 e refresh tokens: <https://developers.google.com/identity/protocols/oauth2>
- Verificação de escopo sensível: <https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification>
- Requisitos de verificação: <https://support.google.com/cloud/answer/13464321>
- Status de publicação e test users: <https://support.google.com/cloud/answer/15549945>
- Verificação de app OAuth (visão geral): <https://support.google.com/cloud/answer/13463073>
- Calendly API: <https://developer.calendly.com/api-docs>
- Calendly — autenticação por PAT: <https://developer.calendly.com/how-to-authenticate-with-personal-access-tokens>
- Calendly — planos e API: <https://calendly.com/help/calendly-api-overview>
- Calendly — webhooks: <https://help.calendly.com/hc/en-us/articles/223195488-Webhooks-overview>
- Cal.com — instalação e API v2: <https://cal.com/docs/self-hosting/installation>
- Cal.com — license key: <https://cal.com/docs/self-hosting/license-key>
- Cal.com — cal.diy e licença MIT: <https://cal.com/blog/cal-diy-open-source-to-closed-source>
