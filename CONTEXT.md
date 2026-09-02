# Agente de Atendimento da Lais Casa

Glossário do domínio. É a linguagem única do projeto: o que estes termos significam aqui vale
para tickets, conversas, código e schema de banco.

Cada termo traz, entre parênteses, o nome correspondente em **inglês** — é ele que aparece no
código, conforme o `CLAUDE.md`. O termo em português é o que se usa ao falar e escrever.

Este arquivo é **só glossário**. Decisão de arquitetura mora nos tickets em `wayfinder/`;
detalhe de implementação, no código.

## Language

### Pessoas

**Consultora** (`advisor`):
Pessoa da Lais Casa que atende clientes. Quatro no total; **três fazem o atendimento no
WhatsApp** e têm aba na planilha compartilhada (PAMELLA, GABRIELA, JOSLAINE). O feminino é
proposital: são todas mulheres.
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

**Sinal de sucesso** (`success_signal`):
Na fase 1, o sucesso de um atendimento é a **qualidade da qualificação** — a consultora
assumiu sem recomeçar, com os dados certos, a classificação certa e a escalada na hora
certa —, não o desfecho de negócio (venda, visita), que acontece depois e fora do controle
do agente. O desfecho é registrado por atendimento como contexto de peso baixo. O único
sinal negativo que treina o agente é o **julgamento explícito da consultora**
(`advisor_verdict`); `sem_venda`, `perdido` e `esfriado` são fatos **neutros** — tratá-los
como falha ensinaria o agente a evitar cliente difícil. Ticket
[013](wayfinder/tickets/013-sinal-de-sucesso-do-aprendizado.md).
_Avoid_: métrica, KPI, taxa de conversão.

**Atendimento esfriado** (`cooled`):
Atendimento sem resposta do contato por **3 dias**, que nunca escalou. O mesmo número define
a **janela de retomada**: depois de uma **escalada**, um contato que volta em até 3 dias
segue no mesmo atendimento ("a consultora já vai te atender"); passando disso, começa
atendimento novo, do zero, no **rodízio**. Desfecho **neutro** para aprendizado. Ticket
[013](wayfinder/tickets/013-sinal-de-sucesso-do-aprendizado.md).
_Avoid_: contato perdido, abandono, churn, no-show.

### Produto e estoque

**Disponibilidade** (`availability`):
Se um produto está na loja agora. **Não existe em sistema algum** — a informação só passa a
existir quando uma consultora anda pela loja e olha. Por isso **o agente nunca afirma
disponibilidade**, em nenhuma fase.
_Avoid_: estoque, saldo, quantidade.

**Catálogo** (`catalog`):
O conjunto de produtos que o agente conhece — preço, dimensão, material, imagem, descrição.
Vem do Mainô. **Catálogo não é disponibilidade:** estar no catálogo não significa estar na
loja.
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

- _(nada pendente no momento — `Sinal de sucesso` e `Atendimento esfriado` foram definidos
  pelo ticket [013](wayfinder/tickets/013-sinal-de-sucesso-do-aprendizado.md) em 2026-09-02.)_
