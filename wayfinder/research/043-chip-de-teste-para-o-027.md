---
ticket: "027"
title: Qual chip pré-pago comprar para o teste do 027, e onde a comunidade compra
tipo: research
data: 2026-09-11
---

# Research — Chip de teste para o ticket 027 (vincular Baileys/Evolution API como dispositivo adicional)

Ticket: [027](../tickets/027-testar-self-hosted-no-numero-atual.md) · Investigado em 2026-09-11 ·
Adendo de pesquisa — não abre ticket novo. Parte do que já está estabelecido em
[research 025](025-numero-dedicado-com-acesso-da-loja.md) (pergunta 2 daquele documento) e
[research 023](023-comunidade-whatsapp-ia-baixo-custo.md): **precisa ser uma linha real de
operadora (TIM/Claro/Vivo), nunca número virtual/VoIP** — a Central de Ajuda do WhatsApp recusa
VoIP para registro em qualquer modalidade, e número virtual/reciclado é sinal de risco. Essa
conclusão **não é repetida como descoberta aqui**; é o ponto de partida. Este documento vai direto
ao que faltava: diferença real entre operadoras, custo mínimo para um teste curto, onde a
comunidade compra na prática, relatos anedóticos de alguém testando exatamente esse cenário
(dispositivo adicional, não número principal do bot), **e um requisito adicional levantado depois
do início desta pesquisa: a linha precisa poder ser adquirida 100% online e com ativação imediata,
sem esperar entrega física por Correios e sem precisar ir a uma loja física** — o que muda "onde
comprar" de chip físico para **eSIM**, investigado como dimensão própria na pergunta 2b abaixo.

> **Nota de escopo — eSIM não é a mesma coisa que número virtual/VoIP.** O research 023 descartou
> VoIP porque a Central de Ajuda do WhatsApp recusa esse tipo de número para registro. eSIM é uma
> tecnologia diferente: é a **mesma linha real de operadora** (mesmo IMSI, mesmo cadastro de CPF,
> mesma rede móvel brasileira), só entregue como perfil digital em vez de cartão físico. O WhatsApp
> pede um número de telefone para verificação por SMS/chamada — não distingue, no protocolo, se
> esse número está num chip físico ou num eSIM. Trato isso como fato de engenharia já estabelecido
> (é assim que eSIM funciona, documentado nas próprias páginas oficiais das operadoras abaixo), não
> como algo que precisasse de fonte à parte.

> **Base desta investigação.** Buscas em issues do GitHub (`WhiskeySockets/Baileys`,
> `EvolutionAPI/evolution-api`, `tulir/whatsmeow`), Reddit, fóruns técnicos brasileiros (TabNews),
> agregadores de preço de plano pré-pago (`melhorplano.net`, `minhaconexao.com.br`,
> `comocomprar.com.br`) e, para a dimensão de eSIM (adicionada depois do início da pesquisa), as
> páginas oficiais das próprias operadoras (`vivo.com.br`, `claro.com.br`) e cobertura de imprensa
> técnica sobre elas (TudoCelular, PontoByte). **Nenhuma fonte primária da Meta ou dos
> mantenedores das bibliotecas discute operadora de origem do chip** — o assunto não aparece no
> radar técnico deles, só no radar de custo/logística da comunidade de devs. Isso já é, em si,
> parte da resposta à pergunta 1.

---

## Resumo executivo

1. **Não existe diferença relatada pela comunidade entre TIM, Claro e Vivo quanto a risco de
   banimento ou fricção ao vincular um cliente headless como dispositivo adicional.** Busquei
   diretamente nas issues de banimento do próprio Baileys (#1869, #1983, #2075, #2260, #2441,
   #935, #1248) e em nenhuma delas qualquer operadora, país de origem do SIM ou tipo de chip é
   mencionado — a discussão técnica dos mantenedores (já mapeada no research 026, caso do erro
   463) opera inteiramente em nível de protocolo/token, não de operadora de telefonia. **Isto é a
   resposta à pergunta 1, não uma lacuna**: a comunidade técnica que investiga banimento
   simplesmente não trata a operadora como variável relevante.
2. **A única discussão encontrada comparando operadoras para chip de automação é de custo e
   logística, não de risco de banimento** — um fórum de devs brasileiros (TabNews,
   ~2024, portanto desatualizado em preço) recomenda TIM pré-pago por praticidade de recarga longa
   (R$50 valendo 6 meses) e cita Vivo Easy como alternativa então mais barata, hoje descontinuada.
   Nenhum dos dois comentários fala de vincular como dispositivo adicional — ambos descrevem o
   chip como número principal do bot.
3. **Para o caso específico do 027 — manter uma linha ativa por um teste curto (dias a semanas),
   sem precisar de internet —, a Vivo é a opção com o menor custo mínimo confirmado e mais
   explícito para esse uso exato:** recarga de R$15 por 30 dias, anunciada pela própria operadora
   como recarga "sem bônus de internet", justamente para só manter a linha ativa. TIM exige mínimo
   de R$20; Claro tem sinal mais fraco (fontes convergem perto de R$15, mas sem a mesma clareza de
   "recarga para manter ativa sem dados" que a Vivo tem). A diferença entre as três é pequena
   (R$5) e nenhuma fonte aponta vantagem de operadora além de preço.
4. **A comunidade brasileira, de forma consistente entre múltiplas fontes independentes, recomenda
   comprar em canal oficial — loja física da operadora, app/site oficial, ou grandes redes
   (farmácia, papelaria, supermercado) — e evitar vendedor informal/de rua/pequeno anúncio de
   marketplace**, porque o risco concreto e documentado (inclusive em reclamações reais no Reclame
   Aqui) é receber um **chip reciclado que já tem uma conta de WhatsApp anterior vinculada**, não
   um chip "banido" por si só. Isso é logisticamente relevante para o teste do 027: um chip que já
   chega com histórico de WhatsApp de outra pessoa complica exatamente o teste que o ticket quer
   fazer (vincular como dispositivo limpo).
5. **Não encontrei nenhum relato público de alguém testando especificamente Baileys/Evolution API
   como dispositivo adicional (companion) — só relatos de bibliotecas não-oficiais como número
   principal do bot.** O único achado que se aproxima (TabNews) é sobre isso, não sobre o cenário
   exato do 027. Ver pergunta 4.
6. **Nenhuma das três operadoras confirma, em página oficial própria, um caminho 100% online e
   imediato para ativar uma linha pré-paga *nova* via eSIM, sem qualquer contato físico.** A TIM é
   a mais explícita e a mais negativa: a própria página confirma que "é necessário adquiri-lo em
   uma loja física da operadora, já que, no momento, a opção ainda não está disponível na loja
   online." A Claro documenta oficialmente que o QR code do eSIM é obtido "em uma loja da Claro" —
   o app permite depois *converter* um chip físico já ativo para eSIM, mas isso pressupõe uma linha
   física anterior, não resolve "linha nova, hoje, sem sair de casa". **A Vivo é a única com sinal
   forte (mas não 100% confirmado para o caso exato de linha nova) de um fluxo de eSIM via app,
   incluindo Pré-Pago, com verificação por biometria facial, sem necessidade de loja** — a leitura
   mais honesta é que a Vivo é a candidata mais provável, não uma certeza documentada. Ver
   pergunta 2b.

**Conclusão prática:** a pesquisa não encontrou diferença real entre operadoras para este caso de
uso — nem em risco, nem em fricção técnica — e isso é reportado como resposta válida, não como
lacuna a preencher com mais busca. A escolha de operadora é, honestamente, uma escolha de preço e
conveniência de compra, não de engenharia — mas a exigência de "online e imediato" **é** uma
diferença real de fricção entre as três, e pesa a favor da Vivo, com a ressalva de que isso precisa
ser confirmado testando o próprio app, não só lendo a documentação (no mesmo espírito do ticket
027 em si).

---

## Pergunta 1 — Existe diferença real entre TIM, Claro e Vivo relatada pela comunidade?

**Não encontrei nenhuma.** Busquei de duas formas:

- **Direto nas issues de banimento do Baileys** — as mesmas já mapeadas nos research 023/026 mais
  outras encontradas nesta busca (**[primária, relato direto]**):
  [#1869](https://github.com/WhiskeySockets/Baileys/issues/1869) ("High number of bans"),
  [#2075](https://github.com/WhiskeySockets/Baileys/issues/2075) ("Repeated Number Bans"),
  [#1983](https://github.com/WhiskeySockets/Baileys/issues/1983),
  [#2260](https://github.com/WhiskeySockets/Baileys/issues/2260) ("GETTING BANNED"),
  [#2441](https://github.com/WhiskeySockets/Baileys/issues/2441) (a mesma investigação do erro 463
  do research 026). Em nenhuma delas qualquer comentarista menciona operadora, país do número ou
  tipo de chip como fator. A discussão técnica real (research 026) é inteiramente sobre tokens de
  protocolo (`tctoken`/`cstoken`) e idade da sessão — variáveis que não têm relação com qual
  operadora emitiu o SIM.
- **Buscas amplas por "qual operadora" + Baileys/Evolution API/automação** — não retornaram
  nenhuma fonte (fórum, Reddit, Discord indexado, blog) comparando TIM/Claro/Vivo por risco de
  banimento ao vincular como dispositivo. O que apareceu foi só comparação de **custo de plano**
  (pergunta 2) e de **cobertura geográfica** (irrelevante para uma linha que só precisa receber
  SMS/chamada uma vez).

**Leitura honesta:** isso não é "a pesquisa não achou porque não procurou o suficiente" — é
consistente com o próprio mecanismo técnico já documentado no research 026 (erro 463, sistema de
tokens de privacidade): a Meta distingue contas por **comportamento e idade de sessão na camada de
protocolo**, não por operadora de origem do número. Não há razão técnica esperada para uma
diferença existir, e a comunidade, de fato, não relata nenhuma.

---

## Pergunta 2 — Custo mínimo para manter linha ativa num teste curto (Setembro de 2026)

Comparação direta, com preço vigente no momento desta pesquisa (setembro de 2026) — todas as
fontes são **secundárias** (agregadores de plano; nenhuma operadora publica página própria clara
de "recarga mínima para manter linha sem dados"):

| Operadora | Recarga mínima confirmada | Validade | Observação |
|---|---|---|---|
| **Vivo** | **R$ 15,00** | 30 dias | Explicitamente anunciada como recarga **sem bônus de internet**, para só manter a linha ativa — é a opção com o enunciado mais direto para o uso do 027. Fonte: [melhorplano.net/vivo/planos-vivo/vivo-recarga](https://melhorplano.net/vivo/planos-vivo/vivo-recarga) (**secundária**, atualizada em 24/07/2026). |
| **TIM** | R$ 20,00 | Não especificado com a mesma clareza para o mínimo puro (planos com dados na mesma faixa de preço variam entre 17 e 30 dias) | Custo do chip em si: R$10–15. Fonte: [minhaconexao.com.br/planos/tim/planos-tim/tim-pre-pago](https://www.minhaconexao.com.br/planos/tim/planos-tim/tim-pre-pago) (**secundária**, atualizada em 12/08/2026, planos revisados em 09/09/2026). |
| **Claro** | Sinal mais fraco: uma fonte cita recarga a partir de R$15 ([comocomprar.com.br](https://comocomprar.com.br/como-comprar-chip-celular-2026-tim-vivo-claro-onde-cpf/), **secundária**), outra (mais recente, 23/07/2026) só encontra recarga a partir de R$30 já com pacote de dados (plano "Prezão"), sem confirmar um mínimo "sem dados" equivalente ao da Vivo. Fonte: [melhorplano.net/claro/chip-claro](https://melhorplano.net/claro/chip-claro) (**secundária**). | — | As duas fontes não convergem no mesmo número — trato R$15–30 como faixa, não como valor único confirmado. |

**Para um teste de dias a poucas semanas** (não uso contínuo), qualquer uma das três recargas
mínimas cobre o período com folga, porque a validade mínima encontrada (30 dias na Vivo, e
provavelmente equivalente nas outras) já excede o prazo do teste do 027. A diferença entre as três
opções é de **R$5 a R$15** — pequena o bastante para não ser o critério de decisão. **A Vivo é a
recomendação por ter a informação mais clara e direta para exatamente este uso** ("recarga sem
bônus de internet, só para manter a linha"), não porque exista evidência de menor risco de
banimento.

**Nota de método, igual à dos research anteriores:** valores datados de setembro de 2026, sujeitos
a mudança e a variação por canal/região; nenhuma das fontes é a página oficial da própria
operadora, todas são agregadores comerciais de comparação de planos.

---

## Pergunta 2b — eSIM com ativação imediata: existe caminho 100% online, sem loja física e sem espera?

Requisito adicional levantado depois do início desta pesquisa: a linha não pode depender de
entrega física por Correios nem de visita a loja — precisa ser possível comprar e ativar **hoje
mesmo, em minutos/horas**. Fui direto às páginas oficiais das três operadoras e a cobertura de
imprensa técnica sobre elas.

### TIM — não confirmado; a própria operadora nega a opção online hoje

**[secundária, mas citação direta de página que reproduz a posição da própria TIM]** A página
oficial-adjacente de comparação mais recente encontrada afirma, sem ambiguidade:

> "Para ativar um eSIM da TIM, é necessário adquiri-lo em uma loja física da operadora, já que, no
> momento, a opção ainda não está disponível na loja online."
>
> — [melhorplano.net/tim/esim-tim](https://melhorplano.net/tim/esim-tim) (**secundária**, conteúdo
> atualizado em 24/04/2026)

Ou seja: pelo menos até abril de 2026, a TIM **não oferece** um caminho de compra 100% online para
eSIM — a etapa de obter o QR code exige ida a uma loja física, o que descumpre o requisito de
"imediato, sem loja física" para esta operadora.

### Claro — o canal oficial também aponta loja física para a linha nova; existe revenda terceirizada não confirmada

**[primária quanto à existência da página, mas o texto da própria Claro é ambíguo]** A página
oficial da Claro sobre eSIM ([claro.com.br/celular/esim](https://www.claro.com.br/celular/esim))
descreve a compra como possível "pela loja online", mas a etapa de retirada do QR code aparece
condicionada a "Após adquirir o QR Code em uma loja da Claro, siga o processo de ativação no seu
aparelho" — o que sugere que, para uma linha **nova** (não conversão de chip físico já ativo), o
caminho oficial ainda passa por loja física para a entrega do QR code, mesmo que o restante do
processo seja digital. Cobertura de imprensa técnica confirma que a Claro **liberou** conversão de
chip físico → eSIM direto pelo app com biometria (FaceID/TouchID) — mas isso pressupõe **já ter uma
linha física Claro ativa**, não cobre "abrir linha nova hoje sem chip físico"
([TudoCelular — "Claro libera ativação do eSIM em seu aplicativo de forma discreta"](https://www.tudocelular.com/android/noticias/n225478/claro-libera-ativacao-esim-em-seu-aplicativo.html),
**secundária**).

Existem serviços de terceiro (`chipvirtualesim.com.br`, `esimcomprar.com`, anúncios no Mercado
Livre) vendendo "eSIM Claro Pré-Pago, número novo, QR code por e-mail em 2h a 48h úteis"
(**[secundária, comercial, não confirmada como canal oficial]**). Não consegui confirmar se são
revendedores autorizados fazendo a ida à loja por conta do comprador (um serviço legítimo, só
terceirizando a parte física) ou uma zona cinzenta de revenda — nenhuma dessas páginas se identifica
como parceiro oficial da Claro, e o prazo de "até 48h úteis" já não bate com "imediato". **Trato
esse caminho como não confirmado**, e ele reintroduz exatamente o risco de revendedor não-oficial
que a pergunta 3 já recomenda evitar (chip/número de procedência incerta).

### Vivo — o candidato mais forte, mas sem confirmação explícita para "linha nova" (só para "gerenciar eSIM")

**[secundária, mas convergente entre a página oficial da Vivo e cobertura de imprensa técnica]** A
Vivo é a única das três com evidência consistente de um fluxo **via app, sem loja física**:

> "A Vivo está disponibilizando a opção [de eSIM direto pelo app, sem loja] para clientes de planos
> Pré-pago" — cobertura de mudança liberada em maio de 2024, ainda referenciada como o estado atual
> em fontes de 2026 (**secundária**, [pontobyte.com/esim-vivo](https://pontobyte.com/esim-vivo/)).

> "A ativação do eSIM pelo App Vivo está disponível para os planos Pré-Pago, Pós-Pago e Controle
> [...] a Vivo realiza a confirmação biométrica do titular da linha, capturando uma foto do rosto
   [...] a confirmação leva apenas alguns minutos."
>
> — convergência de [vivo.com.br/.../esim/ativacao-esim](https://vivo.com.br/para-voce/produtos-e-servicos/para-o-celular/esim/ativacao-esim)
> e [melhorplano.net/vivo/esim-vivo](https://melhorplano.net/vivo/esim-vivo) (**secundária**,
> atualizada em 21/07/2026), citando: "Você pode comprar o chip virtual Vivo (eSIM) pelo site da
> Vivo, pelo App Vivo ou em uma loja física da operadora" — o app aparece como opção equivalente à
> loja, não subordinada a ela.

**A ressalva que impede uma confirmação plena:** nenhuma das páginas oficiais ou de imprensa lidas
confirma, em texto explícito, se esse fluxo cobre **abrir uma linha totalmente nova (primeira linha
daquele CPF na Vivo)**, ou só a **gestão/conversão de uma linha Vivo que já existe** (ex.:
converter um chip físico recém-comprado, ou já cadastrado, para eSIM). O texto fala em "titular da
linha" e "requisição de eSIM pelo app" de forma genérica o bastante para não distinguir os dois
casos. **Isto não foi confirmado nem refutado por nenhuma fonte consultada — é uma pergunta que só
se responde tentando o fluxo no app**, no mesmo espírito de teste que o próprio ticket 027 já adota
para outras perguntas.

### Resposta direta à pergunta do dono do projeto

**Nenhuma das três operadoras tem, documentado em fonte oficial própria, um caminho 100% confirmado
de ativar uma linha pré-paga nova via eSIM, hoje, sem qualquer contato físico** — isso é uma
resposta válida, não uma lacuna de busca: a TIM nega explicitamente a opção online; a Claro
documenta a retirada do QR code em loja para o caso não coberto pela conversão via app; e a Vivo,
apesar de ter o fluxo mais promissor e mais bem documentado de "eSIM pelo app, com biometria, sem
loja", não tem confirmação textual de que esse fluxo específico cobre uma linha **nova**. **A
alternativa mais rápida e realista, dado o que esta pesquisa encontrou, é testar o fluxo do app da
Vivo diretamente** (é gratuito e leva minutos segundo as próprias fontes) — se ele exigir uma linha
Vivo pré-existente para funcionar, a alternativa realista que sobra é chip físico com entrega
expressa via marketplace (o mesmo tipo de serviço de terceiro mencionado para Claro, mas
comprando **chip físico**, não eSIM) — nenhuma fonte consultada confirma prazo de entrega no mesmo
dia para esse caminho no Brasil; ficaria como algo a verificar separadamente se a Vivo não resolver.

---

## Pergunta 3 — Onde a comunidade compra o chip na prática

Convergência consistente entre fontes independentes (**todas secundárias**, mas concordantes entre
si e reforçadas por reclamações reais de consumidor):

- **Canais recomendados:** loja física da operadora, app/site oficial (com entrega em casa,
  segundo [comocomprar.com.br](https://comocomprar.com.br/como-comprar-chip-celular-2026-tim-vivo-claro-onde-cpf/)),
  e grandes redes de varejo — Magazine Luiza, Carrefour, Americanas, lotéricas, farmácias
  (Droga Raia, Pacheco, Pague Menos), bancas de jornal, postos com loja de conveniência (Shell).
  Fontes: [comocomprar.com.br](https://comocomprar.com.br/como-comprar-chip-celular-2026-tim-vivo-claro-onde-cpf/),
  [melhorplano.net/claro/chip-claro](https://melhorplano.net/claro/chip-claro),
  [minhaconexao.com.br](https://www.minhaconexao.com.br/planos/tim/planos-tim/tim-pre-pago) — as
  três, independentemente, listam praticamente o mesmo conjunto de canais oficiais/redes
  estabelecidas.
- **Recomendação recorrente: evitar vendedor informal.** A frase mais direta encontrada:
  **"NUNCA compre chip de fontes informais (camelô, marketplace pequeno, vendedor de rua)"**, com
  o risco citado sendo "chip pré-usado, bloqueado ou clonado"
  ([comocomprar.com.br](https://comocomprar.com.br/como-comprar-chip-celular-2026-tim-vivo-claro-onde-cpf/),
  **secundária**). Note que a ressalva é sobre **vendedor informal/pequeno**, não sobre
  e-commerce estabelecido — nenhuma fonte encontrada nesta pesquisa recomenda evitar Mercado Livre
  ou Amazon *por si só*; o alerta é sobre vendedor não identificável, seja no marketplace, seja na
  rua.
- **O risco concreto que essa recomendação evita é documentado, não hipotético: chip "reciclado"
  que já chega com uma conta de WhatsApp de outra pessoa vinculada.** Confirmado por reclamações
  reais de consumidor no Reclame Aqui
  ([CHIP NOVO VEIO BANIDO NO WHATSAPP? — TIM](https://www.reclameaqui.com.br/tim-celular/chip-novo-veio-banido-no-whatsapp_iLMxRjBDEAVu6AuD/),
  [Chip novo, com número banido — WhatsApp](https://www.reclameaqui.com.br/whatsapp/chip-novo-com-numero-banido_rbKLq1tDABDuNx3K/),
  **secundárias, relatos de consumidor real**) e por um guia técnico de terceiro
  ([Tecnoblog — "Comprou um chip novo e veio com o WhatsApp de outra pessoa?"](https://tecnoblog.net/responde/comprou-um-chip-novo-e-veio-com-o-whatsapp-de-outra-pessoa-saiba-o-que-fazer/),
  **secundária**), que explica o mecanismo: operadoras reciclam números de linhas desativadas, e a
  reciclagem de número **não é ilegal** — segundo o Procon de Londrina, a operadora não se
  responsabiliza pelas consequências de dados do dono anterior
  ([O Londrinense](https://olondrinense.com.br/redes-sociais/venda-de-chip-reciclado-por-operadora-de-celular-revela-dados-de-aplicativo-de-mensagens/),
  **secundária**). Ou seja: **não é a operadora que "bane" o chip** — é a chance de o número já
  ter passado por outro dono no WhatsApp, o que qualquer uma das três operadoras pode entregar
  igualmente, e que só se mitiga escolhendo canal de compra com melhor controle de estoque (loja
  oficial, chip com maior probabilidade de ser genuinamente novo), não escolhendo operadora.

**Relevância direta para o teste do 027:** um chip reciclado que já chega com conta de WhatsApp
ativa de outra pessoa **não invalida o teste do 027**, tecnicamente — dá até para "assumir" o
número (o WhatsApp permite reverificar e a conta anterior é desconectada) — mas atrasa o teste e
introduz uma variável ruidosa (número com histórico desconhecido, possivelmente já com sinais de
uso anterior que a Meta rastreia, conforme research 026, pergunta de idade/histórico de número).
Comprar em canal oficial reduz a chance de precisar lidar com isso, mas não a elimina — nenhuma
fonte garante "chip 100% novo, nunca usado no WhatsApp" nem mesmo comprando na loja da operadora.

---

## Pergunta 4 — Alguém documentou publicamente qual chip usou para testar como dispositivo adicional?

**Não encontrei nenhum relato que corresponda exatamente ao cenário do 027** (Baileys/Evolution API
entrando como dispositivo **adicional** de uma conta já existente, não como número principal do
bot). A busca por esse cenário específico não retornou nada em GitHub, Reddit ou fóruns indexados.

O achado mais próximo, citado como **[terciária, anedota isolada, não é o mesmo cenário]**, é uma
thread de fórum de devs brasileiros:

> **TabNews — ["\[dúvida\] bot de whatsapp"](https://www.tabnews.com.br/rafinhahdc19/duvida-bot-de-whatsapp)**,
> comentários datados de ~2 anos antes desta pesquisa (portanto por volta de 2024 — **preços aí
> citados estão desatualizados**, não usar para pergunta 2). O usuário `Oletros` recomenda: "Compre
> um chip TIM pré-pago, coloque R$50 reais — estes créditos valem por 6 meses" e sugere conectar o
> chip por pelo menos 24h a cada 30 dias num emulador Android (MEMU) para não perder o número. O
> usuário `satulg` relata ter usado **Vivo Easy** (R$10/1GB) com sucesso por 3 anos num dispositivo
> de rastreamento — mas `ethi` avisa, na mesma thread, que a Vivo descontinuou esse plano depois,
> convertendo assinaturas existentes para cobrança mensal padrão sem aviso. **Nenhum dos dois
> comentários fala de dispositivo vinculado/adicional** — os dois descrevem o chip como número
> **principal** de um bot ou rastreador, o oposto do cenário do 027 (número já existente da loja,
> automação entrando como vinculado). Cito porque é o único relato de escolha de operadora
> encontrado com nome de usuário e contexto de automação real, mas com a ressalva clara de que não
> responde à pergunta exata do 027.

Nenhuma outra fonte consultada — issues do Baileys, discussões do whatsmeow, blogs de Evolution
API, Reclame Aqui — descreve alguém testando ou documentando o cenário de dispositivo adicional
com identificação de qual chip usou.

---

## Lacunas que esta pesquisa não fecha

1. **Nenhum relato de teste real do cenário exato do 027** (chip novo vinculado como dispositivo
   adicional a uma conta já existente com Baileys/Evolution API) foi encontrado — nem para
   confirmar nem para refutar qualquer escolha de operadora. Isso só se fecha fazendo o teste do
   próprio ticket 027.
2. **Preço exato da recarga mínima "sem dados" da Claro não foi confirmado com a mesma clareza que
   Vivo e TIM** — as duas fontes consultadas não convergem no mesmo valor.
3. **Nenhuma fonte garante chip "genuinamente novo, nunca usado no WhatsApp" nem mesmo comprando em
   canal oficial** — a reciclagem de número é prática legal e normalizada no setor; o risco é
   reduzido pelo canal de compra, não eliminado.
4. **Não foi possível confirmar se o histórico anterior de um chip reciclado (conta WhatsApp de
   outra pessoa) deixa algum sinal residual relevante para o risco de banimento discutido no
   research 026** (idade de número vs. idade de sessão) — pergunta em aberto, sem fonte que a
   responda.
5. **Se o fluxo de eSIM via app da Vivo cobre abrir uma linha nova (não só gerenciar uma já
   existente) não foi confirmado nem refutado por nenhuma fonte oficial ou de imprensa consultada**
   — é a lacuna mais importante desta atualização, e só se fecha testando o app diretamente.
6. **Se a Claro ou a TIM passaram a oferecer eSIM 100% online para linha nova depois das datas de
   atualização das páginas consultadas** (Claro sem data clara; TIM em 24/04/2026) não foi
   reverificado — ambas mudam esse tipo de processo com frequência, então vale reconferir antes de
   descartar as duas de vez.
7. **Se os serviços de terceiro que vendem "eSIM Claro/Vivo/TIM pré-pago, número novo, QR code por
   e-mail" (`chipvirtualesim.com.br`, `esimcomprar.com`, Mercado Livre) são revenda autorizada ou
   zona cinzenta** não foi confirmado — nenhum deles se identifica como parceiro oficial nas
   páginas lidas.

---

## Addendum — Salvy: MVNO regulada, candidata não considerada na pesquisa original

**Investigado em 2026-09-11, depois da pesquisa principal**, a partir de um link que o dono do
projeto encontrou e pediu para verificar (`salvy.com.br`) — não fazia parte do escopo original,
que comparou só TIM/Claro/Vivo. Verificação direta na página oficial da empresa
(**[primária]**):

- **É uma operadora móvel virtual (MVNO) regulada pela Anatel** — não um serviço de número
  virtual/VoIP disfarçado. Fundada em 2022 em Curitiba (mesma cidade da loja), com aporte de
  EBANX, Madeira Madeira, Olist e Pipefy, investida pela Y Combinator, vencedora do "MVNO Nation
  Global Awards 2024" como melhor operadora B2B — dados apresentados no próprio FAQ da empresa,
  não verificados de forma independente nesta sessão, mas verificáveis (Anatel publica outorgas
  de MVNO).
- **A própria empresa separa dois produtos que não devem ser confundidos** (FAQ, citação direta):
  > "Chip (físico) e eSIM (chip digital): Têm dados móveis, ligações e SMS. Funcionam como uma
  > linha móvel. [...] Número virtual: Não possui chip. Não tem planos de dados e não faz
  > ligações. Uso exclusivo no WhatsApp Business, indicado para quem opera pela API oficial da
  > Meta."

  Ou seja: o produto "**eSIM**" da Salvy é uma **linha móvel real** (candidato válido para o
  027, na mesma categoria de TIM/Claro/Vivo); o produto "**Número virtual**" deles é outra coisa
  — feito para quem usa a **API oficial da Meta** (BSP/Cloud API), que este projeto **não** usa
  (decisão do ticket 016, self-hosted via Baileys) — não serve para este teste.
- **Sinal de "imediato" nos depoimentos da própria página** (não confirmado por fonte
  independente): "a ativação acontece em segundos" (CTO cliente) e "chip ativo em poucos
  minutos" (cliente de suporte) — mas são depoimentos de marketing, não documentação técnica do
  fluxo.
- **É um produto B2B, não uma compra de varejo avulsa.** O cadastro (`app.salvy.com.br/sign-up`)
  pede **e-mail corporativo** (`nome@empresa.com.br`) já na primeira tela — não foi levado além
  disso nesta sessão (criar conta é decisão do dono do projeto, não algo a fazer por ele). Não
  há tabela de preço pública no site — o modelo é lead-gen com chat comercial ("Carla da
  Salvy"), preço provavelmente sob consulta.
- **Não confirmado nesta investigação:** preço do eSIM avulso, se aceita pessoa física com CNPJ
  de pequena empresa (a loja tem CNPJ, então provavelmente qualifica) ou exige volume mínimo de
  linhas, e se o número entregue é genuinamente novo (nenhuma fonte independente de reciclagem
  de número foi encontrada especificamente sobre MVNOs, só sobre TIM/Claro/Vivo).

**Não é uma substituição das operadoras tradicionais na conclusão principal** — é uma
alternativa a mais, que parece resolver "online e imediato" melhor do que qualquer uma das três
grandes (nenhuma delas confirmou isso para linha nova), mas com o custo de ser um fluxo B2B com
e-mail corporativo, não uma compra anônima de balcão.

---

## Recomendação (não-vinculante — a decisão é do dono do projeto)

Para o teste do ticket 027, **a escolha de operadora não é uma decisão de engenharia** — nenhuma
fonte consultada, incluindo as próprias issues de banimento do Baileys, associa operadora a risco
ou fricção. Mas o requisito adicional de "online e imediato" **é** uma diferença real de fricção
entre as três, e muda a recomendação:

- **Primeiro passo: testar o fluxo de eSIM pelo app da Vivo diretamente.** É a única das três com
  sinal forte de caminho via app, sem loja física, com ativação em minutos e biometria facial. Não
  custa nada tentar (a ativação é gratuita segundo a própria Vivo), e é a forma mais rápida de
  responder à pergunta que nenhuma documentação resolve: se esse fluxo cria uma linha nova ou só
  gerencia uma existente. Isso é, na prática, o mesmo princípio de teste que o ticket 027 já aplica
  às outras perguntas em aberto — não dá para saber lendo, só tentando.
- **Se o fluxo da Vivo exigir linha pré-existente:** a TIM já nega explicitamente a opção 100%
  online (própria página confirma exigência de loja física); a Claro tem o mesmo problema para
  linha nova, com a única alternativa sendo serviços de terceiro não confirmados como oficiais
  (`chipvirtualesim.com.br`, `esimcomprar.com`, Mercado Livre) — que reintroduzem o mesmo risco de
  procedência incerta que a pergunta 3 já recomenda evitar, e cujo prazo (até 48h úteis) também não
  é, estritamente, "imediato".
- **Se nenhum caminho de eSIM resolver hoje:** a alternativa realista que sobra é chip físico
  comprado em canal oficial (loja física da operadora, ou grande rede de varejo/farmácia com
  estoque, como já mapeado na pergunta 3) — o que reintroduz a espera de deslocamento, mas não a de
  entrega por Correios, e ainda é mais rápido que qualquer caminho de eSIM não confirmado.
- **Evitar vendedor informal/de rua/marketplace sem identificação clara do vendedor**, tanto para
  chip físico quanto para eSIM revendido por terceiro — não por risco de banimento por operadora,
  mas para reduzir a chance de o número já vir com uma conta de WhatsApp de terceiro vinculada
  (documentado tanto para chip físico quanto, no caso da Claro, para eSIM comprado online — ver
  pergunta 3), o que atrasaria o teste sem agregar nada a ele.
- **Não esperar que a escolha de chip/eSIM reduza o risco de banimento mapeado no research 026** —
  esse risco é de protocolo (tokens de privacidade, idade de sessão), não de operadora de origem do
  número nem do formato físico/eSIM da linha. A linha resolve "ter um número válido para
  registrar", não "reduzir risco de detecção".
