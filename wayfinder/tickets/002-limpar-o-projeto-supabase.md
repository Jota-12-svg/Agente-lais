---
id: "002"
title: Inventariar e limpar o projeto Supabase
labels: [wayfinder:task]
status: open
assignee:
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
