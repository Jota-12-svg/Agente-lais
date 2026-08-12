---
ticket: "016"
title: O que causa banimento de verdade — gatilhos técnicos e desenho de comportamento seguro
tipo: research
data: 2026-08-11
---

# Research — O que dispara banimento na camada de protocolo, e como desenhar o agente para reduzir o risco

Ticket: [016](../tickets/016-escolher-parceiro-meta.md) · Investigado em 2026-08-11 · Aprofunda,
com fonte técnica de primeira mão, o que o [research 023](023-comunidade-whatsapp-ia-baixo-custo.md)
já havia levantado em nível qualitativo (banimento concentrado em disparo em massa, mas com um
relato consistente de banimento em uso só-reativo — issue do whatsmeow #810). Cruza com
[research 024](024-arquitetura-self-hosted-whatsapp.md) (dispositivo adicional no número atual de
produção — aqui o custo de um banimento é a operação inteira, não um número isolado) e
[research 025](025-numero-dedicado-com-acesso-da-loja.md) (número reaproveitado tende a começar em
posição melhor que número novo).

> **Base desta investigação.** Fui atrás da própria thread completa da issue #810 do whatsmeow (via
> API do GitHub, não só a página renderizada, que trunca comentários) e de issues correlatas nos
> repositórios oficiais de Baileys e whatsmeow — incluindo uma investigação técnica aberta por um
> **membro da equipe mantenedora do Baileys** (`purpshell`, `author_association: MEMBER`) sobre o
> mecanismo exato por trás do erro `463`, que é o achado central deste documento. Onde a fonte é
> comentário de comunidade sem confirmação de mantenedor, ou blog comercial, isso está **marcado
> explicitamente**, como nos research anteriores. **Nenhuma fonte encontrada aqui — nem lá —
> publica uma taxa de banimento medida e verificável.** Toda vez que um número percentual aparece
> abaixo, ele vem de quem vende algo, e está sinalizado.

---

## Resposta direta à hipótese do dono do projeto

> "Banimento só acontece se o agente for ativo (dispara para quem não chamou primeiro). Se for só
> reativo, não corre risco."

**Parcialmente certa, e a parte errada tem agora uma explicação técnica concreta, não só um relato
isolado.** A hipótese acerta o alvo real que a Meta persegue — o achado mais forte desta pesquisa,
uma investigação de protocolo feita por um mantenedor do Baileys (detalhada na seção
["O achado central"](#o-achado-central-o-erro-463-e-o-sistema-de-tokens-de-privacidade) abaixo),
confirma que o WhatsApp genuinamente distingue, na camada de protocolo, entre "mensagem para
alguém com quem você já tem uma relação estabelecida" e "alcançar alguém novo" — e só a segunda
categoria é rate-limitada. Isso é, literalmente, a mesma distinção que a hipótese do dono do
projeto propõe.

**Mas há uma peça que a hipótese não previa: os próprios clientes não-oficiais (Baileys, e
provavelmente whatsmeow pelo mesmo mecanismo) historicamente falharam em implementar corretamente
o sinal que prova essa relação estabelecida** — um sistema de tokens de privacidade
(`tctoken`/`cstoken`) que o WhatsApp Web oficial anexa a cada mensagem enviada. Sem esse token, o
servidor da Meta conta a mensagem como "alcançar alguém desconhecido" **mesmo quando, do ponto de
vista humano, é uma resposta pura a quem chamou primeiro**. Isso explica, com uma causa técnica
verificável (não só um padrão estatístico observado), por que a issue do whatsmeow relatou
banimento em uso estritamente reativo: não é que "responder" seja inerentemente arriscado — é que
a biblioteca não estava provando ao WhatsApp que a resposta era, de fato, uma resposta.

**A implicação prática:** a hipótese do dono do projeto é a heurística certa para desenhar o
comportamento do agente (nunca iniciar contato é, sim, a decisão de maior impacto disponível), mas
**não é uma garantia**, por três razões independentes que esta pesquisa confirma:

1. **Lacuna de implementação nas bibliotecas.** O suporte a `tctoken` foi mesclado no Baileys em
   abril de 2026; o `cstoken` complementar segue como *pull request* aberto, não mesclado, no
   momento desta pesquisa. Ou seja, mesmo hoje, o comportamento correto **não está garantido por
   padrão** — depende da versão da biblioteca e de como o agente é implementado por cima dela.
2. **Idade da conexão importa, de forma mensurável.** Uma investigação de comunidade com
   comparação controlada (mesma infraestrutura, mesma versão, única variável: idade da sessão)
   achou reach-out timelock consistente em sessões recém-vinculadas e nenhuma ocorrência numa
   sessão de ~4 semanas — reforçando, com uma fonte técnica melhor que qualquer uma do research
   025, que número/sessão novos carregam risco extra mesmo sem nenhum comportamento agressivo.
3. **Não é uma imunidade permanente.** Um relato independente descreve bots rodando havia **3
   anos sem nunca ter sido banidos**, subitamente banidos na mesma semana — sinal de que a Meta
   ajusta o sistema de detecção ao longo do tempo, e "histórico limpo" reduz risco na média, não o
   zera.

---

## O achado central: o erro 463 e o sistema de tokens de privacidade

**[primária, investigação técnica de um mantenedor do Baileys — [WhiskeySockets/Baileys#2441 —
"\[INVESTIGATION\] 463 error investigation"](https://github.com/WhiskeySockets/Baileys/issues/2441),
aberta por `purpshell` (`author_association: MEMBER`), com validação de código-fonte, não
especulação]**

Esta é a peça de engenharia mais concreta encontrada em toda a pesquisa deste projeto sobre
banimento — o único caso em que alguém abriu o código-fonte ofuscado do WhatsApp Web e mostrou o
mecanismo, em vez de descrever um padrão observado de fora.

### O que é o erro 463

Contas — sobretudo contas já banidas e depois desbanidas — passaram a receber um erro `463` ao
enviar mensagem ou fazer chamada. **O WhatsApp esconde deliberadamente a referência a esse código
no código do cliente**, para dificultar que desenvolvedores de bibliotecas não-oficiais entendam o
que está acontecendo (citação direta da issue: *"WhatsApp deliberately hid mentions of the `463`
errors from client code to prevent people from understanding the error"*).

Rastreando o código-fonte, `purpshell` identificou que `463` corresponde a
`NackCallerReachoutTimelocked`, dentro de `WAWebCallCollection.NackErrorCode` — um **"Reach-out
Time-lock"**: uma trava de taxa, baseada em tempo, sobre o envio de mensagens ou chamadas para
**pessoas desconhecidas**. Existe até uma consulta GraphQL interna
(`WAWebMexFetchReachoutTimelockJobQuery`) que informa ao cliente oficial se a conta está sob essa
trava e por quanto tempo ainda.

### O ponto central para a hipótese do dono do projeto

Citação direta da issue, que é o núcleo de todo este research:

> "The problem with Baileys and whatsmeow users is **not** that we are hitting this limit of
> unknown people. It is that **the absence of `<tctoken>`s and `<cstoken>`s are actually adding up
> the rate-limit of 'reaching out' and making Baileys/whatsmeow/cobalt/others contribute to this
> limit unwillingly.** [...] it seems like the server on WhatsApp's end is counting any outgoing
> `<message>` or `<call>` with missing privacy fields (tc/cstokens) as 'reaching out' and is
> enforcing time-based limits for those actions."

Em outras palavras: **o WhatsApp não está detectando "isto é um bot respondendo" como
comportamento suspeito por si só.** Ele está contando mensagens sem o token de privacidade correto
como se fossem contato frio com desconhecido — **mesmo quando o destinatário chamou primeiro**,
porque o cliente não-oficial não anexou a prova protocolar de que a relação já existe.

### Como o token de relação funciona, tecnicamente

Um contribuidor complementou com engenharia reversa própria (**[primária, relato técnico direto,
mesma thread]**, `Darkratos`):

- Quando não há `tctoken`, o WhatsApp Desktop oficial envia um nó `<privacy>9EE965</privacy>`
  (valor fixo observado, não confirmado se varia por conta) junto com a mensagem.
- Quando o destinatário responde, o remetente recebe um `<notification>` com o `privacy_token`
  real, que passa a ser reutilizado dali em diante — **o token nasce exatamente no momento em que
  a outra pessoa responde**, o que é uma prova protocolar quase literal de "esta é uma conversa de
  mão dupla", não uma mensagem fria.
- `purpshell` confirmou, testando em ambiente controlado, que a função `canSendMsgWhileTimelocked`
  do próprio WhatsApp Web permite continuar enviando, mesmo sob a trava, para: você mesmo, contas
  empresariais, contas de suporte, bots — **e qualquer chat que já tenha um `tctoken` válido**. A
  trava bloqueia especificamente **chats novos sem token**. Isto é a confirmação mais forte
  encontrada nesta pesquisa de que a distinção "conversa já estabelecida" vs. "contato novo" é
  real na arquitetura da Meta, não uma teoria de comunidade.

### Por que isso ainda não está resolvido

- `tctoken` (ciclo de vida completo — expiração, reemissão, poda) foi mesclado no Baileys em
  **[PR #2339](https://github.com/WhiskeySockets/Baileys/pull/2339), 24/04/2026** — mesclado.
- `cstoken` (o token auto-computado usado no **primeiro contato**, quando ainda não existe
  `tctoken`) está em **[PR #2438](https://github.com/WhiskeySockets/Baileys/pull/2438) — aberto,
  não mesclado** no momento desta pesquisa.
- Um operador de um gateway comercial baseado em Baileys (`kobie3717`, autor do middleware
  `baileys-antiban` citado adiante — **[secundária, relato operacional de terceiro, não
  confirmado de forma independente]**) reportou em produção que o orçamento de reach-out timelock
  **continua acumulando mesmo com tc/cstoken presentes**, se o destinatário "não foi conhecido
  através de um handshake apropriado" — sugerindo que ter o código mesclado não é suficiente por
  si só; a sequência exata de eventos (receber a notificação de `privacy_token` antes de
  responder) também importa, e ainda não está totalmente mapeada nem pelos próprios
  contribuidores.
- Em **agosto de 2026** (mesmo mês desta pesquisa), um contribuidor (`Darkratos`) relatou um
  padrão novo, ainda em investigação: receber uma notificação MEX do tipo
  `NotificationUserReachoutTimelockUpdate` correlaciona com o dispositivo sendo **desconectado
  à força** logo em seguida (`401`, `Stream Errored (conflict)`, `device_removed`) — ou seja, a
  trava de reach-out pode escalar para derrubar a sessão inteira, não só bloquear novas mensagens.
  **Isto é o estado mais recente e não fechado da investigação — não uma conclusão.**

### Um caso de diagnóstico controlado que apoia "idade da sessão importa"

**[secundária, mas com metodologia de comparação controlada — comentário na mesma thread,
`ZzJordan`, 22/07/2026]** Um operador da Evolution API (que roda Baileys por baixo) descreveu
mensagens 1:1 aceitas pela API (`status: PENDING`, ID de mensagem real) mas nunca entregues, sem
erro visível em nenhum log — só apareceu ao ativar `LOG_BAILEYS=trace` e ver
`<ack ... error='463' />`. O diagnóstico:

> "Our existing instance (session linked ~4 weeks earlier) was completely unaffected. Every newly
> linked session failed — same host, same image digest, same env vars, same instance settings.
> **The variable is the age of the session**, which does not appear in any config file."

Esta é a confirmação mais concreta encontrada em toda a pesquisa deste projeto (incluindo research
025) de que **idade da sessão/número reduz risco de forma real e observável** — não é só uma
heurística de blog, é uma comparação A/B com uma única variável controlada, ainda que feita por um
único operador, não replicada de forma independente.

### O contraponto que impede otimismo total

**[primária, relato direto — [WhiskeySockets/Baileys#1869 — "High number of bans on
WhatsApp!"](https://github.com/WhiskeySockets/Baileys/issues/1869)]**

> "The most impressive thing is that two bots had been using Baileys for over 3 years and had
> never been banned, and now they're banned."

Isto contradiz a leitura de que histórico limpo é proteção permanente: a Meta muda o sistema de
detecção ao longo do tempo (o mesmo padrão já visto no rollout de passkey do research 024), e
contas antigas, estáveis, sem incidente prévio, foram banidas numa mudança de política/detecção,
não por terem feito algo novo de errado.

---

## Outros fatores de risco, por camada

### Volume e mensagem fria (confirmado, o gatilho mais consistente de todos)

**[primária, múltiplos relatos diretos]** Já mapeado no research 023 (whatsapp-web.js #532,
Evolution API #1870/#439/#2298). Reforçado aqui por duas discussões do próprio repositório do
whatsmeow:

- **[Discussion #199 — "Whatsapp Ban"](https://github.com/tulir/whatsmeow/discussions/199)**:
  um comentarista (`hrizal`) lista os gatilhos que a comunidade associa a banimento: "muitas
  pessoas te bloquearam", "você mandou muitas mensagens para quem não tem seu número na agenda",
  "você criou muitos grupos com gente que não tem seu número salvo", "você mandou a mesma
  mensagem para muita gente", "você mandou muitas mensagens para uma lista de transmissão" —
  **[secundária, lista de comunidade sem citação de fonte oficial, mas consistente com a
  linguagem oficial da Meta abaixo]**.
- No mesmo tópico, um usuário (`roniahmad`) relatou banimento rápido depois de mandar mensagem
  fria para 30 contatos não salvos, **mesmo com 30 segundos de atraso entre cada uma** — mostra
  que **atraso sozinho não neutraliza mensagem fria em volume**; o problema é o destinatário
  desconhecido, não a velocidade.
- Em contraste, outro usuário (`wxnnvs`) relatou rodar um autoresponder simples de "ping-pong" por
  período prolongado sem banimento — caso de sucesso reativo, dado no mesmo tom não verificável
  dos casos de fracasso.
- **[Discussion #567 — "WhatsApp has improved the ban rules for the message automation
  system"](https://github.com/tulir/whatsmeow/discussions/567)**: o mesmo `hrizal` relatou
  banimento após **apenas 5 mensagens via WhatsApp Web oficial** (não uma biblioteca não-oficial)
  — indício de que o gatilho de fundo (destinatário desconhecido, não o cliente usado) é o que
  importa, consistente com o mecanismo do erro 463 acima.

**[primária, documentação oficial da Meta — [WhatsApp Help Center, "Envio não autorizado de
mensagens automáticas ou em massa"](https://faq.whatsapp.com/5957850900902049)]** confirma a
moldura oficial:

> "\[WhatsApp's products\] are not intended for bulk or automated messaging" — sempre foi violação
> dos Termos de Serviço; a Meta usa "machine learning systems" para achar contas abusivas, e desde
> **7 de dezembro de 2019** também age judicialmente contra quem promove publicamente ferramentas
> para violar os Termos.

E uma frase que merece destaque, porque desfaz um medo razoável mas equivocado: **"receiving many
messages at once will not result in an account ban."** Volume de mensagens **recebidas** (a loja
sendo procurada por muita gente) não é sinal de risco — só volume **enviado** para desconhecidos.

### Número de telefone inexistente / não registrado no WhatsApp

**[primária, relato direto — [WhiskeySockets/Baileys#2441, comentário de
`azeezeladl`](https://github.com/WhiskeySockets/Baileys/issues/2441#issuecomment)]**: enviar
mensagem para um número que **não existe no WhatsApp** também consome o orçamento de reach-out e
pode acionar `RESTRICT_ALL_COMPANIONS`/463. Mitigação sugerida no próprio comentário: sempre
validar com `sock.onWhatsApp(jid)` antes de enviar. **Relevância direta para a Lais Casa:** um
número de cliente digitado errado na qualificação, ou um contato que trocou de número, é o tipo de
evento cotidiano de uma loja pequena — não é hipotético.

### Ações de grupo consomem o mesmo orçamento

**[primária, relato direto, mesma thread]** `zhamghaoran` relatou 463 ao **adicionar pessoas a um
grupo**, não só ao mandar mensagem — a trava de reach-out não é exclusiva de mensagem 1:1.
Provavelmente de baixa relevância para o desenho atual do agente (que não gerencia grupos), mas
vale registrar caso o escopo mude.

### Cache de metadado de grupo (achado operacional, baixo risco para este projeto)

**[primária, documentação oficial de configuração do Baileys, via busca — não confirmado com
citação textual exata nesta pesquisa]** A documentação recomenda fornecer um cache
(`cachedGroupMetadata`) ao socket, porque requisições repetidas de metadado de grupo colaboram
para limite de taxa. Relevância marginal para o agente da Lais Casa (não opera em grupo).

### Loop de reconexão / instabilidade de infraestrutura

**[secundária, consolidação de blogs técnicos, sem confirmação de mantenedor]** Reconectar
repetidamente (sessão caindo e voltando) é citado como padrão que os sistemas de detecção também
observam como "conexão incomum". Não há confirmação de mantenedor, mas é plausível dado que o
achado do 463 mostra que o WhatsApp já monitora eventos de sessão (o próprio 401/`device_removed`
do achado de `Darkratos` é, em si, um evento de conexão). **Leitura prática:** hospedagem estável,
sem quedas frequentes, não é só requisito operacional (já apontado no research 024) — pode também
ser requisito de risco.

### Ritmo sobre-humano, ausência de "digitando" e conteúdo repetido/templated

**[secundária/heurística de comunidade, sem confirmação técnica de protocolo equivalente ao
achado do 463]** É o conjunto de recomendações mais repetido em toda a comunidade — presença
`composing` antes de enviar, variação de tempo de resposta, variação de texto — mas **nenhuma
fonte desta pesquisa confirma um mecanismo técnico equivalente ao dos tokens de privacidade para
esses sinais especificamente**. O comentário mais próximo de uma fonte com peso é de `purpshell`
(mantenedor do Baileys) dizendo, antes de abrir a investigação do 463, que o problema da issue
#810 era "mostly a behavioral issue, not a WAM issue" — mas essa frase é anterior à própria
investigação do 463 que ele mesmo abriu depois, e não foi revisitada publicamente à luz do que foi
descoberto. Ferramentas de terceiro como o `baileys-antiban`
([kobie3717/baileys-antiban](https://github.com/kobie3717/baileys-antiban)) implementam simulação
de digitação, jitter gaussiano, variação de fraseado e "ritmo circadiano" com a alegação de que
"WhatsApp's ML flags accounts with 'too perfect' patterns" — **mas o próprio README não cita
nenhuma fonte, estudo ou confirmação de mantenedor para essa alegação específica; é a leitura de
quem constrói e vende (ainda que como projeto aberto e gratuito) uma ferramenta para mitigar
exatamente isso**. Tratar como heurística plausível, não como fato confirmado.

### IP de datacenter / geografia do servidor

**[secundária, convergência de múltiplos blogs técnicos, sem fonte primária encontrada nesta
pesquisa nem na anterior]** A alegação de que IP de datacenter (VPS) é sinalizado e IP
residencial/4G "sobrevive" aparece de forma consistente em vários blogs e no próprio
`baileys-antiban`, mas nenhuma issue de mantenedor consultada nesta pesquisa confirma ou nega isso
tecnicamente. Fica no mesmo status já registrado no research 023: hipótese de comunidade
recorrente, não mecanismo confirmado.

### Múltiplas sessões/conexões simultâneas do mesmo cliente não-oficial

**[sem confirmação, pergunta em aberto]** Um usuário (`crsolver`) perguntou diretamente na issue
#810 se o problema acontece "porque uma máquina está gerenciando várias contas" — a pergunta ficou
sem resposta na thread. Não há dado desta pesquisa que confirme ou refute esse eixo especificamente
para o caso de uma única conexão (que é o caso da Lais Casa).

### Meta Verified reduzindo avisos

**[primária quanto à origem do relato — é o próprio autor da issue #810 relatando o que viu; mas o
relato em si não é verificável de forma independente]** Repetindo o que o research 023 já havia
registrado: alguns clientes relataram que ativar Meta Verified na conta comercial fez os avisos
pararem. Único relato, não replicado, não incluído em nenhuma outra fonte consultada.

### Política de proibição a chatbots de propósito geral (janeiro de 2026)

**[secundária, múltiplas fontes de cobertura convergentes, mas não a política publicada lida linha
a linha]** Esta pesquisa confirma um ponto que precisa de correção de escopo em relação ao
research 023: a proibição de chatbots de propósito geral (ChatGPT, Perplexity e afins dentro do
WhatsApp) é uma política da **WhatsApp Business Platform — ou seja, da Cloud API oficial**, mirando
provedores de IA que vendem o chatbot como produto em si. **Ela não é, tecnicamente, a mesma
categoria de risco de um cliente não-oficial conectado como dispositivo vinculado ao app comum** —
o app comum não tem esse conceito de "plataforma de negócio" nem esse enforcement específico. Não
é irrelevante (se o projeto migrar para Cloud API no futuro, essa política volta a valer, e o
Agente Lais, sendo qualificador de escopo fechado, se encaixaria na categoria permitida), mas não
se aplica da mesma forma ao caminho self-hosted no app comum que este documento avalia.

---

## Conta com histórico vs. número novo — o que esta pesquisa acrescenta ao research 025

O research 025 já apontava, de fontes secundárias, que número reaproveitado/com uso humano
prolongado tende a começar em posição melhor que número novo/VoIP. Esta pesquisa acrescenta duas
peças de evidência mais fortes, uma a favor e uma contra a leitura absoluta:

- **A favor, com metodologia melhor que qualquer coisa do research 025:** o caso `ZzJordan`
  (comparação controlada, mesma infraestrutura, única variável = idade da sessão, sessão de 4
  semanas sem incidente vs. sessão nova falhando de forma consistente) — ver
  [seção acima](#um-caso-de-diagnóstico-controlado-que-apoia-idade-da-sessão-importa).
- **Contra a leitura de imunidade permanente:** o caso `SinhoGamer` (bots de 3 anos sem nunca
  terem sido banidos, banidos na mesma semana que vários outros) — histórico reduz a *taxa* de
  problema, não a *elimina*, e a Meta muda o sistema de detecção ao longo do tempo.
- Não há, nesta pesquisa nem na anterior, nenhuma fonte que confirme especificamente se conectar
  como dispositivo vinculado a uma conta **WhatsApp Business Premium, com anos de uso humano real,
  já com múltiplos dispositivos ativos** (o cenário exato da Lais Casa, mapeado no research 024)
  se comporta melhor que uma sessão isolada nova. A leitura mais honesta: os dois achados acima
  são sobre *idade da sessão do cliente não-oficial em si*, não sobre *idade da conta humana por
  trás dela* — são coisas relacionadas, mas não confirmadas como idênticas. É plausível, por
  inferência, que uma conta com anos de histórico humano real dilua ainda mais o peso relativo de
  uma sessão nova recém-adicionada (mais sinal "bom" acumulado para compensar), mas **isso não foi
  testado nem relatado por ninguém nesta pesquisa** — seria, junto com o teste já recomendado no
  research 024 (conectar sem desconectar, ver mensagens de outros dispositivos), o terceiro item a
  observar num teste real: se a conta desta loja é onde a sessão nova nasce, monitorar
  especificamente por sinais de 463 nas primeiras semanas.

---

## Checklist acionável de comportamento do agente

Cada item traz a força da fonte entre colchetes: **[protocolo confirmado]** = mecanismo técnico
verificado em código-fonte por um mantenedor; **[relato direto]** = issue/discussão com relato de
primeira mão, sem confirmação de mecanismo; **[heurística de comunidade]** = recorrente, plausível,
sem verificação técnica; **[comercial]** = fonte que vende algo relacionado ao próprio conselho.

### Regras de alta confiança (agir sobre elas primeiro)

1. **Nunca iniciar conversa fora de resposta a mensagem recebida.** *(A regra em si é a que a
   hipótese do dono do projeto já propunha.)* **[protocolo confirmado + relato direto]** —
   confirma tanto o mecanismo do erro 463 (`tctoken` só existe depois que o outro lado responde)
   quanto os relatos de banimento em disparo (research 023 + `hrizal`/discussion #199).
2. **Garantir que a biblioteca usada implementa o ciclo de vida completo de `tctoken`/`cstoken`
   antes de ir para produção — não assumir que a versão atual do Baileys resolve isso por
   padrão.** **[protocolo confirmado]** — `cstoken` (o token de primeiro contato) ainda não estava
   mesclado no momento desta pesquisa (PR #2438 aberto). Verificar a versão exata e, se possível,
   testar o fluxo de "primeira mensagem de um contato novo → resposta do agente" observando se
   aparece erro 463 nos logs (`LOG_BAILEYS=trace` no caso do Baileys/Evolution API).
3. **Validar o número antes de qualquer envio automatizado (`onWhatsApp`/equivalente), inclusive
   em respostas.** **[relato direto]** — número inexistente/não registrado consome o mesmo
   orçamento de reach-out que mensagem fria, segundo relato de `azeezeladl`. Relevante porque a
   base de contatos da loja (planilha, número digitado errado) não é perfeitamente limpa.
4. **Priorizar número/sessão com histórico — reforça o já indicado no research 025, agora com
   comparação controlada a favor.** **[relato direto, com metodologia de comparação]** — se o
   caminho escolhido envolver ligar o agente ao número atual de produção (research 024), a sessão
   do próprio agente ainda "nasce nova" ao ser vinculada, mesmo que o número seja antigo; monitorar
   ativamente por sinais de 463/restrição nas primeiras semanas dessa sessão específica, não só do
   número.
5. **Monitorar ativamente por eventos de erro 463 e por desconexão forçada
   (`device_removed`/401) nos logs, e ter um caminho de escalonamento humano quando aparecerem.**
   **[protocolo confirmado, achado ainda em aberto até a data desta pesquisa]** — o achado mais
   recente (`Darkratos`, agosto de 2026) descreve a trava de reach-out escalando para logout
   forçado da sessão; ainda não está claro se isso é reversível sem intervenção, o que é
   exatamente o tipo de falha que não pode ser descoberta pela primeira vez em produção no número
   principal da loja.

### Regras de confiança moderada (plausíveis, valem o custo de implementar, mas não têm mecanismo confirmado)

6. **Nunca mandar a mesma mensagem/template idêntico para destinatários diferentes; variar
   fraseado.** **[relato direto de comunidade + linguagem oficial da Meta sobre bulk messaging]** —
   aparece tanto na lista de `hrizal` quanto na moldura oficial de "bulk/automated messaging" do
   Help Center.
7. **Jitter no tempo de resposta — nunca responder abaixo de alguns segundos, variar o intervalo,
   nunca em cadência fixa.** **[heurística de comunidade, sem mecanismo confirmado]** — não há
   fonte de protocolo equivalente ao achado do 463 para este sinal especificamente; ainda assim, é
   citado de forma consistente o suficiente, e custa pouco implementar, para entrar na lista.
8. **Simular presença (`composing`) antes de responder, com duração compatível com o tamanho da
   mensagem.** **[heurística de comunidade]** — mesmo status do item anterior: sem confirmação de
   mecanismo, mas de baixo custo e alta repetição na comunidade.
9. **Nunca processar mais de um atendimento por vez de forma que pareça simultaneidade
   sobre-humana (múltiplas respostas instantâneas em paralelo).** **[heurística de comunidade]** —
   consistente com o modelo de negócio real da Lais Casa (`Atendimento` já é a unidade de trabalho
   no `CONTEXT.md`; a loja atende uma conversa de cada vez por natureza), então esta regra
   praticamente já nasce satisfeita pelo desenho do domínio — vale garantir que a implementação não
   introduza paralelismo artificial (ex.: fila de mensagens processada em lote).
10. **Manter a hospedagem estável, sem quedas/reconexões frequentes, com IP de saída consistente
    com a geografia do número (Brasil).** **[heurística de comunidade para IP; achado real de
    protocolo para eventos de sessão via o 463/`device_removed`]** — já recomendado no research
    023; reforçado aqui porque agora há confirmação de que eventos de sessão (não só de mensagem)
    fazem parte do que a Meta rastreia.
11. **Uma única sessão/dispositivo do agente conectada por vez ao número, sem múltiplas instâncias
    não-oficiais simultâneas.** **[pergunta em aberto, sem resposta confirmada]** — a pergunta foi
    feita publicamente (`crsolver`) e ficou sem resposta; incluído por precaução, não por
    confirmação.

### Regra que a hipótese do dono do projeto já cobre corretamente, mas que vale reafirmar com a ressalva certa

12. **Reativo-apenas continua sendo, de longe, a decisão de maior impacto disponível — mas não é
    suficiente sozinha.** Ela precisa ser somada às regras 2 e 3 (implementação correta do token de
    relação e validação de número) para funcionar como o mecanismo de protocolo realmente espera.
    Reativo-apenas **sem** essas duas é, pelo achado desta pesquisa, o cenário mais plausível para
    explicar por que contas puramente reativas já foram banidas (whatsmeow #810) — não porque a
    regra estava errada, mas porque a biblioteca não estava cumprindo a parte dela.

---

## Lacunas que esta pesquisa não fecha

1. **Nenhuma taxa de banimento medida e verificável existe**, nem aqui nem no research 023 — só
   estatísticas autodeclaradas por quem vende algo (Z-API, blogs de consultoria, o próprio
   `baileys-antiban`).
2. **Se o suporte a `cstoken` (PR #2438) foi mesclado depois da data desta pesquisa**, e se isso
   muda o quadro de forma relevante, precisa ser reverificado antes de qualquer decisão final —
   este é o tipo de coisa que muda rápido no repositório.
3. **Não há confirmação de que o mecanismo do 463 seja idêntico no whatsmeow** (só em Baileys foi
   diretamente investigado no código-fonte); a suposição de que afeta os dois por igual vem da
   própria issue #810 ("também reportado com Baileys") e do fato de os dois falarem o mesmo
   protocolo, mas não é uma confirmação de código para o whatsmeow especificamente.
4. **Não foi possível confirmar se conectar como dispositivo adicional numa conta com anos de
   histórico humano real dilui o risco da sessão nova do agente**, além do que já foi encontrado
   sobre idade da sessão isolada (ver seção específica acima) — esta é a lacuna mais relevante para
   a decisão concreta da Lais Casa, e só se fecha testando.
5. **Nenhuma fonte consultada mede o efeito real de jitter, simulação de presença ou variação de
   texto separadamente do efeito de evitar contato frio** — é possível que essas práticas
   contribuam pouco isoladamente, e a pesquisa não tem como separar o efeito de cada uma.
6. **O escopo exato da política de chatbots de propósito geral de janeiro de 2026 sobre a Cloud
   API** segue não confirmado linha a linha na política publicada (mesma lacuna do research 023).

---

## Recomendação (não-vinculante — a decisão é do dono do projeto)

A hipótese do dono do projeto — "só ativo bane, reativo é seguro" — está **certa como norte, errada
como garantia absoluta**. O achado mais importante desta pesquisa é que existe, sim, uma explicação
técnica real e verificável em código para o caso que parecia contradizê-la (o banimento reativo
relatado no whatsmeow #810): a diferença entre "conversa estabelecida" e "contato novo" **existe de
verdade** na arquitetura da Meta — só que ela é sinalizada por um token de protocolo específico
(`tctoken`/`cstoken`) que as bibliotecas não-oficiais **nem sempre implementam corretamente**, e
que, mesmo quando implementado, depende de uma sequência de eventos (receber a notificação do token
antes de responder) que ainda está sendo mapeada pela própria comunidade que mantém essas
bibliotecas.

Isso muda a pergunta de forma prática. Não é mais "reativo é seguro, sim ou não" — é: **"a
implementação específica que o agente vai usar consegue provar ao WhatsApp, no protocolo, que cada
resposta é resposta a algo — e o que acontece nas primeiras semanas de uma sessão nova, mesmo que o
número seja antigo?"** Essa é uma pergunta testável, não uma aposta às cegas: rodar o agente contra
uma conta de teste (não a da loja), mandar mensagens de contatos novos e existentes, e observar se
aparece erro 463 nos logs em modo trace — no mesmo espírito dos testes já recomendados nos research
022/024 para os outros pontos em aberto da arquitetura self-hosted.

**Checklist mínimo, para rodar no número de produção da loja com risco reduzido a um nível que eu
consideraria administrável** — combinando as regras de alta confiança da seção anterior:

1. Reativo-apenas, sem exceção (a base, que o dono do projeto já tinha certo).
2. Biblioteca com suporte confirmado e testado ao ciclo de tctoken (e, quando disponível e
   mesclado, cstoken) — não assumir, verificar.
3. Validação de número antes de qualquer envio.
4. Monitoramento ativo de erro 463 e de desconexão forçada, com escalonamento humano imediato se
   aparecerem — não descoberto pela primeira vez em produção.
5. Um atendimento por vez, sem paralelismo artificial — que o desenho do domínio da Lais Casa já
   favorece por natureza.
6. Hospedagem estável, IP brasileiro, sem reconexões frequentes.
7. Jitter de resposta e simulação de `composing` — baixo custo, heurística plausível, mesmo sem
   mecanismo confirmado.

Com esse conjunto, a leitura desta pesquisa é que o risco deixa de ser "aposta às cegas" e passa a
ser "risco residual administrável, testável antes de ir para o número real" — mas **nunca chega a
zero**, e o caso dos bots de 3 anos banidos numa mudança de política (`SinhoGamer`) é o lembrete de
que isso vale mesmo depois de meses de operação limpa. Se o padrão de risco residual que sobra
depois desse checklist ainda for maior do que o dono do projeto está disposto a aceitar **no número
de produção especificamente** (diferente de um número descartável, onde o research 025 já havia
concluído que a aposta é mais defensável), a alternativa que continua sem nenhum risco de
banimento vindo da própria Meta é a já apontada no research 023: Cloud API oficial self-service,
que paga em trabalho de engenharia e perda de Coexistence o que economiza em risco.
