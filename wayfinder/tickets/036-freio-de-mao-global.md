---
id: "036"
title: Freio de mão global — desligamento de emergência do agente
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

> **Origem — reconciliação de 2026-09-02.** O grilling do ticket
> [012](012-quando-e-como-o-agente-escala.md), na branch `wayfinder/quando-escalar`, tinha
> separado o "freio de mão" em dois: o **por conversa** (resolvido de graça pelo mecanismo de
> detecção de handoff) e o **global** (desligar o agente inteiro), e abriu um ticket dedicado
> para o segundo. Ao re-aplicar o 012 na trunk, só a metade "por conversa" sobreviveu — a
> seção "Freio de mão" do 012 hoje adia **tudo** para o [027](027-testar-self-hosted-no-numero-atual.md),
> mas o 027 só cobre a pergunta técnica do freio **por conversa** (se uma mensagem de companion
> gera evento no Baileys). O desligamento global ficou sem dono. Este ticket restaura esse
> item de trabalho — já decidido, não é design novo.

## Question

Todo serviço em produção precisa de um **desligamento de emergência**. Para este agente, o
cenário concreto: o agente está respondendo errado — inventando preço, afirmando
disponibilidade de produto (a restrição dura nº 1 do `CLAUDE.md`), "alucinando" — e é preciso
**calá-lo em todas as conversas de uma vez**, imediatamente, sem depender de entrar em cada
conversa.

Isso é distinto do freio de mão **por conversa** (uma consultora assume um atendimento e o
agente se cala ali) — esse já existe de graça pelo mecanismo de detecção de handoff do
ticket 012. Aqui é o botão único que derruba o agente inteiro.

### O que decidir / construir

- **Mecanismo técnico.** Variável de ambiente lida a cada mensagem, flag numa tabela do
  Supabase (o 035 já traz Supabase para o stack), endpoint protegido, painel admin — a
  escolha cabe a quem implementar, mas precisa ser **rápida de acionar** por quem não abre
  terminal.
- **Efeito imediato e abrangente.** O desligamento atinge **todas as conversas em
  andamento**, não só as mensagens que chegarem depois. Enquanto desligado, o agente não
  responde nada (ou responde só uma linha neutra de "já te respondo", a decidir).
- **Quem aciona.** Dono do projeto e/ou consultoras com acesso — a definir na implementação.
  Não é um controle que o cliente final vê.
- **Como se sabe que está desligado.** Um sinal visível para quem opera (log, cor na
  plataforma do 035, e-mail de confirmação) para não ficar dúvida se o agente está no ar.
- **Religar.** O caminho de volta — e se conversas que chegaram durante o apagão precisam de
  algum tratamento (fila de escalada? nada?).

### Relação com outros tickets

- **012** — a seção "Freio de mão" ganha um ponteiro para cá ao fechar este ticket.
- **027** — cobre o freio **por conversa** (mensagem de companion → evento no Baileys); não
  cobre este.
- **035** — se o mecanismo escolhido for uma flag no Supabase, encosta no esquema do 035.
- **Névoa "Stack e hospedagem do runtime"** — o ponto de integração no código depende de
  onde e como o agente roda; a decisão do mecanismo pode esperar isso, mas o **requisito**
  fica registrado desde já.

**Resolvido quando** existir um jeito comprovado de desligar o agente inteiro — testado,
com quem tem acesso documentado e o caminho de religar claro.

---

## Nota — protótipo visual na plataforma (2026-09-02, ticket 037)

A pedido do dono, o [037](037-construir-plataforma-consultoras-v1.md) já embutiu o **controle
na tela** — `advisor-platform/web/src/lib/KillSwitch.svelte`: barra de status "Agente no ar /
desligado" + botão "Desligar o agente" com confirmação + banner vermelho quando desligado +
"Religar o agente".

**É só visual.** Guarda o estado em `localStorage`, não fala com o Supabase nem com o
runtime. Serve para posicionar o controle e mostrar como ele avisa. **Não muda nada deste
ticket** — o mecanismo real (flag lida pelo runtime a cada mensagem, quem aciona, tratamento
das conversas do apagão) continua a decidir aqui, e depende da stack do agente.
