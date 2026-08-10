---
id: "021"
title: Instagram como porta de entrada para o WhatsApp
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

## Question

Surgiu no grilling do ticket [009](009-como-funciona-o-atendimento-hoje.md): os principais
canais de entrada da Lais Casa são **Instagram e WhatsApp**. Existe um site, com movimento
pequeno.

O dono do projeto decidiu a versão mínima: **o Instagram não recebe agente.** Ele recebe uma
**mensagem automática que direciona a pessoa para o WhatsApp**, onde o atendimento é
centralizado. Isso é configuração na conta profissional (Meta Business Suite), não
construção — e a decisão é deliberada: abrir um segundo canal antes de o primeiro funcionar
com cliente real multiplica superfície sem multiplicar aprendizado.

### O que fazer

1. **Configurar a resposta automática do Direct** na conta profissional do Instagram,
   direcionando para o WhatsApp. Verificar no Meta Business Suite quais automações a conta
   tem disponível de fato (resposta instantânea, mensagem de ausência, perguntas frequentes)
   — o que existe nativamente é a primeira coisa a confirmar, antes de cogitar qualquer
   integração.
2. **Montar links `wa.me` rastreados**, um por origem — bio do Instagram, stories, site. Cada
   link leva uma mensagem inicial pré-preenchida diferente, de modo que **a primeira mensagem
   do cliente já revela de onde ele veio**. O agente passa a saber a origem antes do primeiro
   "oi", sem depender de API nenhuma. É o jeito mais barato de resolver o rastreamento de
   origem e vale por si só.

### Deixado de fora, e por quê

Três coisas justificariam construir integração de verdade com o Instagram. **Nenhuma está no
escopo agora**, e ficam registradas para quando o assunto voltar:

- **Responder comentário em post** — é onde acontece boa parte da pergunta de decoração, e
  em público.
- **O agente conversar no Direct**, em vez de só empurrar para o WhatsApp.
- **Carregar o contexto na travessia** — a pessoa pergunta de um vaso no Direct e chega ao
  WhatsApp com isso já sabido, em vez de recomeçar. É a mais valiosa e a mais difícil: **o
  Instagram identifica por @ e o WhatsApp por telefone, sem campo em comum.** Só se resolve
  com um código carregado no link de travessia — o que é construção, não configuração.

**Resolvido quando** a mensagem automática estiver no ar no Instagram e os links `wa.me`
rastreados estiverem publicados nas origens, com a lista de qual link corresponde a qual
origem registrada aqui.
