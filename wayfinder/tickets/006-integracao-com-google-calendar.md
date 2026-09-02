---
id: "006"
title: O que a integração com Google Calendar exige
labels: [wayfinder:research]
status: closed
assignee: Claude
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
   Workspace, não Gmail comum. Descobrir qual o caso da Lais Aliski Casa é parte do ticket.
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

## Resolução

Investigação completa em [`research/006-google-calendar.md`](../research/006-google-calendar.md).

**A tensão apontada no ticket era real e é a coisa mais importante que este research
produziu.** A recomendação é condicional, e depende de dois fatos que só o dono do projeto
sabe — anexados ao [ticket do atendimento atual](009-como-funciona-o-atendimento-hoje.md):
se as consultoras mantêm agenda no Google **de verdade e atualizada**, e se a loja tem
**Workspace ou Gmail comum**.

**Se usam Google + Workspace:** conta de serviço com **delegação em todo o domínio**. Zero
atrito — a consultora não autoriza, não instala, não clica.

**Se usam Google + Gmail comum:** **compartilhamento de calendário** com uma conta única do
projeto. Cada consultora compartilha a agenda no papel `freeBusyReader` (livre/ocupado sem
detalhe de evento, que é exatamente a privacidade que o ticket pedia), e o agente cria
eventos num calendário da loja — nunca escrevendo na agenda pessoal de ninguém.

**OAuth individual por consultora está descartado.** Escopos de Calendar são "sensíveis": com
o app em Testing, a autorização e o refresh token **expiram em 7 dias**, o que obrigaria cada
consultora a reautorizar toda semana. A saída é a verificação do Google — até 10 dias,
exigindo domínio verificado, política de privacidade hospedada e vídeo demonstrativo. Um
detalhe de autenticação viraria bloqueio de projeto.

**Se NÃO usam Google, a decisão muda de natureza** — deixa de ser integração e vira adoção de
sistema, colidindo com a restrição do mapa de que o processo da loja não se dobra ao agente.
E há uma armadilha: free/busy num calendário vazio responde **"livre" sempre**, que é pior
que não responder — é o mesmo tipo de falha que a restrição de estoque proíbe, afirmar com
confiança algo que não se sabe. Nesse cenário a recomendação é **não construir integração de
calendário na fase 1**: o agente propõe horários de uma grade fixa da loja e escala para a
consultora confirmar. A confirmação humana absorve o que o sistema não sabe, e isso é
coerente com "fase 1 é só qualificação".

**Três coisas são nossas em qualquer cenário, e não vêm de graça de API nenhuma:**

1. **A reserva temporária de horário não existe na Calendar API.** Não há hold, TTL nem
   endpoint de booking. Segurar um slot enquanto o cliente confirma no WhatsApp exige tabela
   de holds no Postgres com **constraint de exclusão** — duas conversas podem pedir o mesmo
   horário, e o Google não impede overbooking.
2. **Revalidar a disponibilidade imediatamente antes de confirmar**, porque free/busy
   cacheado envelhece.
3. **O resultado do agendamento é registrado no nosso banco**, não no Calendar — é ele que
   alimenta o laço de aprendizado.

**Fato útil de custo:** um único `POST /freeBusy` cobre até 50 calendários, então a agenda do
time inteiro cabe em **uma requisição por conversa**. Cota é irrelevante nesta escala.

**Risco que nenhuma tecnologia resolve, e vale dizer em voz alta:** a agenda só é confiável
se alguém a mantiver atualizada. Se a consultora combina uma visita por WhatsApp e não
registra em lugar nenhum, um sistema próprio erra tanto quanto um Google Calendar vazio. Isso
é problema de processo, não de ferramenta.

---

## Addendum — respostas do ticket 020 (2026-08-11, resposta 1 de 4)

Ticket já fechado; registrado aqui como addendum, sem alterar a Resolução acima. É uma
resposta em quatro — tratar como amostra.

- **Usa Google Agenda:** "Sim, e registramos todos os compromissos" — resposta favorável ao
  caminho com integração.
- **E-mail de trabalho:** **@gmail.com** — confirma **Gmail comum**, não Workspace. Se a
  agenda se confirmar confiável, o caminho é o de **compartilhamento `freeBusyReader` com uma
  conta única do projeto**, e não conta de serviço com delegação de domínio.

**Falta a pergunta 18b** (mostrar a agenda da semana que vem) — não foi feita ou não foi
respondida nesta rodada. Sem ela, o critério de confiabilidade que a Resolução do
[009](009-como-funciona-o-atendimento-hoje.md) exige — "a tela, não a resposta verbal" —
continua sem confirmação. É a peça que falta para decidir se o agente agenda de verdade ou só
registra a intenção.
