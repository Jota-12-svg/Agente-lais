---
id: "001"
title: Inicializar o repositório e proteger os segredos
labels: [wayfinder:task]
status: closed
assignee: Jota
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

## Resolução

Feito em 2026-08-10.

- **Repositório criado** na raiz do projeto, branch `main`, com remoto
  `https://github.com/Jota-12-svg/Agente-lais`. O primeiro commit já subiu.
- **`.gitignore` escrito antes do primeiro `git add`**, e verificado com `git check-ignore`
  antes do commit: o `.env` nunca esteve na área de stage e não existe no histórico. Além
  dos segredos, o arquivo também exclui `/dados/` e `/conversas/`, onde ficarão as conversas
  exportadas de clientes — dado pessoal fica fora do git por LGPD, não por tamanho.
- **`.env.example` reescrito do zero.** O anterior documentava a arquitetura do projeto
  descartado (três papéis de banco, plataforma multi-loja, parâmetros de aprendizado). O
  novo lista apenas o que este projeto usa hoje: Supabase, uma `DATABASE_URL`, e o acesso ao
  Gemini via kie.ai. Ele cresce conforme o mapa fechar decisões — WhatsApp, Google Calendar
  e Maino ainda não têm variável porque ainda não foram decididos.
- **`CLAUDE.md` criado**, com o contexto do negócio, as restrições duras, as regras do
  tracker e as convenções de git, branch, commit e PR.

**O que ficou de fora:** a rotação das credenciais que já circularam. Virou ticket próprio —
[Decidir a rotação das credenciais expostas](015-rotacao-das-credenciais.md) — porque depende
de [Inventariar e limpar o projeto Supabase](002-limpar-o-projeto-supabase.md): se a decisão
lá for criar um projeto Supabase novo, boa parte das credenciais atuais morre junto e a
rotação perde o objeto.
