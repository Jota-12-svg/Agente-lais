# Research — Como notificar a consultora certa de uma escalada, em Coexistence

Ticket: [012](../tickets/012-quando-e-como-o-agente-escala.md) · Investigado em 2026-08-11

---

## Resposta curta

**Não existe, hoje, um jeito nativo de o agente dizer "esta conversa é sua" dentro do próprio
WhatsApp Business App.** Etiquetas (labels) — a única ferramenta nativa de sinalização visual
do app — **são explicitamente não suportadas via Cloud API em modo Coexistence**, confirmado
em duas fontes independentes (Meta e Infobip). O app não tem, e nunca teve, conceito de "chat
atribuído a um agente": todo dispositivo acompanhante vê a mesma caixa de entrada única, sem
distinção de quem deve responder.

O mecanismo mais simples, mais barato e que **preserva o app nativo como interface** é:
**o agente manda, pela mesma Cloud API já em uso, uma mensagem de template para o número de
WhatsApp pessoal da consultora responsável**, dizendo que uma conversa específica precisa
dela — com nome do cliente e um resumo curto. Ela recebe isso como uma mensagem de WhatsApp
comum, no aparelho que já usa, e vai até a conversa certa no app compartilhado para responder.
Nenhuma ferramenta nova, custo de poucos centavos por notificação, aprovação de template é
única e não recorrente. Isso é detalhado e recomendado na seção final.

**Existe uma via 100% gratuita com a mesma qualidade — mas ela depende de um hábito
operacional que hoje não existe** (a consultora mandar uma mensagem para o número da loja a
partir do número pessoal dela, para manter uma janela de atendimento aberta). Não é uma
substituição limpa do template pago; é um complemento condicional. Detalhado na seção 6.

---

## 1. Etiquetas (labels) nativas — confirmado: não dá via API

Duas fontes, lidas de forma independente, concordam:

- **Documentação da Meta sobre Coexistence** (Onboarding Business App Users) lista, na tabela
  de comparação de recursos:
  > "Messaging tools (for example, marketing messages, greeting message, away message, quick
  > replies, **labels**) | No change [no app] | **Not supported** [via API]."
  — https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/

- **Infobip**, parceiro oficial (BSP), documenta o mesmo ponto para o cliente final:
  > Labels e demais "messaging tools" — mensagem de saudação, mensagem de ausência, respostas
  > rápidas — **"remain available in the app, but are not supported through the WhatsApp
  > API."**
  — https://www.infobip.com/docs/whatsapp/manage-integration/coexistence

Ou seja: as consultoras continuam podendo **aplicar** uma etiqueta manualmente, tocando na
tela, como sempre fizeram. Mas o **agente não tem como aplicar uma etiqueta programaticamente**
para marcar "esta conversa foi escalada" ou "esta conversa é da Fulana". A etiqueta nativa está
fora de alcance do lado do bot — o que já elimina de saída a opção mais óbvia de sinalização
visual dentro do app.

Isso não é surpresa: já era esperado a partir do que o research 005 estabeleceu sobre
Coexistence (grupos não suportados, mensagens temporárias desligadas). Esta é só a confirmação
específica para labels.

---

## 2. Mensagem de template para o número pessoal da consultora

### O que é e por que funciona tecnicamente

O agente já fala com a Cloud API para atender clientes. A mesma API pode enviar uma mensagem
de **template pré-aprovado** para **qualquer número de WhatsApp válido** — inclusive o número
pessoal da consultora, que é distinto do número compartilhado da loja. Tecnicamente é a mesma
chamada `POST /messages` que qualquer outra mensagem de negócio-para-cliente usa, só que o
destinatário é a consultora, não o cliente.

- Mensagens de negócio fora da janela de atendimento de 24h **exigem template aprovado** —
  confirmado no research 005 e reforçado aqui:
  https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization
- Categoria mais adequada: **utility**. É gratuita **dentro** de uma janela de 24h aberta, e
  paga (poucos centavos) **fora** dela — o que normalmente é o caso, já que a consultora não
  "abriu conversa" recentemente com o número do agente.
  https://developers.facebook.com/docs/whatsapp/pricing

### O ponto cinzento a registrar com honestidade

A política de template da Meta define utility como conteúdo que precisa ser
**"specific to or requested by the user (clearly related to their order, account, services,
or transactions)"** —
https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization.
Essa linguagem foi escrita pensando em **negócio → cliente**, não em **negócio → funcionário**.
A documentação da Meta **não proíbe explicitamente** notificação interna por template, mas
também **não a contempla**. Em outras palavras: não há regra escrita contra, mas também não há
endosso — é uso não previsto pela política, dentro do razoável (baixíssimo volume, conteúdo
puramente informativo, sem intenção promocional), mas não é 100% coberto por precedente
documentado. Vale registrar isso como risco pequeno, não como bloqueio.

**Opt-in**: fora da janela de 24h, mensagens de template exigem consentimento do destinatário
para receber mensagens daquele número de negócio
(https://www.infobip.com/blog/how-to-collect-whatsapp-business-opt-ins). Para a consultora,
isso é resolvido de forma trivial — ela é funcionária da loja, o consentimento é dado uma vez,
por fora do fluxo (ex.: ao ser cadastrada no sistema do agente).

### Custo

Poucos centavos por mensagem enviada fora da janela de 24h (a mesma lógica de tarifação de
julho de 2025 documentada no research 005). Para uma loja com volume baixo de escaladas por
dia, isso é irrelevante frente ao ticket médio de R$ 2 mil a R$ 50 mil.

### Processo de aprovação

Um template **utility** simples ("Olá {{1}}, o cliente {{2}} precisa de atendimento agora:
{{3}}. Responda pelo WhatsApp da loja.") passa pela aprovação padrão da Meta — tipicamente
minutos a 24 horas, conforme o conteúdo seja claramente informativo e não promocional
(https://gurusup.com/blog/whatsapp-api-message-templates). É uma aprovação **única**: feita
uma vez, o template fica disponível para sempre, disparado por variável a cada escalada.

---

## 3. Ferramentas leves de terceiros — o que existe, sem ser um helpdesk completo

Não achei estatística de adoção específica para pequenos negócios brasileiros (não existe
levantamento setorial publicado sobre isso), mas o padrão técnico é bem documentado em
plataformas de automação usadas nesse porte:

- **n8n** tem templates prontos exatamente para esse padrão — "Intent detection & escalation
  can flag orders... and trigger Slack notifications for human handoff" e bots com "push
  notification when a human should take over"
  (https://community.n8n.io/t/show-and-tell-zappro-whatsapp-ai-agent-template-for-n8n-triage-handoff-follow-up/287523,
  https://n8n.io/workflows/5311-ai-powered-telegram-and-whatsapp-business-agent-workflow/).
- **Landbot** documenta o mesmo padrão como feature de produto: ação "Notify Assignee" que
  dispara notificação (inclusive Slack) quando o cliente pede atendimento humano
  (https://landbot.io/blog/create-whatsapp-bot).
- Webhook simples → Telegram Bot API, ou → SMS (Twilio/Zenvia), ou → e-mail, são os três
  canais mais citados nesse tipo de arquitetura leve, todos com custo desprezível em baixo
  volume.

**Leitura para este projeto:** tecnicamente funciona, e é barato. Mas introduz um **segundo
aplicativo** que a consultora precisa monitorar (Telegram, Slack, ou caixa de e-mail) — o que
esbarra direto na restrição do `CLAUDE.md`: "o processo da loja não se dobra ao agente".
Pedir que quatro pessoas (três consultoras + a dona) instalem e checkem regularmente um app
adicional é fricção que a opção da seção 2 não tem, porque a notificação chega **dentro do
mesmo WhatsApp que elas já usam o dia inteiro**. Fica registrado como alternativa válida se a
opção de template esbarrar em algum obstáculo prático (ex.: a Meta rejeitar o template, ou a
loja preferir um canal separado de "só urgência").

---

## 4. Badge de não lida — por que não basta

O WhatsApp Business App **não tem conceito de atribuição de conversa a um agente específico**.
Isso é estrutural, não uma limitação de configuração — é assim desde antes de existir
Coexistence:

- Até 4 dispositivos acompanhantes podem estar logados na mesma conta/número ao mesmo tempo,
  e **todos veem a mesma caixa de entrada única**
  (https://learn.rasayel.io/en/blog/whatsapp-multiple-devices/).
- Não há "quem está respondendo agora", não há como marcar "esta conversa é minha", e não há
  registro de qual dispositivo respondeu o quê. O relato recorrente em conteúdo técnico sobre
  esse cenário é o mesmo, em fontes distintas: duas pessoas respondem o mesmo cliente sem saber
  uma da outra, ou ninguém responde porque cada uma achou que a outra ia
  (https://arkesel.com/shared-whatsapp-inbox-team-multiple-agents/,
  https://www.aurorainbox.com/en/2026/02/23/whatsapp-multiple-agents-same-number/).

> **Ressalva de honestidade sobre essas fontes:** são conteúdo de marketing de plataformas que
> vendem inbox compartilhado como alternativa ao app nativo, então têm interesse comercial em
> pintar o cenário atual como caótico. Os relatos específicos ("cliente esperou dias",
> "duas respostas contraditórias") não são verificáveis. O que **é** verificável e independe
> delas é o fato estrutural: o WhatsApp Business App não tem primitiva de atribuição de
> conversa a um usuário entre os dispositivos acompanhantes. Isso é mecânica do produto, não
> opinião de vendedor.

Para a Lais Casa isso importa porque o objetivo do ticket é justamente **apontar uma pessoa
específica**, não só "alguém, eventualmente". O badge de não lida (contador de mensagens não
lidas por conversa) sinaliza "tem mensagem nova" para **qualquer um** dos quatro dispositivos —
não distingue "isto é seu, Fulana" de "isto é da Beltrana". Numa loja pequena com clientes já
divididos por consultora (cada uma com sua aba na planilha), depender do badge exige que cada
consultora abra o app e verifique manualmente a que cliente aquela conversa pertence antes de
saber se é dela — o mesmo trabalho que a notificação direcionada elimina.

---

## 5. O que preserva o app nativo como interface principal

Resumo comparativo das opções à luz da restrição real do projeto — consultoras não trocam de
ferramenta:

| Opção | Preserva o app nativo? | Aponta a pessoa certa? | Ferramenta nova? | Custo |
|---|---|---|---|---|
| Etiqueta aplicada pelo agente via API | N/A — **não existe**, confirmado (seção 1) | — | — | — |
| Template para número pessoal da consultora | **Sim** — ela recebe e responde tudo dentro do WhatsApp que já usa | **Sim** — mensagem individual, nominal | Não — mesma Cloud API do agente | Poucos centavos por escalada |
| Bot de Telegram/Slack/SMS/e-mail | Não — precisa monitorar um segundo app | Sim, se roteado corretamente | Sim | Baixo, mas cerimônia de adoção |
| Badge de não lida | Sim | **Não** — sinaliza para todos igualmente | Não | Zero, mas insuficiente (seção 4) |

A opção de template é a única que marca as três colunas decisivas ao mesmo tempo: preserva o
app, aponta a pessoa certa, e não pede ferramenta nova.

---

## 6. Existe opção gratuita com a mesma qualidade?

Pergunta investigada à parte, em fonte primária da Meta (não blogs), antes de aceitar pagar
poucos centavos por escalada. Resposta curta: **existe um caminho tecnicamente gratuito, mas
ele não é uma alternativa limpa — depende de um hábito que a loja não tem hoje.** Abaixo, os
quatro pontos verificados.

### 6.1 "Service" é categoria de *conversa*, não de *template* — e não serve para notificar do zero

O research 005 registrou, de passagem: *"Templates de categoria service são gratuitos para
todos desde novembro de 2024."* Essa frase mistura dois conceitos que a documentação da Meta
mantém separados. Verificado direto na fonte:

- A página de categorização de templates lista **apenas três categorias válidas** para um
  template ser criado e aprovado: **marketing, utility e authentication**. "Service" **não
  existe** como opção de categoria de template.
  https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization
- "Service" era (no modelo antigo, por conversa) uma **categoria de conversa**, definida como
  *"Enables you to resolve customer inquiries"* — e essa conversa só existe **depois que o
  outro lado já mandou uma mensagem não-template dentro de uma janela de atendimento aberta**.
  Não é algo que a empresa dispara para começar um contato. A mesma página confirma a mudança
  de novembro de 2024: *"As of November 1, 2024, you can open an unlimited number of service
  conversations at no charge."* — mas isso descreve gratuidade de **resposta dentro da
  janela**, não um mecanismo de notificação a frio.
  https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/conversation-based-pricing
  (documento marcado como **Deprecated**, substituído pelo pricing por mensagem em
  1º de julho de 2025 — a própria Meta avisa: *"This document describes conversation-based
  pricing, which was replaced by per-message pricing on July 1, 2025."*)
- Na página de pricing vigente (por mensagem), a lógica equivalente aparece assim: *"All
  non-template messages are free... Non-template messages can only be sent within an open
  customer service window."* — mesma restrição, nome novo.
  https://developers.facebook.com/docs/whatsapp/pricing

**Conclusão do ponto 1:** a leitura que o usuário temia é a correta. "Service" é a
classificação de mensagens de resposta dentro de uma janela **já aberta pelo destinatário**,
não uma categoria de template que o agente pode disparar para notificar a consultora do zero.
Isso **não substitui** o template de utility fora da janela — para uma notificação "a frio"
(consultora não mandou nada recentemente para o número do agente), continua sendo obrigatório
um template aprovado, pago fora da janela. O texto do research 005 estava impreciso nesse
detalhe e fica corrigido aqui.

### 6.2 A janela de 24h aberta pela própria consultora — funciona, sem distinção técnica de quem manda

Verificado: a documentação de pricing não distingue "cliente" de qualquer outro remetente.
O texto usa **"user"** e **"WhatsApp user"**, nunca uma condição verificável de "ser cliente":
*"The user messages you about the product. This opens a 24 hour customer service window."*
https://developers.facebook.com/docs/whatsapp/pricing — não há, na API, nenhum sinalizador de
"tipo de remetente". Um número de telefone que manda mensagem para o número de negócio abre a
janela de 24h **para aquele par (número de negócio ↔ aquele número de telefone)**, seja esse
número de um cliente, de uma consultora, ou de qualquer pessoa.

Isso significa que **é tecnicamente viável**: se a consultora mandar, do **número pessoal**
dela (não pelo app companheiro do número compartilhado — isso não conta, porque ali ela *é*
o número de negócio, não está falando *com* ele), uma mensagem qualquer para o número do
agente (ex.: "bom dia" uma vez por turno), abre-se uma janela de 24h entre o agente e o número
pessoal dela. Dentro dessa janela, o agente pode mandar **mensagem de texto livre, não-template**,
com o resumo completo da escalada — **de graça**, sem limite de conteúdo pré-aprovado (ao
contrário do template, que trava em variáveis fixas).

**O porém, com honestidade:** isso não é um hábito que já existe. É uma ação nova que a
consultora precisaria adotar — mandar uma mensagem para um número que, na rotina normal dela,
não tem motivo para procurar (ela já atende os clientes pelo mesmo app que usa para o número
compartilhado; o número do agente não é algo que ela hoje mensageia por iniciativa própria).
Se o hábito falhar num dia — ela esquece, troca de aparelho, faz uma folga — a janela fecha e
a notificação daquela escalada específica **precisa cair no template pago** como rede de
segurança. Ou seja: na prática, um sistema que dependesse só disso teria confiabilidade
condicionada à disciplina humana, o que contraria o espírito do `CLAUDE.md` de não impor
processo novo à loja.

### 6.3 Cota gratuita mensal — não existe mais no modelo vigente

Antes de 1º de julho de 2025, o modelo por conversa incluía um **tier gratuito de 1.000
conversas por mês** (fato amplamente documentado por parceiros oficiais, ex. Gupshup, sobre a
transição). No modelo vigente — por mensagem, em vigor desde aquela data — **essa cota
desapareceu**. A página de pricing atual não menciona nenhuma franquia mensal gratuita; os
únicos cenários gratuitos que ela documenta são: mensagens não-template dentro da janela de
atendimento aberta, templates utility/authentication dentro dessa mesma janela, e qualquer
mensagem dentro da "free entry point window" de 72h (aberta por clique em anúncio
Click-to-WhatsApp ou botão de call-to-action do Facebook — irrelevante aqui, já que a
notificação não nasce de um anúncio).
https://developers.facebook.com/docs/whatsapp/pricing

**Conclusão do ponto 3:** não há cota gratuita mensal a explorar. O volume baixo de escaladas
da loja não muda essa conta — a cota simplesmente não existe mais, independente do volume.

### 6.4 Outra via inteiramente gratuita e sem ferramenta nova?

Combinando os pontos acima com o que a seção 3 e 4 já descartaram (grupos, etiquetas), **não
apareceu nenhuma via adicional**. As únicas portas gratuitas que a Meta documenta hoje são
sempre condicionadas a uma janela de atendimento já aberta pelo destinatário — não existe
mecanismo de disparo gratuito e incondicional para notificar alguém que não iniciou contato
recentemente. Isso é coerente com o modelo de negócio da Meta: mensagens não-template grátis
existem para permitir *conversar* dentro de um atendimento já em andamento, não para *começar*
um contato de graça — é exatamente esse "começar contato" que o template pago resolve.

### Veredito da seção 6

**Não é uma troca limpa.** A via gratuita (seção 6.2) funciona tecnicamente e tem a mesma
qualidade de apontamento (mensagem individual, nominal, dentro do WhatsApp que a consultora já
usa) — mas só quando a janela está aberta, e mantê-la aberta exige um hábito novo que hoje não
existe na rotina da loja. Um sistema que dependesse só dela teria uma falha silenciosa possível
(consultora não mandou mensagem recente → notificação não sai, ou precisa de fallback mesmo
assim). O template pago (seção 2), por comparação, funciona **sempre**, incondicionalmente, por
poucos centavos.

**O que vale a pena levar do achado:** um desenho **híbrido** — o agente tenta mandar
mensagem de texto livre (grátis) se souber que a janela com aquela consultora está aberta
(controlando localmente a data da última mensagem recebida do número pessoal dela); se não
houver janela aberta, cai no template pago. Isso reduz o custo real a quase zero **sem** exigir
que a confiabilidade dependa de hábito humano — o template continua como rede de segurança
garantida. Mas isso é uma otimização de custo a considerar depois que o mecanismo básico
(seção 2) estiver funcionando, não um motivo para adiar a decisão do ticket 012 à espera dela.

---

## Recomendação

**Notificar a consultora responsável por mensagem de template (categoria utility), enviada
pela mesma Cloud API do agente, para o número de WhatsApp pessoal dela — não para o número
compartilhado da loja.**

Por quê, em ordem de peso:

1. **É a única opção que aponta a pessoa certa E preserva o app nativo como interface**, ao
   mesmo tempo. Etiqueta via API está descartada por fato confirmado (Meta + Infobip). Badge
   de não lida não distingue destinatário. Ferramentas de terceiro (Telegram/Slack) resolvem o
   apontamento, mas custam um segundo app que o `CLAUDE.md` deste projeto proíbe em espírito.
2. **Zero ferramenta nova.** A infraestrutura já existe: é a mesma Cloud API que o agente usa
   para atender. Só se acrescenta um envio de template a mais número de destino.
3. **Custo irrelevante.** Poucos centavos por escalada, numa loja de ticket R$ 2 mil a
   R$ 50 mil — a mesma conclusão de custo desprezível que o research 005 chegou para a operação
   inteira.
4. **Aprovação é única, não recorrente.** Um template simples ("cliente X precisa de você:
   resumo Y") passa pela revisão da Meta uma vez e fica disponível para sempre.
5. **Não existe alternativa gratuita incondicional.** Investigado à parte na seção 6: a única
   via 100% gratuita depende de a consultora manter uma janela de atendimento aberta por
   hábito próprio — algo que não existe hoje na rotina da loja. Vale como otimização de custo
   futura (mandar texto livre grátis quando a janela já estiver aberta, com o template como
   fallback), não como substituto do mecanismo básico.

**O que fica para o próprio ticket 012 decidir** (fora do escopo deste research, que só resolve
o "como notificar"):
- O **conteúdo exato** do template — quanto de resumo cabe num template aprovado (Meta limita
  formatação e variáveis).
- **Confirmar que cada consultora tem número de WhatsApp pessoal distinto** do número
  compartilhado da loja — presumido aqui, mas não verificado com a loja. Se alguma consultora
  usa o mesmo número para o pessoal e o profissional, a notificação por template precisa de
  outro desenho para ela.
- O que fazer **quando a consultora notificada não responde em X tempo** — este research
  resolve "avisar", não "escalar o aviso".
