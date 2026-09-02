# Research — Como levar o agente ao WhatsApp da Lais Aliski Casa

Ticket: [005](../tickets/005-caminho-de-integracao-com-o-whatsapp.md) · Investigado em 2026-08-10

---

## A premissa do ticket estava errada

O ticket foi escrito sobre a ideia de que **um número não pode estar no app do WhatsApp
Business e na Cloud API ao mesmo tempo**, e que portanto seria preciso escolher entre tirar
o app das mãos das consultoras ou usar um número paralelo.

Isso é verdade apenas no **caminho de migração direta**. A documentação da Meta é explícita:

> "If you onboard via a partner who supports business app number onboarding, you will be
> able to use both the WhatsApp Business app and the partner's app concurrently, and your
> messaging history will be preserved."
>
> — [Migrate an existing WhatsApp number to a Business Account](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/migrate-existing-whatsapp-number-to-a-business-account)

Esse caminho se chama **Coexistence**. Ele é o caminho certo para a Lais Aliski Casa, e reformula a
decisão inteira: o dilema real não é "migrar ou número paralelo", é **por qual parceiro
fazer o onboarding**.

---

## Coexistence — o que é e o que exige

Fonte: [Onboarding Business App Users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)

O mesmo número fica simultaneamente no app do WhatsApp Business (nas mãos das consultoras) e
na Cloud API (nas mãos do agente), com as mensagens **espelhadas nos dois lados**.

**O que é preservado**
- Histórico de conversas dos **últimos 6 meses**, se o negócio autorizar a sincronização.
  Mídia só dos últimos **14 dias** antes do onboarding.
- **Todos os contatos** que tenham número de WhatsApp, sem restrição.
- Mensagens enviadas e recebidas são espelhadas entre a Cloud API e o app.

**O que continua funcionando no app**
- Conversa 1:1 com editar e apagar mensagem, chamadas de voz e vídeo, ferramentas de negócio
  (catálogo, pedidos, status) e o perfil comercial.

**O que é desativado**
- Mensagens temporárias em todas as conversas 1:1, mensagens de visualização única e
  localização em tempo real. Listas de transmissão viram somente leitura. Grupos seguem sem
  suporte.

**Requisitos**
- App do WhatsApp Business **versão 2.24.17 ou superior**.
- O onboarding precisa ser feito por um **Solution Partner ou Tech Provider** da Meta, com
  Embedded Signup e assinatura de três webhooks (`history`, `smb_app_state_sync`,
  `smb_message_echoes`). **Não dá para fazer sozinho como desenvolvedor comum** — é o ponto
  que mais restringe a escolha.
- Janela de **24 horas** para sincronizar o histórico; passou disso, é preciso desfazer e
  refazer o processo inteiro.

**Limitações operacionais**
- **Até 4 dispositivos acompanhantes**, e **todos são desvinculados durante o onboarding** —
  cada consultora precisa reconectar o aparelho dela depois. WhatsApp para Windows e WearOS
  não são suportados nesse modo.
- Throughput fixo de 20 mensagens por segundo. Irrelevante nesta escala.

> ⚠️ **Ponto a confirmar com a loja (liga no ticket [009](../tickets/009-como-funciona-o-atendimento-hoje.md)):**
> quantas consultoras usam o número. O limite de 4 acompanhantes já existe hoje no app; se
> houver mais de 4 consultoras dividindo um número, ou elas já têm outro arranjo, ou o
> arranjo atual não é o que imaginamos.

---

## Custo — bem menor do que parece

Fonte: [WhatsApp Business Platform Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

Desde **1º de julho de 2025** a cobrança é **por mensagem**, não mais por conversa. E a regra
que importa para este projeto:

- **Mensagens que não são template são gratuitas** — só podem ser enviadas dentro de uma
  janela de atendimento aberta.
- Quando o cliente manda mensagem, abre-se uma **janela de atendimento de 24 horas**.
- Templates de categoria **service são gratuitos** para todos desde novembro de 2024.
  **Utility e authentication são gratuitos dentro da janela**, cobrados fora dela.
- **Marketing é cobrado sempre.**
- Cliques em anúncio Click-to-WhatsApp abrem uma janela de **72 horas** em que qualquer tipo
  de mensagem é grátis.

**Consequência direta para a fase 1:** o agente é *reativo* — ele responde a quem chamou a
loja. Isso acontece inteiramente dentro da janela de 24 horas, com mensagens que não são
template. **O custo de WhatsApp da fase 1 é essencialmente zero.** O custo só aparece se o
agente for reengajar cliente frio ou fazer marketing ativo — o que não está no escopo.

Além disso: mensagens que as consultoras mandarem **pelo app** continuam gratuitas. Só o que
sai pela Cloud API entra na tarifa.

Cobrança em BRL: a Meta localizou o faturamento para reais em 1º de julho de 2026, com prazo
até 30 de junho de 2027 para migrar as contas.

---

## Provedores não-oficiais — o risco não compensa aqui

Evolution API, Baileys, WAHA e similares funcionam por engenharia reversa do WhatsApp Web,
conectando por QR code. Violam os termos de uso, e a Meta detecta a conexão na camada de
rede — antes mesmo da primeira mensagem. O banimento é do número, permanente e sem aviso.

Relatos de 2026 indicam intensificação das ações da Meta contra clientes não-oficiais,
especialmente no Brasil.

- [Why Cheap WhatsApp Bots Get Your Number Banned — SporeSec](https://sporesec.com/en/blog/whatsapp-unofficial-api-ban-risk)
- [API Oficial vs Evolution API e Baileys — Tipefy](https://blog.tipefy.com/api-oficial-do-whatsapp-vs-evolution-api-e-baileys-o-que-muda-na-pratica-para-sua-empresa)
- [Is Evolution API a Real Alternative? — Message Marvel](https://messagemarvel.com/is-evolution-api-a-real-alternative-to-the-official-whatsapp-business-api/)

> **Ressalva de honestidade sobre estas fontes:** são blogs de empresas que vendem acesso à
> API oficial, portanto têm interesse em pintar o caminho não-oficial como pior. Os números
> que elas citam (do tipo "68% levam ban em 12 meses") não têm origem verificável e eu não
> os trataria como fato. O que **é** fato, e não depende delas, é que o uso viola os termos
> da Meta e que o banimento é uma decisão unilateral dela.

Para a Lais Aliski Casa isso é decisivo por um motivo que não é técnico: **o WhatsApp não é um canal
da loja, é o canal**. Perder o número é perder a operação de vendas inteira, junto com o
histórico de relacionamento das consultoras com clientes de até R$ 50 mil. Economizar
algumas dezenas de reais por mês contra esse risco não fecha a conta — ainda mais quando a
fase 1 pela via oficial custa praticamente nada.

---

## Recomendação

**Coexistence via um parceiro oficial da Meta.** As consultoras continuam no app que já
usam, com o histórico e os contatos preservados, e o agente entra pela Cloud API no mesmo
número. Ninguém muda de ferramenta, que é a restrição que o mapa fixou.

**O que fica aberto e vira a próxima decisão:** *qual parceiro*. Coexistence exige Solution
Partner ou Tech Provider — não dá para fazer direto. Isso precisa de comparação própria
(360dialog, Twilio, Gupshup, Zenvia, Take Blip e os BSPs brasileiros), avaliando custo por
mensagem sobre a tarifa da Meta, suporte a Coexistence de fato, e qualidade do suporte no
Brasil. É um ticket novo.

**Antes de qualquer coisa**, dois fatos a levantar com a loja:
1. Quantas consultoras usam o número e como os aparelhos estão vinculados hoje — o limite de
   4 acompanhantes pode já estar apertado.
2. Se o número é único e compartilhado, ou se cada consultora tem o seu. Coexistence se
   aplica a um número por vez, e essa resposta muda o desenho do roteamento.

**Plano B, se Coexistence não for viável** (parceiro caro demais, ou o arranjo de aparelhos
não couber): número paralelo só do agente, com o número atual intocado. Custa um handoff
mais desajeitado — o cliente muda de conversa ao ser passado para a consultora — mas não
mexe em nada do que já funciona.
