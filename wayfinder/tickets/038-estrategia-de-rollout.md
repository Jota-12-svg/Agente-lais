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

---

## Decisões do grilling (2026-09-02)

Grilling com o dono, 3 rodadas (11 perguntas). A **forma** da estratégia está fechada. O
ticket **fica `in-progress`** — não `closed` — porque partes dela ainda dependem de trabalho
que não existe (ver "Pendências para fechar" no fim). Enquanto o 038 não fechar, "estratégia
de rollout" **continua** como bloqueio em prosa do [034](034-redigir-o-manual-do-agente.md).

### Forma do piloto

- **Agente 24/7 desde o dia 1.** Sem janela de horário comercial restrita — a ideia de
  restringir horário nas primeiras semanas foi **rejeitada pelo dono**. O
  [009](009-como-funciona-o-atendimento-hoje.md) (24/7) vale desde o arranque.
- **As três consultoras desde o dia 1**, com **rodízio normal**. **Sem "madrinha do
  piloto"** — a ideia de concentrar as primeiras semanas numa consultora que lê todas as
  conversas foi **rejeitada pelo dono**. Isso **reverte** o "piloto com uma consultora" que
  o mapa registrava na névoa: não há fase com uma consultora só, nem faseamento
  semana-1-2 / semana-3-4.
- **Comportamento pleno da fase 1 desde o dia 1** — não há versão estreitada do agente para
  as primeiras semanas. A fase 1 já é o comportamento mais conservador que vai existir (só
  qualifica, escala na dúvida, não afirma nada); estreitar mais testaria um agente que não é
  o que vai rodar. Única válvula é a sensibilidade de escalada, que o
  [012](012-quando-e-como-o-agente-escala.md) já deixou pendendo para "escalar demais".
- **Duração: 4 semanas.** Ao fim, **checagem obrigatória** com as três consultoras, que
  decide uma de três: (a) tira o rótulo "piloto" — o agente vira operação normal; (b) mais
  2–4 semanas de observação próxima com ajustes; (c) rollback. Decisão do dono.
- **"Operação plena" não muda o fluxo** (já é 24/7 + as três desde o dia 1) — muda só a
  cadência da revisão: de frequente para por-evento (fase 2, mudança no que se pede às
  consultoras). Essa checagem de 4 semanas **é** o gatilho de manutenção obrigatória do
  manual (item 9 do [033](033-manual-do-agente-para-as-consultoras.md)).

### Gate de entrada

Checklist — o 038 fixa a lista, **não** agenda data. Nenhum cliente real fala com o agente
antes de:

1. **[037](037-construir-plataforma-consultoras-v1.md)** no ar, com Supabase real — a
   consultora vê / assume / fecha chamado.
2. **[036](036-freio-de-mao-global.md)** no ar e **testado** — a consultora consegue parar o
   agente de fato.
3. **[027](027-testar-self-hosted-no-numero-atual.md)** validado — a conexão self-hosted no
   número de produção não bana.
4. **[011](011-o-que-o-agente-pode-dizer-sobre-produto.md)** fechado — o agente sabe o que
   pode e não pode afirmar sobre produto/disponibilidade.
5. **[014](014-como-o-agente-soa.md)** pronto — tom validado, prints existem.
6. **[031](031-implementar-escrita-do-chamado-na-fila.md)** feito — o agente grava o chamado
   no Supabase.
7. Runtime hospedado num lugar estável (névoa do mapa — stack de runtime).
8. Lógica de qualificação de fato construída (o [010](010-o-que-e-um-lead-qualificado.md)
   decidiu os campos; a extração ainda não existe).
9. **Parte A do manual entregue + demonstração ao vivo** feita com as três consultoras + a
   dona, na semana anterior ao arranque.

### Fallback — três modos de falha, tratados diferente

- **Agente caiu (processo morto):** um *watchdog* externo avisa **o dono** (nunca uma
  consultora) por um canal com push — SMS ou Telegram. Mensagens que chegam ficam sem
  resposta até religar; de madrugada o buraco é igual a hoje (ninguém responde mesmo), de dia
  alguém percebe rápido. **Sem** auto-resposta "estou fora" (cria expectativa e polui a
  conversa).
- **Agente no ar mas errou:** cai no canal de aviso de erro (ver abaixo). Não é urgente por
  incidente isolado — o dono revisa e ajusta a regra/prompt. Só vira urgente se escalar para
  o caso abaixo.
- **Agente alucinando em série:** **freio de mão** ([036](036-freio-de-mao-global.md)).
  Qualquer consultora que perceber **puxa na hora** — não espera o dono. Avisa depois pelo
  canal de erro. Religar é do lado do projeto (o dono), depois de checar.

### Canal de aviso de erro

- Um item **"reportar problema"** na **plataforma das consultoras**
  ([037](037-construir-plataforma-consultoras-v1.md)) — **standalone**, não amarrado a um
  chamado (o erro pode acontecer antes de o agente escalar). Campo de texto livre + qual
  conversa (telefone/nome) + enviar.
- Notifica o dono pelo **mesmo mecanismo do chamado** (Database Webhook no `INSERT` → Edge
  Function → e-mail). **No piloto, somar SMS** — é o "algo está errado agora".
- O **aviso do freio de mão** cai no mesmo lugar: registro na plataforma + e-mail/SMS para o
  dono. **Sem grupo de WhatsApp** (decisão do dono — um grupo de WhatsApp foi a proposta
  inicial, rejeitada em favor da plataforma). Isso ajusta a redação do
  [033](033-manual-do-agente-para-as-consultoras.md) (seção do freio de mão fala em "aviso
  para a dona / o grupo" — o veículo é a plataforma + e-mail/SMS, não um grupo).
- **Amplia o escopo do [037](037-construir-plataforma-consultoras-v1.md):** o "reportar
  problema" + a rota de notificação por SMS entram como requisito do build. Registrar no 037
  quando o 038 fechar.

### Critério de saída do piloto

Não é número de conversão — o [013](013-sinal-de-sucesso-do-aprendizado.md) fixou que
desfecho de negócio é **neutro** na fase 1. É julgamento sobre a **qualidade da
qualificação**, com três sinais, e a decisão é do dono ouvindo as três consultoras:

1. **Veredito das consultoras** (`advisor_verdict`) majoritariamente "me deixou pronta pra
   assumir" nas últimas 2 semanas do piloto.
2. **Nenhum episódio de credibilidade** aberto e não resolvido (o agente afirmou
   disponibilidade, inventou preço, prometeu uma pessoa em vez da loja).
3. As três consultoras, perguntadas direto, dizem que **preferem trabalhar com o agente do
   que sem**.

### Sequência de expansão

**Não se aplica.** Com as três consultoras desde o dia 1 e 24/7 desde o dia 1, não há
expansão de consultora para consultora nem de horário. A única expansão restante é fase 1 →
fase 2, que está **fora de escopo** deste mapa (volta como mapa novo).

### Rollback

- **Mecanismo:** o freio de mão ([036](036-freio-de-mao-global.md)) desliga o agente. A
  partir daí, todo contato novo volta a cair direto para as consultoras, como antes do agente
  — o WhatsApp Business delas **nunca saiu do ar** (coexistência de dispositivo, decisão do
  [016](016-escolher-parceiro-meta.md)). Não há infra a desmontar.
- **Conversas em andamento** no momento do desligamento: o que o agente estava qualificando
  vira **chamado imediato** na fila com o que já foi coletado, para uma consultora assumir.
  Ninguém fica pendurado.
- **Quem decide abortar o piloto:** o dono, não a consultora. A consultora aciona o freio de
  mão numa emergência pontual; "encerrar o piloto" é decisão de projeto.
- **Critério para abortar:** julgamento, não número — se as consultoras gastam mais tempo
  consertando o que o agente fez do que economizando, ou se um episódio queimou um cliente de
  verdade.

### Entrega do manual (as três saídas que o 034 esperava desta estratégia)

1. **Canal de aviso de erro** → o item "reportar problema" na plataforma das consultoras
   (ver acima).
2. **Momento de entrega de cada parte:**
   - **Parte A + demonstração ao vivo:** na **semana anterior ao arranque** (agente montado
     num número de teste para a demo), com as três consultoras + a dona presentes.
   - **Parte B:** no **dia do arranque**, com a plataforma real na tela.
   - Se a plataforma já estiver estável na semana -1, as duas partes podem ser entregues na
     mesma sessão, com a Parte B só revisada no dia 0 se algo na tela mudou.
3. **Gatilho da checagem de manutenção do manual** → a **checagem obrigatória de 4 semanas**
   no fim do piloto.

### Pendências para fechar o 038

O grilling decidiu a forma. O ticket fecha quando estas pontas — que dependem de trabalho
ainda inexistente — estiverem amarradas:

- **Watchdog + canal de push (SMS/Telegram) para o dono** — mecanismo concreto depende da
  **stack de runtime** (névoa do mapa): onde o agente roda decide como um watchdog observa e
  dispara.
- **Incremento "reportar problema" + rota de SMS no [037](037-construir-plataforma-consultoras-v1.md)**
  — vira requisito formal do build quando o 037 for puxado; hoje o 037 espera o runtime.
- **Confirmação do gate** — os itens 3 (027), 4 (011) e 5 (014) do gate ainda estão abertos;
  quando fecharem, revisar se o gate mudou de forma.
- **Ajuste na seção do freio de mão do [033](033-manual-do-agente-para-as-consultoras.md)/[034](034-redigir-o-manual-do-agente.md)**
  — o veículo do aviso é plataforma + e-mail/SMS, não "o grupo". Aplicar na redação do 034.

Quando fechar: escrever a `## Resolução`, `status: closed`, tirar "estratégia de rollout" do
bloqueio em prosa do 034, adicionar linha em `Decisions so far` no mapa, formalizar os
incrementos no 036 e no 037.
