---
id: "009"
title: Como funciona o atendimento da Lais Casa hoje, ponta a ponta
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: []
---

## Question

Este é o ticket-raiz do mapa: quase toda decisão de comportamento do agente depende de
entender o atendimento que já existe. O agente entra num processo em andamento, e o usuário
foi explícito — **o processo não muda para acomodar o agente**.

A conversa precisa reconstruir o caminho real de um contato, do primeiro "oi" ao desfecho:

**O canal e as pessoas**
- Quantas consultoras são? O WhatsApp Business é **um número compartilhado** por todas ou
  cada consultora tem o seu? (Muda tudo em roteamento e handoff.)
- **Como os aparelhos estão vinculados hoje?** Vindo do research do WhatsApp: o Coexistence
  suporta até **4 dispositivos acompanhantes**, e todos são desvinculados durante o
  onboarding — cada consultora reconecta o dela depois. Se houver mais de 4 consultoras num
  número só, o arranjo atual não é o que imaginamos e precisa ser entendido antes.
- Quando chega um contato novo, quem atende? Existe rodízio, ou quem viu primeiro?
- Como um cliente vira "cliente da Fulana" e o que acontece quando ele volta meses depois.
- Qual o horário de atendimento? O que acontece com mensagem que chega de madrugada?

**O consumidor final**
- Como uma conversa típica começa? De onde vem esse contato — Instagram, indicação, passou
  na loja?
- O que a consultora pergunta, e em que ordem?
- Quando a conversa vira visita à loja, e quando resolve tudo pelo WhatsApp?
- Como se fala de preço numa faixa que vai de R$ 2 mil a R$ 50 mil?

**O arquiteto**
- Ele chega diferente? Já manda a planilha de cara, ou conversa antes?
- O que a consultora faz quando recebe a planilha, passo a passo.
- Quanto tempo leva para responder, e o que trava esse tempo.

**Estoque e produto**
- Como a consultora responde "vocês têm esse vaso?" hoje, sem sistema de estoque.
- Com que frequência ela promete algo que depois não tinha?
- O que ela consegue responder de cabeça e o que exige levantar da loja.

**A agenda** (vindo do research do Google Calendar, que não pode ser concluído sem isto)
- As consultoras mantêm agenda no **Google Calendar** hoje — de verdade, atualizada? Ou os
  compromissos vivem só na cabeça delas e no WhatsApp?
- A loja tem **Google Workspace** (e-mail em domínio próprio) ou contas **Gmail** comuns?
  Isso decide o modelo de autenticação inteiro.
- Como uma visita à loja é marcada hoje, do ponto de vista da consultora?

**O desfecho**
- O que acontece depois do "quero comprar": cotação no Maino, pagamento, entrega?
- Quanto tempo leva do primeiro contato à venda, nos dois públicos?
- Quando um contato é considerado perdido?

**Resolvido quando** o fluxo estiver descrito com clareza suficiente para desenhar em cima
dele. A resolução consolida isso e deve produzir o vocabulário do domínio — o que é lead,
cliente, cotação, atendimento — via `/domain-modeling`.
