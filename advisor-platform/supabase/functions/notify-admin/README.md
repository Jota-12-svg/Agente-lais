# notify-admin

Avisa só o **admin** (não as 4) por e-mail em dois eventos: uma consultora reportou um
problema (`problem_reports` INSERT), ou o freio de mão foi acionado (`agent_settings` UPDATE
com `agent_enabled = false`). Ticket 038, addendum 2026-09-14.

Companheira da `notify-handoff` (035 §4), não substituta: aquela avisa as 4 sobre chamado
novo; esta avisa só o admin sobre algo errado. **Não implantada ainda** — mesmo estado que a
`notify-handoff` desde o 037 (código pronto, sem conta Resend criada). A tela de histórico na
própria plataforma (`ProblemHistory.svelte`) já funciona sem depender disto — este e-mail é
avanço de latência (saber na hora), não o único jeito de ver o que foi reportado.

## Como é acionada

Dois **Database Webhooks** do Supabase (Database → Webhooks no painel), a mesma função pros
dois:

1. **Tabela:** `public.problem_reports` · **Evento:** `INSERT`
2. **Tabela:** `public.agent_settings` · **Evento:** `UPDATE`

Ambos:
- **Tipo:** HTTP Request · **Método:** `POST`
- **URL:** `https://<project-ref>.supabase.co/functions/v1/notify-admin`
- **Header extra:** `x-admin-secret: <ADMIN_WEBHOOK_SECRET>`

O header secreto é conferido pela função; sem ele, `401`.

## Segredos (`supabase secrets set --project-ref <ref> ...`)

| Segredo | O que é |
|---|---|
| `ADMIN_WEBHOOK_SECRET` | string aleatória; a mesma no header dos dois webhooks — **não** reaproveitar o `HANDOFF_WEBHOOK_SECRET` |
| `RESEND_API_KEY` | https://resend.com/api-keys (mesma conta da `notify-handoff`, se/quando ela for criada) |
| `NOTIFY_FROM` | mesma variável da `notify-handoff` |
| `NOTIFY_ADMIN_TO` | só o e-mail do admin — **não** confundir com `NOTIFY_TO` (os 4) |
| `ADVISOR_PLATFORM_URL` | URL pública da plataforma — hoje Railway (`plataforma-consultoras-production.up.railway.app`), não Cloudflare Pages |

## Idempotência

Sem escrita no banco (service role key vetada — CLAUDE.md §4). `Idempotency-Key` do Resend:
`problem-report-<id>` pra reports, `killswitch-<toggled_at>` pro freio de mão — um desligamento
novo de verdade sempre tem `toggled_at` diferente do anterior.

## Deploy

```sh
supabase functions deploy notify-admin --project-ref <ref>
```
