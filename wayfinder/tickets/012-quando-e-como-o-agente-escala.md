---
id: "012"
title: Quando e como o agente escala para uma consultora
labels: [wayfinder:grilling]
status: closed
assignee: Claude
blocked-by: ["009"]
---

## Question

O escalonamento é o mecanismo de segurança de todo o projeto: enquanto o agente souber
reconhecer que está fora da sua alçada e passar a bola, o pior caso é ele ser inútil, não
prejudicial. Se ele **não** souber, o pior caso é perder um cliente de R$ 50 mil.

A decidir:

- **Os gatilhos.** O que faz o agente entregar a conversa? O usuário citou "informação mais
  pessoal ou entendimento mais personalizado" — isso precisa virar critério operável.
  Candidatos: pergunta sobre disponibilidade, negociação de preço, cliente irritado,
  planilha de arquiteto, cliente pedindo pessoa, agente sem confiança na própria resposta,
  conversa longa demais sem avanço.
- **Para qual consultora.** Se o cliente já é de alguém, vai para ela — e se ela estiver
  fora, ou se for cliente novo? Rodízio, disponibilidade na agenda, quem estiver online?
- **Como a consultora é avisada**, e o que ela recebe junto: a conversa inteira, um resumo,
  os campos já qualificados?
- **O que o cliente vê.** O agente anuncia a passagem ("vou chamar a Fulana") ou a troca é
  silenciosa? O cliente sabia que estava falando com um agente? — decisão de transparência
  que também tem lado jurídico.
- **O caminho de volta.** Depois que a consultora assume, o agente volta a atuar naquela
  conversa? Em que condição?
- **Quando ninguém atende.** A consultora não responde em X tempo — o que acontece com o
  cliente pendurado?
- **O freio de mão.** Existe um jeito de a consultora desligar o agente numa conversa, ou
  em todas, na hora?

**Resolvido quando** os gatilhos, o roteamento, o que a consultora recebe e o comportamento
de falha estiverem definidos.

---

## Respostas — ticket 020 (2026-08-11, resposta 1 de 4)

- **O que faz perceber que precisa assumir pessoalmente:** *"Quando ele está querendo uma
  produção ou comprar um produto."* Candidato a gatilho de escalada: intenção de compra
  concreta ("quero comprar") ou pedido de produção sob encomenda — não dúvida genérica.
- **O que gostaria de receber ao assumir uma conversa:** **"A conversa inteira"**, não um
  resumo nem só os dados extraídos. Simplifica o desenho do handoff — repassar o histórico
  bruto já atende, sem construir um resumidor separado.
- **Relacionado (pergunta 27, registrada em [009](009-como-funciona-o-atendimento-hoje.md)):**
  a resposta trouxe uma declaração de política, não só um número — *"quando for arquiteto
  prefiro que seja direcionado à consultora, e quando for cliente final, para a IA"*. Reforça,
  com peso de decisão de negócio, o gatilho de classificação que 009 já havia fixado.

**Falta:** a pergunta 31 (arquiteto comprando pra casa dele, e não pra um projeto) não foi
respondida nesta rodada — segue em aberto para confirmar se o modo é da conversa ou do
contato. E as outras três respostas podem trazer gatilhos diferentes de "assumir
pessoalmente".

---

## Resolução

Sessão de grilling em 2026-08-12. **A virada da sessão:** o roteamento não é trabalho do
agente. Ele não decide quem atende — ele produz um chamado e o joga numa fila; quem controla
o rodízio de verdade continua sendo as consultoras, do jeito que já fazem hoje.

### Gatilhos de escalada

| Gatilho | Comportamento |
|---|---|
| Intenção de compra concreta ("quero comprar", produção sob encomenda) | Escala automática — já fixado via ticket 020 |
| Planilha/anexo/lista longa de arquiteto | Escala automática, sem interpretar — já fixado no ticket 009 |
| Cliente pede pessoa explicitamente | Escala automática |
| Cliente demonstra irritação/insatisfação | Escala automática |
| Negociação de preço/desconto | Escala automática — a fase 1 não negocia (restrição dura) |
| Pergunta de disponibilidade | **Não escala sozinha.** O agente responde com a fórmula ("vou verificar e te retorno", achado do 020) e segue qualificando. Só escala se o cliente insistir depois disso. |
| Conversa longa sem avanço | Sinal, vira gatilho a partir de um número de trocas sem progresso — parâmetro de implementação, não decisão de política. |

### Roteamento — fila, não atribuição

- O agente **nunca atribui** um chamado a uma consultora específica. Ele lança o chamado numa
  **fila de chamados pendentes**, e quem pega é decisão humana — como já é hoje.
- Isso vale mesmo quando a própria primeira mensagem do contato já é o gatilho de escalada
  (ex.: planilha de arquiteto logo no "oi", sem qualificação nenhuma): o rodízio de contato
  novo é agnóstico ao motivo da escalada.
- Se o contato já tem dona (registrado na planilha), o chamado entra na fila **com o nome dela
  anexado** — mas não é reserva exclusiva. Fica marcado como pendente, e qualquer consultora
  pode pegá-lo, exatamente como elas já se cobrem informalmente hoje. O agente informa, nunca
  trava.
- **Consequência de arquitetura:** o agente precisa de **acesso de escrita** à planilha
  compartilhada, não só leitura — relevante para quando o ticket
  [004](004-acesso-a-planilha-e-ao-catalogo.md) for resolvido.

### Onde a fila vive

Uma **aba nova na planilha compartilhada**: nome do chamado, dados do cliente, e uma linha em
vermelho enquanto o chamado está pendente.

### Como a consultora é avisada

**Em aberto** — não pode ser WhatsApp ativo (risco de banimento, decisão do ticket 016/026).
Abriu o ticket de research [029](029-canal-de-notificacao-da-fila.md) para mapear as opções.
Candidato de menor custo a testar primeiro: a regra de notificação nativa do Google Sheets
(Ferramentas → Regras de notificação), que manda e-mail quando a planilha muda — zero
construção, só configuração, testável assim que o [004](004-acesso-a-planilha-e-ao-catalogo.md)
der acesso real.

### O que o cliente vê

O agente anuncia a passagem de forma **genérica, sem nome** ("só um instante, uma consultora já
te atende!") antes de ficar em silêncio. Quem se identifica pelo nome é a própria consultora,
ao assumir a conversa — o agente não precisa saber quem pegou o chamado da fila para isso
funcionar. Isso refina a leitura do ticket 009 ("o agente só nomeia a consultora depois que ela
assumiu"): na prática, o agente não chega a nomear ninguém — quem nomeia é a consultora.

### Quando ninguém responde

O agente fica em **silêncio** depois do único aviso. Sem reforço, sem reatribuição automática —
reatribuir sem sinal real de disponibilidade arriscaria duplicar atendimento (problema que o
009 já registrou existir hoje, sem solução).

### Caminho de volta

Definitivo dentro do atendimento: depois que uma consultora assume, o agente nunca mais fala
naquela conversa. Duas exceções de borda:

- **Janela de retomada curta:** se o cliente escrever de novo poucos dias depois, o agente
  responde só para reafirmar que a consultora já vai atendê-lo — não retoma a qualificação.
- **Reinício total:** passado tempo suficiente, é tratado como atendimento novo do zero.

**O número exato da janela fica para o ticket [013](013-sinal-de-sucesso-do-aprendizado.md)**,
que já decide o limiar equivalente sob o nome "contato perdido" (candidato atual: 2–3 dias,
resposta do ticket 020). Fixar um número diferente aqui duplicaria a decisão em dois lugares.

### Freio de mão

**Adiado para o ticket [027](027-testar-self-hosted-no-numero-atual.md).** O mecanismo cogitado
(a consultora digita um comando na própria conversa do WhatsApp, o agente reconhece e cala)
depende exatamente da mesma pergunta técnica que o item 3 do 027 já testa: se uma mensagem
mandada por um companion gera evento do lado do Baileys. Decidir aqui seria chutar algo que só
o teste real responde.

**Tickets abertos por este:** [029](029-canal-de-notificacao-da-fila.md) (canal de notificação).
**Dependência criada:** [013](013-sinal-de-sucesso-do-aprendizado.md) precisa decidir o limiar de
"contato perdido" também para a janela de retomada aqui descrita — mesmo conceito, dois usos.
