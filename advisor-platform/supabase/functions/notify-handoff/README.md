# notify-handoff

Ao entrar um chamado em `handoffs`, manda um e-mail para as 4 (3 consultoras + a dona)
com o relance + link para a plataforma. Ticket 035 §4.

## Como é acionada

Um **Database Webhook** do Supabase (Database → Webhooks no painel):

- **Tabela:** `public.handoffs` · **Evento:** `INSERT`
- **Tipo:** HTTP Request · **Método:** `POST`
- **URL:** `https://<project-ref>.supabase.co/functions/v1/notify-handoff`
- **Header extra:** `x-handoff-secret: <HANDOFF_WEBHOOK_SECRET>`

O header secreto é conferido pela função; sem ele, `401`. Mantém o webhook fora do
`config.toml`/git para o segredo não vazar.

## Segredos (`supabase secrets set --project-ref <ref> ...`)

| Segredo | O que é |
|---|---|
| `HANDOFF_WEBHOOK_SECRET` | string aleatória; a mesma no header do webhook |
| `RESEND_API_KEY` | https://resend.com/api-keys |
| `NOTIFY_FROM` | `Fila Lais Casa <fila@dominio-verificado>` |
| `NOTIFY_TO` | os 4 e-mails, separados por vírgula |
| `ADVISOR_PLATFORM_URL` | URL pública da plataforma (Cloudflare Pages) |

## Idempotência

Sem escrita no banco (a service role key é vetada — CLAUDE.md §4). O header
`Idempotency-Key: handoff-<id>` do Resend garante um e-mail por chamado numa janela de 24 h.

## Deploy

```sh
supabase functions deploy notify-handoff --project-ref <ref>
```

## Teste local

```sh
supabase functions serve notify-handoff --env-file ./supabase/functions/.env.local
# noutro terminal:
curl -i -XPOST localhost:54321/functions/v1/notify-handoff \
  -H 'x-handoff-secret: <valor>' -H 'content-type: application/json' \
  -d '{"type":"INSERT","table":"handoffs","record":{"id":"test","contact_name":"Fulana","contact_phone":"+55 69 99999-0000","summary":"teste","engagement_mode":"consumer","trigger":"qualified"}}'
```
