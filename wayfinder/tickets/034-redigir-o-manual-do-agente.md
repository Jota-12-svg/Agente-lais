---
id: "034"
title: Redigir o manual do agente para as consultoras
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["011", "014", "036", "037"]
---

## Question

Escrever o **manual do agente** para as consultoras e a dona da loja. A **forma** já está
decidida pelo grilling do [033](033-manual-do-agente-para-as-consultoras.md) — este ticket é
a redação, e só. Não reabrir as decisões de forma; se algo nelas não couber quando a redação
começar, é um addendum no 033, não uma escolha nova aqui.

### O que a forma já fixou (resumo — a fonte é a `## Resolução` do 033)

- **Público:** 3 consultoras que atendem + a dona (primário); 4ª pessoa recebe cópia.
  Registro de **referência curta e consultável**.
- **Um documento, duas partes:** Parte A "O que o agente faz" (estável); Parte B "No dia a
  dia" (data no cabeçalho, muda com o rollout).
- **Meio:** fonte markdown no repositório → entregue como **Google Doc**. Parte A em 1–2
  páginas, Parte B em ~1 página + prints.
- **Tom:** concreto, segunda pessoa, zero jargão, curto, com prints reais do agente (do
  014). Descreve o agente, não redesenha o trabalho de quem lê.
- **Estrutura:** ver item 7 da resolução do 033 (as duas partes, seção a seção).
- **O que se pede às consultoras:** quatro pedidos (assumir da fila; marcar desfecho +
  veredito; avisar erro; responder pelo WhatsApp de sempre) + a seção do **freio de mão**.
- **Dono do manual:** João Victor. Rodapé com "dono · revisar quando". Gatilhos de revisão:
  mudança de fase, mudança na Parte B, checagem no fim do piloto.
- **Entrega:** Parte A antes do piloto + demo ao vivo; Parte B no arranque do piloto.

### Por que está bloqueado

- **[011](011-o-que-o-agente-pode-dizer-sobre-produto.md)** — o manual mostra à consultora,
  como promessa da loja, o que o agente pode e não pode afirmar sobre produto e
  disponibilidade. Sem o 011 fechado, essa parte seria invenção.
- **[014](014-como-o-agente-soa.md)** — a Parte A ilustra como o agente soa com **prints de
  conversa real**, não texto inventado. Precisa do protótipo de tom pronto.
- **[036](036-freio-de-mao-global.md)** — a Parte B descreve o freio de mão (kill switch)
  como feature que a consultora aciona. A feature precisa existir e ter um controle
  acionável por quem não abre terminal.
- **[037](037-construir-plataforma-consultoras-v1.md)** — a Parte B ensina a operar a
  plataforma das consultoras (assumir, fechar, marcar veredito) e é ilustrada com prints
  dela. O manual não descreve uma interface que ainda não existe e pode mudar no build.
- **Estratégia de rollout** (névoa do mapa, sem ticket) — define o canal pelo qual a
  consultora avisa que o agente errou, o momento de entrega de cada parte, e o piloto que
  dispara a checagem de manutenção.

### Entradas úteis, não bloqueantes

- `## Resolução` do [033](033-manual-do-agente-para-as-consultoras.md) — a forma inteira.
- [012](012-quando-e-como-o-agente-escala.md) (fechado) — gatilhos de escalada,
  transparência com nome próprio, o que vai no chamado.
- [010](010-o-que-e-um-lead-qualificado.md) (fechado) — o que o agente coleta.
- [035](035-plataforma-central-das-consultoras.md) (fechado) — a plataforma onde a
  consultora assume, fecha e registra o veredito; e o e-mail de aviso de chamado.
- [013](013-sinal-de-sucesso-do-aprendizado.md) (fechado) — por que o `advisor_verdict`
  importa, para explicar isso à consultora sem soar como cobrança.
- Respostas das consultoras no [020](020-perguntas-para-as-consultoras.md) — como elas
  atendem, o vocabulário delas.

**Resolvido quando** o manual (Parte A + Parte B) estiver escrito em markdown no
repositório, revisado pelo dono, publicado como Google Doc, e o link registrado aqui.
