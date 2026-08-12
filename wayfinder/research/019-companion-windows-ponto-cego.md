# Research — O ponto cego do WhatsApp para Windows em Coexistence

Ticket: [019](../tickets/019-companion-windows-ponto-cego.md) · Investigado em 2026-08-10

---

## O que se queria saber

Se uma consultora responder ao cliente pelo **aplicativo do WhatsApp para Windows**, o agente
recebe algum sinal disso? Se não receber, ele pode responder por cima da consultora — que é o
pior defeito possível num atendimento de ticket alto.

Resposta curta: **não recebe. Não existe via de captura.** O detalhamento abaixo.

---

## 1. A restrição é real e continua valendo

A frase que interessa está na documentação de onboarding da Meta, na seção sobre dispositivos
acompanhantes:

> "Businesses can link up to four WhatsApp 'companion' clients to their WhatsApp Business app
> account on other devices (described as 'linked devices' in our Help Center). **All companion
> clients are supported, except for WhatsApp for Windows and WhatsApp for WearOS.** Once a
> business customer onboards to Cloud API with an existing WhatsApp Business app account and
> number, all companion apps will be unlinked from the account, and the business can then
> re-link any supported companion apps. WhatsApp users who use an unsupported companion client
> to message an onboarded business can do so, but the message will not trigger messages
> webhooks, so the business won't be able to mirror the message in their own app. Messages
> sent from an onboarded business (by any means) that are viewed in an unsupported companion
> device will appear with placeholder text, instructing the WhatsApp user to view the message
> in their primary device."
>
> — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)

**Sobre "isso ainda é verdade em 2026":** a página não exibe data de última atualização, e o
changelog da Cloud API
([developers.facebook.com/documentation/business-messaging/whatsapp/changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog))
**retornou erro 500 em todas as tentativas de leitura desta sessão — não consegui verificar o
changelog em fonte primária.** O que consegui confirmar indiretamente:

- A Meta publicou em 2026 uma página nova de Coexistence
  ([Reconnect offboarded coexistence clients](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/reconnect-offboarded-coexistence-clients/)),
  o que mostra que a feature segue em desenvolvimento ativo — e a restrição de Windows
  continua escrita na página de onboarding **hoje**, com o texto acima lido direto da fonte.
- A documentação do 360dialog (BSP oficial) repete a mesma restrição, palavra por palavra:
  > "Messages from unsupported companion devices will not trigger webhook events, so the
  > business won't be able to mirror the message through the API."
  >
  > — [Coexistence — 360dialog](https://docs.360dialog.com/docs/resources/phone-numbers/coexistence)

**Nenhum BSP contradiz a Meta neste ponto.** Todos que consultei repetem a restrição.

---

## 2. `smb_message_echoes` não cobre o caso — por definição

Este era o webhook que, se cobrisse, resolveria tudo. Não cobre. A referência oficial define o
gatilho pelo dispositivo:

> "Notifies you of messages sent via the WhatsApp Business app **or a companion ('linked')
> device** by a business customer who has been onboarded to Cloud API via a solution provider."
>
> Trigger event: "A business customer with a WhatsApp Business app phone number, who has been
> onboarded by a partner, sends a message using the WhatsApp Business app **or a companion
> device** to a WhatsApp user or another business."
>
> — [smb_message_echoes webhook reference](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/smb_message_echoes)

E na página de onboarding a mesma descrição aparece com o qualificador explícito:

> "Describes a message sent by a business customer to a WhatsApp user with the WhatsApp
> Business app or **supported** companion device."

Ou seja: o echo depende de o companion ser suportado. Windows não é. O respond.io (BSP oficial,
que implementa Coexistence em produção) diz o mesmo, e desta vez falando da **direção que nos
interessa** — mensagem que o *negócio* envia:

> "messages sent from unsupported companion devices, such as WhatsApp for Windows or WhatsApp
> for WearOS, do not trigger WhatsApp webhooks" — e por isso não aparecem no respond.io.
>
> — [WhatsApp Business App Quick Start (WhatsApp Coexistence) — respond.io](https://respond.io/help/whatsapp/whatsapp-coexistence)

> **Nota sobre a leitura da fonte:** a frase da Meta que fala em webhooks (§1) está redigida do
> ponto de vista do *usuário* que manda mensagem de um companion não suportado, não da
> consultora. Quem fecha a direção "negócio envia pelo Windows → sem echo" é (a) a definição do
> gatilho do `smb_message_echoes`, que é normativa e restringe a "supported companion device",
> e (b) o respond.io, que é secundário mas explícito. **Isso é inferência a partir de fonte
> primária, não uma frase literal da Meta.** É uma inferência forte, mas registro como tal.

---

## 3. Não existe outra via de captura

Verifiquei os quatro caminhos plausíveis. Nenhum funciona.

**Webhook `history`** — só serve ao onboarding, e **é de uso único**:

> "You can only perform this step once. If you need to perform it again, the customer must
> first offboard, then complete the Embedded Signup flow again."
>
> E: "you have 24 hours to synchronize their messaging history, otherwise they must be
> offboarded and they must complete the flow again."
>
> — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)

O endpoint é `POST /<BUSINESS_PHONE_NUMBER_ID>/smb_app_data` com `{"messaging_product":
"whatsapp", "sync_type": "history"}`. **Não dá para chamar periodicamente para reconciliar** —
uma chamada por onboarding, e refazer o onboarding desliga e religa o número inteiro.

**Webhook `smb_app_state_sync`** — é sobre **contatos**, não mensagens:

> "Describes the business customer's current and new contacts."
>
> — [Coexistence Webhooks — 360dialog](https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence/coexistence-webhooks)

**Polling / API de leitura de mensagens** — não existe. A Cloud API é de envio + webhooks; não
há endpoint para listar ou reler conversas. Isso é conhecimento estabelecido entre
desenvolvedores da plataforma (a recomendação padrão é persistir tudo que chega por webhook num
banco próprio), mas **não encontrei uma frase da Meta declarando explicitamente a ausência** —
a ausência é o próprio fato: não há endpoint documentado de leitura de histórico na referência
de mensagens.

**Conclusão:** se o webhook não disparou no momento do envio, **a informação não é recuperável
depois por nenhum caminho oficial**. Não é atraso, é perda.

---

## 4. O que exatamente é "WhatsApp for Windows" — aqui fica névoa

Esta é a pergunta que **não tem resposta em fonte primária**, e é importante dizer isso com
todas as letras.

**O que a Meta escreve:** "All companion clients are supported, except for WhatsApp for Windows
and WhatsApp for WearOS." Lendo ao pé da letra, a lista de **não suportados** é fechada e tem
exatamente dois itens:

| Companion | Status pela leitura literal da Meta |
|---|---|
| App nativo Windows (Microsoft Store) | **NÃO suportado** — nomeado |
| WearOS | **NÃO suportado** — nomeado |
| WhatsApp Web no navegador (Chrome/Edge) | Suportado *por exclusão* — **não confirmado** |
| App de Mac | Suportado *por exclusão* — **não confirmado** |
| Celular Android/iOS como secundário | Suportado *por exclusão* — **não confirmado** |

**Por que não trato isso como resolvido:**

1. A Meta nunca publica uma lista positiva dos companions suportados. Tudo que existe é a
   exceção. Não achei página da Meta enumerando os tipos de linked device no contexto de
   Coexistence. As páginas da Central de Ajuda do WhatsApp sobre dispositivos conectados
   ([faq.whatsapp.com/647349420360876](https://faq.whatsapp.com/647349420360876),
   [faq.whatsapp.com/378279804439436](https://faq.whatsapp.com/378279804439436)) **vieram
   truncadas em todas as tentativas de leitura** — não consegui extrair a lista de lá.
2. O app de Windows moderno é, tecnicamente, um wrapper do WhatsApp Web. Se a incompatibilidade
   for do runtime web e não do executável, o navegador cairia junto. **Não tenho fonte que
   confirme nem desminta isso.**
3. Encontrei ao menos um artigo de fornecedor afirmando que respostas via **Web** também
   escapam dos webhooks. É blog de vendor, sem citação de fonte, e **contradiz a leitura
   literal da Meta**. Não dá peso de fato — mas dá peso de risco.

> **Recomendação de método:** não tratar "WhatsApp Web é seguro" como decidido. Isso é um
> **teste a fazer em ambiente real**, depois do onboarding: mandar uma mensagem de cada
> companion (Web no Chrome, app de Windows, celular secundário) e ver qual delas gera
> `smb_message_echoes`. É meia hora de teste e substitui toda a especulação acima por fato.

---

## 5. Mitigadores, já que captura não existe

Nenhum destes vem de documentação da Meta — ela não trata do problema. São padrões de
arquitetura de handoff, e o que descrevo abaixo é **desenho meu para o caso da Lais Casa**,
apoiado no padrão geral de *handoff flag* que a literatura de agentes de atendimento descreve
(o bot para de enviar assim que um humano assume, controlado por estado explícito, não por
heurística).

Em ordem de atrito, do menor para o maior:

**a) Desvincular o app de Windows e usar Web no lugar** — atrito quase zero *se* o teste do §4
confirmar que Web gera echo. A consultora continua atendendo do computador, com o mesmo teclado
e a mesma tela grande, só que pela aba do navegador. É o mitigador mais barato que existe e por
isso o teste do §4 é a primeira coisa a fazer.

**b) Inbox do BSP no lugar do app** — a consultora atende pela interface web do parceiro
(360dialog, respond.io, etc.), que passa pela Cloud API e portanto é 100% visível ao agente.
Resolve o problema por inteiro e ainda dá controle de "assumir conversa" nativo. Atrito: é
ferramenta nova, e o mapa fixou que o processo da loja não se dobra ao agente. Vale como opção,
não como imposição.

**c) Timeout de silêncio + pausa por sinal indireto** — o agente pausa a conversa quando detecta
qualquer indício de humano ativo. Sinais que **funcionam mesmo com o ponto cego**:
  - o cliente responder algo que não é resposta à última mensagem do agente (sinal de que houve
    mensagem que o agente não viu);
  - webhook de *status* (`read`) das mensagens do cliente sem que o agente as tenha marcado —
    indica que alguém abriu a conversa em algum lugar. **Não verifiquei se Coexistence entrega
    status de leitura originado do app; fica em aberto.**
  - qualquer `smb_message_echoes` de outra consultora na mesma conversa.

**d) Marcação manual pela consultora** — uma palavra-chave na própria conversa ("/eu assumo")
que o agente reconhece e pausa. Só funciona se a consultora mandar do celular ou de um companion
suportado — do Windows, a mensagem não chega. Portanto **este mitigador não cobre exatamente o
caso que estamos tentando cobrir.** Serve como reforço, não como solução.

**e) Fase 1 é qualificação e escala** — vale lembrar que o desenho atual do agente já reduz a
janela de dano: ele qualifica e passa. A colisão só acontece se ele continuar falando depois do
handoff. Uma regra dura — **agente escalou, agente cala até o cliente voltar a chamá-lo
explicitamente** — elimina a maior parte do risco sem depender de detecção nenhuma.

---

## Recomendação

**Não dá para manter o app do WhatsApp para Windows em uso.** Não é preferência de arquitetura:
a Meta desliga o webhook para esse cliente, o `smb_message_echoes` é definido em termos de
"supported companion device", e não existe nenhum caminho de recuperação posterior — nem
history (uso único), nem polling (não há endpoint), nem app state sync (só contatos). Uma
consultora respondendo pelo Windows é invisível ao agente, para sempre.

**O mitigador de menor atrito, na ordem em que devem ser tentados:**

1. **Testar WhatsApp Web como substituto** (§4). Se Web gerar echo, a consultora troca um ícone
   por outro, continua no computador, e o problema acaba. Esse teste é a próxima ação concreta
   deste ticket — é a diferença entre "as consultoras perdem o computador" e "as consultoras
   trocam de atalho".
2. **Se Web também for cego:** o computador sai do fluxo de resposta ou entra pelo inbox do BSP.
   Entre as duas, o inbox é melhor — mantém a tela grande e ainda dá handoff explícito.
3. **Independente do resultado**, implementar a regra dura do item (e): agente que escalou não
   volta a falar sozinho. É a única defesa que não depende de detectar nada.

**O que fica aberto e precisa de resposta antes do onboarding:**
- Quantas consultoras usam efetivamente o app de Windows hoje, e se o computador é ferramenta
  principal ou eventual. Se for eventual, o custo da restrição é baixo e nem precisa de plano B.
- Se Coexistence entrega webhook de status `read` originado do app (§5c). Não achei fonte.
- O changelog da Cloud API, que não consegui abrir nesta sessão (erro 500 persistente), deve
  ser relido antes do onboarding para confirmar que a restrição não mudou.
