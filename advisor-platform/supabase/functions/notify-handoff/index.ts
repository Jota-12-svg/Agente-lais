// notify-handoff — avisa as consultoras por e-mail quando entra um chamado novo.
//
// Fluxo (ticket 035 §4): Database Webhook do Supabase no INSERT de `handoffs`
//   → esta função → e-mail via Resend para as 4 (3 consultoras + a dona).
//
// NÃO usa a service role key do Supabase (vetada pelo CLAUDE.md §4). A idempotência
// — "um e-mail por chamado, mesmo se a função reexecutar" — vem do header
// `Idempotency-Key` do Resend (dedupe de 24 h), não de uma escrita no banco.
// O `notified_at` da tabela fica reservado para uso do runtime do agente (ticket 031).
//
// Segredos (via `supabase secrets set`, nunca no git):
//   HANDOFF_WEBHOOK_SECRET  — conferido contra o header do webhook; barra chamada forjada
//   RESEND_API_KEY          — https://resend.com/api-keys
//   NOTIFY_FROM             — ex: "Fila Lais Casa <fila@seu-dominio.com>" (domínio verificado no Resend)
//   NOTIFY_TO               — e-mails das 4, separados por vírgula (manter em sincronia com advisor_allowlist)
//   ADVISOR_PLATFORM_URL    — link da plataforma que vai no corpo do e-mail

interface HandoffRecord {
  id: string;
  contact_name: string | null;
  contact_phone: string;
  summary: string;
  desired_timeframe: string | null;
  budget: string | null;
  engagement_mode: string;
  trigger: string;
  owner_advisor: string | null;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: HandoffRecord;
}

const TRIGGER_LABEL: Record<string, string> = {
  purchase_intent: "Quer comprar",
  architect: "Arquiteto com planilha",
  human_requested: "Pediu uma pessoa",
  irritation: "Cliente irritado",
  price_negotiation: "Quer negociar preço",
  qualified: "Qualificado",
};
const MODE_LABEL: Record<string, string> = {
  consumer: "Casa própria",
  architect: "Arquiteto",
};

function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Falta o segredo ${name}`);
  return v;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!
  ));
}

function buildEmail(r: HandoffRecord, platformUrl: string) {
  const who = r.contact_name || "Contato sem nome";
  const rows: [string, string | null][] = [
    ["Telefone", r.contact_phone],
    ["O que quer", r.summary],
    ["Para quando", r.desired_timeframe],
    ["Orçamento", r.budget],
    ["Tipo", MODE_LABEL[r.engagement_mode] ?? r.engagement_mode],
    ["Motivo", TRIGGER_LABEL[r.trigger] ?? r.trigger],
    ["Costuma atender", r.owner_advisor],
  ];
  const lines = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#6b6157;padding:2px 12px 2px 0">${k}</td><td>${escapeHtml(String(v))}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px">
      <h2 style="margin:0 0 4px">Novo chamado na fila</h2>
      <p style="margin:0 0 16px;color:#6b6157">${escapeHtml(who)}</p>
      <table style="border-collapse:collapse;font-size:14px">${lines}</table>
      <p style="margin:20px 0 0">
        <a href="${platformUrl}" style="background:#9c6b3f;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Abrir a fila</a>
      </p>
    </div>`;

  const text = `Novo chamado na fila — ${who}\n` +
    rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nAbrir a fila: ${platformUrl}`;

  return { subject: `Novo chamado — ${who}`, html, text };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Autenticidade: o webhook manda um header secreto combinado.
  const given = req.headers.get("x-handoff-secret");
  if (!given || given !== env("HANDOFF_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (payload.type !== "INSERT" || payload.table !== "handoffs" || !payload.record?.id) {
    // Não é o evento que nos interessa — 200 para o webhook não ficar tentando de novo.
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const r = payload.record;
  const { subject, html, text } = buildEmail(r, env("ADVISOR_PLATFORM_URL"));
  const to = env("NOTIFY_TO").split(",").map((s) => s.trim()).filter(Boolean);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
      // Idempotência: o mesmo chamado nunca gera dois e-mails (janela de 24 h no Resend).
      "Idempotency-Key": `handoff-${r.id}`,
    },
    body: JSON.stringify({ from: env("NOTIFY_FROM"), to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend falhou", res.status, body);
    return new Response(JSON.stringify({ ok: false, status: res.status }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
