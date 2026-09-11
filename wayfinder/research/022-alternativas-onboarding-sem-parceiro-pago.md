---
ticket: "016"
title: Existe caminho para o agente entrar na Cloud API sem mensalidade de parceiro?
tipo: research
data: 2026-08-11
---

# Research — Alternativas de onboarding sem parceiro pago

Ticket: [016](../tickets/016-escolher-parceiro-meta.md) · Investigado em 2026-08-11 · Reabre um
ponto do caminho fechado em [research 005](005-integracao-whatsapp.md) e complementa o
comparativo de [research 016](016-parceiro-meta-onboarding.md) (360dialog ≈€49/mês, Take Blip
R$299/mês, Zenvia mais cara ainda).

> **Base desta investigação.** Fontes primárias sempre que existiam:
> `developers.facebook.com`, `faq.whatsapp.com` (WhatsApp Help Center) e `business.whatsapp.com`
> / `whatsapp.com`. O WhatsApp Help Center (`faq.whatsapp.com`) resistiu à ferramenta normal de
> leitura (a página vem truncada antes do conteúdo relevante) — nesses casos usei um proxy de
> leitura (`r.jina.ai`) sobre a mesma URL oficial, que devolveu o texto integral; toda citação
> desse domínio está marcada como tal. Onde só havia fonte secundária (blog de BSP, agregador),
> isso está **marcado explicitamente** e tratado como indício, não como fato.

---

## Resumo executivo

1. **O recurso de "6 dispositivos" que a loja já usa não é Coexistence.** Não pode ser — a loja
   nunca colocou o número na Cloud API, e Coexistence é exatamente o que este projeto ainda não
   fez. A documentação oficial da Meta ([faq.whatsapp.com/647349420360876](https://faq.whatsapp.com/647349420360876),
   via proxy de leitura) confirma que o WhatsApp Business App gratuito permite **"até quatro
   dispositivos vinculados e um telefone por vez"** — um total de **5**, não 6. Seis dispositivos
   excede esse teto. A explicação mais provável, por eliminação, é o **WhatsApp Business
   Premium**, assinatura paga (~US$5–15/mês, cobrada pela App Store/Play Store) que eleva o
   limite para até 10 dispositivos ligados a um telefone principal. **Não é Cloud API, não é
   Coexistence, não tem nenhuma relação com `developers.facebook.com`** — é um recurso do
   aplicativo de consumidor. **Isso precisa ser confirmado com a loja perguntando se existe uma
   cobrança recorrente de app (Google Play/App Store) associada ao WhatsApp Business.**
2. **Para Coexistence (manter o app das consultoras), não existe caminho gratuito real.** A
   documentação oficial exige que o onboarding seja feito por um **Solution Partner ou Tech
   Provider** já estabelecido. Investiguei se a própria loja (ou quem constrói o agente) poderia
   se tornar seu próprio Tech Provider e evitar o BSP — **tecnicamente a Meta não proíbe isso em
   nenhum texto encontrado**, mas a definição oficial de Tech Provider é construída em torno de
   "oferecer serviços a outras empresas (clientes)", e uma análise de terceiro encontrada
   afirma que o registro é "desenhado para um tipo específico de organização: uma empresa de
   software que pretende construir ferramentas de WhatsApp como produto central" — uma empresa
   que usa WhatsApp só para sua própria comunicação **não** é o caso de uso pretendido. Não é um
   caminho limpo nem confirmado; é uma zona cinzenta com risco de atrito na revisão da Meta.
   Nenhum parceiro pesquisado (360dialog, Zenvia, Take Blip, Twilio, Gupshup, Infobip, e um
   achado novo, **Dualhook**) oferece Coexistence com tier gratuito permanente — o mais barato
   encontrado é o Dualhook, US$12/mês por conexão, ainda uma mensalidade.
3. **Para "número paralelo" (Plano B), o caminho gratuito é real e bem documentado.** A própria
   Meta distingue, na documentação de Solution Partner, dois casos: quem vai atender **outras**
   empresas (precisa virar Solution Partner/Tech Provider) e quem está "construindo um app que
   não será usado por outras empresas" — para esse segundo caso, a orientação oficial é
   simplesmente seguir o **guia padrão de Get Started da Cloud API**, sem nenhuma exigência de
   parceiro. Isso serve exatamente o caso de um número novo, próprio do agente, que não entra em
   Coexistence. Custo: **zero de parceiro**, e a tarifa da própria Meta continua ~R$0 na fase 1
   (já estabelecido em research 005) porque o limite de mensagens não-tarifadas do plano
   verificado sobe de 250/dia (não verificado) para 2.000/dia após verificação de negócio —
   folgado para o volume da Lais Aliski Casa.
4. **Implicação operacional do número paralelo:** é um número WhatsApp **fisicamente distinto**
   do que as consultoras usam hoje. Não há mecanismo documentado de "mesclar" duas contas do
   WhatsApp em uma só — número é identidade permanente. Isso significa que a escalada do agente
   para a consultora **não pode continuar na mesma janela de conversa** que o cliente já tem
   salva; ou o cliente muda de contato no WhatsApp, ou a arquitetura precisa resolver esse
   handoff por outro meio (ex.: a própria consultora responde através do número novo, não o
   cliente mudando de número). Como migrar esse número paralelo depois para Coexistence — dando
   às consultoras visão dele também — **não está documentado em lugar nenhum** que eu tenha
   encontrado, nem pela Meta nem por nenhum parceiro: é a maior lacuna deste research.

**Resposta direta à pergunta que motivou este research:** sim, existe um caminho gratuito — mas
é o Plano B (número paralelo), não Coexistence. Manter o número atual das consultoras com o
agente também presente nele (Coexistence) continua exigindo, na prática, pagar um parceiro; o
mais barato confirmado ainda é da ordem de R$60–300/mês, dependendo de qual achado (Dualhook,
360dialog) resistir a confirmação mais aprofundada.

---

## Pergunta 1 — O que é o recurso de "6 dispositivos" que a loja já usa

### O que a Meta documenta sobre "linked devices" no app gratuito

Fonte: [About linked devices on the WhatsApp Business app](https://faq.whatsapp.com/647349420360876)
(WhatsApp Help Center, lido via proxy de leitura porque a ferramenta de fetch direta trunca a
página antes do texto relevante).

> "You can use up to four linked devices and one phone at a time."

E, no artigo geral sobre dispositivos vinculados
([faq.whatsapp.com/378279804439436](https://faq.whatsapp.com/378279804439436), mesmo método de
leitura):

> "You can stay connected by linking up to four devices at a time to your primary phone."
> "You'll still need your primary phone to register your WhatsApp account and link new
> devices."

Ou seja: **o teto documentado do recurso nativo e gratuito é 1 telefone principal + 4
dispositivos vinculados = 5 no total.** Nenhuma das duas páginas menciona Coexistence, Cloud
API ou qualquer coisa em `developers.facebook.com` — é puramente um recurso do aplicativo do
usuário, com arquitetura descrita pela própria Meta em
[How WhatsApp enables multi-device capability](https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/)
(Engineering at Meta, 2021): cada dispositivo vinculado mantém sua própria sessão criptografada
ponta-a-ponta com quem envia a mensagem, sem depender do celular principal estar online — é
puro protocolo de mensageria do WhatsApp comum, não tem nada a ver com WhatsApp Business
Platform (a Cloud API).

### Por que 6 não fecha com o teto gratuito

6 dispositivos excede o teto de 5 do plano gratuito. Isso deixa duas explicações plausíveis:

1. **Contagem imprecisa por parte do dono da loja** — talvez sejam de fato 5 (1 celular +
   4 vinculados) e o número "6" incluiu alguma sessão temporária ou contagem duplicada. Não dá
   para descartar sem confirmar.
2. **WhatsApp Business Premium.** A Meta descreve esse produto na própria Central de Ajuda —
   [About changes to WhatsApp Business Premium](https://faq.whatsapp.com/835833917556304) e
   [How to subscribe to WhatsApp Business Premium](https://faq.whatsapp.com/5466418600110636) —
   mas a tentativa de leitura via proxy retornou a página sem conteúdo carregado (bloqueio de
   captcha/JS), então **não consegui extrair o texto oficial completo com número exato de
   dispositivos e preço**. O que ficou confirmado do lado da Meta é a existência do produto e
   que ele é uma **assinatura** (a própria URL fala em "subscribe"). Fontes secundárias
   convergem de forma consistente (múltiplos blogs de CRM/automação de WhatsApp, sem relação
   entre si) em: **até 10 dispositivos** ligados a um telefone principal, faixa de preço
   **US$5–15/mês**, cobrado via App Store/Google Play, lançado em beta a partir do fim de 2022 e
   expandido progressivamente. Nenhuma dessas fontes é `developers.facebook.com` nem
   `faq.whatsapp.com` — são blogs de terceiros (Trengo, GuruSup, BotPenguin, Zoko, entre
   outros), então trato o número exato de preço como indício forte, não como fato fechado.

### Resposta à pergunta do ticket

**O recurso que a loja usa hoje, seja qual for exatamente, não é Coexistence.** Coexistence
pressupõe que o número já foi onboardado na Cloud API por um Solution Partner ou Tech Provider
— algo que, por tudo que se sabe do projeto até aqui, nunca aconteceu para o número da Lais
Casa. **Coexistence não é um estado em que um número "cai" sozinho** — é um processo ativo que
exige integração técnica de um parceiro Meta. Não há caminho para a loja estar em Coexistence
sem alguém (ninguém, até agora) ter feito esse onboarding.

Também não é o multi-device nativo gratuito puro, porque 6 excede o teto documentado de 5.

**A explicação mais provável, por eliminação e por convergência de fontes secundárias, é
WhatsApp Business Premium** — uma assinatura paga, pequena (US$5–15/mês), independente da Cloud
API e dos parceiros investigados neste e no research anterior. Isso muda o que se pede à loja
para confirmar: não é "você é Coexistence?", é **"existe uma cobrança recorrente da Apple/Google
associada a esse WhatsApp Business, ou algum indicativo de 'Premium' nas configurações do
app?"** — pergunta objetiva e verificável, diferente do que se imaginava antes deste research.

---

## Pergunta 2 — Caminho para a Cloud API sem parceiro pago

### 2a. Migração direta (tira o número do app) — já sabido, ponto de partida

Já estabelecido em [research 005](005-integracao-whatsapp.md): a via de migração direta
(Get Started padrão da Cloud API) é gratuita de parceiro. Este research aprofunda **se ela tem
algum custo de parceiro embutido** e a resposta, olhando a documentação com mais detalhe, é
**não**:

- [Cloud API Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
  descreve o fluxo básico — criar um app Meta, conectar/criar uma WhatsApp Business Account,
  selecionar ou adicionar um número, gerar token — **sem mencionar Solution Partner ou Tech
  Provider em nenhum passo**. É o fluxo de "qualquer desenvolvedor" mesmo.
- A distinção entre quem precisa de status de parceiro e quem não precisa está em
  [Solution Partner Overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/overview):
  Solution Partners e Tech Providers são definidos como quem "pode oferecer uma gama completa de
  serviços da WhatsApp Business Platform **a outras empresas (clientes)**". Para quem está
  "construindo um app que não será usado por outras empresas", a orientação explícita da própria
  página é consultar o **guia padrão de Get Started da Cloud API** — ou seja, a Meta separa
  formalmente "eu uso para o meu próprio negócio" de "eu revendo/presto serviço a terceiros", e
  só o segundo caso puxa a exigência de virar parceiro.
- Custo da Meta em si: confirmado em research 005 contra a
  [documentação oficial de preços](https://developers.facebook.com/docs/whatsapp/pricing) —
  cobrança por mensagem, mensagens de serviço (iniciadas pelo cliente, dentro da janela de 24h)
  gratuitas desde novembro de 2024. Nada de mensalidade de plataforma da própria Meta.
- Limite de mensagens antes/depois da verificação de negócio, que é gratuita: confirmado em
  [Messaging Limits](https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits) —
  carteiras de negócio novas começam em **250 destinatários únicos/24h**; completar a verificação
  de negócio (gratuita, ver abaixo) já eleva isso para **2.000/24h**, e o limite continua subindo
  automaticamente (10.000 → 100.000 → ilimitado) conforme o histórico de qualidade e uso.

### 2b. Verificação de negócio da Meta — é grátis, e é uma coisa diferente de "Meta Verified"

Ponto de confusão real, porque os nomes são parecidos: **Business Verification** (verificação de
negócio, dentro do Meta Business Suite/Security Center) é **gratuita** — confirmado pela própria
Meta em [About Business Verification in Meta Business Suite](https://www.facebook.com/business/help/1095661473946872)
e [Upload official documents to verify your business](https://www.facebook.com/business/help/159334372093366):
envia documento (CNPJ, contrato social etc.), a Meta confere, sem cobrança. Isso é **diferente**
de **Meta Verified**, que é um selo azul pago por assinatura e não tem relação com o requisito
técnico de onboarding da Cloud API.

### 2c. Existe algum BSP com tier gratuito de verdade para Coexistence?

Revisitei especificamente atrás de "free tier" permanente, não "mais barato":

| Parceiro | Tier gratuito permanente? | Fonte |
|---|---|---|
| 360dialog | **Não.** Página de preços não lista nenhum plano grátis; mais barato é €49/mês | [360dialog.com/pricing](https://360dialog.com/pricing) |
| Zenvia | Mensalidade "R$0" existe no plano Starter, **mas** cobra taxa de setup (R$649+) e markup por mensagem — não é grátis de fato | já levantado em [research 016](016-parceiro-meta-onboarding.md) |
| Take Blip (Blip Go) | Não — R$299/mês fixo | idem |
| Twilio / Gupshup | Eliminados por não suportar Coexistence (ver research 016) | idem |
| Infobip | Suporta Coexistence, preço não divulgado publicamente ("sob consulta") — não é indício de gratuidade, é ausência de dado | idem |
| **Dualhook** (achado novo) | **Não.** Menor plano é **US$12/mês por conexão**, com trial de 14 dias (não é tier grátis permanente) | [dualhook.com/best-whatsapp-coexistence-providers](https://dualhook.com/best-whatsapp-coexistence-providers) — **fonte secundária**, o próprio Dualhook comparando a si mesmo com concorrentes; tratar com o desconto correspondente |

**Achado que vale registrar:** o Dualhook se apresenta como "official Meta Tech Partner", cobra
US$12/mês por uma conexão sem markup por mensagem, e a própria página cita que "Meta Cloud API
direto... é o caminho mais barato, sem nenhuma assinatura de plataforma além das cobranças de
mensagem da própria Meta" — o que é consistente com a pergunta 2a, mas vindo de uma fonte que
vende exatamente o oposto (uma camada paga), então o peso maior aqui é a confirmação indireta,
não o preço do Dualhook em si. **Não pesquisei profundidade suficiente sobre o Dualhook para
recomendá-lo** — é pequeno, achado numa única busca, sem o mesmo nível de verificação que
360dialog/Zenvia/Blip receberam no research 016. Fica como pista a seguir, não como candidato
pronto.

**Conclusão de 2c: nenhum parceiro pesquisado, em nenhuma das duas rodadas de research, oferece
Coexistence de graça de forma permanente.** O piso encontrado, mesmo contando o achado novo, é
da ordem de US$12/mês (Dualhook, não verificado a fundo) a €49/mês (360dialog, bem verificado).

### 2d. Virar o próprio Tech Provider para fugir do BSP — investigado, não é um caminho limpo

Esta é a pergunta mais interessante do research, e a resposta é **"tecnicamente talvez, na
prática não é o que a Meta desenhou, e há risco de atrito"**:

- A documentação oficial de Coexistence
  ([Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/))
  diz literalmente: **"You must already be a Solution Partner or Tech Provider."** Ela não diz
  que esse Solution Partner/Tech Provider precisa ser uma empresa terceira — só exige o status.
- **Virar Tech Provider é, no papel, autoatendimento e sem taxa da Meta.** A página
  [Become a Tech Provider](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers)
  descreve o caminho — app Meta com caso de uso WhatsApp, verificação de negócio (grátis, ver
  2b), aprovação de App Review para os escopos `whatsapp_business_messaging` e
  `whatsapp_business_management` — e tem um botão explícito **"Onboard without a partner"** para
  quem quer seguir esse caminho sem se associar a um Solution Partner existente. **Nenhum texto
  encontrado, em nenhuma página oficial, menciona uma taxa cobrada pela Meta para conceder o
  status de Tech Provider.**
- **Mas a definição do papel é "prestar serviço a outras empresas".** A própria página de
  overview ([Solution Partner Overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/overview))
  define Tech Provider como quem "pode oferecer uma gama completa de serviços da WhatsApp
  Business Platform **a outras empresas**, seja prestando esse serviço diretamente, seja em
  parceria com um Solution Partner." Uma análise de terceiro
  ([whautomate.com/whatsapp-tech-provider-vs-bsp](https://whautomate.com/whatsapp-tech-provider-vs-bsp) —
  **fonte secundária**, blog de um concorrente de BSPs) é ainda mais direta: o registro de Tech
  Provider é "desenhado para um tipo específico de organização: uma empresa de software que
  pretende construir ferramentas de WhatsApp como produto central e integrar outras empresas na
  API em escala" — e explicitamente marca "empresa usando WhatsApp para a própria comunicação
  com clientes" como **não** sendo o caso de uso do Tech Provider. O mesmo texto cita um prazo
  típico de revisão de "3 a 4 semanas".
- **Nenhuma fonte, primária ou secundária, confirma nem nega de forma definitiva** se a Meta
  rejeitaria ou revogaria o status de Tech Provider de uma empresa que o usa só para si mesma.
  A documentação oficial não proíbe; o uso pretendido, pelo texto da própria Meta e pela leitura
  de quem vive nesse mercado, aponta para outro perfil de solicitante.

**Leitura para o projeto:** virar Tech Provider da própria loja para fugir da mensalidade de BSP
é uma zona cinzenta — não é uma porta fechada, mas também não é o caminho que a Meta pavimentou.
Envolve: passar por App Review (que pede demonstração de uso — potencialmente estranha para quem
não é uma empresa de software), assumir sozinho tudo que hoje um BSP entrega pronto (endpoint de
webhook, tratamento de `history`/`smb_app_state_sync`/`smb_message_echoes`, monitoramento de
sessão do Embedded Signup), e aceitar risco de a Meta não aprovar ou, pior, aprovar e depois
reavaliar o status. **Não recomendo este caminho para a Lais Aliski Casa** sem uma confirmação direta
com o suporte de parceiros da Meta — o retorno (evitar uma mensalidade de R$60–300) não parece
compensar o risco de ficar no meio de uma revisão de App Review sem suporte de ninguém.

### 2e. Programa da Meta para pequena empresa / isenção de custo de onboarding

**Não encontrei nenhum programa oficial da Meta de isenção de custo de onboarding para pequenas
empresas**, nem em `developers.facebook.com` nem em buscas gerais. O que existe e já responde à
mesma necessidade é estrutural, não um "programa": a Cloud API em si já não cobra nada além da
tarifa por mensagem (que a fase 1 da Lais Aliski Casa paga ~R$0), e a verificação de negócio é grátis
para qualquer tamanho de empresa — não há um tier "pequena empresa" porque o tier padrão já é
gratuito de plataforma. **Isso é uma lacuna genuína**: não é possível provar a ausência de um
programa assim só com busca; é possível apenas dizer que nenhuma fonte encontrada o menciona.

---

## Pergunta 3 — Implicações operacionais do número paralelo direto pela Meta

Dado que 2a confirma que o caminho existe e é de fato gratuito de parceiro, o que muda na
prática:

### O que muda para o cliente que manda mensagem

- O agente responde por um **número de WhatsApp novo**, diferente do que o cliente já tem salvo
  (se for cliente recorrente) ou do número que a loja divulga hoje (Instagram, site, cartão).
  Isso significa **divulgar um segundo número** em todos os canais onde a loja hoje aponta para
  o número das consultoras, ou aceitar que o agente só recebe tráfego de quem for direcionado
  especificamente a ele (ex.: um link `wa.me` novo num anúncio ou automação específica).
- Cliente que já tem o número antigo salvo **não migra sozinho** — ele continuaria mandando
  mensagem para o número de sempre, que não tem o agente. O número paralelo só funciona se
  houver um motivo para o cliente chegar por ele (ex.: um fluxo de entrada específico, um botão
  de "fale com a gente" no site apontando para o número novo).

### Como funciona (ou não funciona) a escalada para uma consultora no número antigo

Este é o ponto mais frágil do Plano B, e a documentação da Meta **não resolve isso** porque não
é um problema técnico dela — é um limite estrutural do WhatsApp: **um número de telefone é uma
identidade de conversa permanente; não existe mecanismo documentado, em lugar nenhum pesquisado
(Meta ou parceiros), para mesclar o histórico de dois números diferentes numa única conversa do
cliente.**

Duas formas de lidar com isso, nenhuma delas gratuita de atrito:

1. **O cliente muda de conversa.** O agente, ao escalar, informa um segundo número (o das
   consultoras) e pede para o cliente continuar por lá. Cliente perde a continuidade visual da
   conversa (não vê o histórico do agente na tela da consultora, a não ser que alguém copie/cole
   manualmente) e precisa agir (salvar o novo contato, mandar mensagem de novo). Já era o "Plano
   B" descrito em research 005 como "handoff mais desajeitado".
2. **A consultora responde pelo número novo.** Em vez do cliente mudar, alguém do lado da loja
   passa a atender esse cliente específico usando a Cloud API do número novo (por alguma
   interface que o próprio projeto teria que construir, já que a Cloud API não tem um app de
   inbox pronto). Isso evita o cliente trocar de contato, mas tira a consultora do WhatsApp Business
   app que ela já usa — o oposto do que motivou a escolha de Coexistence em primeiro lugar
   (`CLAUDE.md`: "o tom das consultoras não muda… o agente se adapta ao atendimento que já
   existe").

**Nenhuma das duas opções é gratuita de custo operacional** — o dinheiro que se economiza em
mensalidade de BSP se paga, aqui, em fricção de atendimento ou em trabalho de engenharia extra
para simular um inbox. Isso não está documentado pela Meta porque é uma decisão de produto do
próprio projeto, não uma resposta técnica dela.

### Se depois quiser portar esse número paralelo

- **Portar entre parceiros/Solution Partners**, mantendo o número na Cloud API, é documentado
  pela Meta de forma genérica — já citado em research 016:
  [Migrating a business phone number from one Solution Partner to another via Embedded Signup](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/support/migrating-phone-numbers-among-solution-partners-via-embedded-signup/).
  O número não muda, nome e quality rating são preservados, templates são duplicados com rating
  zerado por 24h. Isso vale para o número paralelo tanto quanto para qualquer outro.
- **Portar esse número paralelo *para dentro* de Coexistence depois** (dar às consultoras acesso
  a ele pelo app, juntando os dois mundos) **não está documentado em lugar nenhum encontrado**.
  Toda a documentação de Coexistence descreve o fluxo partindo de um número que **já está** no
  WhatsApp Business app e é levado à Cloud API — não o caminho inverso (um número que nasceu só
  na Cloud API e depois ganha o app). Não há garantia de que isso seja sequer suportado. **Esta
  é a maior lacuna desta seção.**
- **Fundir os dois números existentes** (o das consultoras e o do agente) num só **não é
  possível em nenhum cenário documentado** — não existe, em toda a pesquisa feita neste projeto
  até aqui, nenhuma menção a mesclar duas contas/números do WhatsApp. Número é definitivo.

### Custo mínimo fora da Meta

Um número novo, mesmo que a tarifa da Meta seja ~R$0, ainda precisa de uma **linha telefônica
real** para receber o SMS/chamada de verificação e permanecer registrada (um chip, plano ou
número virtual) — um custo pequeno, mas que é da operadora de telefonia, não da Meta nem de
nenhum BSP, e que nenhum dos dois caminhos investigados neste research elimina.

---

## Lacunas que a documentação não fecha

1. **Confirmação de que o "6 dispositivos" da loja é Business Premium.** Não consegui ler o
   texto oficial completo da página de Premium (bloqueio de captcha no proxy de leitura); a
   conclusão vem por eliminação (6 excede o teto gratuito de 5) e por convergência de fontes
   secundárias, não por leitura direta do texto oficial com número exato. **Perguntar direto à
   loja se existe assinatura recorrente de app associada ao WhatsApp Business fecha isso sem
   depender de mais pesquisa.**
2. **Se a Meta aceitaria/rejeitaria um pedido de Tech Provider de uma empresa que só quer se
   auto-onboardar.** Não há caso documentado, nem de aprovação nem de rejeição, para esse
   cenário específico. Só dá para saber tentando, ou perguntando ao suporte de parceiros da
   Meta antes de investir tempo de engenharia nisso.
3. **Se o Dualhook é um candidato real para Coexistence barata.** Aparece só numa fonte
   (o próprio site dele comparando concorrentes), sem o mesmo nível de checagem cruzada que
   360dialog/Zenvia/Blip tiveram no research 016. Precisaria de uma rodada de verificação
   própria antes de entrar em qualquer comparativo final.
4. **Migração de um número Cloud-API-only para dentro de Coexistence depois.** Não documentado
   por ninguém — Meta, 360dialog, ou qualquer parceiro pesquisado. Ponto crítico se a Lais Aliski Casa
   quiser começar pelo número paralelo (mais barato, mais simples) e mesclar os mundos depois.
5. **Nenhum caso real relatado** (fórum, comunidade de desenvolvedores) de uma pequena empresa
   brasileira tendo virado seu próprio Tech Provider com sucesso, ou tendo sido barrada. A busca
   não trouxe nenhum relato de primeira mão nos dois lados.

---

## Recomendação

**Não-vinculante — decisão final é do dono do projeto.**

Para o objetivo de "evitar mensalidade inteiramente":

- **Coexistence sem pagar nada a um parceiro não tem caminho limpo e confirmado.** A rota de
  virar Tech Provider da própria loja é tecnicamente aberta pela documentação, mas desenhada
  para outro tipo de empresa, com risco real de atrito na revisão da Meta e sem nenhum relato
  encontrado de alguém tendo feito isso com sucesso nessas condições. Não recomendo apostar
  tempo de engenharia nisso sem antes confirmar diretamente com o suporte de parceiros da Meta
  se esse uso é aceito.
- **O caminho realmente gratuito é o número paralelo (Plano B de research 005), com onboarding
  direto pela Meta via o guia padrão de Cloud API — zero parceiro, zero mensalidade, só a
  tarifa da própria Meta (~R$0 na fase 1).** Isso está bem documentado e não depende de nenhuma
  zona cinzenta. O preço dessa gratuidade é operacional, não financeiro: um número novo para
  divulgar, um handoff mais desajeitado para a consultora (ver Pergunta 3), e nenhuma garantia
  documentada de que dá para juntar os dois mundos depois.
- Se Coexistence continuar sendo a prioridade (preservar o app das consultoras intacto, que é o
  que o `CLAUDE.md` do projeto valoriza — "o processo da loja não se dobra ao agente"), a
  mensalidade mais barata e mais verificada continua sendo a **360dialog, ≈€49/mês**, do research
  016. O achado do Dualhook (~US$12/mês) é mais barato no papel, mas não foi verificado a fundo
  o suficiente para substituir essa recomendação sem uma rodada própria de checagem.

**A escolha real que fica para o dono do projeto** não é mais só "qual parceiro", é "vale mais
pagar ~R$60–300/mês para manter as consultoras exatamente como estão, ou aceitar o atrito
operacional de um número novo (handoff manual, divulgação duplicada) para não pagar nada?" —
essa é uma decisão de produto e de orçamento, não uma pergunta que a documentação da Meta
responde.
