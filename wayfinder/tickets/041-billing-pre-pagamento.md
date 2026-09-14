---
id: "041"
title: Colocar a conta de faturamento do Gemini em pré-pagamento antes que o serviço pare
labels: [wayfinder:task]
status: closed
assignee: Claude
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

## Resolução

**Fechado em 2026-09-14: o dono decidiu conscientemente NÃO converter agora.** Investigado
antes da decisão (navegador, só leitura — nenhuma confirmação de troca foi clicada):

- **Contexto real, não é aviso genérico**: a Google lançou em março/2026 dois planos de
  faturamento pra API Gemini (Prepay/Postpay) e está reavaliando contas antigas, atribuindo
  plano novo ou oferecendo escolha — não é opt-in espontâneo
  ([ai.google.dev/gemini-api/docs/billing](https://ai.google.dev/gemini-api/docs/billing),
  [blog.google](https://blog.google/innovation-and-ai/technology/developers-tools/prepay-gemini-api/)).
  A conta `My Billing Account` está em **Tier 1** (só configurou faturamento, sem histórico de
  pagamento relevante — a documentação mostra Tier 1 = teto de US$ 250, Tier 2 exige US$ 100+
  em 3 dias, Tier 3 exige US$ 1.000+ em 30 dias); reportagens sobre o rollout (fonte
  secundária, não confirmada letra a letra no texto oficial) indicam que só Tier 3 mantém
  Postpay — bate com o banner "Ação necessária" já ativo especificamente nesta conta.
- **Efeito confirmado, direto na tela de confirmação da Google** (não documentação de
  terceiros): "Seu nível de cota não vai mudar ao trocar para o pré-pagamento" — não afeta
  rate limit. E não afeta o `serviceTier: standard` que os tickets 017/018 validaram pra
  conformidade com LGPD — esse depende de ser conta paga (não-free), não do método
  prepay/postpay. **Pendência original do ticket ("nem o efeito sobre o tier pago foi
  investigado") está resolvida**: não há efeito adverso.
- **A troca é via de mão única** ("não será possível voltar para o pós-pagamento") e exige
  comprar crédito não reembolsável na hora — por isso não foi confirmada sozinha, ficou pra
  decisão consciente do dono.
- **Risco aceito, registrado explicitamente**: se a conta não converter, a Google avisa
  "interrupções no serviço" — na prática, a chamada ao Gemini que a Manu faz a cada mensagem
  pode passar a falhar, derrubando o atendimento em produção sem aviso prévio. **Decisão do
  dono**: manter pós-pagamento como está; se o problema aparecer (erro de billing/cobrança
  bloqueada), troca reativamente na hora. Gasto atual é baixo (~R$ 2/mês) e o cartão cadastrado
  segue válido — risco considerado tolerável por enquanto.
- Não reabrir este ticket se o problema acontecer — criar um novo, já que a decisão e o
  porquê estão registrados aqui.
