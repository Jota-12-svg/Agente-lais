# advisor-platform — plataforma das consultoras (v1)

A tela web única onde a consultora vê a fila de **chamados** do agente, **assume**, **fecha**
e registra o desfecho (`business_outcome`) + o veredito sobre o atendimento do agente
(`advisor_verdict`). Sobre o Supabase, sem backend de aplicação.

Ticket [037](../wayfinder/tickets/037-construir-plataforma-consultoras-v1.md) — desenho no
[035](../wayfinder/tickets/035-plataforma-central-das-consultoras.md).

## Estrutura

```
advisor-platform/
  supabase/
    migrations/         esquema handoffs + enums + allow-list + índices; políticas RLS
    functions/
      notify-handoff/   Edge Function: Database Webhook no INSERT → e-mail via Resend
    seed.sql            allow-list placeholder + chamados semeados p/ testar sem o agente
  web/                  SPA Vite + Svelte (uma tela), hospedagem estática
```

## O que cada peça faz

| Peça | Faz | Depende de |
|---|---|---|
| `supabase/migrations` | cria a tabela `handoffs`, os 5 enums, a `advisor_allowlist`, o índice da fila e as políticas RLS | nada — aplica no Supabase já |
| `web/` | login Google, guarda de allow-list, fila ao vivo (Realtime), assumir, finalizar chamado | migração aplicada + provider Google no Supabase Auth |
| `supabase/functions/notify-handoff` | ao entrar um chamado, manda e-mail para as 4 | Database Webhook configurado + chave do Resend |

## Rodar local

Ver [`web/README.md`](web/README.md). O esquema pode ser testado com
`supabase db reset` (aplica migrations + `seed.sql`).

## Estado

Construído no ticket 037. **Entra em uso real quando o runtime do agente existir** e passar
a produzir chamados (ticket [031](../wayfinder/tickets/031-implementar-escrita-do-chamado-na-fila.md)).
Até lá, roda com os chamados semeados.
