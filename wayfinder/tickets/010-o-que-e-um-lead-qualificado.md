---
id: "010"
title: O que é um lead qualificado e que dados o agente extrai
labels: [wayfinder:grilling]
status: open
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
