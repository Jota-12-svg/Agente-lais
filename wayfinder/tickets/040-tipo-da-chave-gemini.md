---
id: "040"
title: Confirmar se a GEMINI_API_KEY é do tipo "auth" antes do prazo de setembro/2026
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

## Question

Achado do ticket [015](015-rotacao-das-credenciais.md): a documentação oficial do Gemini API
(`ai.google.dev/gemini-api/docs/api-key`) registra que a partir de **setembro de 2026 — agora
— a API passa a rejeitar chaves do tipo "Standard"**, aceitando só chaves "auth" (vinculadas a
uma service account, com identificação do chamador). Chaves criadas na AI Studio hoje já
nascem como "auth" por padrão — mas a `GEMINI_API_KEY` atual foi criada manualmente pelo dono
antes dessa mudança de default, e ninguém confirmou no painel qual dos dois tipos ela é.

Se for "Standard", o acesso ao LLM para de funcionar sem aviso prévio — quebra o que os
tickets 017 e 018 já validaram (tier pago, `serviceTier: standard`, contrato de function
calling).

**O que fazer:** o dono confirma no painel da AI Studio (`aistudio.google.com/apikey`) o tipo
da chave atual.

- Se já for **"auth"**: nada a fazer, ticket fecha registrando a confirmação.
- Se for **"Standard"**: criar uma chave nova (nasce "auth" automaticamente), testar
  `serviceTier` de novo (mesmo teste do 017/018) e trocar no `.env`.

**Resolvido quando** o tipo da chave estiver confirmado e, se preciso, a chave nova estiver
testada e no lugar da antiga.
