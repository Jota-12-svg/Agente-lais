---
id: "033"
title: Manual do agente para as consultoras — que forma toma e o que cobre
labels: [wayfinder:grilling]
status: closed
assignee: sessão-grilling-033
blocked-by: []
---

## Question

O projeto precisa de um **manual do agente**: um material que explica, para quem não é
técnico, o que o agente faz, como ele funciona, o que ele **não** faz, e o que se espera das
consultoras em troca. Público primeiro são as três consultoras que atendem e a dona da loja;
o parceiro do usuário e uma consultora nova no futuro também são leitores plausíveis.

Isto é um **grilling**, não uma tarefa de redação, porque o manual tem dois modos de falhar,
os dois caros:

- **Técnico demais** — ninguém lê, e o agente entra em produção com quem atende sem saber o
  que ele faz.
- **Vago ou otimista demais** — cria expectativa errada. Uma consultora que termina o manual
  achando que o agente confirma disponibilidade, ou que ele "resolve" o cliente sozinho, vai
  descobrir o contrário na frente do cliente. Isso queima a credibilidade que a restrição
  dura do estoque existe para proteger.

Além disso, "responsabilidades das consultoras" é **compromisso operacional pedido a quem já
tem processo próprio** — e a restrição dura diz que o processo da loja não se dobra ao
agente. O manual não pode soar como "aqui está o fluxo novo que vocês vão seguir". Como se
pede o que precisa ser pedido, sem inverter essa relação, é decisão de grilling, não de
redação.

### O que o grilling decide

1. **Público e registro.** Só as três consultoras + a dona? Também a 4ª pessoa (que não
   atende)? O parceiro do usuário? Uma consultora nova daqui a seis meses? O registro muda
   com isso: apresentação de novidade que se lê uma vez × documento de referência que se
   consulta quando surge dúvida.

2. **Forma e meio.** Documento no repositório? PDF ou slides para entregar? Uma página só?
   Roteiro para uma demonstração ao vivo (o agente rodando num número de teste)? Vídeo curto?
   As consultoras atendem "metade e metade" celular/computador (ticket
   [020](020-perguntas-para-as-consultoras.md), pergunta 1) — o meio tem de caber nisso.

3. **Estrutura e o que entra.** Candidatos: o que o agente faz · o que ele explicitamente
   **não** faz (não afirma disponibilidade, não vende, não negocia preço, não promete uma
   pessoa — só a loja) · como um atendimento típico flui, do "oi" à escalada · quando e como
   ele escala · o que aparece na aba de chamados e como a consultora responde a isso · o que
   fazer quando o agente erra. Decidir o recorte e a ordem.

4. **Responsabilidades das consultoras — o que exatamente se pede.** Olhar a fila de chamados
   (e-mail + aba)? Assumir um chamado seguindo o rodízio? Marcar o resultado do atendimento
   (venda, satisfação) — **depende do [013](013-sinal-de-sucesso-do-aprendizado.md)**?
   Avisar quando o agente erra, e por qual canal? Não responder o cliente por um caminho que
   cega o agente — **depende do [019](019-companion-windows-ponto-cego.md) /
   [016](016-escolher-parceiro-meta.md)**? Este é o ponto mais sensível do ticket: listar
   pouco e o agente fica sem rede; listar demais e o manual vira imposição de processo.

5. **Um artefato ou dois.** "O que o agente faz" é explicativo e estável; "como operar com
   ele no dia a dia" é operacional e muda a cada ajuste de rollout. Juntar num documento só
   ou separar em dois com ciclos de vida diferentes.

6. **Tom do próprio manual.** Fala com quem não é técnico e não quer manual. Sem jargão de
   software. Espelha a restrição dura: o agente se adapta ao atendimento que existe, e o
   manual descreve o agente — não redesenha o trabalho de quem lê.

7. **Como se mantém vivo.** O comportamento do agente vai mudar (ajustes da fase 1, depois a
   fase 2). Sem dono e sem gatilho de atualização, o manual nasce com data de validade.
   Decidir quem mantém e o que dispara uma revisão.

8. **Quando é entregue.** Antes do piloto, junto com ele, depois? Amarra-se à **estratégia de
   rollout**, que hoje é Névoa no mapa.

### Bloqueio — resolução em dois momentos

O **grilling** (itens 1–8: público, forma, estrutura, papel, responsabilidades a pedir, tom,
manutenção) está **desbloqueado** e pode rodar agora. Ele não descreve o comportamento do
agente, só decide a forma do material que vai descrevê-lo — risco zero para o projeto.

A **redação final do manual** não deve começar antes de:

- [011](011-o-que-o-agente-pode-dizer-sobre-produto.md) — o que o agente pode afirmar sobre
  produto e disponibilidade (o manual mostra isso à consultora como uma promessa da loja).
- [013](013-sinal-de-sucesso-do-aprendizado.md) — define **se** "marcar o resultado" é
  responsabilidade da consultora e com que atrito.
- [014](014-como-o-agente-soa.md) — o manual ilustra como o agente soa; precisa dos exemplos
  reais, não de invenção.
- Uma decisão de **estratégia de rollout** (piloto com uma consultora, horário, fallback) —
  hoje em `Not yet specified`.

Por isso o grilling deve **abrir um ticket de tarefa** (034) para escrever o manual, já com
esses `blocked-by` no frontmatter, em vez de tentar redigir agora com base instável.

### Entradas úteis, não bloqueantes

- Respostas das consultoras no [020](020-perguntas-para-as-consultoras.md): elas já sabem do
  projeto (a reunião que originou boa parte do mapa), respondem curto, atendem no celular
  tanto quanto no computador. Isso informa forma e registro.
- Ticket [012](012-quando-e-como-o-agente-escala.md) (fechado): a fila de chamados, os
  gatilhos de escalada e a transparência com nome próprio — matéria-prima do "como funciona".
- Ticket [010](010-o-que-e-um-lead-qualificado.md) (fechado): o que o agente coleta e o que
  vira chamado na fila.

**Resolvido quando** o manual tiver público, meio, estrutura, recorte de conteúdo, lista do
que se pede às consultoras, decisão de um ou dois artefatos, dono e gatilho de atualização —
e o ticket 034 estiver aberto para a redação, bloqueado pelas decisões de comportamento e de
rollout.

---

## Resolução

Grilling com o dono, 3 rodadas (9 perguntas). A **forma** do manual está fechada; a redação
é o ticket [034](034-redigir-o-manual-do-agente.md), aberto aqui e bloqueado pelas decisões
de comportamento e de rollout.

### Decisões

**1. Público e registro.** Destinatário primário: as **3 consultoras que atendem + a dona**.
A 4ª pessoa recebe cópia, mas nada se pede a ela. O manual é **referência curta e
consultável**, não apresentação que se lê uma vez — porque uma consultora nova daqui a meses
e o parceiro do dono são leitores plausíveis, e o material não pode depender de alguém ter
estado na demonstração ao vivo.

**2. Um artefato, duas partes.** Um documento só, com duas partes claramente separadas:

- **Parte A — "O que o agente faz"**: explicativa e estável, muda só entre fases.
- **Parte B — "No dia a dia"**: operacional, leva data no cabeçalho e um aviso explícito de
  que muda a cada ajuste de rollout.

Para três leitoras não-técnicas, dois arquivos seria mais coisa a perder de vista. Vira
folha à parte só se a Parte B ficar instável demais.

**3. O que exatamente se pede às consultoras.** O manual abre pelo que o agente faz *por
elas* (entrega o contato já qualificado, no rodízio, 24/7) antes de pedir qualquer coisa.
São **quatro pedidos**:

1. Chegou o e-mail de chamado novo → abrir a plataforma das consultoras e **assumir**, no
   mesmo rodízio de sempre.
2. Terminou o atendimento → **marcar o desfecho** (virou venda / visita / sem venda) e **o
   veredito** sobre o agente (te deixou pronta pra assumir? sim / não / + nota). Dois toques.
   O `advisor_verdict` é o sinal de maior peso do aprendizado (ticket 013).
3. O agente falou algo errado com um cliente → **avisar** (canal definido na estratégia de
   rollout).
4. **Responder o cliente pelo mesmo WhatsApp de sempre** — não por um app à parte que o
   agente não enxerga (princípio; o recorte fino depende de 019/016).

Itens 3 e 4 entram como "o que já muda pouco no seu dia", não como processo novo.

**4. Seção do freio de mão (kill switch).** Seção própria na Parte B — **"Se o agente
começar a errar feio"** — deixando claro que a feature existe e é para as consultoras
usarem:

- **O que é**: um botão que desliga o agente em **todas as conversas de uma vez**, na
  plataforma das consultoras. Mecanismo real é o ticket
  [036](036-freio-de-mao-global.md) / runtime.
- **Quando usar**: o agente inventou preço, afirmou que tem um produto, está alucinando.
  **Não** é para "esse cliente eu quero pegar" — para isso é só **assumir** o chamado.
- **O que acontece**: o agente para de responder todo mundo; um aviso vai para a dona / o
  grupo; alguém do lado do projeto religa depois de checar.
- **Depois de acionar**: avisar o dono pelo canal de erro. Não é decisão que a consultora
  carrega sozinha.

Isso **fecha a pergunta "quem aciona" do 036** para o lado de incluir as consultoras
(decisão do dono, 2026-09-02) — o 036 ganha nota nesse sentido.

**5. Tom do manual.** Concreto e com exemplo, segunda pessoa ("quando um cliente te
chama…"), zero jargão de software, curto. Ilustrado com **prints de conversa real do
agente** (vêm do ticket 014, não invenção). Português, acolhedor sem ser publicitário. Cada
coisa que se pede vem colada ao ganho que ela traz — não como obrigação solta. O manual
**descreve** o agente; não redesenha o trabalho de quem lê.

**6. Forma e meio.** Fonte em **markdown no repositório** (é onde o projeto mora, e é
versionável) → entregue como um **Google Doc**. As consultoras vivem no ecossistema Google
(e-mail `@gmail.com`, Google Agenda), abre no celular, a dona compartilha com consultora
nova por link, permite comentário para a revisão que a Parte B vai exigir. Não slides (é
referência, não palestra), não PDF (congela um documento que nasce para mudar). Alvo de
tamanho: Parte A em 1–2 páginas, Parte B em ~1 página + prints. O **roteiro da demonstração
ao vivo não é o manual** — é artefato interno do projeto para o dia do piloto, decidido no
rollout; o manual só menciona que a demo acontece.

**7. Estrutura e ordem.**

- **Parte A — O que o agente faz** (abre pelo ganho):
  1. O que você ganha — contato chega com nome, o que quer e para quando já coletados, no
     rodízio, 24/7.
  2. O que ele faz — recebe o "oi", pergunta o essencial, responde dúvida que conhece.
  3. O que ele **não** faz — não afirma disponibilidade, não vende, não negocia preço, não
     promete uma pessoa (só a loja); na dúvida, escala.
  4. Como ele fala — com nome próprio, sem fingir ser gente, sem se anunciar robô (+ print
     real do 014).
  5. Quando ele te passa a conversa — os gatilhos + o que vem no chamado.
  6. Quando ele erra — o que fazer.
- **Parte B — No dia a dia** (abre por "muda pouco"):
  1. Chegou chamado → o e-mail, a plataforma, assumir.
  2. O rodízio continua sendo de vocês.
  3. Fechar o atendimento → marcar desfecho + veredito (e por que o veredito importa: é
     assim que o agente aprende).
  4. Avisar quando o agente erra → canal [definido no rollout].
  5. Se o agente começar a errar feio → o freio de mão (seção 4 acima).
  6. Responder o cliente sempre pelo WhatsApp de sempre.

**8. Quando é entregue.** Princípio fixado agora (o detalhe amarra à estratégia de rollout,
hoje na névoa do mapa): **Parte A antes do piloto**, junto com uma **demonstração ao vivo**
do agente num número de teste. **Parte B no arranque do piloto**, quando já existe
plataforma real para mostrar na tela.

**9. Como se mantém vivo.** Dono do manual: **João Victor** (o dono do projeto) — nunca uma
consultora. Gatilhos de revisão: mudança de fase (1→2), qualquer mudança no que se pede às
consultoras (Parte B), e uma **checagem obrigatória no fim do piloto**. Parte A revista
raramente; Parte B leva data no cabeçalho e é revista a cada ajuste de rollout. O rodapé do
documento carrega "dono · revisar quando".

### Abertura do 034

Criado o [034](034-redigir-o-manual-do-agente.md) (`wayfinder:task`) para a redação, com
`blocked-by: [011, 014, 036, 037]` no frontmatter e a **decisão de estratégia de rollout**
como bloqueio em prosa (não há ticket de rollout — é névoa do mapa). Racional dos bloqueios:

- **011** — o que o agente pode afirmar sobre produto/disponibilidade; o manual mostra isso
  à consultora como promessa da loja.
- **014** — o manual ilustra como o agente soa; precisa dos exemplos reais.
- **036** — a Parte B descreve o freio de mão como feature acionável pela consultora; a
  feature precisa existir.
- **037** — a Parte B ensina a operar a plataforma das consultoras e é ilustrada com prints
  dela; o manual não descreve interface que ainda não existe.
- **Rollout** — define o canal de aviso de erro, o momento de entrega de cada parte, e o
  piloto que dispara a checagem de manutenção.

(O ticket 013, que o enunciado original listava como bloqueio, saiu: fechou em 2026-09-02 e
já define que marcar desfecho + veredito é responsabilidade da consultora.)
