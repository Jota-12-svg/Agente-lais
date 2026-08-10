---
labels: [wayfinder:map]
title: Agente de WhatsApp da Lais Casa
---

# Agente de WhatsApp da Lais Casa

## Destination

Um agente de WhatsApp **em produção** atendendo clientes reais da Lais Casa: recebe o
contato novo, faz a qualificação inicial (extrai os dados que a consultora precisa),
responde dúvidas sobre o negócio e sobre produtos que ele conhece, verifica
disponibilidade de horário de consultora e agenda, e **escala para uma consultora**
quando a conversa exige julgamento humano — tudo no tom que as consultoras já usam hoje.

Junto com ele, em produção, o **laço de aprendizado**: cada atendimento gera registro de
resultado (venda, reunião agendada, satisfação/insatisfação, fracasso) que alimenta uma
base a partir da qual o agente refina o atendimento seguinte.

O mapa termina com isso **rodando**, não com uma spec.

## Notes

**Este mapa carrega execução, não só decisão.** É um override explícito do padrão do
wayfinder: o destino é o agente funcionando, então tickets de construção são legítimos
aqui — mas só entram depois que a decisão que os governa estiver fechada.

**Projeto limpo.** O `.env` deste repositório é tratado como **cofre de credenciais e nada
mais** (Supabase `ewxmjbvaolfiafhghxbn` / us-east-1, Postgres, Gemini via kie.ai). Toda a
arquitetura, parâmetros, numeração de decisões e a ideia de plataforma multi-loja que
estavam escritos nos comentários do `.env` e do `.env.example` pertencem a um projeto
anterior e foram **descartados por decisão do usuário**. Não são fonte, não são
precedente, não voltam pela porta dos fundos. Dados no Supabase do projeto anterior devem
ser apagados.

**O negócio.** Lais Casa — loja de decoração e mobiliário (vasos, bandejas, taças,
móveis). Ticket de R$ 2.000 a R$ 50.000. Dois públicos distintos: **consumidor final** e
**arquiteto**, que manda uma planilha com uma lista de itens desejados. Três sistemas em
uso: **WhatsApp Business** (no celular de todas as consultoras), **Maino** (cotação e nota
fiscal) e uma **planilha compartilhada** (uma aba por consultora com os clientes dela,
mais uma aba de datas importantes tipo aniversários).

**Restrições duras**, a respeitar em toda decisão:

- **Não existe controle de estoque.** O que está à vista na loja é o estoque, conferido a
  olho pelas consultoras. O agente não pode afirmar disponibilidade de produto.
- **O tom das consultoras não muda.** O agente se adapta ao atendimento que já existe; o
  atendimento não se adapta ao agente.
- **Fase 1 é só qualificação.** Enquanto não estiver treinado, o agente coleta dados e
  escala. Não vende, não negocia, não resolve dúvida complexa.

**Skills a consultar em toda sessão:** `/grilling` e `/domain-modeling`. Em tickets de
prototipagem, `/prototype`. Em tickets de research, `/research` como subagente.

**Idioma:** português, em tudo — tickets, resoluções e handover.

## Decisions so far

<!-- índice: uma linha por ticket fechado -->

_(vazio — o mapa acabou de ser criado)_

## Not yet specified

Névoa em escopo, ainda sem nitidez para virar ticket:

- **Desenho do mecanismo de aprendizado.** Que forma exatamente a "base de treinamento"
  toma — prompt que evolui, recuperação de casos parecidos, memória por cliente,
  fine-tune? Só fica nítido depois de existir um sinal de sucesso definido e de eu ver
  conversas reais.
- **Modelo de dados no Supabase.** Esquema de clientes, conversas, produtos e aprendizado.
  Depende de saber que campos a qualificação extrai e como o catálogo é representado.
- **Stack e hospedagem do runtime.** Onde o agente roda, como recebe webhook, como
  sobrevive a reinício no meio de uma conversa.
- **Fluxo do arquiteto.** O agente recebe uma planilha com dezenas de itens — o que ele faz
  com ela é um segundo fluxo inteiro, não uma variação do primeiro.
- **Superfície para as consultoras.** Como elas veem, corrigem e assumem uma conversa do
  agente; como marcam que uma venda aconteceu.
- **LGPD.** Consentimento, retenção e o que pode ser guardado de conversa de cliente.
- **Estratégia de rollout.** Piloto com uma consultora, horário limitado, fallback quando
  o agente falha.
- **Migração da planilha compartilhada.** Se os clientes saem da planilha para o Supabase,
  ou se os dois coexistem.

## Out of scope

- **Fase 2 do agente** — venda direta, negociação e dúvidas complexas. É a evolução
  declarada do agente, mas depois deste destino; volta como mapa novo.
- **Gestão de estoque de verdade.** A loja não tem e este mapa não vai construir.
- **Substituir o Maino ou a planilha compartilhada.** O agente convive com eles.
