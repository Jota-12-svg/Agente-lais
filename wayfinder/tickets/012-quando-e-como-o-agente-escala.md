---
id: "012"
title: Quando e como o agente escala para uma consultora
labels: [wayfinder:grilling]
status: open
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
