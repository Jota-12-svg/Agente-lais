---
id: "035"
title: Plataforma central das consultoras — substrato da fila e desfecho
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: []
---

> **Numeração:** nasceu como "033" numa sessão paralela (2026-09-02, madrugada) que não viu
> outra sessão abrir o [033](033-manual-do-agente-para-as-consultoras.md) (manual do agente)
> quase ao mesmo tempo. Renumerado para **035** ao reconciliar — 034 já está reservado pelo
> 033 para a redação do manual. O conteúdo é o mesmo desde a criação.

## Question

**Decisão do dono do projeto (2026-09-02):** a fila de chamados **não fica mais numa aba da
planilha compartilhada**. No lugar, uma **plataforma própria, simples**, onde tudo que a
consultora precisa para pegar um chamado do agente fica centralizado e fácil de acessar. O
pedido é explícito: **simples o bastante para não consumir o projeto, funcional o bastante
para valer a pena**.

Isso reabre o substrato — não o comportamento — de decisões já fechadas (ver "Impacto em
outros tickets" abaixo).

### O que esta decisão já fixa

- **A fila sai da planilha.** Passa a viver numa tabela do **Supabase** (já no stack:
  Postgres + Auth + Realtime, plano free), exposta por uma tela web pequena.
- **Escopo do v1 (resposta do dono):** **fila de chamados + marcação de desfecho**. A tela
  lista os chamados pendentes, a consultora **assume** e **fecha** um chamado, e registra o
  **desfecho** (venda / visita agendada / sem sucesso — taxonomia a fechar, ver ponto 5).
  Espelhar a conversa dentro da plataforma **fica fora do v1**.
- **O comportamento do [012](012-quando-e-como-o-agente-escala.md) continua intacto:** o
  agente **produz fila, não roteia**; o chamado entra com o nome da dona anexado quando
  houver, **sem trava** — qualquer consultora pega; o aviso à consultora **não pode ser
  WhatsApp ativo** (restrição dura, 016/026).
- **O relance continua sendo o relance do [010](010-o-que-e-um-lead-qualificado.md)**
  (telefone, nome, o que quer, para quando, orçamento, novo/cliente, horário, gatilho),
  nunca a conversa inteira — essa fica no WhatsApp.

### O que este ticket decide (grilling com o dono)

1. **Canal de aviso.** O que tira a consultora do "não sei que a fila mudou" sem ela ficar
   com a tela aberta o tempo todo: **bot de Telegram**, **e-mail**, **web push (PWA)**, ou
   outro. Na prática **reabre a pergunta do research [029](029-canal-de-notificacao-da-fila.md)**
   num contexto novo (a fila não está mais na planilha, então Apps Script varrendo planilha
   não se aplica). A restrição de 029 continua: nada de mensagem ativa no WhatsApp de
   produção. Pergunta a levar junto (herdada do 029 e do [020](020-perguntas-para-as-consultoras.md)):
   **o celular de cada consultora avisa quando chega e-mail/mensagem no expediente?** — não
   só "elas checam".
2. **Login das consultoras.** **Magic link por e-mail** (Supabase Auth), **login com
   Google** (elas já têm `@gmail`), ou **senha compartilhada**. Trade-off central: LGPD e
   saber quem assumiu o quê (usuário identificado) × montar rápido (senha única).
3. **Stack e hospedagem.** Recomendação a confirmar: Supabase (backend + auth + realtime) +
   uma SPA pequena hospedada em tier free (Vercel/Netlify/Cloudflare Pages). Decidir
   framework e onde hospeda, mantendo "simples" como critério.
4. **Esquema da tabela de chamados.** Campos do relance do 010 + `status`
   (`pendente` / `assumido` / `fechado`) + `assumido_por` + `desfecho` + timestamps.
   Fechar a lista exata e os nomes (inglês, conforme `CLAUDE.md`).
5. **Taxonomia de desfecho do v1 e como ela conversa com o [013](013-sinal-de-sucesso-do-aprendizado.md).**
   O 013 decide **quais são os sinais** e o que se aprende com o fracasso; este ticket decide
   **onde a consultora clica** (a captura "com atrito quase zero" que o 013 pede no enunciado).
   Se o 013 ainda estiver aberto, o v1 usa um conjunto provisório e o 013 tem a palavra final
   — mesmo arranjo que 012↔013 para "contato perdido". **Não fixar aqui um sinal de sucesso
   que é decisão do 013.**
6. **Substituição × coexistência.** A plataforma substitui a aba da fila por completo desde o
   dia 1, ou há um período em que as duas convivem? (A fila nunca existiu na planilha ainda —
   ver nota do 004 —, então provavelmente é substituição limpa, mas confirmar.)
7. **O que a consultora faz na tela.** Assumir, fechar, marcar desfecho, ver os dados do
   chamado — e **precisa poder corrigir** um dado que o agente extraiu errado antes de
   assumir? Definir o mínimo.

### Impacto em outros tickets

- **[029](029-canal-de-notificacao-da-fila.md)** (fechado, research) — o **enunciado**
  (canal de aviso sem WhatsApp ativo) continua válido e é retomado aqui; a **conclusão**
  (e-mail via Apps Script varrendo a planilha) **cai** com a fila saindo da planilha. Ao
  fechar o 035, anotar isso na linha do 029 no `map.md`, como se fez com o 005↔016.
- **[030](030-implementar-notificacao-da-fila.md)** (aberto, task) — **obsoleto na forma
  atual** (Apps Script vinculado ao Google Sheet). Vira `blocked-by: ["035"]`; ao fechar o
  035, ou é reescrito para o canal escolhido ou é fechado como substituído.
- **[031](031-implementar-escrita-do-chamado-na-fila.md)** (aberto, task) — **continua
  válido em intenção** (o agente escreve o chamado quando escala), mas o alvo muda de
  **Sheets API v4** para **Supabase**, o que elimina a conta de serviço + delegação de
  domínio e simplifica bastante. Vira `blocked-by: ["035"]` (esquema e stack) e segue
  dependendo da arquitetura do runtime para o ponto de integração no código.
- **[033](033-manual-do-agente-para-as-consultoras.md)** (aberto, grilling) — o item 3/4 do
  manual descreve "o que aparece na aba de chamados e como a consultora responde". Quando
  este ticket fechar, esse trecho passa a descrever a plataforma, não a planilha. Não
  bloqueia o grilling do 033, mas a redação (034) deve esperar as duas decisões.

### Relação com a névoa do mapa

Cobre a **primeira fatia** da névoa **"Superfície para as consultoras"**: ver a fila,
assumir um chamado, marcar o desfecho. Ver e **corrigir a conversa** do agente dentro da
plataforma, e o fluxo de "assumir uma conversa em andamento", ficam para depois do v1.

**Resolvido quando** estiverem decididos: canal de aviso, login, stack/hospedagem, esquema
da tabela e taxonomia de desfecho do v1 — e estiver registrado o que fazer com 029/030/031.
A construção da plataforma em si é o passo seguinte (deste ticket ou de um que ele abrir).
