---
id: "001"
title: Inicializar o repositório e proteger os segredos
labels: [wayfinder:task]
status: open
assignee:
blocked-by: []
---

## Question

Nada a decidir: trabalho manual que destrava todo o resto.

Hoje a pasta do projeto **não é um repositório git**. Consequência imediata: o `.env` com
credenciais reais não está protegido por `.gitignore` nenhum — o comentário dentro dele
que afirma o contrário é herança do projeto anterior e é falso aqui. No primeiro `git init`
seguido de `git add .` os segredos entram no histórico.

O que precisa acontecer:

1. `git init` na raiz do projeto, com `.gitignore` que exclua `.env` **antes** do primeiro
   commit.
2. Reescrever o `.env.example` do zero: ele hoje é documentação do projeto anterior. Deve
   listar apenas as variáveis que **este** projeto usa, sem valor real e sem a arquitetura
   antiga nos comentários.
3. Avaliar a rotação das credenciais que já circularam: o `SUPABASE_ACCESS_TOKEN` alcança
   **todos** os projetos Supabase da conta, não só este — decidir com o usuário se rotaciona
   agora.

**Resolvido quando** o repositório existe, o `.env` está fora do controle de versão e o
`.env.example` reflete este projeto. A resolução registra o que foi rotacionado e o que não.
