---
id: "015"
title: Decidir a rotação das credenciais expostas
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["002"]
---

## Question

As credenciais do `.env` vieram de um projeto anterior e circularam fora de um cofre. Uma
credencial que já apareceu em texto deve ser considerada comprometida — o próprio arquivo
registra que o `SUPABASE_ACCESS_TOKEN` já foi trocado uma vez, em 2026-08-01, "após o
anterior ser exposto no chat".

Bloqueado por [Inventariar e limpar o projeto Supabase](002-limpar-o-projeto-supabase.md)
de propósito: se a decisão lá for **criar um projeto Supabase novo**, as credenciais atuais
morrem junto e este ticket vira quase nada. Rotacionar antes seria trabalho jogado fora.

A decidir, credencial por credencial:

- **`SUPABASE_ACCESS_TOKEN`** — é o mais grave: alcança **todos** os projetos Supabase da
  conta, não só este. Rotacionar, e avaliar se o projeto precisa mesmo dele em runtime ou
  se ele é só ferramenta de CLI que pode viver fora do `.env` da aplicação.
- **`SUPABASE_DB_PASSWORD`** — senha do banco. Trocar pelo painel invalida strings de
  conexão existentes; verificar o que quebra.
- **`SUPABASE_PUBLISHABLE_KEY`** — pública por design, não é segredo. Provavelmente nada a
  fazer, mas confirmar que é mesmo a chave publishable e não uma legada.
- **`KIE_API_KEY`** — chave de LLM, cobrada por uso. Chave vazada é fatura de terceiro.
  Verificar se o painel da kie.ai mostra consumo inesperado antes de trocar.
- **As senhas dos papéis de banco** herdadas do projeto anterior: se aqueles papéis forem
  derrubados na limpeza, as senhas somem com eles.

Decidir também **onde as credenciais passam a morar** em produção — variável de ambiente da
plataforma de hospedagem, gerenciador de segredos, ou `.env` no servidor — porque isso muda
quem precisa ter acesso a elas.

**Resolvido quando** cada credencial tiver um destino decidido e executado. A resolução
registra o que foi rotacionado, o que não foi e por quê.
