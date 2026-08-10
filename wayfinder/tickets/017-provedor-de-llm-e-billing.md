---
id: "017"
title: Decidir o provedor de LLM e habilitar o billing
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

## Question

O [research do contrato do Gemini](008-contrato-da-api-do-gemini.md) recomendou **ir direto à
Gemini API da Google, no tier pago**, em vez de usar a kie.ai. A recomendação está fundamentada,
mas a execução depende de duas coisas que só o dono do projeto pode fazer ou autorizar — não
são chute a codificar.

**1. Autorizar billing na Google (AI Studio, tier pago).**

Não é opcional, e o motivo é LGPD, não performance: a tabela de preços da Google marca, linha
a linha, que o **free tier usa os dados para melhorar os produtos** e o **tier pago não usa**.
Conversa real de cliente da Lais Casa no free tier significa entregar dado pessoal para
treinamento. O free tier serve para protótipo com dado sintético, e só.

Basta uma API key do AI Studio e uma conta de cobrança vinculada — não exige projeto GCP nem
service account. O custo estimado é de ordem de **R$ 130/mês para 500 atendimentos**, e cai
bastante com cache de contexto.

**2. Decidir se conversa real de cliente pode passar pela kie.ai enquanto isso não existir.**

Leitura do research: **não**, até haver DPA ou anonimização. A kie.ai retém logs com
parâmetros de entrada por 2 meses e não publica contrato de tratamento de dados, jurisdição
nem lista de subprocessadores. Mas a decisão de aceitar ou não esse risco é do dono do
projeto, que responde por ela.

**Consequência prática de cada caminho:**

- **Billing autorizado** → Google direto desde o começo; a chave da kie.ai vira ferramenta de
  protótipo e provedor de fallback atrás da mesma interface.
- **Billing recusado ou adiado** → o desenvolvimento roda na kie.ai ou no free tier **com dado
  sintético**, e a data de entrada em produção passa a depender desta decisão. Não é
  bloqueador para construir; é bloqueador para atender cliente de verdade.

**Resolvido quando** o provedor estiver escolhido e, se for a Google, a chave criada e o
billing ativo. A resolução registra qual provedor, qual modelo, e onde a credencial mora.
