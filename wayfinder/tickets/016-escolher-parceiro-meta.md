---
id: "016"
title: Escolher o parceiro Meta para o onboarding do WhatsApp
labels: [wayfinder:research]
status: closed
assignee: Claude
blocked-by: ["009"]
---

## Question

A decisão de caminho já está tomada — [Coexistence](005-caminho-de-integracao-com-o-whatsapp.md),
com o número seguindo no app das consultoras e o agente entrando pela Cloud API. Mas
Coexistence **exige onboarding por um Solution Partner ou Tech Provider da Meta**: não existe
caminho direto para um desenvolvedor comum. Escolher esse parceiro é a próxima decisão, e ela
tem consequência longa — é por ele que todas as mensagens do agente vão passar.

Bloqueado pelo [ticket do atendimento atual](009-como-funciona-o-atendimento-hoje.md) porque
o número de consultoras e o arranjo de aparelhos mudam o que se pede do parceiro.

O research deve comparar os candidatos relevantes no Brasil — 360dialog, Twilio, Gupshup,
Zenvia, Take Blip, Meta Cloud API via parceiros menores — em:

1. **Suporte real a Coexistence.** Nem todo parceiro implementa o *business app number
   onboarding*. Este é o filtro eliminatório: quem não suporta, sai da lista.
2. **Custo.** Quanto o parceiro cobra **por cima** da tarifa da Meta: markup por mensagem,
   mensalidade, taxa de setup. Dado que a fase 1 quase não gera mensagem tarifada, uma
   mensalidade fixa pode dominar o custo total — comparar pelo custo mensal real esperado, não
   pelo preço por mensagem.
3. **Acesso à API.** O parceiro expõe a Cloud API crua, ou obriga a passar pela plataforma
   dele? Plataforma própria costuma vir com um inbox que a loja não quer e não vai usar.
4. **Suporte no Brasil**, em português, e o que acontece quando o número tem problema.
5. **Portabilidade.** Sair depois é fácil? O número volta? O histórico vai junto? Um parceiro
   de onde não se sai é um risco de refém.
6. **Faturamento em BRL**, dado que a Meta localizou a cobrança em julho de 2026 e exige a
   migração das contas até junho de 2027.

**Resolvido quando** houver um comparativo com custo mensal estimado para o volume real da
Lais Aliski Casa e uma recomendação. A escolha final é do dono do projeto — é ele quem assina o
contrato.

## Resolução

**A pergunta do ticket mudou de figura no meio da investigação.** Começou como "qual parceiro
Meta contratar" e terminou como "vale pagar parceiro nenhum". Seis documentos de research,
nesta ordem:

1. [research/016](../research/016-parceiro-meta-onboarding.md) — comparativo dos parceiros
   pagos para Coexistence. 360dialog (~€49/mês, ~R$300) era o mais barato viável. **O dono do
   projeto considerou esse custo inviável** para o orçamento da loja.
2. [research/022](../research/022-alternativas-onboarding-sem-parceiro-pago.md) — os "6
   dispositivos" que a loja já usa **não são Coexistence** (o número nunca foi onboardado na
   Cloud API); por eliminação, é provavelmente WhatsApp Business Premium, recurso do app sem
   relação com a Cloud API — **pendente confirmar com a loja**. Confirma também que
   Coexistence não tem caminho gratuito real; só "número paralelo" (Cloud API direto pela
   Meta, sem parceiro) é genuinamente grátis, ao custo de um handoff desajeitado.
3. [research/023](../research/023-comunidade-whatsapp-ia-baixo-custo.md) — como a comunidade
   resolve isso fora do discurso comercial dos BSPs; reavalia bibliotecas não-oficiais
   (Baileys/Evolution API) com fontes mais neutras.
4. [research/024](../research/024-arquitetura-self-hosted-whatsapp.md) — **o achado que
   decidiu o ticket.** Um agente self-hosted (Baileys) pode entrar como mais um dispositivo
   vinculado **no número que a loja já usa hoje**, sem parceiro nenhum, sem trocar de número.
   Por como a sincronização multi-device funciona (client-fanout, sem distinguir tipo de
   dispositivo), esse caminho provavelmente não tem o ponto cego do WhatsApp para Windows que
   aflige o Coexistence oficial (ticket [019](019-companion-windows-ponto-cego.md)) — não
   testado, mas plausível pela arquitetura documentada da própria Meta.
5. [research/025](../research/025-numero-dedicado-com-acesso-da-loja.md) — a alternativa de
   número novo dedicado, com a loja tendo acesso a ele, foi **descartada em conversa**: isola
   o risco de banimento, mas isola também o agente do resto do ecossistema da loja (sem
   visão do que a consultora faz depois do handoff) e obriga a consultora a operar duas
   contas de WhatsApp separadas — dois problemas que o research não tinha coberto e que só
   apareceram ao formular a pergunta em conversa com o dono do projeto.
6. [research/026](../research/026-o-que-causa-banimento.md) — investigação de protocolo
   (código-fonte, não especulação) sobre o que causa banimento de verdade. Achado central: o
   WhatsApp distingue de fato, via um token de protocolo (`tctoken`/`cstoken`), "conversa já
   estabelecida" de "contato novo" — só a segunda é limitada por taxa (erro `463`). A hipótese
   do dono do projeto ("só agente ativo bane, reativo é seguro") **acerta o mecanismo real**,
   mas bibliotecas não-oficiais nem sempre implementam esse token corretamente, o que explica
   por que existe relato de banimento em uso puramente reativo. Entrega um checklist
   acionável de comportamento do agente para reduzir (não eliminar) o risco residual.

**Decisão do dono do projeto:** seguir com a arquitetura do research 024 — **agente
self-hosted (Baileys/Evolution API) conectado como dispositivo adicional no número atual da
loja, sem parceiro Meta, sem número novo.** Escolhida sobre as outras quatro por eliminação em
conversa:

- **Coexistence pago** (research 016) descartado por custo.
- **Número paralelo puro** (research 022) descartado por isolar o agente do resto do
  atendimento e obrigar o cliente a trocar de conversa no handoff.
- **Número dedicado com acesso da loja** (research 025) descartado por isolar o agente do
  ecossistema da loja e exigir duas contas de WhatsApp separadas para a consultora.
- **Virar Tech Provider da própria loja** descartado por ser zona cinzenta não pavimentada
  pela Meta (research 022).

**Risco aceito conscientemente:** essa arquitetura concentra o risco de banimento (real,
mitigável mas não eliminável — research 023 e 026) sobre o **número de produção** da loja, não
um número descartável. O dono do projeto optou por esse risco em vez do custo do Coexistence
pago e do isolamento das outras alternativas, com o checklist do research 026 como mitigação e
um teste técnico antes de produção como condição — ver ticket
[027](027-testar-self-hosted-no-numero-atual.md).

**Isto reverte, para esta decisão específica, a rejeição de provedores não-oficiais registrada
no ticket [005](005-caminho-de-integracao-com-o-whatsapp.md)** ("Provedores não-oficiais foram
descartados: violam os termos da Meta e o banimento é do número"). O research 005 não tinha o
achado do erro 463/tokens de privacidade (research 026) nem havia pesado o custo do parceiro
contra o orçamento real da loja — informação que só existe agora. A reversão é específica a
"self-hosted no número atual"; não reabre a rejeição de número novo via biblioteca não-oficial
sem cuidado (research 025 mostrou que isso também tem custo, só que operacional, não de
banimento).

**Consequência para o ticket [019](019-companion-windows-ponto-cego.md):** ele testava o ponto
cego do Windows especificamente sob Coexistence, que deixou de ser o caminho. Anotado nele que
a pergunta original está em pausa — o teste equivalente para a arquitetura escolhida entra no
ticket 027.
