---
id: "005"
title: Como levar o agente ao WhatsApp sem tirar o Business das consultoras
labels: [wayfinder:research]
status: closed
assignee: Claude
blocked-by: []
---

## Question

A Lais Aliski Casa usa o **app do WhatsApp Business**, presente no celular de todas as
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

## Resolução

Investigação completa em [`research/005-integracao-whatsapp.md`](../research/005-integracao-whatsapp.md).

**A premissa deste ticket estava errada.** A exclusividade entre o app do WhatsApp Business e
a Cloud API vale só para a migração direta. A Meta oferece **Coexistence**: o mesmo número
fica nos dois lados ao mesmo tempo, com as mensagens espelhadas, o histórico dos últimos 6
meses e os contatos preservados. As consultoras não perdem o app.

**Recomendação: Coexistence via parceiro oficial.** As razões:

- É o único caminho que respeita a restrição do mapa de não mudar a ferramenta das
  consultoras.
- **O custo da fase 1 é essencialmente zero.** Desde julho de 2025 a cobrança é por mensagem,
  e mensagens fora de template são gratuitas dentro da janela de 24h aberta pelo cliente. O
  agente da fase 1 é reativo — vive inteiro dentro dessa janela. Mensagens enviadas pelo app
  pelas consultoras continuam grátis.
- Provedores não-oficiais (Evolution, Baileys) foram descartados: violam os termos da Meta e
  o banimento é do número. Num negócio onde o WhatsApp *é* o canal de vendas, o risco é a
  operação inteira contra uma economia irrisória.

**Restrições que Coexistence impõe e que precisam ser aceitas:**

- Exige onboarding por **Solution Partner ou Tech Provider** da Meta — não dá para fazer
  sozinho.
- App na versão 2.24.17+; até **4 dispositivos acompanhantes**, todos desvinculados durante o
  onboarding e reconectados depois por cada consultora.
- Mensagens temporárias, visualização única e localização ao vivo são desativadas; listas de
  transmissão viram somente leitura.

**Abre:** [Escolher o parceiro Meta para o onboarding do WhatsApp](016-escolher-parceiro-meta.md).

**Devolve para o ticket do atendimento atual** duas perguntas de fato: quantas consultoras
usam o número e como os aparelhos estão vinculados hoje (o limite de 4 acompanhantes pode já
estar apertado), e se o número é único e compartilhado ou um por consultora.

## Atualização — 2026-08-11

**A recomendação de Coexistence não é mais o caminho seguido.** O ticket
[016](016-escolher-parceiro-meta.md), ao pesquisar o parceiro para executar Coexistence,
achou o custo (~R$300/mês, o mais barato viável) inviável para o orçamento da loja, e a
investigação levou a uma releitura da rejeição de provedores não-oficiais feita acima. O
[research 026](../research/026-o-que-causa-banimento.md) encontrou, em código-fonte, um
mecanismo real que explica boa parte do risco de banimento (falha das bibliotecas em provar
ao protocolo que uma resposta é resposta, não contato frio) e um checklist que o reduz. A
decisão registrada no ticket 016 é rodar o agente self-hosted como dispositivo adicional no
número atual da loja — mantém o não-mudar-de-ferramenta que motivou Coexistence, sem o custo
do parceiro, aceitando um risco de banimento residual e mitigado no lugar do risco financeiro.
Esta entrada fica como registro histórico do raciocínio original; a decisão vigente está no
ticket 016.
