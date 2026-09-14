# Manual do agente — Lais Aliski Casa

Este documento explica o que é o **Manu**, o agente de WhatsApp que faz o primeiro
atendimento da loja, o que ele faz, o que ele **não** faz, e o que muda no seu dia a dia com
ele. É material de consulta — volte aqui sempre que precisar, não é algo pra ler uma vez só e
guardar.

---

## Parte A — O que o agente faz

### 1. O que você ganha

Quando um contato novo chega pelo WhatsApp, o Manu conversa com ele primeiro. Até o chamado
chegar até você, ele já coletou o nome, o que a pessoa quer e para quando — 24 horas por dia,
todos os dias, inclusive fora do horário da loja. Você não começa do zero: abre o chamado já
sabendo com quem está falando e o que essa pessoa veio buscar.

### 2. O que ele faz

- Recebe o "oi" e conduz a conversa — sem questionário, sem bateria de perguntas. Ele encaixa
  o que precisa saber dentro do que a pessoa já está contando.
- Responde dúvidas simples que já sabe sobre a loja: o que vende, onde fica, horário de
  funcionamento, estilo.
- Identifica se é um cliente final (alguém decorando a própria casa) ou um arquiteto com um
  projeto. Para o arquiteto, ele não tenta qualificar nada — escala na hora, com o que a
  pessoa mandou (planilha, lista, o que for).
- Se o contato já é cliente de uma de vocês, ele reconhece isso sozinho (pelo telefone) e não
  repete perguntas que o histórico já responde.

### 3. O que ele **não** faz

- **Nunca diz preço, medida ou material de uma peça específica.** Registra o que o cliente
  pediu ("anotei: poltrona de couro caramelo da vitrine") e diz que quem passa valor e
  condição é a consultora.
- **Nunca confirma que a loja tem um produto.** Mesmo que o cliente mande foto de uma peça
  óbvia do estilo da casa, ele não tenta reconhecer o que é nem confirma disponibilidade —
  não existe controle de estoque, só o que está na loja à vista, e um "temos sim" errado
  custa a credibilidade da loja com um cliente de peça cara.
- **Não dá desconto.** Nenhuma margem automática, nem "à vista sai mais barato" — condição de
  pagamento é sempre com você.
- **Não promete uma pessoa específica**, só a loja. Ele não diz "a Gabi vai te atender" — quem
  se apresenta pelo nome é você, quando assume.
- **Não negocia e não vende sozinho.** Nesta fase, o trabalho dele é qualificar e te passar o
  contato pronto — a venda continua sendo com vocês.

### 4. Como ele fala

O agente se chama **Manu**. Ele fala em primeira pessoa, com nome próprio, sem fingir ser uma
pessoa e sem ficar repetindo "sou um robô" a cada mensagem — se perguntarem, ele é honesto.
O tom é o de alguém que atende bem numa loja de decoração de alto padrão: educado, direto,
sem gíria de software, sem forçar venda.

Algumas falas que ele realmente usa, sempre do mesmo jeito:

- Pra se apresentar, no início da conversa: *"aqui é a Manu, assistente da Lais Aliski
  Casa."*
- Se perguntarem se é robô: *"sou sim, assistente virtual da Lais Aliski Casa"* — confirma
  na hora, sem enrolar, e oferece passar pra uma consultora se a pessoa preferir.
- Se perguntarem disponibilidade de um produto: *"quem te confirma isso de verdade é a
  consultora, que olha a peça pessoalmente antes de te passar qualquer coisa — ela verifica
  e te retorna."*
- Pra escalar: *"vou passar seu contato para uma consultora — ela te chama por aqui ainda
  hoje, dentro do horário da loja."*

### 5. Quando ele te passa a conversa

Ele escala automaticamente quando:

- o cliente pede para falar com uma pessoa;
- o cliente já quer comprar, ou fala em encomenda;
- o cliente está impaciente ou insatisfeito;
- o cliente quer negociar preço ou desconto;
- é um arquiteto com planilha, lista ou menção a projeto;
- a conversa girou muitas trocas sem sair do lugar.

Pergunta de disponibilidade **não** escala sozinha na primeira vez — ele responde com a
fórmula do item anterior ("quem te confirma isso de verdade é a consultora...") e continua a
conversa. Só escala se o cliente insistir depois disso.

Quando escala, ele manda uma única mensagem genérica — *"vou passar seu contato para uma
consultora — ela te chama por aqui ainda hoje, dentro do horário da loja"* — e para de
responder ali. Ele não anuncia seu nome nem o de ninguém: quem se apresenta é você, ao
assumir o chamado.

### 6. Quando ele erra

Ele não tem revisão humana antes de mandar uma mensagem — o que ele escreve vai direto pro
cliente. Se ele disser algo errado (preço, disponibilidade, qualquer coisa fora do que devia),
é pra avisar — como fazer isso está na Parte B, item 4.

---

## Parte B — No dia a dia

*Versão de 2026-09-14. Esta parte muda conforme o piloto avança — revise a data acima quando
algo aqui for atualizado.*

A maior parte disso já é o seu dia a dia de sempre. O que muda é pouco.

### 1. Chegou chamado

Os chamados aparecem na fila da **plataforma das consultoras**
(`plataforma-consultoras-production.up.railway.app`), com login pelo seu Google. Hoje ainda
não existe aviso automático (som, notificação) quando um chamado novo chega — é abrir a
plataforma e olhar a fila. Isso é algo que pode mudar; por ora é assim.

### 2. O rodízio continua sendo de vocês

O Manu não decide quem atende. Ele só coloca o chamado na fila — pegar continua sendo do
mesmo jeito que vocês já se organizam hoje. Se o contato já é cliente de uma de vocês, o
chamado chega com o nome dela marcado, mas isso não trava: qualquer uma pode assumir, como já
se cobrem informalmente.

### 3. Fechar o atendimento

Quando terminar, marque na plataforma:

- **o desfecho** — virou venda, virou visita, ou não vendeu;
- **o veredito sobre o agente** — ele te deixou pronta pra assumir sem precisar recomeçar do
  zero? Sim ou não, com um comentário se quiser.

É rápido — dois toques. E é o que mais ensina o agente a melhorar: é o único sinal que conta
de verdade quando ele erra.

### 4. Avisar quando o agente erra

Tem um botão **"reportar problema"** na plataforma, separado de um chamado específico (porque
o erro pode acontecer numa conversa que nem chegou a escalar). Conte o que aconteceu e com
qual cliente. Isso não é pra guardar pra depois — é pra usar assim que perceber.

### 5. Se o agente começar a errar feio

Seção à parte porque é a mais importante: existe um botão, no topo da plataforma, que
**desliga o Manu em todas as conversas de uma vez**.

- **Quando usar:** ele inventou um preço, afirmou que a loja tem um produto, está dizendo
  coisa sem sentido — um erro que se repete, não um deslize isolado. **Não é** para "esse
  cliente eu quero atender eu mesma" — pra isso basta assumir o chamado normalmente (item 2).
- **O que acontece:** o Manu para de responder todo mundo. Contato novo cai direto pra vocês,
  exatamente como era antes de ele existir — o WhatsApp Business de vocês nunca saiu do ar.
- **Depois de acionar:** avise pelo canal de erro (item 4 acima). Religar o agente é decisão
  do projeto, depois de checar o que houve — não é algo que você carrega sozinha.

### 6. Responder o cliente sempre pelo WhatsApp de sempre

Depois de assumir, continue respondendo pelo mesmo WhatsApp Business de sempre — não passe o
cliente pra um app à parte. O Manu só enxerga o que acontece ali; um caminho diferente o deixa
cego para aquele atendimento.

---

**Dono do manual:** João Victor · revisar quando: mudar de fase, mudar algo na Parte B, ou na
checagem obrigatória do fim do piloto (4 semanas após o arranque).
