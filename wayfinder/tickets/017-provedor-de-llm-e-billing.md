---
id: "017"
title: Decidir o provedor de LLM e habilitar o billing
labels: [wayfinder:task]
status: closed
assignee: Claude
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
Conversa real de cliente da Lais Aliski Casa no free tier significa entregar dado pessoal para
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

---

## Decisão tomada — 2026-08-10

O dono do projeto **acatou as duas recomendações**:

1. **Provedor: Gemini API da Google (AI Studio), tier pago.** Modelo `gemini-3-flash`, sempre
   com `reasoning_effort: "low"` e `include_thoughts: false` explícitos.
2. **Conversa real de cliente NÃO passa pela kie.ai.** A kie.ai fica restrita a protótipo com
   **dado sintético** e, mais adiante, a provedor de fallback atrás da mesma interface — nunca
   com dado pessoal, enquanto não houver DPA ou anonimização.

**O ticket segue aberto** porque a parte executável depende de ação no console da Google, que
só o dono da conta pode fazer:

- [ ] Criar a API key no Google AI Studio (https://aistudio.google.com/apikey)
- [ ] Vincular conta de cobrança para sair do free tier — **o free tier usa os dados para
      treinar**, e é essa a razão de existir esta etapa
- [ ] Confirmar no painel que o projeto está no tier pago
- [ ] Colocar a chave no `.env` como `GEMINI_API_KEY` (o `.env.example` já tem o campo)

Enquanto isso não acontece, o desenvolvimento pode rodar na kie.ai ou no free tier **com dado
sintético**. O que fica bloqueado é atender cliente de verdade, não construir.

---

## Resolução — 2026-09-01

Sessão com o dono do projeto. O provedor da decisão de 2026-08-10 **continua valendo**; o que
mudou foi o **modelo** (o id fixado não existe mais) e a **execução** (a chave já estava no
lugar).

### Provedor e chave — tier pago confirmado

- **Gemini API da Google (AI Studio), tier pago.** A `GEMINI_API_KEY` já presente no `.env`
  (formato `AQ.…` — que é o formato **atual** das chaves do AI Studio, não uma credencial
  temporária, como se chegou a suspeitar nesta sessão) foi testada contra
  `v1beta/models/*:generateContent` em 2026-09-01: responde `200` e devolve
  **`serviceTier: "standard"`** — ou seja, o projeto Google por trás dela **já está no tier
  pago**, não no free. Isso satisfaz a exigência de LGPD do ticket (o free tier treina com os
  dados; o pago, não).
- **Checklist da "Decisão tomada — 2026-08-10" dispensado:** não foi preciso criar chave nova
  nem vincular billing — a chave existente já atende. O wizard de criação de chave
  (`/wizard`) chegou a ser montado nesta sessão e fica no scratchpad, não usado.
- **A credencial mora só no `.env`**, como `GEMINI_API_KEY`. Não entra no git (`.gitignore`),
  não vai para chat/PR/log.
- **Pendência menor, não bloqueante:** se algum dia o dono quiser um projeto Google Cloud
  **dedicado** só para o agente (linha de custo isolada), é troca de uma linha no `.env` +
  novo teste de `serviceTier`. Não bloqueia nada.

### Modelo

Pesquisa completa em [`research/017-escolha-do-modelo-gemini.md`](../research/017-escolha-do-modelo-gemini.md)
(seções 1–10: escolha do modelo contra a doc oficial; seção 11: custeio no volume real de
~10 atendimentos/dia).

- **`gemini-3.6-flash`** — id fixo, nunca o alias `gemini-flash-latest`. Substitui o
  `gemini-3-flash` da decisão de 2026-08-10 e do research 008, que **deixou de existir**
  (`404` em setembro/2026; `gemini-2.5-flash` idem). É GA ("Stable"), sem data de
  descontinuação anunciada, e aceita o nível mínimo de raciocínio.
- **`thinking_level: "minimal"` em toda chamada.** Contrato novo dos modelos 3.x — substitui
  o `reasoning_effort: "low"` + `include_thoughts: false` da era 2.5 que a decisão de
  2026-08-10 tinha escrito. `thinking_summaries` desligado/`auto`. (O `gemini-3.7-flash` foi
  descartado justamente por não aceitar `"minimal"` — piso `"low"`, gasta mais tokens de
  pensamento, que são cobrados como saída — e por ser afinado para coding/agentic, altitude
  errada para qualificação.)
- **Plano B: `gemini-3.5-flash-lite`** — a comparar com `gemini-3.6-flash` num teste de
  ~20–30 casos reais (áudio com sotaque, planilha fotografada, aderência à regra de escalar)
  antes de qualquer troca. Enquanto o teste não existe, produção vai de `gemini-3.6-flash`.
- **Fallback multimodal pontual: `gemini-3-flash-preview`** — só para reprocessar uma imagem
  que o modelo principal não conseguiu ler; nunca como principal (é Preview, 2 semanas de
  aviso de deprecação).
- **Custo não decidiu.** No volume real (~10/dia, ~300/mês) o `gemini-3.6-flash` sai
  ~R$ 15–40/mês em 2026; a diferença para o `flash-lite` é ~R$ 8–42/mês. Imaterial para uma
  loja de ticket R$ 2.000–50.000. A escolha entre os dois é só de qualidade e latência.

### Restrições que saem desta decisão

- **Interface fina de LLM desde a primeira linha** (mantido do 008): trocar de modelo ou de
  provedor tem de ser trocar base URL, header e nome do modelo.
- **System prompt precisa de ≥ ~4.096 tokens para ser cacheável** nos modelos 3.x (mínimo de
  cache da geração). Abaixo disso, sem cache explícito. Achado da seção 11: no
  `gemini-3.6-flash`, um prefixo de 5k **cacheado** sai mais barato que 1,5k sem cache — o
  hit de cache é 10× mais barato que entrada normal.
- **kie.ai:** só protótipo e fallback **com dado sintético**, nunca dado real (sem DPA).

### Execução

- `LLM_MODEL=gemini-3.6-flash` gravado no `.env` (estava `gemini-3.5-flash-lite`, resíduo).
- `.env.example` corrigido: `LLM_MODEL=gemini-3-flash` → `gemini-3.6-flash`, com nota sobre
  `thinking_level` e o plano B.
- Addendum no research [008](008-contrato-da-api-do-gemini.md) apontando o modelo e o
  contrato de thinking desatualizados.
- **Desbloqueia o [018](018-validar-contrato-do-llm.md)** — a validação empírica agora tem
  provedor e modelo definidos. A seção 10 do research 017 ("Lacunas — o que só teste com a
  chave e com dado real fecha") é insumo direto para o 018.
