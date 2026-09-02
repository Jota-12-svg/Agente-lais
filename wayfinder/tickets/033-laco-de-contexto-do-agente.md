---
id: "033"
title: Laço de contexto — o contexto do agente evoluindo com os atendimentos
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: ["013"]
---

## Question

Surgiu na grelha do ticket [014](014-como-o-agente-soa.md), 2026-09-02. O dono quer que o
**contexto que o agente carrega sobre o negócio** cresça com os atendimentos — e foi
explícito que **isto é diferente do sinal de sucesso/fracasso** do ticket
[013](013-sinal-de-sucesso-do-aprendizado.md): contexto não depende de a conversa ter dado
venda. É sobre o que **recorre**.

Exemplos do tipo de coisa que se aprenderia:
- "Todo mundo pergunta se tem lista de casamento" → o agente devia saber a resposta.
- "Clientes chamam a bandeja grande de 'petisqueira'" → vocabulário do cliente.
- "Muita gente pergunta sobre entrega para o interior do Paraná" → uma dúvida frequente sem
  resposta no contexto atual.

**Forma acordada na grelha** (a detalhar neste ticket):
- **Quem propõe:** a própria Manu, num passe **quinzenal** sobre os transcritos, rodando via
  **Batch API** (~50% do preço — ver `prototipo-tom-014/CUSTOS.md`).
- **O que sai:** uma lista de **propostas** de acréscimo ao contexto, não mudanças aplicadas.
- **Aprovação:** **a dona aprova** cada proposta. Nada entra no contexto do agente sozinho.
- **Onde cai:** um **doc/store separado de contexto de negócio** do agente — **não** o
  `CONTEXT.md`, que se declara "só glossário" e é curado à mão.
- **Distinção do 013:** não pontua por resultado; cataloga o que se repete.

A decidir neste ticket:
- O formato exato da proposta (o que a Manu extrai, como apresenta para a dona revisar).
- Onde o "contexto de negócio" mora — arquivo versionado no repo, tabela no Supabase, parte do
  system prompt? E como ele entra na chamada (prefixo cacheado? ver cache de prefixo no
  `CUSTOS.md`).
- O gatilho — quinzenal fixo, ou por volume de atendimentos, ou quando um padrão passa de N
  ocorrências.
- Como a dona revisa na prática (ela não mexe em arquivo — precisa de uma superfície).
- O que **não** vira contexto (dado de um cliente específico é memória por cliente, não
  contexto de negócio; opinião de uma conversa só não é padrão).
- LGPD: o passe lê transcritos de clientes em lote — anonimizar antes? (o `CLAUDE.md` pede
  "anonimizadas sempre que o uso permitir", e aqui o uso permite — é offline).

**Bloqueado por 013:** o laço de contexto e o laço de sucesso/fracasso vão ler os mesmos
transcritos e podem compartilhar infraestrutura (Batch, store, cadência). Desenhar este antes
de o 013 fechar arrisca retrabalho. Não é urgente — o agente funciona sem ele; ele é
refinamento contínuo.

**Resolvido quando** houver um desenho de como uma observação recorrente vira contexto
aprovado do agente, ponta a ponta.
