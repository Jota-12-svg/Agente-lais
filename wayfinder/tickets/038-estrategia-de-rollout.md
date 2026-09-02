---
id: "038"
title: Estratégia de rollout do agente — piloto, horário, fallback, canal de erro
labels: [wayfinder:grilling]
status: in-progress
assignee: sessão-grilling-038
blocked-by: []
---

## Question

O mapa tem, em `Not yet specified`, uma **estratégia de rollout**: "piloto com uma
consultora, horário limitado, fallback quando o agente falha". Ela **bloqueia a redação do
manual** ([034](034-redigir-o-manual-do-agente.md)) por três coisas concretas que o manual
precisa citar:

- o **canal** pelo qual a consultora avisa que o agente errou (a Parte B tem uma seção só
  disso);
- o **momento de entrega** de cada parte do manual (Parte A antes do piloto + demo ao vivo;
  Parte B no arranque — o *quanto antes* amarra aqui);
- o **piloto** que dispara a checagem de manutenção obrigatória do manual (item 9 do
  [033](033-manual-do-agente-para-as-consultoras.md)).

Isto é **grilling**, não tarefa: o piloto é a primeira vez que clientes reais falam com o
agente no número de produção, e as duas formas de errar são caras — largar cedo demais
(cliente real numa alucinação, credibilidade da loja queimada) ou tarde/tímido demais (o
agente nunca sai do teste e o projeto não valida nada).

### Tensão central a resolver

"Piloto com uma consultora" colide com "o agente é a porta de entrada de **todo** contato
novo" (ticket [009](009-como-funciona-o-atendimento-hoje.md)): o rodízio distribui **depois**
da qualificação, então não há como o agente atender só os contatos de uma consultora. O
piloto é limitado por **horário**, por **quem acompanha o laço de feedback**, ou pelos dois?

### O que o grilling decide

1. **Forma do piloto.** Quanto tempo. O agente no ar para todos os contatos novos ou só numa
   janela. Uma consultora "de plantão" no laço de feedback ou todas as três desde o dia 1.
   Qual consultora, se for uma.
2. **Horário do agente no piloto.** 24/7 como o [009](009-como-funciona-o-atendimento-hoje.md)
   desenhou, ou restrito (só horário comercial / só quando alguém está de olho).
3. **Gate de entrada.** O que precisa estar no ar e validado antes do primeiro cliente real:
   011, 014, 036, 037, 027 (número não bana), Parte A entregue + demo feita. O piloto só
   começa quando o quê?
4. **Fallback quando o agente falha.** Distinguir três falhas: o agente **cai** (processo
   morto — ninguém responde), o agente **erra** (respondeu bobagem mas está no ar), o agente
   **precisa ser parado** (alucinação em série → freio de mão, [036](036-freio-de-mao-global.md)).
   O que cobre cada uma no piloto.
5. **Canal de aviso de erro.** Como a consultora sinaliza "o agente falou besteira" — sem ser
   o WhatsApp ativo da loja (cega o agente, mesma restrição do [029](029-canal-de-notificacao-da-fila.md)).
   Candidatos: botão na plataforma das consultoras (037), grupo de WhatsApp do piloto nos
   números pessoais, e-mail, Telegram.
6. **Critério de saída do piloto.** O que precisa ser verdade para o piloto virar operação
   plena e o agente passar a valer para as três consultoras. Quem decide, com base em quê
   (liga no [013](013-sinal-de-sucesso-do-aprendizado.md): qualidade da qualificação, veredito
   da consultora).
7. **Sequência de expansão.** Depois do piloto: liga para as outras consultoras de uma vez ou
   escalonado. O que muda no manual (Parte B) a cada passo.
8. **Rollback.** Se o piloto vai mal, como se volta ao estado sem agente sem deixar cliente no
   vácuo.
9. **Amarração com o manual (034).** Confirmar as três saídas que o 034 espera: canal de erro
   (item 5), momento de entrega de cada parte (liga ao item 1/3), gatilho da checagem de
   manutenção (fim do piloto, item 6).

### Entradas úteis, não bloqueantes

- [009](009-como-funciona-o-atendimento-hoje.md) — agente 24/7, promete a loja e nunca a
  pessoa, rodízio para contato novo.
- [012](012-quando-e-como-o-agente-escala.md) — gatilhos de escalada, freio de mão por
  conversa adiado para o 027.
- [013](013-sinal-de-sucesso-do-aprendizado.md) — o que se mede na fase 1 (qualidade da
  qualificação; `advisor_verdict` é o sinal de maior peso).
- [027](027-testar-self-hosted-no-numero-atual.md) — validação do self-hosted antes de tocar
  no número de produção; o piloto depende disso.
- [033](033-manual-do-agente-para-as-consultoras.md) — forma do manual; entrega em dois
  momentos amarrada ao rollout.
- [036](036-freio-de-mao-global.md) — freio de mão global; o fallback do piloto se apoia
  nele.
- [037](037-construir-plataforma-consultoras-v1.md) — a plataforma; candidata a hospedar o
  canal de aviso de erro.

**Resolvido quando** a estratégia de rollout tiver forma do piloto, horário, gate de entrada,
fallback, canal de aviso de erro, critério de saída, sequência de expansão e rollback — e o
034 puder tirar "estratégia de rollout" da lista de bloqueios (as três saídas que ele espera
estarão definidas).
