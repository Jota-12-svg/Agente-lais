---
id: "006"
title: O que a integração com Google Calendar exige
labels: [wayfinder:research]
status: open
assignee:
blocked-by: []
---

## Question

O usuário indicou o Google Calendar como fonte da disponibilidade dos consultores. **Há uma
tensão a checar antes:** ele também disse que a loja usa apenas três sistemas — WhatsApp,
Maino e a planilha. O Calendar não está entre eles, o que sugere que as consultoras podem
não manter agenda no Google hoje. Se não mantêm, "verificar disponibilidade" deixa de ser
integração e vira sistema a construir, e a decisão muda de natureza.

O research deve levantar:

1. **Autenticação para ler a agenda de várias pessoas.** OAuth por consultora (cada uma
   autoriza uma vez) versus conta de serviço com delegação de domínio — que exige Google
   Workspace, não Gmail comum. Descobrir qual o caso da Lais Casa é parte do ticket.
2. **Free/busy.** Como consultar disponibilidade sem ler o conteúdo dos eventos —
   privacidade importa, o agente não precisa saber que a consultora vai ao médico.
3. **Criar e alterar evento** em nome da consultora: convite ao cliente, fuso horário,
   cancelamento e remarcação.
4. **Reserva temporária de horário.** Enquanto o cliente confirma no WhatsApp, o slot pode
   ser tomado por outra conversa. Ver o que a API oferece e o que teria de ser resolvido do
   nosso lado.
5. **Limites de cota** que importem para um agente consultando agenda a cada conversa.
6. **Alternativas**, caso as consultoras não usem Google: Calendly e similares, ou agenda
   própria no Supabase com um painel — com o custo de cada uma.

**Resolvido quando** estiver claro o que a integração exige, o que ela pede das consultoras
e qual o caminho recomendado. Confirmar com o usuário se elas usam Google Calendar hoje é
parte da resolução.
