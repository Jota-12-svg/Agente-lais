// notify-admin — avisa só o admin (não as 4) quando: (a) uma consultora reporta um problema,
// ou (b) o freio de mão é acionado. Ticket 038, addendum 2026-09-14 (grilling do canal de
// aviso de erro). Mesmo padrão do notify-handoff (035 §4) — companheira dela, não substituta:
// notify-handoff avisa as 4 sobre chamado novo; esta avisa só o admin sobre algo errado.
//
// NÃO usa a service role key do Supabase (vetada pelo CLAUDE.md §4).
//
// Segredos (via `supabase secrets set`, nunca no git):
//   ADMIN_WEBHOOK_SECRET  — conferido contra o header do webhook; barra chamada forjada.
//   RESEND_API_KEY        — https://resend.com/api-keys (mesma conta do notify-handoff).
//   NOTIFY_FROM            — mesma variável do notify-handoff.
//   NOTIFY_ADMIN_TO        — só o e-mail do admin (não os 4) — não confundir com NOTIFY_TO.
//   ADVISOR_PLATFORM_URL   — URL pública da plataforma (hoje Railway, não Cloudflare Pages —
//                            ver correção 2026-09-14, o deploy-wizard.sh está desatualizado).

interface ProblemReportRecord {
  id: string;
  reported_by: string;
  contact_reference: string | null;
  description: string;
  product_claim: boolean;
}

interface AgentSettingsRecord {
  agent_enabled: boolean;
  toggled_by: string | null;
  toggled_at: string | null;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: ProblemReportRecord | AgentSettingsRecord;
}

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

function buildProblemEmail(r: ProblemReportRecord, platformUrl: string) {
  const rows: [string, string | null][] = [
    ["Reportado por", r.reported_by],
    ["Qual conversa", r.contact_reference],
  ];
  const lines = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#6b6157;padding:2px 12px 2px 0">${k}</td><td>${escapeHtml(String(v))}</td></tr>`)
    .join("");

  // product_claim: erro de afirmação de preço/disponibilidade — a restrição dura nº 1 do
  // CLAUDE.md — é mais urgente que os demais tipos de problema reportado (037, via 011).
  const subjectPrefix = r.product_claim ? "URGENTE — " : "";
  const priorityBanner = r.product_claim
    ? `<p style="margin:0 0 12px;color:#a23b2e;font-weight:600">Envolve preço ou disponibilidade de produto</p>`
    : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px">
      <h2 style="margin:0 0 4px">Problema reportado</h2>
      ${priorityBanner}
      <table style="border-collapse:collapse;font-size:14px">${lines}</table>
      <p style="margin:12px 0 0;white-space:pre-wrap">${escapeHtml(r.description)}</p>
      <p style="margin:20px 0 0">
        <a href="${platformUrl}" style="background:#9c6b3f;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Ver histórico na plataforma</a>
      </p>
    </div>`;
  const text = (r.product_claim ? `ENVOLVE PREÇO OU DISPONIBILIDADE DE PRODUTO\n\n` : "") +
    `Problema reportado\n` +
    rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\n${r.description}\n\nVer histórico: ${platformUrl}`;

  return { subject: `${subjectPrefix}Problema reportado na plataforma`, html, text };
}

function buildKillSwitchEmail(r: AgentSettingsRecord, platformUrl: string) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px">
      <h2 style="margin:0 0 4px">Freio de mão acionado</h2>
      <p style="margin:0">O agente foi <strong>desligado</strong>${r.toggled_by ? ` por ${escapeHtml(r.toggled_by)}` : ""}.
      Nenhuma conversa está recebendo resposta automática até religar.</p>
      <p style="margin:20px 0 0">
        <a href="${platformUrl}" style="background:#a23b2e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Abrir a plataforma</a>
      </p>
    </div>`;
  const text = `Freio de mão acionado${r.toggled_by ? ` por ${r.toggled_by}` : ""} — agente desligado.\n\nAbrir a plataforma: ${platformUrl}`;

  return { subject: "Freio de mão acionado — agente desligado", html, text };
}

async function sendEmail(subject: string, html: string, text: string, idempotencyKey: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ from: env("NOTIFY_FROM"), to: [env("NOTIFY_ADMIN_TO")], subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("Resend falhou", res.status, body);
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const given = req.headers.get("x-admin-secret");
  if (!given || given !== env("ADMIN_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const platformUrl = env("ADVISOR_PLATFORM_URL");

  if (payload.type === "INSERT" && payload.table === "problem_reports") {
    const r = payload.record as ProblemReportRecord;
    const { subject, html, text } = buildProblemEmail(r, platformUrl);
    const ok = await sendEmail(subject, html, text, `problem-report-${r.id}`);
    return new Response(JSON.stringify({ ok }), { status: ok ? 200 : 502 });
  }

  if (payload.type === "UPDATE" && payload.table === "agent_settings") {
    const r = payload.record as AgentSettingsRecord;
    if (r.agent_enabled) {
      // Religou — não é evento urgente, não manda e-mail (só desligar avisa).
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }
    const { subject, html, text } = buildKillSwitchEmail(r, platformUrl);
    // Idempotência por toggled_at: um re-toggle rápido do mesmo evento não duplica dentro da
    // janela de 24h do Resend; um desligamento novo de verdade tem toggled_at diferente.
    const ok = await sendEmail(subject, html, text, `killswitch-${r.toggled_at}`);
    return new Response(JSON.stringify({ ok }), { status: ok ? 200 : 502 });
  }

  // Não é o evento que nos interessa — 200 para o webhook não ficar tentando de novo.
  return new Response(JSON.stringify({ skipped: true }), { status: 200 });
});
