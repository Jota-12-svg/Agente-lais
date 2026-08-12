---
id: "030"
title: Escolher o modelo Gemini certo para a solução (áudio, imagem, texto, reasoning, custo)
labels: [wayfinder:research]
status: closed
assignee: Claude
blocked-by: []
---

## Question

O [ticket 017](017-provedor-de-llm-e-billing.md) fixou `gemini-3.6-flash` só porque
`gemini-3-flash-preview` (a escolha original do research 008) foi aposentado pela Google em
2026-07-15 — não foi uma comparação de verdade entre os modelos disponíveis **hoje**, e o
3.6 Flash custa 5-6× mais que o preview antigo (US$1,50/US$7,50 por 1M tokens de
entrada/saída, contra US$0,25/US$1,50).

Este ticket pede a comparação de verdade: qual modelo da família Gemini (via API direta da
Google, tier pago — provedor já decidido no 017, não é questão aqui) melhor atende a
solução, considerando:

1. **Multimodal de entrada obrigatório.** O agente recebe **áudio** (nota de voz do WhatsApp,
   OGG/Opus) e **imagem** (foto de produto, cliente de iPhone manda HEIC por padrão) e
   responde em **texto**. Um modelo que não aceite os três de forma confiável está fora,
   não importa o preço.
2. **Reasoning bom o suficiente para não alucinar.** Fase 1 é qualificação (extrair dados,
   decidir escalar) — não é raciocínio pesado tipo Pro, mas precisa ser coerente o bastante
   para não inventar disponibilidade de produto ou dado do cliente (restrição dura do
   projeto, ver `CLAUDE.md` seção 1).
3. **Custo por atendimento típico**, medido ou estimado com a mesma metodologia do research
   008 (500 atendimentos/mês como referência), para comparar modelos em pé de igualdade.
4. **Function calling e `thinkingLevel` controlável continuam obrigatórios** — restrições já
   estabelecidas nos tickets 008/017, não relitigar, só confirmar que o modelo escolhido
   também atende.

Candidatos mínimos a comparar (todos via API nativa da Google, não kie.ai — isso já foi
decidido no 017): `gemini-3.6-flash` (atual default), `gemini-3.5-flash` (antecessor,
ainda disponível?), variantes **Flash-Lite** se existirem para esta geração (custo menor,
mas confirmar se aceitam áudio/imagem), e `gemini-3-pro`/`gemini-3.1-pro` só como
referência de teto de custo — já era descartado no research 008 por preço e (no caso do
3.1) por não ter function calling na kie.ai; confirmar se o mesmo vale na API nativa.

**Fora de escopo:** reabrir a escolha de provedor (Google vs. kie.ai vs. outro) — isso já
foi decidido no ticket 017 e não é questão aqui.

**Resolvido quando** houver uma tabela comparativa (multimodal, reasoning/hallucination,
custo estimado, function calling, controle de thinking) com fonte para cada linha, e uma
recomendação clara de qual modelo pinar — mantendo `gemini-3.6-flash` ou trocando, com o
porquê.

## Resolução

Research completo em [030 — Qual modelo Gemini pinar](../research/030-modelo-gemini-ideal.md).

**Recomendação: trocar `gemini-3.6-flash` por `gemini-3.5-flash-lite`.** Não é o mesmo
modelo que está pinado hoje — ver nota abaixo.

Achados principais, contra `ai.google.dev`:

- `gemini-3-pro-preview` está completamente desativado (shutdown 2026-03-09); quem faz o
  papel de teto de referência hoje é `gemini-3.1-pro-preview`.
- **`gemini-3.1-pro-preview` TEM function calling na API nativa da Google** — a limitação
  que o research 008 achou (`functionCalling: false`) era do wrapper da kie.ai, não do
  modelo.
- Os dois candidatos Flash-Lite da geração atual (`gemini-3.5-flash-lite` e
  `gemini-3.1-flash-lite`) aceitam áudio, imagem (inclusive HEIC) e vídeo, têm function
  calling e thinking controlável — o medo do ticket de que Flash-Lite "corta multimodal"
  não se confirmou para esta geração.
- `gemini-3.5-flash-lite` tem `thinkingLevel` com `"low"`/`"high"` **confirmados** na
  tabela oficial de thinking; `gemini-3.1-flash-lite` não aparece nessa tabela (só a
  variante `-image` aparece), então fica de fora por essa lacuna de doc, apesar de ser
  ~25% mais barato.
- Custo estimado (500 atendimentos/mês, mesma metodologia do research 008): **~R$87/mês
  em `gemini-3.5-flash-lite`, contra ~R$353/mês recalculado para `gemini-3.6-flash`** —
  cerca de 75% mais barato, mantendo os quatro requisitos obrigatórios do ticket.
- Risco de formato de áudio (OGG/Opus do WhatsApp vs. "OGG Vorbis" documentado) continua
  sem confirmação — mas é igual para qualquer candidato, não é um fator de desempate.

**Não mexi em `.env.example` nem no ticket 017** — por instrução explícita deste ticket,
troca de modelo pinado fica para uma sessão de acompanhamento decidir se aplica.
