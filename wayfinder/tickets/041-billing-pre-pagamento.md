---
id: "041"
title: Colocar a conta de faturamento do Gemini em pré-pagamento antes que o serviço pare
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

## Question

Achado incidental do ticket [040](040-tipo-da-chave-gemini.md): ao abrir o painel "Chaves de
API" do AI Studio (`aistudio.google.com/apikey`), aparece um aviso ativo no topo da página:

> "Você precisa colocar uma ou mais contas de faturamento em pré-pagamento. Faça isso agora
> para evitar interrupções no serviço."

A conta de faturamento hoje (`My Billing Account`) está em **"Nível 1 · Pós-pagamento"**. Não
foi investigado nesta sessão: o que exatamente muda ao converter para pré-pagamento (limite de
gasto fixo antecipado? cartão diferente? afeta o tier pago que o ticket 017 confirmou, do qual
depende a conformidade com LGPD?), nem o prazo real por trás do "faça isso agora".

**O que fazer:** o dono acessa "Acessar faturamento" a partir do próprio aviso (ou
`console.cloud.google.com/billing`) e confirma o que a conversão para pré-pagamento exige —
e se afeta o `serviceTier: standard` que o 017/018 já validaram.

**Resolvido quando** a conta estiver em pré-pagamento (ou o dono decidir conscientemente não
converter, registrando o porquê) e o efeito sobre o tier pago estiver confirmado.
