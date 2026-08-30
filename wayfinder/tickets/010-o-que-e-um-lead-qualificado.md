---
id: "010"
title: O que é um lead qualificado e que dados o agente extrai
labels: [wayfinder:grilling]
status: closed
assignee: Claude
blocked-by: ["009", "003"]
---

## Question

A fase 1 do agente é **só qualificação**: ele coleta e escala, não vende. Então o valor
inteiro dele nessa fase está em uma pergunta — **o que ele tem de arrancar da conversa para
que o tempo da consultora valha a pena?**

O usuário citou nome, número e e-mail, mais "qualquer coisa relevante". "Relevante" é o que
este ticket precisa tornar concreto.

A decidir:

- **Os campos.** Que informação a consultora precisa ter antes de entrar na conversa? Além
  do contato: é arquiteto ou consumidor final? Que ambiente está montando? Tem prazo? Tem
  orçamento? Já é cliente da casa? Como chegou até a loja?
- **O que é obrigatório e o que é oportunista.** Um cliente que se recusa a dar e-mail é
  descartado ou passa assim mesmo? Onde está a linha entre qualificar e interrogar — um
  cliente de R$ 50 mil não responde formulário.
- **Como o agente pergunta sem soar como formulário.** O tom das consultoras tem de ser
  preservado; conversas reais (ticket 003) mostram como elas extraem isso naturalmente.
- **Qualificação diferente por público.** Arquiteto e consumidor final provavelmente não
  se qualificam com as mesmas perguntas — e o agente precisa descobrir cedo em qual está.
- **Quando parar.** O que caracteriza qualificação *completa*, e o que o agente faz depois:
  escala imediatamente, agenda, ou continua conversando?
- **Onde os dados vão parar.** A planilha compartilhada é a base de clientes de hoje. O
  agente escreve nela, escreve no Supabase, ou nos dois?

**Resolvido quando** existir a lista de campos, a regra do que é obrigatório, o critério de
qualificação completa e o destino dos dados.

---

## Resolução

Sessão de grilling em 2026-08-30, com o dono do projeto. Base de evidência: a análise dele
sobre como as consultoras atendem (o ticket [003](003-exportacao-das-conversas-das-consultoras.md)
fechou sem a exportação das conversas — ver lá) e o acesso recém-obtido à planilha
compartilhada de clientes.

**O enquadramento que governa o resto:** o agente não é um formulário. Ele é um atendente que
entrega valor aos dois lados — à loja, deixando trabalho pronto para a consultora; ao cliente,
respondendo o que ele veio buscar sem fazer perder tempo. Não existe "esqueleto" de perguntas.
A condução depende de como o cliente chega, do que ele pergunta, do que ele já contou. A
coleta dos campos abaixo acontece **encaixada na conversa** — durante ou ao finalizar o
contato —, nunca como bateria.

### Os campos da qualificação

| Campo | Origem | Peso |
|---|---|---|
| Telefone | o WhatsApp já dá | garantido |
| Nome | confirmado na conversa (não o do perfil) | núcleo |
| Modo do atendimento | `consumidor_final` ou `arquiteto` — pergunta natural ("é para sua casa ou para um projeto?") + sinais que disparam sozinhos (ticket 009) | núcleo — decide se continua ou escala |
| O que procura | o item ou o ambiente | núcleo |
| Para quando | prazo / gatilho (mudança, obra, evento, presente) | núcleo |
| Orçamento | faixa, só se a pessoa deixar escapar | oportunista |
| Origem | Instagram, indicação, loja, site — parte resolvida pelos links `wa.me` do ticket 021 | oportunista |
| Já é cliente da casa | **lookup na planilha pelo telefone** — o agente não pergunta | automático |
| Intenção de visita + quando | registra; só marca de fato se a agenda se provar confiável (condicional do ticket 009) | oportunista |
| E-mail | provavelmente raro num contexto de WhatsApp | oportunista |

O **núcleo** (nome + o que procura + para quando, mais o modo) é o que justifica a escala. O
resto é enriquecimento.

### Obrigatório vs. oportunista

**Nada é obrigatório a ponto de barrar ou descartar um contato.** O agente nunca recusa
atendimento por falta de dado. Cada campo oportunista é tentado **no máximo uma vez**, de
forma natural; se o cliente desvia, o agente segue e deixa a consultora completar. Um cliente
de R$ 50 mil que se sente interrogado é perda real; um chamado escalado só com nome e "quer um
sofá" ainda é útil.

### Como o agente conduz — restrição de design

O 010 fixa o princípio; o **ticket [014](014-como-o-agente-soa.md)** (protótipo de tom)
calibra o volume exato de mensagens. Quatro regras concretas:

1. Responde primeiro o que o cliente trouxe.
2. Nunca faz pergunta isolada quando dá para encaixá-la na resposta.
3. No máximo uma leva curta de perguntas por vez.
4. Entre insistir num campo e escalar, escala.

O agente é ágil e econômico em mensagens — o tempo do cliente conta tanto quanto o da loja.

### Arquiteto

Assim que o atendimento é classificado como `arquiteto` — pela pergunta, por autodeclaração,
por planilha / anexo / lista longa, ou por menção a RT (ticket 009) — o agente **escala na
hora**, com o mínimo: telefone, nome se já tiver, e o material que a pessoa mandou. Não
pergunta prazo, orçamento nem ambiente, e não tenta adiantar nada. A fase 1 atende só
consumidor final; reforçado pela política da loja registrada no ticket 020 ("quando for
arquiteto prefiro que seja direcionado à consultora").

### Contato que já é cliente da casa

Quando o lookup por telefone acusa que o número já é cliente de uma consultora: qualificação
**mais leve** — o agente não repete nome, origem nem "casa ou projeto?" se o histórico já
responde. Foca no **que a pessoa quer agora** (cada atendimento é novo; o mesmo cliente pode
voltar por outra coisa, inclusive mudando de modo) e escala **para a consultora dona**,
furando o rodízio. Se este atendimento parece projeto/planilha, vale a regra do arquiteto —
escala imediata, mesmo sendo cliente conhecido.

### Qualificação completa e o próximo passo

Não existe "formulário completo". A qualificação está completa **quando o agente tem o
suficiente para a consultora priorizar e assumir sem recomeçar**: nome + o que quer + (se veio
à tona) prazo e orçamento. A partir daí:

- **No expediente** → o agente cria o chamado na fila (ticket 012).
- **Fora do expediente** → continua disponível, coleta o que der, informa quando a loja volta
  (promete a loja, nunca a pessoa — ticket 009), e o chamado entra na fila para o expediente
  seguinte.
- **Escala antecipada** → a qualquer momento, se aparecer um gatilho do ticket 012 (compra
  concreta, negociação de preço, irritação, pedido de pessoa), escala na hora, mesmo com a
  qualificação incompleta.
- Tendo o essencial e não havendo mais o que coletar naturalmente, o agente **escala em vez de
  esticar a conversa**.

### Onde os dados vão parar

| | Supabase (interno do agente) | Fila / aba do ticket 012 | Aba da consultora |
|---|---|---|---|
| Campos da qualificação | tudo | o relance (ver abaixo) | nada |
| Metadados do atendimento | tudo | telefone + "novo"/"cliente da X" | nada |
| Conversa (log de mensagens) | sim | não | nada |

- **O Supabase é a memória do agente e a matéria-prima do laço de aprendizado.** É **interno** —
  as consultoras não mexem nele e não precisam. **Todo atendimento** gera registro, inclusive
  os que esfriam sem escalar (o ticket 013 já disse que o fracasso também é sinal). Só os
  escalados geram linha na fila.
- O agente **nunca escreve nas abas das consultoras** — território delas, e o vínculo
  cliente↔consultora é decisão do rodízio, não do agente. Ele só **lê** a planilha, pelo
  telefone, no primeiro contato.
- Schema do Supabase: fora do escopo deste ticket (segue como névoa no mapa). Retenção e o que
  pode ser guardado de conversa: névoa de LGPD do mapa — o store fica sujeito a essa decisão
  quando ela vier.

### A linha do chamado na fila

O handoff acontece na **mesma conversa do WhatsApp**: a consultora pega o chamado, abre aquele
número e continua o chat — o histórico inteiro está ali, ela rola para cima. A "conversa
inteira" que ela pediu (ticket 020) já está resolvida pelo próprio WhatsApp. **A linha da fila
não reproduz a conversa** — conversa é dado pessoal e a planilha compartilhada não é lugar
para ela.

A linha carrega só o relance para priorizar:

- Telefone (é como ela acha o chat)
- Nome (se coletado)
- O que a pessoa quer — uma linha
- Para quando (se veio à tona)
- Orçamento (se veio à tona)
- "Contato novo" ou "cliente da [consultora]"
- Horário que o chamado entrou (o da madrugada mostra que a pessoa espera há horas → prioridade)
- Motivo da escala (o gatilho)

Chamado escalado quase sem nada (arquiteto que manda planilha no "oi"): entra com o mínimo —
telefone + "arquiteto — planilha recebida" + horário. Enquanto ninguém pega o chamado, o
agente **mantém o relance atualizado** se o cliente mandar mais informação.

Fora do escopo do 010: quem tira o vermelho quando a consultora assume, e o mecanismo de
escrita — tickets 030/031.

### O que este ticket não decide

- **Redação exata, tamanho e número de mensagens** → ticket 014.
- **O que o agente pode afirmar sobre o produto que o cliente citou** (preço, medida,
  disponibilidade) → ticket 011, bloqueado pelo 004. Por ora o agente **registra o item como o
  cliente falou e não comenta**.
- **Schema do Supabase e migração da planilha compartilhada** → névoa do mapa.
- **Retenção / consentimento / LGPD** → névoa do mapa.

### Vocabulário

Entrou em [`CONTEXT.md`](../../CONTEXT.md) o termo **Atendimento qualificado**
(`qualified_engagement`), e a linha "Lead qualificado" saiu de "Ainda sem definição".
