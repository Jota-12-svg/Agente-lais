---
id: "030"
title: Escolher o modelo Gemini certo para a solução (áudio, imagem, texto, reasoning, custo)
labels: [wayfinder:research]
status: open
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
