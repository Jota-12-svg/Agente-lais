---
id: "009"
title: Como funciona o atendimento da Lais Casa hoje, ponta a ponta
labels: [wayfinder:grilling]
status: open
assignee: sessão 2026-08-10 (grilling com o dono do projeto)
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

---

## Respostas do grilling (em andamento — sessão de 2026-08-10)

Anotadas conforme o dono do projeto responde. A `## Resolução` consolida no fim.

### O canal e as pessoas

- **Quatro pessoas atendem** pelo número: 3 consultoras + a dona da loja.
- **O limite de 4 acompanhantes do Coexistence não é um problema** — a estrutura é *1 aparelho
  principal + até 4 acompanhantes*, e a **Cloud API não ocupa vaga de acompanhante**: ela é
  via de integração no nível da conta, não dispositivo vinculado. Confirmado na doc da Meta
  (*"Businesses can link up to four WhatsApp 'companion' clients"*). O incômodo real do
  onboarding permanece: todos os acompanhantes são desvinculados e cada pessoa reconecta o
  seu depois.
- ⚠️ **Ponto cego descoberto:** mensagem enviada de um companion **não suportado** não dispara
  webhook — e o **WhatsApp para Windows** está na lista de não suportados. Algumas consultoras
  usam esse app hoje. Se elas responderem por ele, o agente não sabe que um humano assumiu e
  pode responder por cima. Investigado em
  [research/019](../research/019-companion-windows-ponto-cego.md).

### Roteamento — como o contato chega a uma consultora

- **Rodízio.** Contato novo vai para a próxima da fila, sempre intercalando entre as quatro.
  Regra determinística, executável sem julgamento.
- **O estado do rodízio não está escrito em lugar nenhum** — vive no acordo entre elas, cada
  uma sabendo de cabeça quem pegou o último.
- **O vínculo cliente↔consultora mora na planilha compartilhada** (uma aba por consultora).
- **Cliente que volta fura a fila**: vai para a consultora dona dele, fora do rodízio.

**Consequência de desenho** (a confirmar no ticket de escalada): o agente precisa de duas
coisas que hoje não existem em formato legível por máquina — **um registro de quem é a vez**
e **a planilha consultável por número de telefone**, para saber no primeiro "oi" se aquele
número já tem dona. Sem as duas, ele distribui errado.
