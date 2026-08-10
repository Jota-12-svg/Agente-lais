---
id: "008"
title: Contrato real da API do Gemini via kie.ai
labels: [wayfinder:research]
status: closed
assignee: Claude
blocked-by: []
---

## Question

O `.env` traz credenciais da **kie.ai** como caminho de acesso ao Gemini, e é isso que o
projeto tem em mãos. Tudo o mais que estava escrito nos comentários daquele arquivo sobre
como a API se comporta pertence ao projeto anterior e **foi descartado** — precisa ser
verificado do zero, não copiado.

O research deve levantar, contra a documentação oficial da kie.ai e da Google:

1. **Endpoints e formato.** Que superfície a kie.ai expõe, se é a nativa do Gemini
   (`contents`/`parts`), se há streaming e não-streaming, e como se autentica.
2. **Multimodal.** Como enviar áudio e imagem: base64 inline ou upload, formatos aceitos,
   limite de tamanho e de duração. O cliente vai mandar áudio no WhatsApp e foto de
   produto — isso precisa funcionar.
3. **Modelos disponíveis** e a diferença prática entre eles para esta tarefa; parâmetros de
   raciocínio, se existirem.
4. **Custo por token** (entrada, saída, áudio, imagem) e o custo estimado de um atendimento
   típico.
5. **Limites de taxa** e comportamento sob erro — o que acontece quando estoura, se há
   retry, quanto tempo uma resposta demora.
6. **Chamada de ferramenta / function calling.** Existe? O agente vai precisar consultar
   agenda e catálogo no meio da conversa; se a superfície da kie.ai não suportar isso, é um
   problema estrutural.
7. **Confiabilidade da kie.ai como intermediário.** Ela é um revendedor, não a Google.
   Levantar o que se sabe sobre estabilidade e o que custaria falar direto com a API do
   Gemini.

**Resolvido quando** o contrato estiver documentado com exemplo de chamada verificado, e
estiver claro se a kie.ai atende o que o agente precisa ou se convém ir direto à Google.

## Resolução

Investigação completa em [`research/008-gemini-kie-ai.md`](../research/008-gemini-kie-ai.md).

**O medo estrutural do ticket não se confirmou: function calling existe na kie.ai**, nas duas
superfícies que ela expõe (nativa do Gemini e compatível com OpenAI). O agente pode declarar
`consultar_agenda` e `buscar_produto`.

**Mas a recomendação é ir direto à Gemini API da Google (AI Studio, tier pago)**, e os
motivos decisivos não são preço:

1. **LGPD.** O tier pago da Google declara por escrito que **não** usa os dados para treinar;
   o free tier declara que **usa**. A kie.ai retém logs com parâmetros de entrada por 2 meses
   e não publica DPA, jurisdição nem política de subprocessadores. Passar conversa real de
   cliente por um intermediário não contratado é exposição jurídica, não economia.
2. **Cache de contexto.** A kie.ai declara `cachedTokens: false` em todos os modelos. O
   agente reenvia prompt de sistema + tom + catálogo a cada turno — exatamente o prefixo
   estável que o cache existe para atender. Na Google isso custa 10× menos ($0,05 vs
   $0,50/1M), o que anula o desconto de 70% da kie.ai.
3. **Contrato incompleto.** A kie.ai não expõe `systemInstruction`, `maxOutputTokens`,
   `safetySettings`, `tool_choice` nem Files API. Sem `tool_choice` não dá para **forçar** a
   consulta de agenda — só torcer para o automático acertar.
4. **A própria kie.ai declara** que sua estabilidade é menor que a dos provedores oficiais,
   "uma escolha consciente". Sem SLA, sem status page, suporte com janela diária descoberta.

**Custo não decide este ticket.** A diferença é de ~R$ 90/mês em 500 atendimentos, numa loja
de ticket R$ 2.000–50.000.

**Achados operacionais que valem para qualquer provedor:**

- **Modelo: `gemini-3-flash`.** Fase 1 é qualificação, não raciocínio pesado — um Pro seria
  pagar 3–4× por capacidade não usada. `gemini-3.1-pro` está descartado de todo modo: a
  kie.ai o marca como **sem** function calling.
- **Sempre mandar `reasoning_effort: "low"` e `include_thoughts: false` explicitamente.** Os
  defaults são `high`/`true` — os caros e os lentos — e tokens de pensamento são cobrados
  como saída.
- **Risco no áudio:** a nota de voz do WhatsApp é OGG/**Opus**, e a Google lista `audio/ogg`
  como "OGG **Vorbis**". Pode exigir transcodificação com ffmpeg no runtime — o que muda a
  arquitetura de hospedagem. É teste empírico, não questão de doc.
- **Na kie.ai, saída estruturada e function calling são mutuamente exclusivos.** A
  qualificação quer extrair JSON *e* consultar agenda; pela kie.ai isso não cabe numa
  chamada. Na Google, cabe.
- **Escrever o código atrás de uma interface fina de LLM desde a primeira linha.** As duas
  falam `contents`/`parts`, então trocar de provedor é trocar base URL, header e nome do
  modelo. Uma decisão reversível não precisa ser perfeita agora.

**Abre dois tickets:**
[Decidir o provedor de LLM e habilitar o billing](017-provedor-de-llm-e-billing.md) e
[Validar empiricamente o contrato do LLM](018-validar-contrato-do-llm.md).
