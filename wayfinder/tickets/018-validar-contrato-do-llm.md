---
id: "018"
title: Validar empiricamente o contrato do LLM
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["017"]
---

## Question

O [research do contrato do Gemini](008-contrato-da-api-do-gemini.md) levantou tudo o que a
documentação responde — e deixou uma fila de perguntas que **nenhuma documentação fecha**.
Elas precisam de chave e `curl`. Duas delas mudam a arquitetura do runtime, então precisam
ser respondidas **antes** de decidir stack e hospedagem, não depois.

Bloqueado por [Decidir o provedor de LLM e habilitar o billing](017-provedor-de-llm-e-billing.md)
porque os testes se fazem contra o provedor escolhido.

**Prioridade máxima — muda a arquitetura:**

1. **Ciclo completo de function calling.** Declarar a ferramenta → receber `functionCall` →
   devolver o resultado → receber a resposta final. Inclui descobrir a forma exata do turno de
   volta e o que fazer com o `thoughtSignature` que vem nos modelos Gemini 3 — a Google diz
   que os SDKs cuidam disso automaticamente, e falando HTTP cru **não há SDK para fazer isso
   por você**. Se o turno de volta não funcionar, function calling é meia-funcionalidade e o
   agente não consegue consultar agenda nem catálogo no meio da conversa.
2. **Áudio OGG/Opus do WhatsApp**, em base64 inline. Aceita direto? Precisa transcodificar
   para mp3/wav? Qual o tamanho e a duração máximos reais? **Se precisar de ffmpeg, isso muda
   o ambiente de hospedagem** — deixa de ser um runtime qualquer e passa a exigir binário
   nativo.

**Importantes, mas sem efeito estrutural:**

3. Prompt de sistema na superfície nativa — `systemInstruction` existe e funciona?
4. Custo real de um áudio e de uma imagem, medido, não estimado.
5. Streaming versus não-streaming: `stream: false` funciona? A resposta de chat é síncrona?
6. Latência medida (p50/p95, tempo até o primeiro token) do servidor onde o agente vai rodar.
7. HEIC passa? Cliente de iPhone manda foto em HEIC por padrão.

**Resolvido quando** os sete pontos tiverem resposta verificada com chamada real, e as duas
consequências arquiteturais (function calling utilizável, necessidade de transcodificação de
áudio) estiverem decididas. A resolução registra os comandos que funcionaram — eles viram a
base do cliente de LLM.
