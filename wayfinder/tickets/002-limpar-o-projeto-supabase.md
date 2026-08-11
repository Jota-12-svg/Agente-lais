---
id: "002"
title: Inventariar e limpar o projeto Supabase
labels: [wayfinder:task]
status: open
assignee: Claude
blocked-by: []
---

## Question

O projeto Supabase `ewxmjbvaolfiafhghxbn` foi usado por um projeto anterior. O usuário
decidiu que este projeto começa limpo: esquema, papéis e dados antigos devem sair.

Apagar é irreversível, então o ticket tem duas metades e a segunda **não acontece sem aval
explícito**:

1. **Inventariar.** Conectar com as credenciais do `.env` e listar o que existe: schemas,
   tabelas, contagem de linhas, papéis de banco criados (`agent_runtime`,
   `platform_worker`), policies de RLS, funções, buckets de storage, migrações aplicadas.
   Apresentar isso ao usuário.
2. **Limpar**, depois do "pode apagar": derrubar o que for do projeto anterior e deixar o
   banco em estado virgem.

Perguntas que o inventário precisa responder antes de qualquer `drop`:

- Existe algum dado real de cliente da Lais Casa ali, ou é tudo de teste?
- Vale reaproveitar o projeto Supabase, ou é mais limpo criar um projeto novo e trocar as
  credenciais? (Projeto novo elimina resíduo invisível — papéis, extensões, configurações
  de auth — que um `drop schema` não pega.)

**Resolvido quando** o banco está no estado inicial acordado. A resolução registra o que
existia, o que foi apagado e quais credenciais mudaram.

---

## Inventário — 2026-08-11

Levantado via **Management API do Supabase** (`SUPABASE_ACCESS_TOKEN`, endpoint
`database/query`), em modo só-leitura — nenhum `drop`/`delete` foi executado. Projeto
`ewxmjbvaolfiafhghxbn`, região `us-east-1`, criado em 2026-08-01, nome no dashboard ainda é
o genérico `joaovictormarchi76@gmail.com's Project` (não ficou marca de projeto anterior no
nome).

### Schemas e tabelas

Além dos schemas padrão do Supabase (`auth`, `storage`, `realtime`, `extensions`, `graphql*`,
`pgbouncer`, `vault`, `supabase_migrations`), existe **um schema próprio: `app`**, com 7
tabelas — claramente do projeto anterior (plataforma multi-loja):

| Tabela | Linhas | Nota |
|---|---|---|
| `app.stores` | 3 | `Ótica Visão Clara`, `Ateliê Manola`, `Clínica Bem Estar` — nenhuma é a Lais Casa |
| `app.customers` | 4 | 3 com UUID determinístico de seed (`c0000000-…-0000000000{1,2,3}`), 1 com UUID aleatório criado em 2026-08-05, ligado à `Ateliê Manola` |
| `app.conversations` | 2 | |
| `app.messages` | 11 | |
| `app.store_knowledge` | 17 | |
| `app.agent_knowledge` | 16 | |
| `app.store_settings` | 3 | |

`auth.users`: **0**. `storage.buckets` e `storage.objects`: **0**.

**Resposta à primeira pergunta do ticket:** não há dado de cliente da Lais Casa ali — os 3
schemas de loja e os 4 registros de cliente pertencem todos a negócios do projeto anterior
(ótica, ateliê, clínica), nenhum é decoração/mobiliário. 3 dos 4 clientes têm UUID de seed
(dado sintético, claramente de script de setup); o quarto (criado 3 dias depois, UUID
aleatório) pode ser um teste manual do dono do projeto — mesmo assim, não é Lais Casa.

### Papéis de banco

Dois papéis com login criados pelo projeto anterior, exatamente os que o `map.md` já citava:
**`agent_runtime`** e **`platform_worker`**. Os demais papéis com login (`postgres`,
`authenticator`, `supabase_admin`, `supabase_etl_admin`, etc.) são infraestrutura padrão do
Supabase, não resíduo.

### RLS, funções e o resto

- **RLS ligado e forçado** (`FORCE ROW LEVEL SECURITY`) nas 7 tabelas de `app`, com 9 policies
  no total (leitura/escrita por escopo de loja/agente).
- **1 função customizada:** `app.current_store_id()` — suporte multi-tenant do projeto
  anterior.
- **Migrações aplicadas:** 3, todas do schema `app` (`tenancy_and_conversation`,
  `agent_knowledge`, `store_knowledge_unico`), datadas de 2026-08-02.
- **Extensions:** `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault` — todas
  padrão/inofensivas, nada a limpar aí.
- **Sem Edge Functions, sem `pg_cron`, sem webhooks (`supabase_functions.hooks` não existe),
  Vault sem segredos.** Superfície de resíduo é só o schema `app` e os dois papéis.

### Resposta à segunda pergunta do ticket — reaproveitar ou criar projeto novo?

**Recomendo reaproveitar o projeto atual**, não criar um novo. A superfície de resíduo é
pequena e nomeada: um schema (`app`), dois papéis (`agent_runtime`, `platform_worker`), 3
migrações. Não há Edge Function, cron, webhook, extension incomum ou config de Auth alterada
que um projeto novo evitaria e um `DROP SCHEMA app CASCADE` mais `DROP ROLE` não resolva.
Criar projeto novo trocaria a credencial mais perigosa do `.env`
(`SUPABASE_ACCESS_TOKEN`) sem necessidade — e essa rotação já está desenhada para acontecer
de qualquer forma no ticket [015](015-rotacao-das-credenciais.md), goste a decisão for aqui
qual for.

### Pendente de aval explícito antes de qualquer `drop`

1. **Apagar o schema `app` inteiro** (`DROP SCHEMA app CASCADE`) — leva junto tabelas,
   policies, função e os 53 registros listados acima.
2. **Remover os papéis `agent_runtime` e `platform_worker`** — a primeira migração deste
   projeto vai recriá-los do zero, então não há nada a preservar neles.
3. Confirmar se o `app.customers` com UUID aleatório (criado em 2026-08-05) merece uma
   olhada antes de apagar, ou se pode ir junto — não é dado da Lais Casa, mas pode ser um
   teste que o dono do projeto queira revisar primeiro.

Sem esse aval, o ticket fica **aberto com o inventário registrado** — a segunda metade
(limpar) não roda sozinha.
