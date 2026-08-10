---
id: "007"
title: O Maino tem API? O que dá para ler de lá
labels: [wayfinder:research]
status: closed
assignee: Claude
blocked-by: []
---

## Question

O **Maino** é o sistema onde a Lais Casa faz cotação e emite nota fiscal. Ele é o candidato
mais provável a ser a única fonte estruturada de **produtos e preços** da loja — e, pelas
notas emitidas, a única fonte objetiva de **venda concretizada**, que é o sinal de sucesso
mais forte que o aprendizado pode ter.

O research deve levantar, contra a documentação oficial do Maino:

1. **Existe API pública?** Autenticação, formato, se exige plano específico.
2. **Catálogo de produtos.** Dá para listar produtos com descrição, preço, código? Há
   imagem, dimensão, material — o tipo de informação que um cliente de decoração pergunta?
3. **Cotações.** Dá para ler cotações emitidas e saber quais viraram venda? Dá para
   *criar* cotação por API — o que importaria para a fase 2 do agente, mas cuja resposta
   convém saber agora.
4. **Notas fiscais.** Dá para consultar notas emitidas, com valor, data e cliente? É isso
   que fecharia o laço "esta conversa virou esta venda".
5. **Webhooks.** O Maino avisa quando uma nota é emitida, ou só dá para consultar por
   polling?
6. Se **não houver API**: que caminhos restam — exportação manual periódica, relatório em
   planilha, ou nenhum.

**Resolvido quando** estiver claro o que o Maino entrega e o que não entrega. A resposta
determina se o catálogo do agente vem de lá ou precisa ser montado à mão, e se a venda pode
ser detectada automaticamente ou dependerá de a consultora informar.

## Resolução

Investigação completa em [`research/007-maino-api.md`](../research/007-maino-api.md).

**O Mainô tem API REST documentada** — `https://api.maino.com.br/api/v2`, OAuth2 com token
JWT, chave solicitada dentro do próprio sistema.

**As duas respostas que o ticket buscava, ambas positivas:**

- **O catálogo vem do Mainô.** `GET /produtos` devolve muito mais que o mínimo fiscal:
  preço de venda, dimensões, peso, **imagens**, título e descrição de e-commerce, marca,
  modelo, categoria. É material suficiente para o agente conversar sobre produto sem
  cadastro paralelo — e cadastro paralelo seria pior, porque criaria duas verdades sobre
  preço.
- **A venda é detectável automaticamente.** `GET /notas_fiscais_emitidas` lista as notas com
  valor, data de emissão, destinatário e chave de acesso, filtrável por intervalo de data.
  Fecha o laço "esta conversa virou esta venda" sem depender de alguém marcar nada.

**Três ressalvas que precisam viajar para as decisões seguintes:**

1. **A API tem campos de estoque (`qtde` e afins) e eles não valem nada aqui.** A loja não
   faz controle de estoque; o número vai estar desatualizado ou zerado, e um campo que
   *parece* confiável é pior que campo ausente. A regra do mapa não muda: **o agente não
   afirma disponibilidade**, e isso tem de estar explícito no código e no prompt.
2. **Não há webhook passivo de emissão de nota.** O callback documentado só existe para quem
   emite pela API, e quem emite é a consultora pela interface. A detecção de venda será por
   **polling** — suficiente, já que latência de minutos não afeta aprendizado.
3. **O filtro de destinatário é por CNPJ.** Serve para arquiteto com empresa; para
   consumidor final (CPF) a conciliação pode ficar frágil. É o ponto mais incerto e só se
   resolve com dado real.

**Próximo passo concreto**, que cai no ticket
[Obter acesso à planilha de clientes e ao catálogo de produtos](004-acesso-a-planilha-e-ao-catalogo.md):
pedir a chave de API e chamar `GET /produtos` de verdade. O caminho técnico está resolvido —
o que falta é saber se o cadastro da Lais Casa **está preenchido**. Catálogo rico na API e
vazio na prática não serve para nada.
