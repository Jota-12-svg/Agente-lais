---
ticket: "016"
title: Arquitetura self-hosted (Baileys/Evolution API/WPPConnect) como dispositivo adicional no número atual
tipo: research
data: 2026-08-11
---

# Research — Conectar um agente self-hosted como dispositivo a mais no número da loja

Ticket: [016](../tickets/016-escolher-parceiro-meta.md) · Investigado em 2026-08-11 · Aprofunda a
arquitetura técnica que o [research 023](023-comunidade-whatsapp-ia-baixo-custo.md) já havia
mapeado em nível geral (Baileys, Evolution API, WPPConnect, whatsapp-web.js existem, conectam por
QR code, risco de banimento concentrado em disparo em massa). **Este documento não repete o
levantamento de risco de banimento — foca em mecanismo técnico e viabilidade de conexão.**

> **Base desta investigação.** Fontes primárias sempre que existiam: documentação oficial dos
> projetos (`github.com/WhiskeySockets/Baileys`, `baileys.wiki`, `wppconnect.io`,
> `docs.evolutionfoundation.com.br`), o post de engenharia da própria Meta sobre a arquitetura
> multi-device (já citado no research 022), e **issues do GitHub com relato direto** — tratadas
> como primárias no sentido de "isto é o que um usuário/mantenedor realmente relatou", mesmo sendo
> conteúdo gerado pela comunidade. Onde a fonte é um blog comercial (revenda de API oficial ou de
> gateway pago), isso está **marcado explicitamente** com o que a empresa vende, para os dois
> lados do interesse comercial. Todas as leituras de issue/documentação foram feitas via
> ferramenta de fetch com resumo — quando um trecho aparece entre aspas, é citação; o resto é
> síntese meu, sinalizada como tal.

---

## Resumo executivo

**Pergunta direta que motivou este research: é tecnicamente viável conectar um agente self-hosted
como dispositivo adicional ao número que a loja já usa, sem desconectar nada?**

**Resposta: provavelmente sim em condição normal, mas com uma incerteza aguda e não resolvida no
momento exato desta pesquisa (agosto de 2026) que pode bloquear a tentativa antes mesmo de chegar
à pergunta "desconecta algo?". Confiança: moderada-baixa — mecanismo plausível e bem documentado,
mas sem nenhum relato de primeira mão de alguém tendo feito exatamente isso (dispositivo adicional
numa conta WhatsApp Business Premium já com vários aparelhos ativos) e confirmado que funcionou.**

1. **Mecanismo (pergunta 1):** Baileys fala o protocolo multi-device nativo do WhatsApp
   diretamente por WebSocket — handshake Noise, criptografia Signal, sem navegador, sem
   Selenium, sem Puppeteer. Ele se autentica exatamente como o WhatsApp Web faria: como um
   **dispositivo acompanhante (companion device)** pareado por QR code ou código alfanumérico
   **[primária, README/docs do próprio Baileys]**. Evolution API empacota o Baileys por trás de
   um servidor REST/webhook. WPPConnect (e whatsapp-web.js) fazem algo estruturalmente diferente:
   rodam uma sessão real do WhatsApp Web dentro de um Chromium headless via Puppeteer, injetando
   JavaScript nas funções internas da própria página — **dois mecanismos diferentes, o mesmo
   resultado final** (ocupar um slot de dispositivo vinculado).

2. **Dispositivo adicional sem desconectar nada (pergunta 2):** a documentação da própria Meta
   confirma que **adicionar um novo dispositivo vinculado não desconecta os existentes** — cada um
   roda com sua própria sessão de criptografia independente, até o teto do plano (4 no grátis, até
   10 no Business Premium, conforme já estabelecido no research 022). Como Baileys/WPPConnect se
   autenticam pelo mesmo fluxo de pareamento que qualquer dispositivo oficial, a leitura mecânica é
   que eles deveriam ocupar **mais um slot**, sem tirar ninguém do ar, **se houver slot livre**.
   **Mas há um problema agudo e não resolvido nesta data:** desde ~30 de junho de 2026 a Meta está
   em rollout de um requisito de **passkey/WebAuthn obrigatório para vincular um dispositivo
   novo**, que um cliente headless não consegue completar (exige autenticação biométrica real).
   Issues abertas e não resolvidas em Baileys, OpenWA e relatos que citam whatsmeow e
   whatsapp-web.js mostram travamento no próprio pareamento — a sessão nunca completa, fica presa
   num aviso de "Continue on WhatsApp Web (Passkey)". Um dos relatos descreve isso como **"rollout
   faseado — nem todas as contas foram afetadas ainda"**. Ou seja: a resposta de hoje pode ser
   "sim, funciona normalmente" ou "trava no primeiro passo", dependendo de uma variável (se a
   conta da loja já está no lote afetado) que não é possível verificar sem tentar de fato.

3. **Sinal de handoff (pergunta 3) — o achado mais relevante deste research para o projeto.** A
   arquitetura de sincronização multi-device da própria Meta é descrita como **"client-fanout"**:
   o dispositivo que envia a mensagem criptografa e transmite N cópias para os N outros
   dispositivos vinculados da conta, **sem distinção documentada entre tipos de dispositivo**
   **[primária, engineering.fb.com]**. Isso é estruturalmente diferente do `smb_message_echoes` do
   Coexistence oficial, que é uma webhook de camada de negócio que a Meta **optou** por não
   entregar para WhatsApp para Windows e WearOS (o ponto cego do ticket
   [019](../tickets/019-companion-windows-ponto-cego.md)). Um cliente self-hosted, sendo ele mesmo
   um dispositivo vinculado dentro do mesmo mecanismo nativo de sincronização, deveria — por
   inferência de arquitetura, não por teste confirmado — receber o evento `messages.upsert` com
   `fromMe: true` para **qualquer** dispositivo que a consultora usar para responder, Windows
   incluído. **Nenhuma fonte encontrada confirma isso com um teste de primeira mão**; é a leitura
   mais forte que a documentação primária permite, mas continua sendo inferência.

4. **Hospedagem (pergunta 4):** Baileys/Evolution API não precisam de navegador — processo Node.js
   leve, RAM da ordem de dezenas de MB por conexão (uma única conexão, como é o caso da Lais Casa,
   roda folgada em qualquer VPS pequeno). WPPConnect/whatsapp-web.js precisam de um Chromium
   headless por sessão — 200-400 MB de RAM só para o navegador, por sessão. VPS barato no Brasil
   (Hostinger, com datacenter nacional) começa em torno de **R$28/mês com 4 GB de RAM**; opções
   internacionais (Contabo, Hetzner) são ainda mais baratas em euro, mas somam câmbio + IOF de
   ~12-15%. Precisa estar online **24/7** nos três casos, porque todos mantêm uma sessão
   WebSocket autenticada persistente — se o processo cai, a sincronização para até reconectar.

5. **Estabilidade (pergunta 5) — o achado operacional mais sério.** Há um evento de quebra
   **em andamento agora**, não histórico: o rollout de passkey de junho/2026 descrito acima é o
   tipo exato de coisa que preocupa o ticket ("o agente para de funcionar do nada"). Fora esse
   evento agudo, o Baileys tem histórico recorrente de regressões pontuais quando a Meta muda
   comportamento do protocolo (uma delas documentada no próprio changelog de migração para v7,
   corrigida numa release-candidate posterior), mas é **mantido ativamente** (múltiplas releases
   entre maio e julho de 2026). WPPConnect e whatsapp-web.js carregam uma **segunda superfície de
   quebra** que o Baileys não tem: além de mudança de protocolo da Meta, dependem do Puppeteer (que
   também lança breaking changes) e das funções internas injetadas no HTML/JS do WhatsApp Web, que
   podem ser renomeadas sem aviso — o próprio changelog do WPPConnect v2.0.0 documenta ter
   precisado se adaptar a uma renomeação interna (`webpack` → `loader`) da lib que ele injeta.

6. **Comparação para este caso de uso (pergunta 6):** para um número único, orçamento mínimo,
   self-hosted, **Baileys puro (ou Evolution API por cima dele) é a escolha tecnicamente mais
   madura** — menor superfície de quebra, menor custo de hospedagem, maior proximidade da correção
   quando a Meta muda algo (é a fonte, não um wrapper). WPPConnect é comparável em comunidade e
   documentação em português, mas carrega custo de recurso e uma superfície de quebra extra sem
   benefício claro para conectar um único número.

**Confiança geral desta pesquisa:** moderada. As perguntas de mecanismo e arquitetura têm boa base
primária (docs oficiais dos projetos, post de engenharia da Meta). A pergunta mais decisiva para
o projeto — "conecta sem desconectar nada, numa conta Premium já ocupada" — não tem nenhum relato
de primeira mão testando exatamente esse cenário, e está sujeita a um evento de instabilidade da
Meta em curso agora que pode simplesmente impedir a tentativa.

---

## Pergunta 1 — Mecanismo técnico exato de conexão

### Baileys: protocolo nativo, sem navegador

**[primária, README e documentação oficial do Baileys —
[github.com/WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) e
[baileys.wiki](https://whiskeysockets-baileys-94.mintlify.app/introduction)]**

Baileys reimplementa o protocolo multi-device do WhatsApp diretamente:

- Autenticação como **dispositivo acompanhante (companion device)**, pareado por QR code ou
  código alfanumérico — exatamente o mesmo fluxo que vincular WhatsApp Web num navegador ou o app
  de Windows/Mac.
- Conexão via **WebSocket binário** para `web.whatsapp.com`, abrindo com um handshake do
  **protocolo Noise** (padrão XX) para cifrar os quadros iniciais.
- Criptografia ponta-a-ponta do conteúdo das mensagens via **protocolo Signal** (biblioteca
  `libsignal`).
- Persistência de sessão local (`useMultiFileAuthState` ou equivalente), sem depender de
  navegador algum. Não há Selenium, não há Chromium, não há emulador de telefone em nenhum ponto
  da stack.

**Leitura direta:** do ponto de vista do WhatsApp, um cliente Baileys autenticado **é
indistinguível, na camada de protocolo, de um WhatsApp Web real aberto num navegador** — porque é
literalmente a mesma implementação de protocolo, só que escrita à mão em vez de rodar dentro do
Chrome.

### Evolution API: Baileys por trás de um servidor REST

**[primária, docs oficiais —
[docs.evolutionfoundation.com.br](https://docs.evolutionfoundation.com.br/en/licensing/faq) e a
página de documentação do provider Baileys]**

Evolution API não é um mecanismo de conexão alternativo — é uma camada de aplicação (REST API +
webhooks + persistência em Postgres/Redis) construída **sobre** o Baileys. A conexão em si segue
sendo exatamente o mecanismo do Baileys descrito acima; a documentação do próprio Evolution API
confirma isso ao expor variáveis de ambiente para "configurar como sua instância aparece nos
'Dispositivos Vinculados' do WhatsApp" (nome do cliente, tipo de navegador simulado) — ou seja, o
Evolution API está literalmente configurando os metadados que o Baileys manda no pareamento como
dispositivo vinculado.

### WPPConnect (e whatsapp-web.js): abordagem estruturalmente diferente

**[primária, sínteses técnicas confirmadas contra a documentação oficial dos projetos —
[wppconnect-team.github.io](https://wppconnect-team.github.io/) e o guia de instalação em
[wwebjs.dev](https://wwebjs.dev/guide/installation)]**

WPPConnect e whatsapp-web.js **não reimplementam o protocolo** — eles rodam uma sessão real de
WhatsApp Web dentro de um **Chromium headless controlado por Puppeteer**, e automatizam essa
sessão injetando JavaScript que chama as próprias funções internas do WhatsApp Web (não são
seletores de UI simples — são chamadas às funções internas da aplicação React/webpack do WhatsApp
Web). O login continua sendo o mesmo QR code de sempre, porque é literalmente a mesma página web
que qualquer pessoa abriria no navegador — só que automatizada.

**Diferença prática entre as duas abordagens:** Baileys fala o protocolo; WPPConnect/whatsapp-web.js
operam um navegador que fala o protocolo por elas. O resultado (ocupar um slot de dispositivo
vinculado) é o mesmo; o caminho até lá, e a superfície de coisas que podem quebrar, não é (ver
pergunta 5).

---

## Pergunta 2 — Conectar como dispositivo adicional numa conta já ativa, sem desconectar nada

### O que a documentação oficial da Meta diz sobre adicionar dispositivos

Já estabelecido no research 022, e reconfirmado aqui: o teto documentado é **até 4 dispositivos
vinculados no plano grátis** (1 celular principal + 4 = 5 no total), estendido a **até 10** no
WhatsApp Business Premium — que é a explicação mais provável, por eliminação, para os "6
dispositivos" que a loja usa hoje.

O comportamento de **adicionar** um dispositivo, especificamente, é descrito de forma consistente
por múltiplas fontes secundárias (guias de uso do recurso, não documentação técnica de protocolo)
como **não desconectando os dispositivos já vinculados**: cada dispositivo mantém sua própria
sessão de criptografia independente, e o processo de vincular um novo é aditivo até bater no teto
— só quando o teto já está cheio é que a Meta bloqueia a adição de mais um (não que ela troque um
existente por um novo). O post de engenharia da própria Meta sobre a arquitetura multi-device já
citado no research 022 sustenta essa leitura: cada dispositivo acompanhante "mantém sua própria
sessão criptografada... sem depender do celular principal estar online", o que é incompatível com
um modelo onde vincular um novo apagaria uma sessão existente.

**Por essa leitura mecânica, Baileys/WPPConnect deveriam se comportar como qualquer outro
dispositivo sendo adicionado: ocupam o próximo slot livre, sem afetar os demais — desde que haja
slot livre.** Isso é inferência bem fundamentada em documentação primária, não um teste
confirmado com essas bibliotecas especificamente contra a conta da Lais Casa.

### O evento que complica essa resposta agora: passkey/WebAuthn obrigatório para vincular

Esta é a descoberta mais importante e mais recente desta pesquisa, e está **em andamento no
momento em que este documento foi escrito**:

Por volta de **30 de junho de 2026**, a Meta começou a exigir uma confirmação de **passkey
(WebAuthn)** no fluxo de vinculação de um **novo** dispositivo — tanto por QR code quanto por
código de pareamento. A mensagem que aparece no telefone principal é: **"Keep the app open on
both devices. You may need to scan another QR code to use your passkey."**, e a conexão nunca
completa — trava em timeout.

- **[primária, relato direto, issue aberta e não resolvida]**
  [WhiskeySockets/Baileys#2672 — "Continue on WhatsApp Web (Passkey)"](https://github.com/WhiskeySockets/Baileys/issues/2672),
  aberta em 30/06/2026, **status: aberta**, sem confirmação de correção ou workaround por parte
  dos mantenedores até o momento em que foi lida.
- **[primária, relato direto, issue aberta]**
  [rmyndharis/OpenWA#560 — "WhatsApp mandatory passkey blocks all device linking — QR and
  pairing-code both fail"](https://github.com/rmyndharis/OpenWA/issues/560), também aberta,
  descreve o mesmo sintoma e acrescenta um dado importante: **"This appears to be a phased
  rollout — not all accounts are affected yet."** — ou seja, não é um interruptor global e
  simultâneo; contas diferentes podem estar em estágios diferentes do rollout, o que significa
  que **não dá para saber se a conta da Lais Casa está ou não afetada sem tentar vincular de
  fato**.
- A mesma issue e fontes convergentes (ver abaixo) indicam que o problema **afeta especificamente
  a vinculação de um dispositivo novo**, e que **sessões já vinculadas antes do rollout continuam
  funcionando normalmente** — o que, se verdadeiro, significa que o risco aqui não é "o agente
  para de funcionar depois de conectado", é "o agente pode nem conseguir se conectar da primeira
  vez".

> **Ressalva de honestidade sobre a origem secundária que amplificou este achado.** A busca que
> encontrou esse evento também trouxe um blog comercial
> ([whapi.cloud/blog/understanding-whatsapp-new-passkey-security-webauthn-explained](https://whapi.cloud/blog/understanding-whatsapp-new-passkey-security-webauthn-explained)),
> de uma empresa que **vende acesso gerenciado à API do WhatsApp** — ou seja, tem interesse
> comercial direto em pintar o caminho self-hosted como "permanentemente quebrado" para empurrar a
> migração para o produto pago dela. O texto chega a chamar as bibliotecas headless de
> "permanently broke" e apresenta o próprio serviço como "the only sustainable path". **Não tratei
> essa alegação de permanência como fato** — as issues primárias (Baileys, OpenWA) descrevem um
> bug ativo e um rollout em fase, não um anúncio da Meta de descontinuação definitiva, e a
> Baileys continuou lançando release candidates depois da data em que o problema começou (ver
> pergunta 5), o que não é o padrão de um projeto que os próprios mantenedores consideram morto.

**Leitura para o projeto:** a pergunta "dá para conectar sem desconectar nada" tem uma pré-condição
que este research não conseguiu verificar: **conseguir conectar, ponto**. Se a conta da loja
estiver no lote já afetado pelo rollout de passkey, a tentativa trava antes mesmo de chegar à
pergunta sobre slots de dispositivo. Isso só se resolve tentando.

### Um sinal relacionado, mas de um cenário diferente: parear contra um número já onboardado via Cloud API

Encontrei uma issue relevante, ainda que de um cenário adjacente e não idêntico ao da Lais Casa:

- **[primária, relato direto]**
  [tulir/whatsmeow#916 — "Could you give me a hand to configure correctly to use a connection
  compatible with WhatsApp Web to connect to WhatsApp Business Coexistence?"](https://github.com/tulir/whatsmeow/issues/916),
  fechada como duplicata de
  [#893](https://github.com/tulir/whatsmeow/issues/893), que descreve o erro **"Failed to pair
  device: invalid device signature in pair success message"** ao tentar ler um QR code de um
  telefone que já estava "usando a WhatsApp API".

Isso não é o cenário da Lais Casa hoje (a loja **não** está em Coexistence nem em nenhuma API da
Meta — está no WhatsApp Business app comum, provavelmente Premium). Mas é um sinal de que **parear
um cliente não-oficial contra um número que já foi onboardado pela Meta em algum modo oficial
(Coexistence ou Cloud API) pode se comportar de forma diferente/falhar** de um jeito que não
falharia num número "comum". Vale como alerta caso o projeto algum dia considere os dois caminhos
ao mesmo tempo (self-hosted **e** Coexistence oficial no mesmo número) — não é o caso considerado
neste documento, mas é uma armadilha a evitar combinar sem verificar antes.

### O que não foi encontrado

**Nenhum relato de primeira mão** de alguém tendo vinculado Baileys, Evolution API ou WPPConnect
como um dispositivo **adicional** (não o primeiro, não substituindo nenhum) a um número **WhatsApp
Business Premium já em uso ativo por várias pessoas**, confirmando que os dispositivos existentes
sobreviveram ao processo. As buscas feitas (termos em português e inglês, GitHub, Reddit, fóruns
técnicos) não trouxeram esse relato específico — só o mecanismo geral (pergunta 2, primeira
metade) e o bug de passkey (segunda metade). Essa é a maior lacuna deste research, e a única forma
de fechá-la é testar.

---

## Pergunta 3 — O que a leitura de mensagens entrega, e o sinal de handoff

### Recebimento em tempo real

**[primária, docs do Baileys — [baileys.wiki/docs/socket/handling-messages](https://baileys.wiki/docs/socket/handling-messages/)]**

Mensagens chegam via evento local `messages.upsert`, em tempo real, assim que o WebSocket recebe o
quadro do servidor — é um event emitter local, não um webhook HTTP (o processo Node.js roda dentro
do próprio servidor do agente, então "receber o evento" é só uma callback dentro do mesmo
processo). Isso cobre tanto mensagens recebidas do cliente quanto — este é o ponto central da
pergunta — mensagens **enviadas pela própria conta**, incluindo as enviadas de outros dispositivos.

### Histórico

**[primária, baileys.wiki/docs/socket/history-sync]** Ao conectar, o socket baixa e processa chats,
contatos e mensagens antigas via o evento `messaging-history.set`. Existe uma opção
(`syncFullHistory`) para "emular um desktop" e puxar histórico mais completo, incluindo mensagens
enviadas do próprio telefone. O tamanho exato dessa janela de histórico (dias/meses) não está
documentado de forma numérica nas páginas consultadas — diferente do Coexistence oficial, que
documenta explicitamente 6 meses de conversa e 14 dias de mídia (research 005). **Não encontrei um
número equivalente e confirmado para o Baileys** — trato isso como lacuna.

### O achado central: mensagens enviadas de outro dispositivo (o problema do ticket 019)

Esta é a pergunta mais importante para o projeto, porque é exatamente o ponto cego que o ticket
[019](../tickets/019-companion-windows-ponto-cego.md) documentou para o Coexistence oficial: uma
consultora respondendo pelo **WhatsApp para Windows** não gera `smb_message_echoes`, porque a Meta
explicitamente excluiu esse tipo de dispositivo da lista de companions suportados **para esse
webhook específico**.

A pergunta é: **um cliente self-hosted, ligado ao mesmo número como mais um dispositivo
vinculado, tem o mesmo ponto cego?**

A resposta, por leitura da arquitetura primária, é **provavelmente não** — e a razão é estrutural:

- **[primária, engineering.fb.com/2021/07/14/security/whatsapp-multi-device]** A sincronização de
  mensagens entre dispositivos vinculados no protocolo multi-device nativo é descrita como um
  modelo de **"cliente-fanout"**: "o cliente WhatsApp que envia a mensagem criptografa e transmite
  N vezes para N dispositivos diferentes." O texto **não estabelece nenhuma distinção entre tipos
  de dispositivo companion** (Web, macOS, Windows, Portal) na forma como esse fanout acontece —
  todos são tratados como companions de mesmo nível, recebendo a cópia cifrada da mensagem.
- Isso é **fundamentalmente diferente** do `smb_message_echoes` do Coexistence, que não é parte do
  protocolo nativo de sincronização entre dispositivos — é uma **webhook de camada de negócio**
  que a Meta construiu por cima, especificamente para levar eventos da WABA ao parceiro Meta, e
  onde a Meta **escolheu**, por decisão de produto, não cobrir Windows e WearOS (documentado no
  próprio research 019 do projeto).
- Um cliente Baileys/whatsmeow/WPPConnect, sendo ele mesmo **um dos N dispositivos** que recebem o
  fanout — porque é assim que ele está tecnicamente pareado — deveria, por essa leitura, receber a
  cópia da mensagem enviada por **qualquer outro companion**, Windows incluído, como um evento
  `messages.upsert` comum com `key.fromMe: true`. O `fromMe: true` sinaliza "esta mensagem foi
  enviada pela própria conta" — sem distinguir se foi o processo Baileys que a enviou ou outro
  dispositivo vinculado que a enviou (confirmado pela própria documentação e por padrões de código
  publicados: checar `!msg.key.fromMe` é a forma padrão de filtrar "mensagem de terceiro" de
  "mensagem da própria conta", o que implica que mensagens da própria conta enviadas de qualquer
  lugar chegam pelo mesmo canal de evento).

**Isso não foi confirmado por nenhum teste de primeira mão encontrado nesta pesquisa** — nenhuma
issue, fórum ou relato descreve especificamente "conectei Baileys, mandei mensagem pelo app de
Windows do mesmo número, e vi o evento chegar". É uma inferência de arquitetura, apoiada por uma
fonte primária forte (o próprio post de engenharia da Meta) e por como a API do Baileys é
documentada e usada na prática (checagem de `fromMe`), mas segue sendo inferência.

**Se essa inferência estiver correta, é um achado de peso real para o projeto:** o caminho
self-hosted resolveria, por construção, o ponto cego que motivou o ticket 019 no Coexistence
oficial — sem exigir tirar o app de Windows da mão de nenhuma consultora. **Recomendo fortemente
testar isso especificamente**, com o mesmo tipo de teste que o ticket 019 já planeja para
Coexistence (mandar mensagem de cada tipo de dispositivo — Web, Windows, celular secundário, Mac —
e conferir qual gera evento), caso o projeto decida prototipar o caminho self-hosted.

### Presença e recibos de leitura

**[primária, baileys.wiki/docs/socket/presence-receipts]** Baileys expõe eventos de presença
(`available`, `composing`/digitando, `recording`, `paused`) e tem um rastreador de recibos de
leitura. Isso é potencialmente um sinal indireto adicional de atividade humana (uma consultora
digitando no app dela apareceria como evento de presença), algo que o research 019 registrou como
**não confirmado** para o Coexistence oficial ("ficou em aberto no research: se Coexistence entrega
webhook de status `read` originado do app"). Não testei isso de fato; é um ponto a favor a
confirmar, não uma garantia.

---

## Pergunta 4 — Requisitos reais de hospedagem própria

### Perfil de recurso por biblioteca

| | Baileys / Evolution API (Baileys por baixo) | WPPConnect / whatsapp-web.js |
|---|---|---|
| Navegador? | **Não** — WebSocket direto | **Sim** — Chromium headless via Puppeteer |
| RAM por instância/sessão | Ordem de dezenas de MB por conexão Node.js — não há um benchmark oficial publicado, mas uma discussão pública sobre escalar para milhares de sessões cita ~4 GB de RAM para ~200 sessões concorrentes **com Redis e DynamoDB no meio** **[primária, relato direto — [Baileys#1824](https://github.com/WhiskeySockets/Baileys/discussions/1824)]** — folgado para o caso de **uma única conexão** | **200–400 MB de RAM só para o processo do Chromium**, por sessão **[secundária, consolidada de múltiplos guias de deploy em VPS]**, mais o overhead do próprio Node |
| CPU | Baixo — pico só em operações de criptografia | Baixo a médio — renderização de página, mesmo headless, custa mais que um socket puro |
| Precisa de flags especiais em VPS? | Não | Sim — `--no-sandbox`, `--disable-dev-shm-usage` são citados de forma recorrente como necessários para evitar crash em VPS pequeno |

### Precisa ficar online 24/7?

**Sim, nos três casos.** Todos mantêm uma sessão WebSocket autenticada e persistente com os
servidores do WhatsApp — não é um modelo de "acordar quando chega mensagem" como um webhook HTTP
tradicional. Se o processo cai, mensagens que chegarem nesse intervalo não são processadas em
tempo real (dependendo da lib, podem ser recuperadas via history sync na reconexão, ou perdidas do
ponto de vista do evento em tempo real — não confirmei o comportamento exato de "mensagem chegada
durante downtime" para nenhuma das três, é uma lacuna).

### Custo de VPS no Brasil

**[secundária, páginas de preço de fornecedores — tratadas como primárias para o próprio preço de
cada um, mas não auditadas de forma independente]**

- **Hostinger** (datacenter no Brasil): plano KVM a partir de **~R$28/mês, com 4 GB de RAM**,
  instalação de 1 clique disponível para aplicações como o próprio Evolution API
  ([hostinger.com/applications/evolution-api](https://www.hostinger.com/applications/evolution-api)).
  Vantagem: preço em reais, sem câmbio, datacenter nacional (latência menor).
- **Contabo**: a partir de **~€6/mês** (~R$36–40 dependendo do câmbio). Datacenter fora do Brasil.
- **Hetzner**: a partir de **~€4,50/mês** (~R$27–30). Datacenter na Europa.
- Uma fonte de comparação nacional
  ([runzos.com/vps-brasil-barato-2026](https://runzos.com/vps-brasil-barato-2026/)) observa que
  planos internacionais cobrados em dólar/euro **somam IOF de 6,38% mais câmbio**, adicionando
  **~12–15% ao custo real** — o que estreita bastante a vantagem de preço nominal desses
  provedores estrangeiros frente a um provedor nacional.

**Para uma única conexão (o caso da Lais Casa), qualquer uma dessas opções tem recurso de sobra.**
A diferença de custo entre rodar Baileys puro (mais leve, cabe num plano bem básico, possivelmente
abaixo dos R$28/mês citados) e rodar Evolution API completo (que soma Postgres + Redis ao
processo do Baileys, então precisa de mais RAM) é real, mas pequena em termos absolutos — a
recomendação prática é o plano de 2–4 GB de RAM citado acima, que cobre os três casos com folga,
inclusive o cenário mais pesado (WPPConnect com Chromium).

---

## Pergunta 5 — Estabilidade e manutenção

### O evento agudo: passkey/WebAuthn (detalhado na pergunta 2)

Este é o achado mais importante para esta pergunta especificamente, porque é **exatamente** o tipo
de coisa que o ticket teme: "o agente para de funcionar do nada porque a lib ficou desatualizada" —
só que, neste caso, é a Meta que mudou o requisito de autenticação para vincular um dispositivo
novo, não um bug da lib em si. Está em andamento desde ~30/06/2026, sem solução de código conhecida
(exige autenticador de hardware real), e o alcance é **"rollout faseado"** — não afeta todas as
contas ao mesmo tempo, o que também significa que não há garantia de que vá parar de afetar contas
novas tão cedo.

### Histórico de regressões fora desse evento

**[primária, changelog de migração do Baileys —
[baileys.wiki/docs/migration/to-v7.0.0](https://baileys.wiki/docs/migration/to-v7.0.0)]** A
documentação de migração menciona que "o WhatsApp alterou seu comportamento de nós [nodes do
protocolo] alguns meses atrás" e que o time do Baileys não capturou essa mudança a tempo, causando
falhas de parsing de protocolo — corrigidas numa release candidate posterior (rc13, 21/05/2026). É
um exemplo concreto do padrão: **a Meta muda algo sem aviso, o Baileys quebra, o Baileys corrige em
semanas**, não meses. Uma vulnerabilidade de segurança crítica também foi corrigida nesse período
(rc12, referenciada como GHSA-qvv5-jq5g-4cgg).

**Status de manutenção confirmado (agosto de 2026):** releases frequentes — v7.0.0-rc10 (06/05),
rc12, rc13 (21/05), rc14 e v6.7.24 (ambas 29/07/2026, a mais recente encontrada). O projeto segue
sendo mantido ativamente, com um processo de teste próprio (um "servidor de protocolo simulado"
chamado "Bartender" citado na documentação) rodando em cada PR — sinal de maturidade de engenharia
acima da média para um projeto de engenharia reversa.

### WPPConnect / whatsapp-web.js: uma segunda superfície de quebra

Diferente do Baileys, que só quebra quando a Meta muda o **protocolo binário**, WPPConnect e
whatsapp-web.js quebram por **dois motivos independentes**:

1. Mudança no protocolo da Meta (mesmo risco do Baileys, porque por baixo é a mesma rede).
2. Mudança na própria página web do WhatsApp Web — renomeação de funções internas injetadas,
   mudança de estrutura do bundle JS. **[primária, changelog oficial do WPPConnect —
   [wppconnect.io/blog/wppconnect/v2.0.0](https://wppconnect.io/blog/wppconnect/v2.0.0/)]** A
   versão 2.0.0 (30/04/2026) documenta ter precisado se adaptar a uma renomeação de `webpack` para
   `loader` numa dependência interna (`wa-js`) que o projeto usa para injetar código na página —
   exatamente o tipo de mudança que só afeta quem manipula o DOM/JS da página, não quem fala o
   protocolo diretamente.
3. Adicionalmente, o próprio Puppeteer lança breaking changes em suas versões maiores (v25.0.0,
   maio de 2026, migrou pacotes para ESM-only) — uma terceira dependência com ciclo de vida
   próprio para acompanhar.

### Evolution API: reestruturação organizacional em 2026

**[primária, GitHub e FAQ oficial —
[docs.evolutionfoundation.com.br/en/licensing/faq](https://docs.evolutionfoundation.com.br/en/licensing/faq)]**
Em 2026 o projeto se reorganizou sob a identidade "Evolution Foundation", com um novo módulo de
licenciamento e um requisito de "notificação de uso". A própria documentação afirma que **o
self-hosted continua gratuito** ("The community tier has no instance limit — run as many as you
need... There is no cap, no throttle and no per-instance fee") e que mudanças futuras de modelo
serão anunciadas com antecedência. Não é um sinal de instabilidade técnica, mas é um sinal de
**mudança organizacional** que vale monitorar — um projeto que está formalizando estrutura de
licenciamento/monetização tem mais superfície de decisão de negócio que pode, no futuro, afetar
os termos de uso gratuito.

---

## Pergunta 6 — Diferença entre Baileys, Evolution API e WPPConnect para este caso específico

| Eixo | Baileys (puro) | Evolution API | WPPConnect |
|---|---|---|---|
| Mecanismo | Protocolo nativo, WebSocket | Baileys + REST/webhook/DB por cima | Puppeteer + Chromium headless |
| Recurso (RAM) por conexão | Mais leve dos três | Baileys + Postgres + Redis (mais pesado que Baileys puro) | Mais pesado dos três (200-400MB só de Chromium) |
| Superfícies de quebra | 1 (protocolo Meta) | 2 (protocolo Meta + bugs próprios do wrapper) | 3 (protocolo Meta + DOM/JS do WhatsApp Web + Puppeteer) |
| Proximidade da correção quando a Meta muda algo | É a fonte — corrige primeiro | Depende do Baileys corrigir e do Evolution absorver a correção | Depende de duas comunidades (WPPConnect e Puppeteer) |
| Pronto para uso (REST, webhook, persistência) | Não — precisa construir | Sim — já vem com tudo | Sim — já vem com tudo |
| Comunidade/documentação em português | Nenhuma nativa (projeto internacional) | Grande, muito usado no Brasil | Grande, também muito usado no Brasil, origem brasileira |
| Estrutura organizacional 2026 | Comunidade aberta, sem entidade comercial visível | Reestruturado sob "Evolution Foundation", com módulo de licenciamento (self-host segue grátis) | Time ativo, sem sinal de reestruturação comercial encontrado |

**Para o caso da Lais Casa (um número, orçamento mínimo, agente já sendo construído sob medida,
prioridade em não cegar para mensagens de outro dispositivo):** Baileys puro, ou Evolution API por
cima dele se o time preferir não escrever a camada de REST/webhook/persistência do zero, são as
escolhas tecnicamente mais defensáveis. WPPConnect não tem nenhuma vantagem técnica clara sobre
Baileys para conectar **um único número** — a vantagem dele (rodar como navegador real, o que
alguns argumentam ser "mais parecido com um usuário real" para fins de detecção) é uma alegação de
comunidade sem fonte primária encontrada nesta pesquisa, e o research 023 já havia estabelecido que
esse eixo de risco de banimento está fora do escopo deste documento.

---

## Lacunas que a documentação não fecha

1. **Nenhum relato de primeira mão** de alguém tendo vinculado Baileys/Evolution API/WPPConnect
   como dispositivo **adicional** a um número WhatsApp Business Premium já em uso ativo por várias
   pessoas, confirmando que nada foi desconectado. É a lacuna mais importante do documento — a
   única forma de fechá-la é um teste real com a conta da loja (ou uma conta de teste equivalente,
   com vários dispositivos vinculados, antes de tocar na conta real).
2. **Se a conta da loja está no lote afetado pelo rollout de passkey de junho de 2026.** Isso não
   é verificável por pesquisa — só tentando vincular.
3. **Se `messages.upsert` com `fromMe: true` realmente chega para mensagens enviadas do WhatsApp
   para Windows especificamente**, via Baileys/whatsmeow/WPPConnect. A leitura de arquitetura
   aponta que sim; nenhum teste de primeira mão confirma. Se o projeto avançar para o caminho
   self-hosted, este é o primeiro teste técnico a rodar — antes até de qualquer decisão de
   arquitetura maior.
4. **Janela de histórico sincronizável pelo Baileys** (equivalente aos "6 meses / 14 dias" do
   Coexistence oficial) não tem um número documentado encontrado nesta pesquisa.
5. **O que acontece a uma mensagem recebida durante o tempo em que o processo self-hosted está
   fora do ar** (reconecta e sincroniza depois, ou perde o evento em tempo real) não foi confirmado
   para nenhuma das três bibliotecas.
6. **Se a passkey do WebAuthn é ou não permanente/definitiva.** A leitura das issues primárias
   (abertas, sem confirmação de que o problema seja definitivo) contradiz a alegação de uma fonte
   comercial (`whapi.cloud`) de que é "permanentemente quebrado". A verdade provavelmente está
   entre os dois — mas nenhuma fonte neutra confirma qual será o desfecho.
7. **Custo de engenharia relativo** entre montar a camada própria sobre Baileys puro versus usar
   Evolution API pronto não foi medido nesta pesquisa, só inferido pela diferença de escopo dos
   dois projetos.

---

## Recomendação (não-vinculante — decisão final é do dono do projeto)

A pergunta que o dono do projeto trouxe — hospedar o próprio agente e ligar por dentro do número
que a loja já usa, sem pagar parceiro — é **tecnicamente coerente com como o protocolo multi-device
do WhatsApp funciona**: um cliente self-hosted que fala esse protocolo diretamente é, estruturalmente,
só mais um dispositivo vinculado, e adicionar um dispositivo não deveria, por design documentado da
própria Meta, desconectar os que já estão lá. Essa é a metade otimista da resposta.

A metade que pede cautela: **esta pesquisa não encontrou ninguém que tenha feito exatamente isso —
conectar como dispositivo extra numa conta Premium já ocupada — e confirmado que funcionou.** E o
momento em que esta pesquisa foi feita coincide com uma instabilidade real e não resolvida do lado
da Meta (o requisito de passkey para vincular dispositivo novo), que pode simplesmente impedir a
tentativa, de forma imprevisível, antes de chegar a qualquer pergunta sobre slots.

**Se o dono do projeto quiser avançar por este caminho, o primeiro passo não é decisão de
arquitetura — é um teste de meia hora, no mesmo espírito do que o ticket 019 já planeja para
Coexistence:** subir um Baileys (ou Evolution API) num ambiente de teste, tentar vincular como
dispositivo adicional a um número com vários companions já ativos (idealmente **não** o número
real da loja na primeira tentativa — um número de teste com o mesmo arranjo de dispositivos, se
possível), e observar três coisas: (1) o pareamento completa ou trava no passkey; (2) os
dispositivos existentes continuam conectados depois; (3) uma mensagem mandada de um companion tipo
"WhatsApp para Windows" gera ou não o evento `messages.upsert` no lado do Baileys — essa última é
a que mais interessa ao projeto, porque é a resposta que o Coexistence oficial não consegue dar.

**Se esse teste confirmar as três coisas — conecta, não desconecta ninguém, e vê o Windows —**, o
caminho self-hosted deixa de ser só "mais barato que Coexistence" e passa a ser, tecnicamente,
**melhor** que Coexistence no ponto que mais preocupa o projeto hoje (o ponto cego do ticket 019),
e a decisão vira uma comparação puramente entre custo de mensalidade de BSP versus risco de
banimento (já coberto no research 023) e custo de manutenção de infraestrutura própria (coberto
aqui). **Se o teste travar no passkey ou desconectar algo**, a resposta muda para "não agora, com a
loja usando esse arranjo específico de dispositivos" — sem descartar o caminho para sempre, porque
o rollout de passkey é descrito como faseado, não definitivo.
