---
id: "040"
title: Confirmar se a GEMINI_API_KEY é do tipo "auth" antes do prazo de setembro/2026
labels: [wayfinder:task]
status: closed
assignee: Claude
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

## Resolução

**Confirmado: a chave é do tipo "auth" (autorização).** Nada a trocar.

A página "Chaves de API" do AI Studio, nesta conta, não mostra a coluna "Tipo de chave" que a
documentação descreve — pode ser rollout gradual da própria Google. A confirmação veio pelo
caminho alternativo que a doc também aceita: o **console do Google Cloud** (`Credenciais` →
`APIs e serviços`, projeto `gen-lang-client-0815886762`). Lá, a chave "Agente Lais" aparece com
uma **"Bound account"** preenchida — `ais-gemini-key-7cd04e14c8af452@...iam.gserviceaccount.com`
— e é exatamente essa vinculação a uma conta de serviço que define uma chave "auth" (chaves
"Standard" não têm essa coluna preenchida). Restrição já é "Gemini API" (não irrestrita).

Nenhuma ação necessária: a chave sobrevive ao corte de setembro/2026 sem troca.

**Achado à parte, fora do escopo deste ticket:** o painel do AI Studio mostra um aviso ativo —
"Você precisa colocar uma ou mais contas de faturamento em pré-pagamento. Faça isso agora para
evitar interrupções no serviço." — não investigado aqui. Virou o ticket
[041](041-billing-pre-pagamento.md).
