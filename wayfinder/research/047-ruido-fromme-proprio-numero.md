---
ticket: "047"
title: "Ruído fromMe/remoteJid=próprio número após reconexão (Baileys 6.7.24)"
tipo: research
data: 2026-09-14
---

# Ruído `fromMe` com `remoteJid` = próprio número — descobertas

> **Por que este documento existe.** Em teste de hoje (2026-09-14), múltiplos ciclos rápidos
> de logout completo + reescaneamento de QR no mesmo número **pessoal** produziram, em toda
> reconexão, uma rajada de `messages.upsert` com `fromMe: true`, `remoteJid` = o próprio
> número da conta, `pushName: null`, e erros de decriptação (`PreKeyError`, `SessionError`,
> `MessageCounterError`) na mesma janela. O mesmo padrão **não apareceu** no número de
> WhatsApp Business dedicado da loja, que ficou conectado de forma estável. Este research
> investiga a causa contra o código-fonte real instalado (`@whiskeysockets/baileys@6.7.24`,
> `libsignal@6.0.0`, ambos em `agente-runtime/node_modules/`) e a comunidade Baileys, e avalia
> se o runtime (`agente-runtime/index.js`) precisa de proteção explícita contra isso.

---

## 0. Resumo executivo

1. **O que é:** confirmado por comentário no próprio código-fonte do Baileys 6.7.24 — são
   estanças de protocolo roteadas como "chat" endereçado ao próprio jid (`category: "peer"`),
   usadas para **sincronização entre os dispositivos da mesma conta** (histórico, app-state
   sync). O Baileys 6.7.24 **não filtra** esse tráfego antes de emitir `messages.upsert`; ele
   só marca `category: "peer"` internamente para decidir o tipo de *read receipt* a mandar —
   o evento chega à aplicação como se fosse uma mensagem normal.
2. **Por que aparece mais em relogin repetido:** cada logout completo + novo QR gera um
   dispositivo/sessão Signal novo, com prekeys novas. Os erros observados
   (`PreKeyError: Invalid PreKey ID`, `SessionError: No session record`,
   `MessageCounterError: Key used already or never filled`) são exatamente os erros que o
   `libsignal` (dependência do Baileys) lança quando falta, no armazenamento local, a sessão
   ou a prekey referenciada pela mensagem recebida — coerente com re-pareamento apagando o
   estado local enquanto outra ponta (o próprio telefone, ou resquício da sessão anterior)
   ainda referencia material da sessão anterior. **Não achei fonte primária que meça
   isso especificamente contra "múltiplos relogins em menos de 1h"** — a ligação
   causal específica é inferência a partir do mecanismo, não um documento que testou isso.
3. **É conhecido na comunidade:** sim, amplamente — múltiplas issues no repositório oficial e
   em wrappers (Evolution API) relatam os mesmos três erros do libsignal após reconexão ou
   restart. **Não é documentado como resolvido** — as issues do Baileys foram fechadas sem
   correção ("not planned" / duplicada), e a discussão do Evolution API não tem resposta de
   mantenedor.
4. **Mitigação:** o Baileys 6.7.24 expõe `shouldIgnoreJid` (config do socket, default
   `() => false`) que, se retornar `true` para o próprio jid, faz o `handleMessage` nem tentar
   decriptar — eliminaria o ruído e os erros de log juntos. **Não achei essa recomendação
   documentada pela comunidade** especificamente para este cenário (self-jid); é leitura
   direta do código-fonte 6.7.24, não um padrão relatado em issue/wiki. O padrão que a
   comunidade de fato usa e documenta é mais bruto: `if (msg.key.fromMe) return` — ignorar
   toda mensagem própria, sem distinguir a causa.
5. **Para o projeto:** o runtime real conecta um número Business dedicado, historicamente
   estável — o cenário que gerou o ruído (vários logout+QR em menos de uma hora) é
   especificamente o de hoje, não o padrão de operação esperado. Ainda assim, o código atual
   trata **todo** `fromMe` como possível "consultora assumiu no aparelho" (ticket 047,
   `agente-runtime/index.js:511-527`) — se esse ruído ocorrer em produção (reconexão após
   queda do processo, por exemplo), ele cairia nesse caminho e criaria uma conversa fantasma
   com jid = próprio número. Ver §5 para avaliação de impacto e recomendação.

---

## 1. O que é essa mensagem "de mim para mim mesmo" com `pushName: null`?

### Achado no código-fonte real (6.7.24)

`decode-wa-message.js` decide o `remoteJid` (`chatId`) e o `fromMe` de toda mensagem
individual assim:

```
agente-runtime/node_modules/@whiskeysockets/baileys/lib/Utils/decode-wa-message.js:36-48
if (isJidUser(from) || isLidUser(from)) {
    if (recipient && !isJidMetaIa(recipient)) { ... chatId = recipient }
    else { chatId = from }
    msgType = 'chat'; author = from;
}
...
// linhas 79-84, comentário literal do código instalado:
// Check the sender against both our PN and LID identities — picking only
// one based on `from`'s format misses peer-routed self stanzas (history
// sync, app-state sync, etc.) when `from` and our stored identity are in
// different formats, leaving fromMe wrongly false.
const senderJid = (stanza.attrs.participant || stanza.attrs.from);
const fromMe = isMe(senderJid) || isMeLid(senderJid);
```

Ou seja: quando `from` (o `remoteJid` cru vindo da rede) é o **próprio número**, sem
`recipient` explícito, `chatId = from` = o próprio jid — dá exatamente o `remoteJid` "igual
à própria conta" observado. O comentário do próprio mantenedor do Baileys nomeia a causa:
**"peer-routed self stanzas (history sync, app-state sync, etc.)"** — tráfego de
sincronização entre os aparelhos da mesma conta, endereçado como se fosse uma conversa normal
com o próprio número.

`pushName` vem de `stanza?.attrs?.notify` (`decode-wa-message.js:85,100`) — um atributo que só
existe quando o remetente é um contato de verdade anunciando seu nome de perfil. Estanças de
sincronização entre dispositivos não carregam isso, daí `pushName: null` (`msg.pushName ||
null`, `agente-runtime/index.js:485,499`) em **todo** evento desse tipo.

O rótulo `category: "peer"` (visto no log bruto do Baileys) é lido direto do XML:
`decode-wa-message.js:116: category: stanza.attrs.category`. No handler que decide o que
fazer após decriptar, `category === 'peer'` só muda o **tipo de read receipt** enviado
(`type = 'peer_msg'`) — **não impede** a mensagem de seguir para `upsertMessage(msg, ...)`,
a mesma chamada que dispara `messages.upsert` para qualquer mensagem normal
(`agente-runtime/node_modules/@whiskeysockets/baileys/lib/Socket/messages-recv.js:674-699`).
Confirma a hipótese: **o Baileys expõe esse tráfego de protocolo como `messages.upsert`
normal, sem filtrar**, exatamente como suspeitado.

### Avaliação das três hipóteses

| Hipótese | Veredito | Fonte |
|---|---|---|
| É o chat nativo "Mensagens para você mesmo" sincronizando pro aparelho companion | **Sem evidência que sustente especificamente essa origem** — não achei nada (nem no código, nem na comunidade) ligando esse padrão à feature de UI "Message Yourself". É uma hipótese plausível de superfície (mesmo sintoma: remoteJid=próprio número) mas a fonte primária aponta para outra causa mais geral. | — |
| É tráfego de protocolo (retry/re-sync de sessão/app-state sync) exposto como `messages.upsert` sem filtro | **Confirmada** — comentário literal do código-fonte 6.7.24 nomeia "history sync, app-state sync, etc." como a origem desses "peer-routed self stanzas"; e o pipeline de decriptação não os filtra antes de `upsertMessage`. | `decode-wa-message.js:79-84`; `messages-recv.js:674-699` |
| Tem relação direta com `category: "peer"` no node cru — mensagens de sessão/controle entre os próprios aparelhos, não de usuário real | **Confirmada** — é a mesma coisa que a hipótese acima, vista pelo atributo XML: `category: stanza.attrs.category` é lido e só afeta o tipo de receipt, nunca bloqueia o upsert. | `decode-wa-message.js:116`; `messages-recv.js:675-679` |

Conclusão prática: as hipóteses 2 e 3 são, na prática, **a mesma coisa** — tráfego de
sincronização entre dispositivos da própria conta (histórico, estado do app), roteado no
protocolo do WhatsApp como uma mensagem endereçada ao próprio número com atributo
`category="peer"`, que o Baileys 6.7.24 decodifica e emite via `messages.upsert` sem
distinguir de uma mensagem de cliente de verdade. A hipótese 1 (feature de UI) não tem
sustentação nem a favor nem contra — é indistinguível por fora do jid, mas a fonte real do
código não a nomeia como causa.

---

## 2. Por que aparece mais depois de MÚLTIPLOS relogins rápidos no mesmo número?

### Mecanismo, a partir do código-fonte real (`libsignal@6.0.0`)

Os três erros citados no achado de produção vêm todos do mesmo pacote, instalado como
dependência do Baileys (`agente-runtime/node_modules/libsignal`, `package.json` →
`"version": "6.0.0"`):

- **`PreKeyError: Invalid PreKey ID`** — `session_builder.js:64-66`:
  ```
  const preKeyPair = await this.storage.loadPreKey(message.preKeyId);
  if (message.preKeyId && !preKeyPair) {
      throw new errors.PreKeyError('Invalid PreKey ID');
  }
  ```
  Disparado quando a mensagem recebida (`pkmsg`, PreKeyWhisperMessage) referencia um
  `preKeyId` que **não existe mais** no armazenamento local de prekeys.
- **`SessionError: No session record`** — `session_cipher.js:167-169`:
  ```
  const record = await this.getRecord();
  if (!record) { throw new errors.SessionError("No session record"); }
  ```
  Disparado quando chega uma mensagem Signal "normal" (não prekey-wrapped) para um endereço
  com o qual **não existe nenhuma sessão** salva localmente.
- **`MessageCounterError: Key used already or never filled`** — `session_cipher.js:232-236`:
  ```
  this.fillMessageKeys(chain, message.counter);
  if (!chain.messageKeys.hasOwnProperty(message.counter)) {
      throw new errors.MessageCounterError('Key used already or never filled');
  }
  ```
  Disparado quando o contador de mensagem da cadeia do Double Ratchet não bate com o que a
  sessão local tem — chave já consumida ou nunca preenchida (dessincronia de estado da
  cadeia, não corrupção de dado bruto).

**Leitura do mecanismo:** os três são sintomas da mesma classe de problema — a ponta que
manda (o outro dispositivo da mesma conta, ou o servidor agindo em nome dele) está usando
material de sessão/prekey que **não corresponde** ao que o armazenamento local do Baileys tem
agora. Um logout completo + novo pareamento por QR troca as chaves de identidade/dispositivo
e o conjunto de prekeys locais (`useMultiFileAuthState` grava um estado novo do zero). Se,
nesse intervalo, chegar tráfego de sincronização (§1) que referencia sessão/prekey da
vinculação **anterior** — ou que o servidor ainda estava processando/reencaminhando no
instante do re-pareamento — o resultado esperado, mecanicamente, é exatamente estes três
erros.

**O que não tenho fonte para afirmar:** que a **repetição rápida** (vários ciclos em menos de
uma hora) agrava especificamente isso, versus um único relogin normal já bastar. A
documentação oficial do Signal (X3DH — https://signal.org/docs/specifications/x3dh/, Sesame —
https://signal.org/docs/specifications/sesame/) descreve como prekeys são consumidas e
descartadas e como sessões antigas são gerenciadas por expiração de tempo, mas **não** cobre
o caso específico "mesmo número, WhatsApp, reautenticação completa repetida em minutos" — isso
é implementação do WhatsApp por cima do protocolo Signal, não parte pública da spec. A
correlação observada em produção (aparece em todo ciclo de teste de hoje, nunca no número
estável) é consistente com o mecanismo acima, mas **é evidência do próprio teste, não de uma
fonte externa que tenha estudado a frequência de re-pareamento como variável**.

### Avaliação da hipótese

| Hipótese | Veredito |
|---|---|
| Relação com corrupção de sessão Signal (prekeys esgotadas/inválidas, contador dessincronizado) por re-pareamento repetido | **Mecanismo confirmado pelo código-fonte** (as três exceções e suas condições de disparo batem exatamente com "sessão/prekey local não corresponde ao remetente"). **A causalidade específica com "múltiplos relogins rápidos"** (em vez de "um relogin qualquer") **é inferência, não confirmada por fonte externa** — nenhum documento (Signal, Baileys, comunidade) testa ou afirma isso como padrão esperado. |

---

## 3. É comportamento documentado/conhecido na comunidade Baileys?

Busquei no repositório oficial (`WhiskeySockets/Baileys`), no predecessor histórico
(`adiwajshing/Baileys`, hoje redirecionado/arquivado sob a mesma organização) e em wrappers
populares (Evolution API, que embrulha o Baileys).

- **`PreKeyError: Invalid PreKey ID`** é uma queixa recorrente:
  - https://github.com/WhiskeySockets/Baileys/issues/936 — relata exatamente `SessionError`
    + `PreKeyError` em `messages.upsert` após restart do processo, com conversas já
    existentes. **Fechada como "not planned"**, sem correção.
  - https://github.com/WhiskeySockets/Baileys/issues/54 — mesmo erro, mensagens específicas
    vindas de `messages.upsert`. Fechada como duplicata de outra issue (conteúdo da issue
    original não ficou acessível para confirmar se essa teve resolução).
  - https://github.com/EvolutionAPI/evolution-api/issues/1658 (título, em português: *"Já vi
    várias issues sobre isto e parece recorrente... Alguém sabe como resolver isto de vez?"*)
    — confirma que é percebido como recorrente e sem solução conhecida até por quem já viu
    várias ocorrências.
  - https://github.com/WhiskeySockets/Baileys/issues/888 — relato correlato de
    `"Closing stale open session for new outgoing prekey bundle"`, mesma família de sintoma
    (sessão antiga sendo fechada em favor de um novo prekey bundle — o mesmo código-fonte que
    li em `session_builder.js:72-76` gera esse aviso).
- **`MessageCounterError` / "Bad MAC" após reconexão:**
  - https://github.com/evolution-foundation/evolution-api/issues/2518 — título *"Bad MAC /
    MessageCounterError loops after reconnects"*, relatado especificamente em janelas de
    reconexão do Baileys (abril/2026), com o mesmo stack (`libsignal/crypto.js`,
    `"Failed to decrypt message with any known session..."` — a mesma frase de log que aparece
    em `session_cipher.js:157` no código instalado aqui). **Sem resposta de mantenedor** no
    conteúdo acessível.
  - https://github.com/WhiskeySockets/Baileys/issues/885 — variante "No SenderKeyRecord found"
    (mesma família, mas para mensagem de grupo/`skmsg`, não o caso deste research).
- **`shouldIgnoreJid`** aparece em várias issues como mecanismo de filtro, mas **sempre** para
  `@broadcast` / `@newsletter` / `@status` — não achei um único caso de uso relatado contra o
  próprio jid (`self`/`fromMe` peer noise). Exemplos encontrados:
  `shouldIgnoreJid: jid => isJidBroadcast(jid) || isJidStatusBroadcast(jid)` e
  `shouldIgnoreJid: jid => !jid || isJidBroadcast(jid) || isJidNewsletter(jid)`.
- **`whatsmeow`** (a lib Go citada como referência de arquitetura pelo próprio Baileys em
  alguns comentários) — busquei mas não encontrei, dentro do orçamento desta pesquisa, uma
  issue ou trecho de documentação pública que trate especificamente desse padrão "mensagem
  peer para o próprio jid" do lado do whatsmeow. Não afirmo que não exista — apenas que a
  busca não achou uma fonte verificável a citar.
- **Discord da comunidade Baileys:** não encontrei uma thread publicamente indexada/arquivada
  (via busca que retornasse URL verificável) sobre este padrão específico. Não invento
  conteúdo de Discord — apenas registro a ausência de achado.
- **Feature nativa "Message Yourself":** não encontrei nenhuma issue, discussão ou artigo que
  ligue esse padrão especificamente a essa feature de UI do WhatsApp.

### Avaliação da hipótese

| Hipótese | Veredito |
|---|---|
| É comportamento documentado/conhecido na comunidade Baileys | **Confirmada parcialmente**: os erros de decriptação (`PreKeyError`, `SessionError`/"Bad MAC", `MessageCounterError`) após reconexão/restart **são amplamente relatados** em issues do próprio Baileys e do Evolution API — é um padrão reconhecido pela comunidade. **Não confirmada** a parte "documentado como resolvido" ou "com causa raiz publicada": todas as issues encontradas foram fechadas sem correção ou ficaram sem resposta de mantenedor. O recorte específico "remoteJid = próprio número, pushName null, rajada pós-reconexão que para sozinha" não tem uma issue dedicada encontrada — a comunidade documenta os **erros de decriptação**, não o **ruído de `messages.upsert` com `fromMe`+`remoteJid` próprio** como um padrão nomeado à parte. |

---

## 4. O que a comunidade recomenda como correção/mitigação?

- **Filtrar `fromMe` de forma ampla** é o padrão mais comum e documentado nos exemplos e
  tutoriais Baileys encontrados: checar `event.type === 'notify' && !msg.key.fromMe` ou
  `if (!msg.message || !msg.key.remoteJid || msg.key.fromMe) return`. Isso descarta **toda**
  mensagem própria (não distingue "peer noise" de "consultora escreveu de outro aparelho") —
  é a solução que a maioria dos bots simples usa, porque a maioria não precisa tratar `fromMe`
  como sinal de nada (ao contrário deste projeto, que usa `fromMe` deliberadamente como sinal
  de handoff — ticket 047, `agente-runtime/index.js:505-527`). Isso explica por que esse ruído
  não é um problema relatado com destaque na comunidade: quem descarta `fromMe` de forma
  cega nunca o vê como problema à parte.
- **Evitar múltiplos re-pareamentos rápidos** — não achei uma recomendação explícita da
  comunidade (issue, wiki) dizendo isso em termos de "corrupção de sessão" ou "risco de
  banimento". A ligação que fiz em §2 é inferência técnica a partir do código-fonte, não algo
  que encontrei documentado como orientação operacional (tipo "não relogue mais que N vezes
  por hora").
- **Opção de configuração do Baileys 6.7.24 que resolveria de forma limpa:** existe, e é
  `shouldIgnoreJid` — confirmado no código-fonte real instalado:
  ```
  agente-runtime/node_modules/@whiskeysockets/baileys/lib/Defaults/index.js:47:
      shouldIgnoreJid: () => false,
  agente-runtime/node_modules/@whiskeysockets/baileys/lib/Socket/messages-recv.js:611:
      if (shouldIgnoreJid(node.attrs.from) && node.attrs.from !== '@s.whatsapp.net') {
          logger.debug(...); await sendMessageAck(node); return;
      }
  ```
  Se `shouldIgnoreJid(jid)` devolvesse `true` para o próprio número, o `handleMessage` (o
  handler que decodifica e emite `messages.upsert`) **nunca chegaria a chamar
  `decryptMessageNode`/`decrypt()`** para essas estanças — eliminaria de uma vez o ruído do
  evento **e** os erros de log de `PreKeyError`/`SessionError`/`MessageCounterError`, porque a
  tentativa de decriptação simplesmente não aconteceria. **Ressalva importante, não achada em
  nenhuma fonte, só lida no código:** essa comparação teria que usar `areJidsSameUser`
  (utilitário que o próprio Baileys exporta,
  `lib/WABinary/jid-utils.js:27`), não igualdade de string simples — o jid completo inclui um
  sufixo de dispositivo (`:12`, por exemplo) que uma comparação ingênua perderia. Não encontrei
  esse uso de `shouldIgnoreJid` documentado ou recomendado por ninguém para este cenário
  específico — é uma leitura direta do contrato do parâmetro na versão 6.7.24, não uma prática
  relatada.
- **Wrappers populares (Evolution API, WPPConnect, Venom):** a busca não encontrou, dentro do
  orçamento desta pesquisa, trecho de código-fonte público desses projetos com um filtro
  nomeado por `remoteJid === ownJid` ou tratamento explícito de mensagens `category: "peer"`.
  Não afirmo que não exista — apenas que não achei uma fonte verificável.

### Avaliação da hipótese

| Hipótese | Veredito |
|---|---|
| Comunidade recomenda filtrar `remoteJid === próprio jid` | **Sem evidência de recomendação nomeada assim.** O padrão comum é mais bruto (ignorar todo `fromMe`), o que resolveria por acidente, não por design. |
| Comunidade recomenda evitar múltiplos re-pareamentos rápidos | **Sem evidência encontrada** de recomendação operacional nesses termos. |
| Existe opção de config do Baileys 6.7.24 que resolve de forma limpa | **Confirmada a existência e o mecanismo** (`shouldIgnoreJid`, lido no código-fonte real). **Não confirmada como prática documentada/recomendada** pela comunidade para este caso — é dedução própria a partir do contrato da função. |

---

## 5. Implicação prática para o projeto

### O que o código atual faz hoje com esse ruído (lido em `agente-runtime/index.js`)

O handler de `messages.upsert` já filtra grupo/newsletter (linhas 483-488) e aplica uma
restrição de teste por `ALLOWED_JID` (linhas 490-501) **antes** de chegar no tratamento de
`fromMe` (linhas 505-527, endurecido pelo ticket 047). A ordem importa para este ruído:

- **Com `ALLOWED_JID` setado** (como no teste de hoje) — o ruído (jid = próprio número, quase
  certamente diferente do contato de teste) **é descartado pelo filtro de `ALLOWED_JID`**,
  antes mesmo de chegar no tratamento de `fromMe`. É por isso que o teste de hoje não
  corrompeu nenhum estado de conversa: o gate de teste absorveu o ruído incidentalmente.
- **Sem `ALLOWED_JID`** (produção real, quando o freio de teste for removido) — esse ruído
  cairia direto no bloco `if (msg.key.fromMe)` (linha 511), que hoje existe para detectar
  "consultora escreveu de outro aparelho" (ticket 047). O jid dessa "conversa" seria o
  **próprio número da conta**, não o de nenhum cliente real — então **não contamina o estado
  de nenhuma conversa de cliente existente**. O efeito colateral seria: uma entrada nova em
  `conversas` (Map em memória) chaveada pelo próprio número, com `status = 'com_consultora'`,
  e uma tentativa de `persistirEngajamento` (linha 524) gravando uma linha fantasma na tabela
  `engagements` do Supabase — com `phone` = o próprio número da loja, `name = null`. Essa
  linha reidrataria em todo restart (`rehidratarEngajamentos`, linha 170) como um "atendimento
  aberto", poluindo o que a plataforma mostra para a consultora, embora sem risco de LGPD (é
  o próprio número da loja, não dado de cliente) e sem interferir na fila real de handoff
  (`writeHandoff` não é chamado nesse caminho).

### Isso é esperado acontecer em produção?

O cenário que gerou o ruído hoje é **especificamente vários logout+QR completos em menos de
uma hora, no mesmo número pessoal**. A produção real:

- conecta um **número WhatsApp Business dedicado da loja**, sem histórico de múltiplos
  re-pareamentos rápidos (comentário no próprio `agente-runtime/index.js:7-11` já lista auth
  em disco via `useMultiFileAuthState` como pendência — hoje um redeploy sem volume
  persistente **força um QR novo a cada redeploy**, que é uma via de re-pareamento repetido
  real e já esperada até essa pendência ser resolvida);
- reconexões de socket "normais" (queda de rede, restart do processo Node com credenciais
  intactas) usam as credenciais já salvas — **não** é o mesmo caminho de "logout completo",
  que é o gatilho que este research testou. Não há dado de produção mostrando se
  reconexão-sem-logout também produz esse ruído (o teste de hoje só cobriu logout+QR
  repetido); a suspeita, pelo mecanismo de §2, é que reconexão simples (sem trocar
  identidade/prekeys) tem muito menos chance de gerar sessão desencontrada — mas isso não foi
  testado nem confirmado por fonte externa.

### Recomendação

**Não é necessário adicionar um filtro dedicado agora, mas vale registrar a lacuna.**
Razões:

1. O ruído, quando ocorre, não contamina conversa de cliente real (jid distinto) — o pior
   caso é uma linha fantasma no Supabase e um log de erro do Baileys, não uma falha visível
   para a loja ou o cliente.
2. O gatilho identificado (múltiplos logout+QR em menos de uma hora) não é o padrão de
   operação esperado do número Business em produção estável — é uma peculiaridade do teste de
   hoje. Enquanto a pendência de auth em disco (`agente-runtime/index.js:7-9`) não for
   resolvida, **redeploys sem volume persistente já forçam QR novo a cada deploy** — isso é um
   caminho realista para o mesmo padrão aparecer em produção com alguma frequência (um QR por
   deploy, não vários em uma hora, mas repetido ao longo do tempo). Vale reavaliar quando o
   044 tratar a auth em disco.
3. Não achei fonte (nem no código, nem na comunidade) que aponte um jeito **garantido** de
   diferenciar, só pelo evento, "peer noise de sincronização" de uma futura mensagem legítima
   endereçada ao próprio número (ex.: a consultora realmente usando o "Message Yourself" do
   WhatsApp) — um filtro por `remoteJid === próprio jid` descartaria os dois casos igual.
   Dado que o projeto já trata `fromMe` com um propósito específico (handoff), um filtro cego
   por "é o próprio jid" poderia silenciosamente engolir um caso de handoff real caso a
   consultora algum dia escreva para o próprio número da loja por engano — cenário raro, mas
   pior que a linha fantasma atual.

Se o dono do projeto preferir eliminar mesmo assim a poluição no Supabase (item 2 acima, dado
o redeploy-sem-volume atual), a forma mais cirúrgica — a validar em um ticket separado, não
decidida aqui — seria um filtro explícito **dentro do handler de `messages.upsert`** (mesmo
padrão já usado para grupo/newsletter, linhas 483-488), comparando com
`areJidsSameUser(jid, sock.user.id)` (utilitário que o próprio Baileys já exporta,
confirmado em `lib/WABinary/jid-utils.js:27`) — não uma comparação de string simples, e não
via `shouldIgnoreJid` do socket (que suprimiria também recibos/notificações internas do
Baileys para esse jid, um raio de efeito maior que o necessário só para não gravar uma linha
fantasma). Isso é uma leitura de código, não uma decisão — falta ao mapa decidir se vale abrir
esse ticket antes ou depois de resolver a auth em disco (044).

---

## Fontes primárias (código-fonte lido diretamente, versões instaladas em produção)

- `agente-runtime/node_modules/@whiskeysockets/baileys/lib/Utils/decode-wa-message.js` (v6.7.24)
- `agente-runtime/node_modules/@whiskeysockets/baileys/lib/Socket/messages-recv.js` (v6.7.24)
- `agente-runtime/node_modules/@whiskeysockets/baileys/lib/Defaults/index.js` (v6.7.24)
- `agente-runtime/node_modules/@whiskeysockets/baileys/lib/WABinary/jid-utils.js` (v6.7.24)
- `agente-runtime/node_modules/@whiskeysockets/baileys/lib/Socket/socket.js` (v6.7.24)
- `agente-runtime/node_modules/libsignal/src/session_builder.js` (v6.0.0)
- `agente-runtime/node_modules/libsignal/src/session_cipher.js` (v6.0.0)
- `agente-runtime/index.js` (código do runtime deste projeto)

## Fontes externas

- Signal — X3DH: https://signal.org/docs/specifications/x3dh/
- Signal — Sesame (gestão de sessão): https://signal.org/docs/specifications/sesame/
- https://github.com/WhiskeySockets/Baileys/issues/936 (PreKeyError + SessionError após restart, fechada sem correção)
- https://github.com/WhiskeySockets/Baileys/issues/54 (Invalid PreKey ID em `messages.upsert`, fechada como duplicata)
- https://github.com/WhiskeySockets/Baileys/issues/888 ("Closing stale open session for new outgoing prekey bundle")
- https://github.com/WhiskeySockets/Baileys/issues/885 ("No SenderKeyRecord found for decryption")
- https://github.com/EvolutionAPI/evolution-api/issues/1658 (relato de recorrência, sem solução conhecida)
- https://github.com/evolution-foundation/evolution-api/issues/2518 ("Bad MAC / MessageCounterError loops after reconnects")
- https://baileys.wiki/pt-BR/faq (consultada — não cobre este cenário)

Buscas sem achado verificável (registrado para não repetir): thread de Discord da comunidade
Baileys sobre este padrão; menção explícita da feature "Message Yourself" como causa; trecho
de código-fonte público do Evolution API/WPPConnect/Venom-bot filtrando `remoteJid === ownJid`
ou tratando `category: "peer"` explicitamente; documentação do `whatsmeow` (Go) sobre o mesmo
padrão.
