---
id: "027"
title: Testar a conexão self-hosted como dispositivo adicional, antes de tocar no número da loja
labels: [wayfinder:task]
status: open
assignee: Claude
blocked-by: []
---

## Question

O ticket [016](016-escolher-parceiro-meta.md) decidiu a arquitetura: o agente entra no número
que a loja já usa hoje como mais um dispositivo vinculado (Baileys ou Evolution API por cima
dele), sem parceiro Meta, sem número novo. Essa decisão foi tomada sobre **inferência de
arquitetura documentada**, não sobre teste real — os research
[024](../research/024-arquitetura-self-hosted-whatsapp.md) e
[026](../research/026-o-que-causa-banimento.md) foram explícitos em dizer que as perguntas
abaixo só se respondem tentando, não lendo mais documentação.

**Isto não é pergunta de pesquisa, é de teste** — no mesmo espírito do ticket
[019](019-companion-windows-ponto-cego.md), que fazia o equivalente para Coexistence.

### O que precisa ser verificado, nesta ordem

1. **O pareamento completa, ou trava no passkey?** Desde ~30/06/2026 a Meta está em rollout
   faseado de confirmação de passkey/WebAuthn para vincular dispositivo **novo** — um cliente
   headless como o Baileys pode não conseguir completar essa etapa. Não dá para saber se a
   conta afetada está no lote sem tentar vincular de verdade.
2. **Os dispositivos que já estavam vinculados sobrevivem?** A leitura de arquitetura diz que
   sim (cada dispositivo mantém sessão própria, adicionar não deveria derrubar nada) — mas
   nenhuma fonte encontrada confirma isso especificamente para uma conta **WhatsApp Business
   Premium já com vários companions ativos**.
3. **Mensagem mandada de um companion tipo WhatsApp para Windows gera evento no lado do
   Baileys?** É a pergunta que mais interessa ao projeto — se confirmada, o caminho escolhido
   resolve de graça o ponto cego que o Coexistence oficial tem (ticket 019, agora em pausa).
4. **O ciclo de token de relação (`tctoken`/`cstoken`) funciona na prática?** Rodar com
   `LOG_BAILEYS=trace` (ou equivalente), mandar mensagem de um contato **novo** para a conta de
   teste, deixar o agente responder, e conferir se aparece erro `463`
   (`NackCallerReachoutTimelocked`) nos logs — mesmo numa resposta pura, sem disparo nenhum. Se
   aparecer, o checklist do research 026 precisa de ajuste antes de ir para produção.
5. **O próprio ato de vincular a sessão é, sozinho, um momento de risco — não só o
   comportamento depois.** Achado do
   [research 028](../research/028-casos-de-banimento-e-estimativa-de-risco.md): dois casos
   catalogados (Evolution API #1650 e #2497) mostram banimento **antes de qualquer mensagem
   enviada**, só ao ler o QR code e vincular. Monitorar também esse instante — "conectou sem
   erro" não é a mesma coisa que "seguro" — e manter o mesmo cuidado se algum dia vincular no
   número real da loja.
6. **Marcar uma conversa como "não lida" (`chatModify({ markRead: false }, jid)`) sincroniza
   para os outros companions?** Pedido do ticket
   [035](035-plataforma-central-das-consultoras.md) (§5): ao escalar, o agente marcaria o
   chat como não lido para a consultora bater o olho. Verificar (a) se o Baileys aplica o
   *app-state* sem erro, (b) se o estado "não lida" chega aos aparelhos vinculados (celular,
   WhatsApp Web, e o app de Windows — ver ressalva do 019), e (c) se marcar lido/não-lido
   conta como atividade que soma risco de banimento (não deveria — é *app-state* passivo, não
   mensageria — mas confirmar nos logs, como no item 4). Sinal secundário: se não funcionar
   confiável, o 035 já trata como não-autoritativo.

### Como testar sem arriscar o número da loja

**Não usar o número real da Lais Casa nesta primeira rodada.** Montar um cenário equivalente
com um número de teste (chip novo, barato):

1. Registrar o número de teste no WhatsApp Business comum, com um aparelho real.
2. Vincular alguns dispositivos extras (WhatsApp Web, um segundo celular, se possível o app de
   Windows) para reproduzir o arranjo de vários companions que a loja tem hoje — replicando o
   cenário real o mais fiel possível.
3. Subir Baileys (ou Evolution API) num VPS e tentar vincular como dispositivo adicional.
4. Rodar os quatro itens acima, registrando o que de fato aconteceu — não o que a documentação
   sugeria que aconteceria.

Só depois de um resultado positivo nos quatro pontos é que faz sentido considerar repetir o
processo no número real da loja — e mesmo assim, fora do horário de atendimento, com plano de
reverter (desconectar o Baileys) se algo parecer errado.

### O que falta confirmar com a loja antes ou durante o teste

- Se os "6 dispositivos" são de fato WhatsApp Business Premium (pergunta já registrada no
  research [022](../research/022-alternativas-onboarding-sem-parceiro-pago.md) — existe
  cobrança de app recorrente associada?). Isso decide quantos slots de dispositivo sobram de
  verdade para o agente entrar.

**Resolvido quando** os seis pontos acima estiverem testados e registrados com o resultado
real (não inferido), e houver uma recomendação clara de ir ou não para o número de produção da
loja — e, se for, com que ajuste no desenho do agente (checklist do research 026). O item 6
(marca de não-lida) não bloqueia a recomendação de ir/não-ir — se não funcionar, o 035 já o
trata como opcional.
