---
id: "019"
title: Descobrir de quais dispositivos a consultora pode responder sem cegar o agente
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["016"]
---

## Question

Descoberto durante o grilling do ticket
[009](009-como-funciona-o-atendimento-hoje.md): em Coexistence, **mensagem enviada de um
dispositivo acompanhante não suportado não dispara webhook**. A Meta nomeia dois não
suportados: **WhatsApp para Windows** e **WearOS**.

Isso é grave para nós. Se uma consultora responde ao cliente pelo app de Windows, o agente
não recebe sinal nenhum, não sabe que um humano assumiu, e pode responder por cima dela —
na frente de um cliente de até R$ 50 mil. E a informação é **perdida, não atrasada**: o
research [019](../research/019-companion-windows-ponto-cego.md) fechou os quatro caminhos de
recuperação (echo, history, app state sync, polling). Nenhum funciona.

**Algumas consultoras usam o app de Windows hoje**, e tirá-lo delas é atrito real — o mapa
fixou que o processo da loja não se dobra ao agente.

A pergunta que sobra **não é de pesquisa, é de teste**: a Meta só publica a lista de *não*
suportados, nunca a de suportados. Pela leitura literal, WhatsApp Web no navegador, app de
Mac e celular secundário seriam suportados por exclusão — mas isso não está confirmado, e o
app de Windows moderno é tecnicamente um invólucro do WhatsApp Web, o que levanta a dúvida
de o navegador cair junto.

**O teste**, a rodar logo depois do onboarding em Coexistence: enviar uma mensagem de cada
dispositivo — WhatsApp Web no Chrome, app nativo de Windows, celular secundário, app de Mac
— e verificar qual delas gera `smb_message_echoes`. Meia hora de trabalho que substitui toda
a especulação por fato.

Fica bloqueado pela escolha do parceiro Meta ([016](016-escolher-parceiro-meta.md)), porque
sem onboarding não há o que testar.

**Também a levantar com a loja** (não depende do onboarding):

- Quantas consultoras usam o app de Windows de fato, e se o computador é ferramenta
  principal de atendimento ou eventual. Se for eventual, o custo da restrição é baixo e nem
  precisa de plano B.

**Resolvido quando** estiver escrito de quais dispositivos as consultoras podem responder
sem cegar o agente, e a operação estiver ajustada a essa lista.

## Notas prévias

- **Regra dura que vale independente do resultado do teste:** agente que escalou não volta a
  falar sozinho — só se o cliente o chamar de novo explicitamente. É a única defesa que não
  depende de detectar nada, e entra no desenho da escalada
  ([012](012-quando-e-como-o-agente-escala.md)).
- **Plano B, se o WhatsApp Web também for cego:** as consultoras atendem pelo inbox do
  próprio parceiro (BSP), que passa pela Cloud API e é 100% visível ao agente. Mantém a tela
  grande do computador e ainda dá handoff explícito — mas é ferramenta nova, então é opção a
  oferecer, não imposição.
- **Ficou em aberto no research:** se Coexistence entrega webhook de status `read` originado
  do app. Se entregar, é um sinal indireto de humano ativo. Não há fonte.
- O changelog da Cloud API não pôde ser lido (erro 500 persistente). Reler antes do
  onboarding para confirmar que a restrição de Windows não mudou.
