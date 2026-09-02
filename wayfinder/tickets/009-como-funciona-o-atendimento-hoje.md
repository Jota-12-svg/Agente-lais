---
id: "009"
title: Como funciona o atendimento da Lais Casa hoje, ponta a ponta
labels: [wayfinder:grilling]
status: closed
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

## Respostas do grilling (sessão de 2026-08-10)

Anotadas conforme o dono do projeto respondeu, pergunta a pergunta. A `## Resolução`, no fim
do arquivo, consolida — quem quiser só o resultado pode pular direto para lá.

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

#### Como o agente reconhece um arquiteto

**"Arquiteto" não é atributo da pessoa, é modo do atendimento.** O mesmo arquiteto que manda
planilha de um projeto na terça pode chamar na quinta para comprar uma bandeja para a casa
dele — e aí é consumidor final. **Classifica-se a conversa, não o cadastro.** Carimbar o
contato erraria já na segunda conversa.

**Duas camadas de identificação:**

1. **Perguntar** — dentro da qualificação, uma pergunta natural do tipo *"é para sua casa ou
   você está montando um projeto?"*. É o sinal mais barato e mais confiável, não soa como
   triagem e resolve a maioria dos casos na primeira troca.
2. **Sinais que disparam sozinhos**, mesmo sem a pergunta: anexo, planilha ou lista longa de
   itens; autodeclaração ("sou arquiteta", "é para uma cliente minha"); vocabulário
   profissional (*projeto*, *ambiente*, *especificação*, *meu cliente*, prazo de obra); pedido
   de **tabela para profissional**; e o sinal mais decisivo no Brasil — **menção a RT**
   (reserva técnica, a comissão do arquiteto). Consumidor final não sabe o que é RT.
   Some-se a isso o contato **já conhecido**, se a planilha compartilhada o marcar como
   arquiteto.

**Viés declarado: na dúvida, escala.** A assimetria de custo é grande e é o que sustenta a
regra. Escalar um consumidor final por engano custa apenas o agente ter feito menos trabalho —
a consultora atende como sempre atendeu e ninguém perde nada. Tratar um arquiteto como
consumidor custa o agente tentar responder uma planilha, que é exatamente o erro caro que a
fase 1 existe para não cometer. Erro barato de um lado, caro do outro: o agente pende para o
barato.

**A levantar com as consultoras** (perguntas 29 a 31 do ticket 020): como elas percebem que é
arquiteto antes de a pessoa dizer. Elas fazem essa leitura há anos e têm sinais que não se
adivinham de fora.

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

### Transparência — o agente não finge ser gente, mas também não se anuncia robô

- **O agente tem nome próprio e se apresenta como assistente da Lais Casa.** Não finge ser
  pessoa e não abre a conversa anunciando que é um robô.
- **Nunca assina como uma consultora.** Se o cliente acredita ter falado com a Fulana e a
  Fulana não faz ideia da conversa, a mentira não é do agente — é da loja.
- **Se o cliente perguntar se é um robô, responde que sim, na hora, sem rodeio.** Esta regra
  não se negocia.
- **Razão da escolha:** declarar de cara rebaixa a conversa (parte dos clientes trata bot com
  menos paciência, e num ticket de R$ 30 mil isso custa o contato no primeiro minuto); não
  declarar nunca cria o pior momento possível, que é o cliente descobrir sozinho — estrago
  que a venda não paga, numa loja onde a relação com a consultora é o ativo.
- ⚠️ **Pendência jurídica, não técnica:** o CDC não exige hoje declaração de atendimento por
  IA, mas há discussão legislativa em curso no Brasil e a LGPD pesa sobre o que se faz com a
  conversa. **A decisão deve passar pela dona da loja** — não porque esteja errada, mas
  porque é ela quem responde pela marca se o critério mudar.
- O **nome** do agente fica para o protótipo de tom ([014](014-como-o-agente-soa.md)).

### Agendamento — decisão condicional, e o critério é confiabilidade

O destino do mapa diz que o agente *"verifica disponibilidade e agenda"*; a restrição dura diz
que *"fase 1 é só qualificação"*. As duas não podiam valer juntas, e a contradição estava
atravessando três tickets. Resolvida assim:

**O caminho depende de a agenda das consultoras ser confiável — e o teste não é o uso, é a
confiabilidade.**

- **Se a agenda for confiável → o agente agenda.** Confirma o horário com o cliente.
- **Se não for → o agente registra a intenção e escala:** *"vou ver com a consultora e ela te
  confirma"*. Ele captura **quando** o cliente quer vir — dado que faz a consultora priorizar
  quem atender primeiro — mas quem confirma é gente.

**O critério, explicitamente:** o agente só agenda se a consultora responder que lança **tudo**
na agenda **e** isso se confirmar olhando a agenda dela de verdade (perguntas 18 e 18b do
ticket [020](020-perguntas-para-as-consultoras.md)) — a tela, não a resposta verbal. Todo mundo
diz que mantém a agenda em dia.

**Por que o critério é esse:** uma agenda parcialmente preenchida é **mais perigosa que agenda
nenhuma**, porque parece confiável. Se a consultora lança a reunião importante mas não o
cliente que passou às 15h, um horário livre na agenda não significa livre — o agente marca por
cima de compromisso real, o cliente chega e ninguém o espera. Isso é pior que não agendar: é
errar na frente do cliente com a assinatura da loja.

**Três consequências, se o caminho do agendamento se confirmar:**

1. **Reserva de horário é obrigação nossa.** A API do Google não tem *hold* (research
   [006](../research/006-google-calendar.md)). Entre oferecer "amanhã às 15h" e o cliente
   confirmar, nada impede a mesma vaga ser oferecida a outro. Exige tabela de reservas com
   trava de exclusão — construção real, dentro da fase 1.
2. **Depende de escrita, não só de leitura.** O `freeBusyReader` recomendado para o caso Gmail
   comum apenas **lê**. Marcar exige permissão de escrita, o que muda o modelo de acesso e
   endurece a resposta da pergunta 19.
3. **A fase 1 deixa de ser só qualificação.** Agendar é a primeira coisa que o agente faz *no
   mundo*, não apenas na conversa. É decisão legítima — mas tomada com esse nome, não por
   tabela.

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

---

## Resolução

O fluxo está descrito com nitidez suficiente para desenhar em cima dele, e o vocabulário do
domínio foi extraído para [`CONTEXT.md`](../../CONTEXT.md) na raiz do repositório.

**A constatação que reorganiza o resto:** conferir disponibilidade é um **ato físico**. A
informação não existe em sistema nenhum até uma consultora andar pela loja e olhar — e isso
não é limitação da fase 1, é do negócio. Portanto **escalar não é o plano B do agente, é o
produto dele**: boa parte dos atendimentos termina numa consultora por definição, não por
falha. O agente deve ser medido por quanto trabalho já deixou pronto quando ela chega, nunca
por quantas conversas resolveu sozinho.

**O que ficou fixado:**

| Assunto | Decisão |
|---|---|
| Canal | Um número compartilhado por 4 pessoas (3 consultoras + a dona). O limite de 4 acompanhantes do Coexistence **não é obstáculo** — a Cloud API não ocupa vaga. |
| Dispositivos | O **app de Windows cega o agente**, sem via de recuperação. Saída provável é o WhatsApp Web, mas exige teste → ticket [019](019-companion-windows-ponto-cego.md). |
| Roteamento | **Rodízio** para contato novo; **cliente que volta fura a fila** e vai para a consultora dona dele. O vínculo mora na planilha; o estado do rodízio não está escrito em lugar nenhum. |
| Horário | Agente **24/7**, loja em horário comercial. Fora do expediente ele **qualifica mas não distribui**. |
| Promessa | O agente **promete a loja, nunca a pessoa**. Só nomeia a consultora depois que ela assumiu. |
| Escopo | **Só consumidor final.** Planilha, anexo ou lista longa é escalada imediata, sem interpretar nada. |
| Classificação | Duas camadas — perguntar dentro da qualificação, e sinais que disparam sozinhos (anexo, autodeclaração, vocabulário profissional, **RT**). **Na dúvida, escala**, porque o erro de escalar demais é barato e o de tratar arquiteto como consumidor é caro. |
| Transparência | Nome próprio, não finge ser gente, não se anuncia robô — e **confirma na hora** se perguntarem. Nunca assina como consultora. |
| Agendamento | **Condicional:** o agente agenda se, e só se, a agenda das consultoras for **confiável** — testada na tela, não na resposta verbal. Caso contrário, registra a intenção e escala. |
| Instagram | **Sem agente.** Só mensagem automática direcionando ao WhatsApp → ticket [021](021-instagram-porta-de-entrada.md). |

**Contradição do mapa, resolvida:** o destino prometia que o agente "verifica disponibilidade
de horário e agenda" enquanto a restrição dura limitava a fase 1 à qualificação. As duas não
podiam valer juntas e três tickets assumiam coisas diferentes. Agora o agendamento é
condicional e explícito.

**O que deliberadamente não foi respondido aqui.** Como uma conversa típica começa, o que a
consultora pergunta e em que ordem, quando vira visita, como se fala de preço numa faixa de
R$ 2 mil a R$ 50 mil, e o desfecho passo a passo. Nada disso está com o dono do projeto —
sai das conversas exportadas ([003](003-exportacao-das-conversas-das-consultoras.md)) e do
roteiro do ticket [020](020-perguntas-para-as-consultoras.md), aberto nesta sessão. Forçar
resposta agora seria inventar decisão.

**Tickets abertos por este:** [019](019-companion-windows-ponto-cego.md) (dispositivos),
[020](020-perguntas-para-as-consultoras.md) (perguntas às consultoras),
[021](021-instagram-porta-de-entrada.md) (Instagram).

**Pendência para a dona da loja:** o aval sobre a transparência do agente. Não é técnica — é
ela quem responde pela marca se o critério mudar.

---

## Addendum — respostas do ticket 020 (2026-08-11, resposta 1 de 4)

Ticket já fechado; registrado aqui como addendum, sem alterar a Resolução acima. É uma
resposta em quatro (3 consultoras + a dona da loja) — tratar como amostra.

- **Rodízio na prática:** "Temos uma cronologia de rotatividade" — confirma o rodízio descrito
  na Resolução. Não detalhou o que acontece quando duas pessoas respondem o mesmo cliente.
- **Planilha atualizada:** "Sempre em dia" — resposta favorável; o próprio roteiro do ticket
  020 já alertava que "todo mundo diz que mantém em dia", então vale conferir na prática antes
  de tratar como fonte confiável para o agente.
- **Horário real de atendimento:** **segunda a sexta, 9h às 18h; sábado, 9h às 13h.** Primeiro
  dado concreto de horário — falta confirmar domingo (presume-se "não atende", por omissão) e
  se mensagem fora do horário chega a ser respondida de casa.
- **Folga/férias/ausência:** "Escala/agenda" — existe registro em algum lugar, o que deixa
  aberto o caminho para, no futuro, o agente nomear quem volta em vez de só "a loja volta".
- **Proporção de arquitetos:** **8 de 10** — mais alto do que o esperado. Não muda a decisão de
  fase 1 (só consumidor final), mas dimensiona quanto do movimento fica de fora por enquanto.
  Veio junto com uma declaração de política, não só um número: *"quando for arquiteto prefiro
  que seja direcionado à consultora, e quando for cliente final, para a IA"* — reforça, com
  peso de decisão de negócio, a classificação já fixada nesta Resolução.
- **Tempo de resposta a planilha de arquiteto:** "No mesmo dia".
- **Como identifica um arquiteto:** "Já conhecemos a pessoa" — o sinal citado é o
  reconhecimento prévio do contato, que reforça a camada "planilha compartilhada marca como
  arquiteto" já prevista acima. Não cobre o caso mais difícil, que é o arquiteto novo e ainda
  desconhecido.
- **Já confundiu arquiteto com consumidor final, ou o contrário:** "Nunca".

**Falta:** as outras três respostas, para saber se a proporção 8/10 e "já conhecemos a pessoa"
se repetem ou são particulares desta consultora.

---

## Addendum — 2026-09-02 · o time de atendimento são três, não quatro

Grelha do ticket [014](014-como-o-agente-soa.md) com o dono. Esta seção **corrige** a linha da
Resolução que diz *"Um número compartilhado por 4 pessoas (3 consultoras + a dona)"*.

- **A dona (Lais Aliski) não faz atendimento no WhatsApp.** O time é **três consultoras** —
  Pamella, Gabriela (apelido Gabi), Joslaine —, em rodízio puro, sem especialidade.
- O 004 já tinha registrado "a 4ª consultora não atende" (não há 4ª consultora); este addendum
  fecha a conta: a 4ª pessoa era a dona, e ela também está fora do atendimento.
- **Consequência para o agente:** ele conhece os três nomes (para reconhecer "quero a Gabi" e
  escalar direto), sabe que a Lais é a dona, mas continua **sem nomear consultora por conta
  própria** (decisão de transparência da Resolução e do 012 permanece).
- Também confirmado nesta grelha: o **nome da loja é "Lais Aliski Casa"** (sem acento em
  "Lais"), não "Lais Casa". `CONTEXT.md` atualizado ("A loja").
