---
ticket: "016"
title: Escolher o parceiro Meta para o onboarding do WhatsApp (Coexistence)
tipo: research
data: 2026-08-11
---

# Research — Qual parceiro Meta faz o onboarding em Coexistence

Ticket: [016](../tickets/016-escolher-parceiro-meta.md) · Investigado em 2026-08-11 · Depende da
decisão já tomada em [research 005](005-integracao-whatsapp.md) (Coexistence é o caminho).

> **Base desta investigação.** Fontes primárias sempre que existiam: documentação oficial da
> Meta (`developers.facebook.com`), documentação oficial de cada parceiro
> (`docs.360dialog.com`, `docs.gupshup.io`, `twilio.com/docs`, `support.zenvia.com`,
> `help.blip.ai`, `infobip.com/docs`). Onde só havia fonte secundária (blog, comparativo de
> terceiro), isso está **marcado explicitamente** e não é tratado como fato — só como indício
> a confirmar. Nenhum comentário herdado do `.env` foi usado.

---

## Resumo executivo

1. **Filtro eliminatório derruba dois dos cinco candidatos do ticket.** **Twilio** e
   **Gupshup** não têm suporte documentado a Coexistence — a própria documentação oficial dos
   dois não menciona a funcionalidade em nenhum lugar, e múltiplas fontes secundárias
   confirmam a ausência de forma consistente. Saem da lista.
2. **Sobrevivem ao filtro: 360dialog, Zenvia, Take Blip (via "Blip Go")**, e um achado fora da
   lista original, a **Infobip** (suporte oficial documentado, mas sem dado de preço nem de
   presença comercial no Brasil confirmado — entra como nota, não como candidato pronto).
3. **Só a 360dialog entrega Cloud API crua sem obrigar plataforma própria.** Zenvia exige o
   Customer Cloud (inbox dela); Blip Go é um produto fechado com IA e funil próprios da Blip —
   nos dois casos, "usar a API" significa "usar a plataforma deles". Isso pesa contra os dois
   no eixo 3, que é uma restrição dura do projeto (a loja não quer inbox alheio).
4. **Custo mensal estimado para o volume da Lais Casa (fase 1, quase zero mensagem tarifada):**
   360dialog ≈ **€49/mês** (~R$ 300, sem markup sobre a tarifa da Meta) é a mais barata e mais
   previsível. Take Blip (Blip Go) é **R$ 299/mês fixo**, também previsível, mas amarrada à
   plataforma. Zenvia é a mais cara e a menos previsível: mensalidade de R$ 0 a R$ 600 **mais**
   taxa de setup de R$ 649 **mais** um markup próprio por mensagem (~R$ 0,30–0,55) cobrado
   mesmo em mensagens que a Meta já dá de graça dentro da janela de 24h.
5. **Faturamento em BRL:** só **Zenvia** e **Take Blip** cobram nativamente em reais, sendo
   empresas brasileiras. **360dialog cobra em EUR/USD** — não encontrei página oficial dela
   com opção de fatura em BRL; o prazo da Meta (30/06/2027) é sobre a tarifa da Meta em si, não
   sobre a mensalidade do parceiro, então isso não bloqueia a 360dialog, mas é um ponto de
   atrito operacional (cartão internacional, câmbio) que os concorrentes brasileiros não têm.
6. **Portabilidade** é documentada pela própria Meta de forma genérica (migração de número
   entre Solution Partners via Embedded Signup preserva nome, templates e quality rating) e
   vale para qualquer parceiro homologado — não é um diferencial de nenhum candidato
   específico. O que não está documentado em lugar nenhum, nem pela Meta nem pelos parceiros, é
   **como a migração se comporta quando o número já está em modo Coexistence**. Essa é a maior
   lacuna deste research.

**Nenhuma decisão está tomada aqui.** Esta é uma comparação com estimativa de custo; a escolha
final é do dono do projeto.

---

## Tabela comparativa

| Parceiro | Suporta Coexistence? | Cloud API crua ou plataforma própria? | Custo mensal estimado (volume Lais Casa) | Suporte BR/PT | Fatura em BRL? |
|---|---|---|---|---|---|
| **360dialog** | ✅ Sim, documentado ([docs.360dialog.com](https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence)) | **Cloud API crua**, cadastro direto (Direct Signup), sem inbox obrigatório | **≈ €49/mês** (~R$ 300, estimativa), sem markup sobre a Meta | Empresa alemã; sem confirmação oficial de time em português — suporte 24/7 mas idioma não confirmado | **Não** — cobra em EUR/USD |
| **Zenvia** | ✅ Sim, documentado ([support.zenvia.com](https://support.zenvia.com/kb/en/article/561777/whatsapp-coexistence-what-it-is-requirements-and-how-to-use-it-z)) | **Plataforma própria** (Customer Cloud) — Coexistence é recurso dela, não Cloud API isolada | R$ 0–600/mês + R$ 649 setup + ~R$ 0,30–0,55/mensagem (markup próprio) | Empresa brasileira, suporte em português confirmado | **Sim** (BRL nativo — [zenvia.com/precos](https://zenvia.com/precos/)) |
| **Take Blip** (produto "Blip Go") | ✅ Sim, documentado ([help.blip.ai](https://help.blip.ai/hc/en-us/articles/28047450049943-Blip-Go-WhatsApp-Business-API)) | **Plataforma própria** (Blip Go: IA, funil, campanhas da Blip) | **R$ 299/mês fixo** + R$ 0,60/disparo além dos 100 grátis | Empresa brasileira (Belo Horizonte), suporte em português | **Sim** (BRL nativo) |
| **Twilio** | ❌ Sem suporte documentado — doc oficial não menciona Coexistence | Cloud API + camada Twilio | *(eliminado — fora da lista)* | Global, suporte em inglês majoritário | Não confirmado, tipicamente USD |
| **Gupshup** | ❌ Sem suporte documentado — doc oficial não menciona Coexistence | Cloud API + camada Gupshup, wallet | *(eliminado — fora da lista)* | Global | **Não** — wallet em USD ([support.gupshup.io](https://support.gupshup.io/hc/en-us/articles/33760266293529-Basics-of-Gupshup-Wallet-and-Billing-for-Prepaid-USD-Wallet)) |
| **Infobip** (achado fora da lista original) | ✅ Sim, documentado ([infobip.com/docs](https://www.infobip.com/docs/whatsapp/manage-integration/coexistence)) | Não confirmado nesta pesquisa — Infobip também vende plataforma própria de inbox | Não encontrado (preço sob consulta) | Global, presença comercial no Brasil não confirmada nesta pesquisa | Não confirmado |

---

## Eixo 1 — Suporte real a Coexistence (filtro eliminatório)

Fonte-base do requisito: doc oficial da Meta, já citada em
[research 005](005-integracao-whatsapp.md) —
[Onboarding Business App Users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/).
O parceiro precisa ser **Solution Partner ou Tech Provider**, assinar os webhooks `history`,
`smb_app_state_sync` e `smb_message_echoes`, e o cliente final precisa estar no app do
WhatsApp Business versão **2.24.17+**.

- **360dialog — suporta.** Documentação própria e dedicada:
  [WhatsApp Coexistence](https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence) e
  [Coexistence Onboarding](https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence/coexistence-onboarding),
  com passo a passo via QR code no app.
- **Zenvia — suporta.** Artigo oficial dedicado:
  [WhatsApp Coexistence: What it is, requirements, and how to use it in Zenvia Customer Cloud](https://support.zenvia.com/kb/en/article/561777/whatsapp-coexistence-what-it-is-requirements-and-how-to-use-it-z).
- **Take Blip — suporta, via o produto "Blip Go".** Documentação oficial:
  [Blip Go! WhatsApp Business API](https://help.blip.ai/hc/en-us/articles/28047450049943-Blip-Go-WhatsApp-Business-API),
  que descreve o uso da "Meta's Coexistence API". Não confirmei se o produto enterprise da
  Blip (fora do Blip Go, voltado a contas maiores) também oferece Coexistence — a documentação
  encontrada trata do Blip Go especificamente.
- **Twilio — não suporta, pela ausência na doc oficial.** O documento
  [WhatsApp Business Platform with Twilio](https://www.twilio.com/docs/whatsapp/api) foi lido
  por completo e **não contém nenhuma menção** a "coexistence" ou a manter o app funcionando
  junto com a API no mesmo número. Isso, por si, não prova ausência — mas bate com múltiplas
  fontes secundárias que afirmam explicitamente que a Twilio não suporta Coexistence (ex.:
  [chakrahq.com](https://chakrahq.com/article/whatsapp-coexistence-chakra-twilio-migrate-change/),
  que é um blog de um concorrente — ressalva de honestidade abaixo). **Não encontrei nenhuma
  fonte, primária ou secundária, afirmando o contrário.**
- **Gupshup — não suporta, pela mesma lógica.** O
  [Onboarding Guide](https://docs.gupshup.io/docs/onboarding-guide) oficial não menciona
  Coexistence. Fontes secundárias (mesmo blog acima, e outras) afirmam ausência de suporte.
  Idem: nenhuma fonte encontrada afirma o contrário.
- **Infobip — suporta**, com página própria e específica:
  [WhatsApp Business App coexistence](https://www.infobip.com/docs/whatsapp/manage-integration/coexistence).
  Não estava na lista original do ticket; entra como achado, mas com informação bem mais rasa
  do que os outros quatro (não pesquisei preço nem oferta de API crua para ela — ver Lacunas).

> **Ressalva de honestidade sobre as fontes que dizem "Twilio/Gupshup não suportam".**
> `chakrahq.com` é um blog operado pela própria ChakraHQ, um BSP concorrente que vende
> Coexistence como diferencial — tem interesse comercial em pintar Twilio e Gupshup como
> incapazes disso. Meu peso maior aqui não é o blog, é o **silêncio da documentação oficial**
> de Twilio e Gupshup sobre o assunto, que eu conferi diretamente. Silêncio não é prova
> definitiva de ausência (documentação pode estar desatualizada), mas é o melhor sinal
> disponível sem uma conta de teste em cada plataforma.

---

## Eixo 2 — Custo por cima da tarifa da Meta

Base para o cálculo: a fase 1 da Lais Casa é reativa, dentro da janela de 24h, sem template —
ou seja, **a tarifa da própria Meta é ~R$0** (confirmado em
[research 005](005-integracao-whatsapp.md) contra a
[doc oficial de preços da Meta](https://developers.facebook.com/docs/whatsapp/pricing)). Isso
muda o que importa comparar: não é o preço por mensagem, é **o que o parceiro cobra mesmo
quando a Meta não cobra nada**.

### 360dialog

[Tabela de preços](https://360dialog.com/pricing): plano **"WhatsApp API — Regular", €49/mês
por número**, sem taxa de setup visível, com a frase explícita **"no markup on Meta fees"**.
Existe também um plano "Premium" (€99/mês) e "High Throughput" (€249/mês), irrelevantes na
escala da Lais Casa. A documentação de onboarding de Coexistence
([link](https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence/coexistence-onboarding))
**não restringe Coexistence a um plano específico** — mas também não confirma que o plano
Regular basta. **Isso precisa ser confirmado com a 360dialog antes de assinar.**

> ⚠️ Uma fonte secundária de um revendedor brasileiro (Chat2Desk Brasil) descreve preço por
> **conversa** ("R$ 0,70 por conversa iniciada pela empresa, R$ 0,50 pelo cliente") — esse é o
> **modelo antigo, anterior à mudança da Meta para cobrança por mensagem em julho de 2025**
> (confirmada em research 005). Tratei essa fonte como desatualizada e não a usei no cálculo.

### Zenvia

[Planos e preços](https://zenvia.com/precos/): mensalidade de **R$ 0 (Starter) a R$ 3.900
(Professional)**, mais **taxa de setup de R$ 649 a R$ 3.999** "se precisar habilitar WhatsApp
e/ou RCS". Acima disso, **consumo por mensagem cobrado de um pacote de crédito**: no exemplo
de um pacote de R$ 100, mensagem "WhatsApp User" (iniciada pelo cliente, portanto grátis para
a Meta) sai a **~R$ 0,30**, e "WhatsApp Business" (iniciada pela empresa) a **~R$ 0,55**. Ou
seja: **a Zenvia cobra um markup próprio em cima de mensagens que a Meta já entrega de graça
dentro da janela de 24h.** Para o volume baixíssimo da fase 1 isso é um valor pequeno em
termos absolutos, mas é a estrutura de custo mais cara e menos alinhada ao "quase zero" que a
Meta oferece.

### Take Blip (Blip Go)

**R$ 299/mês fixo**, com "conversas orgânicas ilimitadas" incluídas e 100 disparos de campanha
grátis por mês, além disso R$ 0,60 por disparo adicional
([help.blip.ai](https://help.blip.ai/hc/en-us/articles/28047450049943-Blip-Go-WhatsApp-Business-API),
confirmado também em [blip.ai/en/blip-go](https://www.blip.ai/en/blip-go/)). Como o fluxo da
Lais Casa é majoritariamente reativo e não-template, a maior parte do tráfego cairia na faixa
"grátis" do próprio plano. **Uma fonte secundária** (bossbot.uk) cita R$ 99/mês como preço —
divergente do valor confirmado na doc oficial da Blip; tratei o valor de R$ 299 como o correto
por vir do canal de ajuda oficial da empresa, e a divergência como possível desatualização do
blog terceiro.

### Twilio / Gupshup (eliminados, valor apenas para referência)

Fora da comparação principal por não suportarem Coexistence, mas os números encontrados dão
noção de escala: **Gupshup** cobra tarifa da Meta + fee próprio por mensagem, com exemplo de
mercado citando algo como "$80/mês de plano + $0,001/mensagem de markup"
([zoko.io](https://www.zoko.io/post/whatsapp-api-gupshup-pricing-features), fonte secundária,
não confirmada na doc oficial da Gupshup). **Twilio** soma tarifa da Meta a um fee de
mensageria próprio, documentado em geral mas não levantado em detalhe aqui porque o candidato
já saiu no filtro do eixo 1.

---

## Eixo 3 — Acesso à API: crua ou obrigada a plataforma própria

Este é o eixo em que **360dialog se separa do resto**.

- **360dialog:** o Client Hub permite **Direct Signup** — a própria empresa final se cadastra,
  sem precisar de revenda/parceiro intermediário
  ([docs.360dialog.com](https://docs.360dialog.com/docs/hub/embedded-signup/coexistence-onboarding)).
  A base da API é `https://waba-v2.360dialog.io`, autenticação por `D360-API-KEY` — é a Cloud
  API da Meta por trás de um proxy fino, sem inbox, sem CRM embutido. A própria empresa se
  posiciona assim: acesso direto, "no abstraction layers, no feature caps"
  ([resultado de busca sobre o produto](https://360dialog.com/) — texto de marketing, tratar
  com o desconto correspondente, mas consistente com o que a documentação técnica mostra).
- **Zenvia:** Coexistence é descrito como um recurso **do Zenvia Customer Cloud**
  ([artigo oficial](https://support.zenvia.com/kb/en/article/561777/whatsapp-coexistence-what-it-is-requirements-and-how-to-use-it-z)),
  a plataforma de atendimento da Zenvia — não uma API isolada. Usar Coexistence pela Zenvia
  significa operar dentro do inbox dela, exatamente o que o ticket qualifica como "vem com um
  inbox que a loja não quer e não vai usar".
- **Take Blip:** o produto que suporta Coexistence é o **Blip Go**, um pacote fechado com IA
  própria, funil (Kanban), campanhas e relatórios
  ([blip.ai/en/blip-go](https://www.blip.ai/en/blip-go/)). O core histórico da Blip também é
  um **construtor de chatbot visual** ("Blip Builder"), não uma API crua para quem quer
  escrever o próprio agente — achado a partir de várias páginas oficiais de ajuda da Blip
  (`docs.blip.ai`, `help.blip.ai`). Usar Take Blip para este projeto significaria o agente da
  Lais Casa rodar **dentro** da infraestrutura de bot da Blip, não como um serviço externo
  falando com a Cloud API.
- **Infobip:** não investigado a fundo neste research — sinalizado como lacuna.

**Leitura direta para o projeto:** dado que o agente da Lais Casa **já está sendo construído
sob medida** (qualificação, integração com Mainô, planilha), forçar esse agente a viver dentro
do Blip Go ou do Zenvia Customer Cloud significa reescrevê-lo para caber na plataforma do
parceiro — o oposto do que o `CLAUDE.md` do projeto pede ("o processo da loja não se dobra ao
agente"; aqui seria o agente se dobrando ao parceiro). **Só a 360dialog preserva a arquitetura
que o projeto já está montando.**

---

## Eixo 4 — Suporte no Brasil, em português, e o que acontece quando o número dá problema

- **360dialog:** sediada na Alemanha. Documentação oficial de suporte
  ([docs.360dialog.com](https://docs.360dialog.com/docs/support/response-and-resolution-time)
  e [docs.360dialog.com](https://docs.360dialog.com/docs/support/get-support)) descreve
  **suporte 24/7, 365 dias**, com SLA de primeira resposta por plano e resposta em até 24h por
  e-mail/WhatsApp fora do chat prioritário — mas **não encontrei confirmação oficial de time em
  português**. Fontes secundárias mostram vários revendedores/integradores brasileiros
  (Chat2Desk Brasil, SonaVoip) operando **sobre** a 360dialog e oferecendo suporte em
  português por conta própria — o que sugere que suporte em PT-BR direto da 360dialog não é
  garantido, e a alternativa prática seria contratar através de um desses intermediários
  (o que reintroduz uma camada e, provavelmente, um markup).
- **Zenvia:** empresa brasileira, com central de ajuda em português
  ([support.zenvia.com/kb/pt-br](https://support.zenvia.com/kb/pt-br/Search?q=whatsapp)) e
  presença comercial no Brasil confirmada por ser a própria origem da empresa.
- **Take Blip:** empresa brasileira (Belo Horizonte — achado em fontes secundárias de review,
  não verificado num "About" oficial nesta pesquisa), central de ajuda com artigos em
  português (`help.blip.ai/hc/pt-br/...`), contato telefônico brasileiro exibido no site
  (`+55 31 3349-6201`).
- **Twilio / Gupshup:** eliminados no eixo 1; não aprofundei suporte.
- **Infobip:** afirma "24/7 support" na própria doc
  ([infobip.com/docs](https://www.infobip.com/docs/whatsapp/tech-provider-program/support)),
  sem confirmação de português ou escritório no Brasil nesta pesquisa.

**O que acontece quando o número dá problema** não está documentado de forma comparável entre
os parceiros — cada um tem sua própria central de ajuda com artigos de troubleshooting, mas
nenhum publica SLA de resolução (só de primeira resposta, no caso da 360dialog) nem
compromisso de "número recuperado em X horas". Isso é uma lacuna transversal, não específica de
um parceiro (ver seção de lacunas).

---

## Eixo 5 — Portabilidade

A regra geral vem **da Meta**, não de nenhum parceiro específico — o que significa que ela
vale (em teoria) igualmente para qualquer um dos sobreviventes. Fonte oficial:
[Migrating a business phone number from one Solution Partner to another via Embedded Signup](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/support/migrating-phone-numbers-among-solution-partners-via-embedded-signup/).

O que a doc afirma, literalmente:

- O número de telefone **não muda** — a migração troca o parceiro que administra a WABA, não
  o número em si.
- **Nome de exibição, quality rating e status de Conta Oficial são preservados.**
- **Templates são duplicados** na WABA de destino, mas a **qualidade dos templates não é
  migrada** — todos entram com rating `UNKNOWN` e ficam assim por 24h até acumular dado novo.
- O registro do número na nova WABA é instantâneo (**sem downtime de mensagens**), mas há
  descontinuidade nos templates durante a duplicação.
- A doc **não menciona histórico de conversas** no processo de migração entre parceiros — nem
  confirma nem nega que ele seja preservado.

**360dialog** tem documentação própria e detalhada só dela sobre esse fluxo — três cenários
distintos: trazer um número de outro BSP para a 360dialog, mover um número entre WABAs dentro
da 360dialog, e **tirar um número da 360dialog para outro BSP**
([Migrating a Phone Number](https://docs.360dialog.com/partner/waba-management/phone-number-and-hosting/migrating-existing-waba)).
Ter esse terceiro caminho documentado — sair, não só entrar — é um sinal de que a 360dialog não
trata a saída como caso não previsto.

Não encontrei documentação equivalente e específica de **saída** para Zenvia nem para Take
Blip — as buscas retornaram principalmente documentação de **entrada** (migrar **para** a
plataforma deles). Isso não prova que a saída seja difícil, só que não achei o artigo — ver
lacunas.

**O ponto que nenhum parceiro nem a Meta documentam: migração de número que está em modo
Coexistence.** Todo o processo de portabilidade descrito acima parece pressupor um número
"normal" na Cloud API. Não encontrei nenhuma fonte, de nenhum lado, descrevendo o que acontece
se você tenta migrar de parceiro **enquanto** o número está simultaneamente no app das
consultoras e na Cloud API. Ver Lacunas.

---

## Eixo 6 — Faturamento em BRL

Fato confirmado direto na doc oficial da Meta
([developers.facebook.com/docs/whatsapp/pricing](https://developers.facebook.com/docs/whatsapp/pricing)):
a cobrança da **tarifa da própria Meta** foi localizada para Real a partir de **1º de julho de
2026**, com prazo até **30 de junho de 2027** para migrar todas as contas elegíveis — depois
disso, contas não migradas para BRL **deixam de ter suas mensagens entregues** a partir de 1º
de julho de 2027. Isso é sobre o WABA na Meta, **não** sobre a mensalidade que o parceiro
cobra — são duas faturas diferentes.

- **Zenvia e Take Blip** já cobram nativamente em BRL, por serem empresas brasileiras — a
  mensalidade do parceiro em si não tem questão de câmbio.
- **360dialog** cobra a própria mensalidade em **EUR/USD**
  ([360dialog.com/pricing](https://360dialog.com/pricing) não lista opção em BRL). A parte da
  fatura que é passthrough da tarifa da Meta deve seguir a localização da Meta para BRL
  (mesmo prazo de todo mundo), mas a parte da mensalidade da própria 360dialog continua em
  moeda estrangeira — o que implica cartão internacional ou conta em moeda estrangeira para a
  Lais Casa, e exposição a câmbio sobre um valor pequeno (€49/mês).
- Não encontrei página oficial da 360dialog anunciando qualquer plano de localizar a própria
  cobrança para BRL.

**Leitura para o projeto:** o prazo de junho de 2027 da Meta não elimina nenhum candidato — ele
é sobre a tarifa da Meta, que no caso da fase 1 já é ~R$0. O que pesa de fato é se a Lais Casa,
uma loja pequena, quer lidar com fatura em euro todo mês por uma mensalidade de ~R$300, ou
prefere pagar em reais a um fornecedor nacional mesmo que isso custe uma estrutura de preço
menos limpa (Zenvia) ou uma plataforma fechada (Blip Go).

---

## Lacunas que a documentação não fecha

Nada abaixo dá para responder só lendo doc — precisa de contato direto com o parceiro ou de
uma conta de teste.

1. **Qual plano da 360dialog é exigido para Coexistence.** A doc de onboarding não restringe,
   a de preços não confirma. Perguntar direto ao time comercial antes de assinar.
2. **Se a 360dialog oferece suporte em português**, ou se isso só existe via revendedor
   brasileiro (o que muda o custo real e reintroduz uma camada).
3. **Migração de número que está em modo Coexistence entre parceiros.** Não achei essa resposta
   em lugar nenhum — nem Meta, nem 360dialog, nem Zenvia, nem Blip. É a lacuna mais importante
   deste research porque toca diretamente o eixo de portabilidade que motivou o ticket.
4. **Histórico de conversas na migração entre Solution Partners.** A doc da Meta fala de
   templates e quality rating, não de histórico — e o histórico é justamente o que a Lais Casa
   mais valoriza preservar (relacionamento de consultora com cliente de até R$ 50 mil).
5. **Processo de saída documentado para Zenvia e Take Blip.** Só achei documentação de entrada.
   Não é evidência de que a saída seja difícil, só que não foi encontrada — vale perguntar
   direto no comercial de cada um antes de assinar.
6. **Infobip como candidato completo.** Suporte a Coexistence está confirmado oficialmente, mas
   não pesquisei preço, se dá Cloud API crua ou exige plataforma própria, nem presença/suporte
   no Brasil. Não estava na lista original do ticket — decidir se vale um research à parte ou
   se fica descartada por falta de informação.
7. **SLA de resolução (não só de primeira resposta) para número com problema**, em qualquer um
   dos parceiros. Nenhum publica isso.
8. **Confirmação viva de preço** — toda a comparação de custo é sobre páginas de preço público
   datadas de agosto de 2026; parceiros de SaaS mudam tabela de preço com frequência.
   Confirmar o valor exato no momento de assinar, não confiar cegamente neste documento daqui
   a alguns meses.

---

## Recomendação

**360dialog é o candidato mais alinhado às seis restrições do ticket, com uma ressalva prática
de câmbio/idioma que vale confirmar antes de assinar.**

Ela é a única que:
- dá Cloud API crua sem empurrar inbox ou plataforma própria (eixo 3, a restrição mais dura
  para este projeto especificamente, porque o agente já está sendo construído sob medida);
- tem a estrutura de custo mais barata e mais previsível para o volume da fase 1 — mensalidade
  fixa sem markup sobre a tarifa da Meta, que já é ~R$0 (eixo 2);
- documenta explicitamente um caminho de **saída** para outro BSP, não só de entrada (eixo 5).

O preço a pagar por essa escolha é cobrar em euro/dólar (eixo 6) e não ter confirmação de
suporte nativo em português (eixo 4) — os dois pontos em que **Zenvia** e **Take Blip** saem na
frente por serem empresas brasileiras. Se suporte em português e fatura em reais pesarem mais
para o dono do projeto do que manter o agente fora de uma plataforma de terceiro, **Take Blip
(Blip Go)** é a alternativa mais defensável dos dois — R$ 299/mês fixo é previsível e mais
barato que a estrutura da Zenvia —, mas isso significa aceitar que o agente da Lais Casa passa
a rodar dentro da infraestrutura de bot da Blip, não como serviço próprio.

**Zenvia fica em último lugar nas três frentes que importam aqui**: exige plataforma própria
igual à Blip, é a mais cara, e ainda cobra markup em cima de mensagens que a Meta já dá de
graça — a única vantagem dela é ser brasileira, e essa vantagem sozinha não compensa o resto.

**A decisão final, incluindo qual das duas ressalvas (câmbio/idioma vs. plataforma própria)
importa mais para a operação real da loja, é do dono do projeto.**
