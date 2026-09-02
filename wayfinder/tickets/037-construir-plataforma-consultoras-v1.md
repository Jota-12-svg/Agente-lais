---
id: "037"
title: Construir a plataforma das consultoras — v1
labels: [wayfinder:task]
status: in-progress
assignee: sessão 2026-09-02 (build da plataforma v1)
blocked-by: ["035"]
---

> **Aberto pelo [035](035-plataforma-central-das-consultoras.md)** (2026-09-02), que fechou
> o desenho: superfície única, stack, login, esquema `handoffs`, canal de aviso. Este ticket
> **constrói** o v1. Absorve o [030](030-implementar-notificacao-da-fila.md) (fechado como
> substituído — o disparo da notificação virou parte deste ticket).

## Question

Construir a plataforma das consultoras conforme a resolução do 035, sem relitigar as
decisões que ele fechou. Três peças:

### 1. Migração `handoffs` + RLS

- Tabela `handoffs` com o esquema exato da resolução do 035 (§6). Enums: `engagement_mode`,
  `trigger`, `status`, `business_outcome`, `advisor_verdict`.
- **RLS:** os 4 advisors autenticados (allow-list) leem e atualizam todas as linhas; `INSERT`
  só via *service role* (o agente, [031](031-implementar-escrita-do-chamado-na-fila.md));
  nenhum `DELETE`.
- Allow-list dos 4 e-mails `@gmail.com` (3 consultoras + dona) — em tabela, não hard-coded.
- Índice para a fila (`status`, `created_at`).

### 2. Web app — uma tela

- **Vite + framework leve** (Svelte ou React — decidir aqui, com "simples" como critério).
  Mobile-first. **Critério de aceite: fácil e intuitiva para quem não mexe com tecnologia** —
  sem jargão, poucos toques, estado sempre claro.
- **Login Google** via Supabase Auth; recusa quem não está na allow-list.
- **Fila** (`status` em `pending` / `assumed`), ao vivo via Supabase Realtime, ordenada por
  tempo de espera. Cada card: relance do [010](010-o-que-e-um-lead-qualificado.md) + há
  quanto tempo espera + gatilho.
- **Assumir**: escreve `assumed_by` + `assumed_at`, muda `status` para `assumed`, mostra
  "FULANA pegou às HHhMM". Trava suave — qualquer uma reabre.
- **Fechar**: formulário curto — `business_outcome` (venda / visita / sem venda / perdido) +
  `advisor_verdict` (mandou bem / atrapalhou / pular) + nota livre. Grava, muda `status` para
  `closed`, **some da fila**.
- Histórico read-only dos últimos ~50 fechados: opcional no v1.
- Hospedagem estática: Cloudflare Pages (free) ou Railway.

### 3. Notificação por e-mail

- **Database Webhook** no `INSERT` de `handoffs` → **Edge Function** (Deno) → e-mail via
  Resend para os 4.
- Conteúdo: o relance + link direto para a plataforma. Sem reproduzir a conversa.
- Deduplicação: um e-mail por chamado (o webhook dispara uma vez no insert; garantir
  idempotência se a função reexecutar).
- Credenciais (Resend, Supabase service role) no `.env` — nomes no `.env.example`.

## Fora do escopo do v1

- SMS (adição de ~15 linhas na mesma Edge Function, se o e-mail se provar fraco — 035 §4).
- Ver/corrigir a conversa do agente dentro da plataforma.
- Visão admin separada para a dona.
- Retenção/purga automática (espera a decisão de LGPD — névoa do mapa).

## Depende de

- **035** — esquema e desenho (bloqueia).
- **Runtime do agente** (névoa do mapa) — o `INSERT` do agente ([031](031-implementar-escrita-do-chamado-na-fila.md))
  mora no runtime. A plataforma pode ser construída e testada com linhas semeadas à mão antes
  do runtime existir, mas só entra em uso real quando o agente produzir chamados.
- Os **e-mails reais** das 4 pessoas e a confirmação de que o celular delas avisa quando
  chega e-mail no expediente (pergunta 34 do [020](020-perguntas-para-as-consultoras.md)).

**Resolvido quando** a plataforma estiver no ar, uma consultora conseguir logar, ver um
chamado (semeado ou real), assumir, fechar com desfecho + veredito, e o e-mail de aviso
chegar — tudo testado de ponta a ponta.
