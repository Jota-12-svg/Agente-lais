---
id: "005"
title: Como levar o agente ao WhatsApp sem tirar o Business das consultoras
labels: [wayfinder:research]
status: open
assignee:
blocked-by: []
---

## Question

A Lais Casa usa o **app do WhatsApp Business**, presente no celular de todas as
consultoras. O agente precisa entrar nesse canal — e é aí que está o conflito: **um número
não pode estar simultaneamente no app do WhatsApp Business e na Cloud API da Meta**.
Migrar o número para a API tira o app das mãos das consultoras, junto com o histórico e as
ferramentas que elas usam todo dia. Isso não é aceitável sem uma resposta clara.

O research deve levantar, contra fontes primárias:

1. **O que exatamente se perde** ao migrar um número do app Business para a Cloud API:
   histórico de conversas, etiquetas, catálogo, respostas rápidas, uso simultâneo por
   várias pessoas. O que a Meta oferece no lugar (Business Manager, apps de terceiros).
2. **Uso multi-usuário.** Como várias consultoras atendem no mesmo número hoje (WhatsApp
   Business vinculado a até N dispositivos) e como isso funcionaria via API.
3. **A janela de 24 horas e os templates** da Cloud API: o que o agente pode ou não enviar
   fora dela, custo por conversa em BRL, e como isso afeta um agente que reengaja cliente.
4. **Áudio e imagem.** O cliente manda áudio e foto de produto. Verificar o que cada
   caminho entrega: como a mídia chega, formato, se precisa download autenticado, limites
   de tamanho.
5. **Provedores não-oficiais** (Evolution API, Z-API, Baileys e similares): o que
   entregam, o custo, e o risco real de bloqueio do número — que num negócio onde o
   WhatsApp *é* o canal de vendas significa perder a operação inteira.
6. **Número paralelo.** A alternativa de o agente atender num número novo, deixando o
   número atual intocado nas mãos das consultoras. Quais as implicações práticas: como o
   cliente chega nesse número, e como a conversa passa de um para o outro num handoff.

**Resolvido quando** houver um comparativo dos caminhos com custo, risco e o que cada um
custa às consultoras no dia a dia — e uma recomendação. A escolha final é do usuário.
