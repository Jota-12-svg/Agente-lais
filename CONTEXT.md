# Agente de Atendimento da Lais Casa

Glossário do domínio. É a linguagem única do projeto: o que estes termos significam aqui vale
para tickets, conversas, código e schema de banco.

Cada termo traz, entre parênteses, o nome correspondente em **inglês** — é ele que aparece no
código, conforme o `CLAUDE.md`. O termo em português é o que se usa ao falar e escrever.

Este arquivo é **só glossário**. Decisão de arquitetura mora nos tickets em `wayfinder/`;
detalhe de implementação, no código.

## A loja (fatos, não termos)

Confirmado com o dono do projeto em 2026-09-02 (grelha do ticket 014). É o contexto que o
agente carrega sobre o negócio.

- **Nome:** **Lais Aliski Casa** (sem acento em "Lais"). O projeto e vários documentos ainda
  dizem "Lais Casa" por herança — o nome correto é este.
- **Dona:** **Lais Aliski**. **Não faz atendimento** no WhatsApp — quem atende são as três
  consultoras. O agente sabe quem é a Lais (para responder "quem é a Lais?"), mas não é com
  ela que o cliente fala.
- **Time de atendimento:** **três consultoras** — Pamella, Gabriela (apelido **Gabi**),
  Joslaine —, em **rodízio** puro, sem especialidade. (Corrige o ticket 009, que dizia
  "quatro pessoas": a dona está fora do atendimento.)
- **Loja física:** Curitiba, bairro **Batel** — R. Francisco Rocha, 707, CEP 80420-130.
  Horário: seg–sex 9h–18h, sábado 9h–13h, domingo fechado.
- **O que vende:** decoração (vasos, cachepôs, esculturas, quadros, livros decorativos,
  caixas e potes, centros de mesa, cestos, aromas) **e mobiliário**. Alto padrão, curadoria,
  estilo clássico/sofisticado. Ticket alto (milhares a dezenas de milhares de reais).
- **Site:** <https://www.laisaliskicasa.com.br/> — é e-commerce, mas **não é fonte de
  disponibilidade** (ver **Disponibilidade**; as consultoras conferem tudo à mão). Serve como
  referência de estilo e catálogo parcial, e como link para o cliente "dar uma olhada".
- **Instagram:** <https://www.instagram.com/laisaliskicasa/> — mesmo uso: link para o cliente
  explorar, não fonte que o agente consulta em runtime na fase 1.

## Language

### Pessoas

**Consultora** (`advisor`):
Pessoa da Lais Aliski Casa que atende clientes pelo WhatsApp. **Três**, em rodízio puro, sem
especialidade: **Pamella, Gabriela (Gabi), Joslaine** — cada uma com aba na planilha
compartilhada. O feminino é proposital: são todas mulheres. A **dona (Lais Aliski) não é
consultora** e não faz atendimento (ver **A loja**).
_Avoid_: vendedora, atendente, operador.

**Contato** (`contact`):
Pessoa que chamou o WhatsApp da loja. Existe desde a primeira mensagem, antes de qualquer
qualificação e antes de ter consultora.
_Avoid_: lead, prospect, usuário.

**Cliente** (`customer`):
Contato que já tem uma consultora dona registrada na planilha compartilhada. A passagem de
contato para cliente é o vínculo, não a compra — quem nunca comprou mas está na aba de alguém
é cliente daquela consultora.
_Avoid_: comprador, conta.

**Arquiteto** (`architect`):
Profissional que compra para o projeto de um terceiro, e não para si. Ver **Modo do
atendimento**: ser arquiteto é uma característica da pessoa, mas o que o agente classifica é a
conversa.
_Avoid_: designer, profissional, parceiro.

### O trabalho

**Atendimento** (`engagement`):
Uma conversa com começo, meio e desfecho — do primeiro "oi" até a venda, o abandono ou a
perda. Um mesmo contato tem vários atendimentos ao longo do tempo, todos na mesma conversa do
WhatsApp. **É a unidade de trabalho e a unidade de aprendizado do projeto.**
_Avoid_: conversa, sessão, ticket, caso.

**Modo do atendimento** (`engagement_mode`):
Classifica o **atendimento**, não a pessoa: `consumidor_final` ou `arquiteto`. O mesmo
arquiteto que manda planilha de um projeto na terça pode chamar na quinta para comprar uma
bandeja para a casa dele — e aí o atendimento é de consumidor final. Carimbar o contato
erraria já na segunda conversa.
_Avoid_: tipo de cliente, perfil, segmento.

**Qualificação** (`qualification`):
Coletar do contato o que a consultora precisa saber antes de assumir a conversa. É todo o
escopo do agente na fase 1.
_Avoid_: triagem, pré-venda, filtro.

**Atendimento qualificado** (`qualified_engagement`):
Um **atendimento** com o suficiente para a consultora priorizar e assumir sem recomeçar: nome,
o que a pessoa quer e para quando; orçamento e origem entram se vierem à tona, não travam.
É o gatilho de **escalada** "por completude" — distinto dos gatilhos por evento (compra,
irritação, planilha) do ticket 012. Na fase 1, consumidor final → chamado no **rodízio**
(contato novo é o caminho único: o agente não tem dado para reconhecer cliente antigo — ver
addendum do 010); arquiteto identificado → escala pela regra do arquiteto. Ticket
[010](wayfinder/tickets/010-o-que-e-um-lead-qualificado.md).
_Avoid_: lead qualificado, lead quente, oportunidade.

**Escalada** (`handoff`):
Passar o atendimento do agente para uma consultora. **Não é o plano B do agente — é o produto
dele**: conferir disponibilidade é ato físico, então boa parte dos atendimentos termina numa
consultora por definição do negócio, não por falha. O valor do agente está em quanto trabalho
já deixou pronto quando ela chega.
_Avoid_: escalonamento, transferência, encaminhamento, handover.

**Rodízio** (`rotation`):
Regra de distribuição de contato novo entre as consultoras: cada nova pessoa vai para a
próxima da fila. Cliente que volta **fura o rodízio** e vai para a consultora dona dele.
_Avoid_: fila, round-robin, escala.

**Visita** (`store_visit`):
Ida do contato à loja física, marcada com uma consultora.
_Avoid_: reunião, agendamento, compromisso.

**Cotação** (`quote`):
Orçamento montado pela consultora no Mainô e enviado ao contato.
_Avoid_: orçamento, proposta, pedido.

**Reserva técnica** (`technical_reserve`), sigla **RT**:
Comissão paga ao arquiteto sobre a compra que ele especifica. Interessa ao agente como
**sinal de classificação**: consumidor final não sabe o que é RT, então quem pergunta por ela
é arquiteto.
_Avoid_: comissão, bonificação.

### Produto e estoque

**Disponibilidade** (`availability`):
Se um produto está na loja agora. **Não existe em sistema algum** — a informação só passa a
existir quando uma consultora anda pela loja e olha. O site é e-commerce, mas **não conta como
sistema de estoque**: as consultoras conferem tudo à mão mesmo assim (confirmado 2026-09-02).
Por isso **o agente nunca afirma disponibilidade**, em nenhuma fase.
_Avoid_: estoque, saldo, quantidade.

**Catálogo** (`catalog`):
O conjunto de produtos que o agente conhece. **O Mainô não tem catálogo mantido** (o
`GET /produtos` do research 007 existe como endpoint, mas a loja não o popula — confirmado
2026-09-02, ticket 032). Na fase 1 o "catálogo" do agente é: as **categorias e o
posicionamento** da loja no contexto (ver **A loja**) + o **site** como referência de estilo,
que ele compartilha com o cliente mas não consulta em runtime. Produto específico → escala.
**Catálogo não é disponibilidade.**
_Avoid_: mix, portfólio, linha.

### Origem e registro

**Origem** (`source`):
De onde o contato veio antes de chamar no WhatsApp — Instagram, site, indicação, loja física.
_Avoid_: canal, campanha, mídia.

**Planilha compartilhada** (`shared_sheet`):
A planilha do Google que a loja usa hoje: diretório-mestre de escritórios de arquitetura,
lista de mailing, uma aba por consultora que atende (três) com a carteira de arquitetos dela
e o registro de brindes/aniversários, e logs de visitas e entregas. Guarda o vínculo
cliente↔consultora **sobretudo para arquitetos**; para consumidor final é esparso e sem chave
de contato (ver ticket [004](wayfinder/tickets/004-acesso-a-planilha-e-ao-catalogo.md)). A
cópia local de trabalho é `dados/CARTEIRA+MAILLING.xlsx`; o acesso à planilha viva vem no
setup do agente na loja.
_Avoid_: base, CRM, cadastro.

### Ainda sem definição

Termos que o projeto vai precisar e que **nenhuma decisão definiu ainda**. Não invente
significado para eles:

- **Sinal de sucesso** — o que conta como atendimento bem-sucedido, e como isso é capturado.
  Ticket [013](wayfinder/tickets/013-sinal-de-sucesso-do-aprendizado.md).
- **Contato perdido** — a partir de quando um atendimento sem resposta é dado como perdido.
  Pergunta 15 do ticket [020](wayfinder/tickets/020-perguntas-para-as-consultoras.md).
