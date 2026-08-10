---
id: "008"
title: Contrato real da API do Gemini via kie.ai
labels: [wayfinder:research]
status: open
assignee:
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
