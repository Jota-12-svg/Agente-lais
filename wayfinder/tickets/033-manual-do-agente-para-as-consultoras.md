---
id: "033"
title: Manual do agente para as consultoras — que forma toma e o que cobre
labels: [wayfinder:grilling]
status: in-progress
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
