---
id: "007"
title: O Maino tem API? O que dá para ler de lá
labels: [wayfinder:research]
status: open
assignee:
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
