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

### Horário — o agente é 24/7, a loja não

- **O agente atende 24 horas, todos os dias.** A loja funciona em horário comercial.
- **Fora do horário, o agente qualifica mas não distribui.** Ele atende, coleta o que
  consegue e **informa ao cliente quando a consultora retorna**, escalando a conversa nesse
  momento. A atribuição pelo rodízio acontece no expediente, com gente acordada — atribuir de
  madrugada apostaria que a consultora sorteada estará disponível de manhã, e erraria em
  silêncio quando ela estivesse de folga.
- **Custo aceito da decisão:** sem consultora atribuída, o agente não tem para quem escalar
  durante a madrugada. Ele segura a conversa sozinho até o expediente.

- **O agente promete a loja, nunca a pessoa.** Fora do expediente ele diz *"nosso atendimento
  volta às 8h e uma consultora te procura por aqui"* — não *"a Fulana te retorna às 8h"*. O
  cliente não conhece a Fulana no primeiro contato, então não perde nada; e a promessa deixa
  de depender de saber a agenda de alguém, o que elimina uma classe inteira de erro. **O
  agente só nomeia a consultora depois que ela assumiu** a conversa — nomear antes seria
  atribuir por tabela, contradizendo a decisão de não distribuir fora do expediente.

**Consequência de desenho:** o agente precisa saber **o horário real de atendimento da loja**
— que não está confirmado (o horário comercial no Brasil é 8h–18h, mas o da Lais Casa é
pergunta aberta) e nem se há atendimento no sábado. Está no roteiro do ticket
[020](020-perguntas-para-as-consultoras.md), pergunta 20.

Já a escala de folga, férias e feriado (pergunta 21) **não é bloqueante** graças à decisão de
prometer a loja: sem ela o agente diz *"no próximo dia útil"*, com ela diria *"segunda às
8h"*. É refinamento, não pré-requisito.

### A conferência de estoque é um ato físico — e isso redefine a escalada

Não é que falte um sistema para o agente consultar: a informação de disponibilidade **não
existe em lugar nenhum** até uma consultora andar pela loja e olhar. Isso não é limitação da
fase 1 — nenhuma fase resolve, nem um agente perfeito. Enquanto a loja operar assim, toda
pergunta de disponibilidade termina obrigatoriamente numa pessoa se movendo.

**Consequência, e é a mais importante do ticket:** *escalar não é o plano B do agente, é o
produto dele.* Uma parte grande das conversas **termina** numa consultora por definição do
negócio, não por falha do agente. O valor dele está em **quanto trabalho já deixou pronto**
quando ela chega — quem é o cliente, o que quer, qual item, para quando. Um agente que escala
rápido e bem é o agente certo para esta loja, não um agente fraco.

Isso deve governar o desenho da escalada ([012](012-quando-e-como-o-agente-escala.md)) e a
definição de sinal de sucesso ([013](013-sinal-de-sucesso-do-aprendizado.md)): medir o agente
por "conversas que ele resolveu sozinho" seria medir a coisa errada.

### O arquiteto fica fora da fase 1

- **A fase 1 atende só o consumidor final** de ponta a ponta.
- **Planilha, anexo ou lista longa de itens é gatilho de escalada imediata.** O agente
  registra que chegou, avisa o cliente que uma consultora vai olhar, e passa — sem tentar
  interpretar nada.
- **Razão de fundo:** a planilha do arquiteto é um pedido de conferência física multiplicado
  por dezenas de itens. É o lugar onde o erro é mais caro — um profissional monta um projeto
  em cima da resposta e leva o nome da loja junto.
- **Não há dado sobre a fatia do movimento** que é arquiteto. A loja não tem esse tipo de
  registro. A pergunta desceu para o ticket [020](020-perguntas-para-as-consultoras.md) como
  estimativa das consultoras — mas a decisão não depende dela.

### De onde vêm os contatos

- **Instagram e WhatsApp** são os canais principais, segundo a consultora entrevistada. Existe
  **site**, com movimento pequeno. Não há dado quantitativo — a loja não guarda esse tipo de
  registro.
- **A loja não anuncia** (não confirmado explicitamente, mas nada indica anúncio pago). Na
  prática, o agente começa **às cegas** na maioria das conversas: sem contexto de origem, sem
  saber o que a pessoa veio buscar. É o cenário mais difícil, e é o que o protótipo de tom
  ([014](014-como-o-agente-soa.md)) deve atacar primeiro.
- **Instagram fica fora do escopo de atendimento.** Recebe apenas uma mensagem automática
  direcionando para o WhatsApp → ticket [021](021-instagram-porta-de-entrada.md).
- **Links `wa.me` rastreados** (um por origem, com mensagem inicial pré-preenchida diferente)
  resolvem o rastreamento de origem sem API nenhuma. Também no ticket 021.

### O desfecho — desceu para as consultoras

Cotação, pagamento, momento de emissão da nota e tempo de ciclo não estão com o dono do
projeto. Desceram para o ticket [020](020-perguntas-para-as-consultoras.md), perguntas 22 a
26 — incluindo o pedido de **um exemplo de nota fiscal**, que mostra os campos existentes em
vez dos lembrados.

**O que está em jogo:** a aposta de que a nota fiscal emitida no Mainô é o sinal objetivo de
venda para o aprendizado. Ela quebra por dois caminhos — pelo **tempo** (ciclo longo e nota
tardia tornam a atribuição frouxa) e pela **chave** (a nota carrega CPF e nome; a conversa
carrega telefone — sem campo em comum, não casa). Se quebrar, o ticket
[013](013-sinal-de-sucesso-do-aprendizado.md) muda inteiro.
