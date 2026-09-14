// Rastro das próprias mensagens da Manu (ticket 047) — companheiro de engagement-writer.mjs
// e handoff-writer.mjs, mesmo mecanismo (RPC security definer, publishable key). Reaproveita
// o ENGAGEMENT_SECRET já existente: não é uma fronteira de confiança nova, é a mesma
// (runtime → Supabase), só uma tabela nova por trás.
//
// Existe só pra desambiguar, no histórico que o Baileys reenvia numa reconexão, "mensagem
// fromMe da própria Manu" (ignorar) de "mensagem fromMe de uma consultora humana" (sinal de
// handoff perdido — ver `## Resolução` do 047 pro porquê).

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseEnv(txt) {
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function loadConfig() {
  const keys = ['SUPABASE_PROJECT_REF', 'SUPABASE_PUBLISHABLE_KEY', 'ENGAGEMENT_SECRET'];
  if (keys.every((k) => process.env[k])) {
    return Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  }
  const candidates = ['C:/Agente Lais/.env', path.join(HERE, '..', '.env')];
  for (const p of candidates) {
    try {
      if (!existsSync(p)) continue;
      const env = parseEnv(readFileSync(p, 'utf8'));
      if (keys.every((k) => env[k])) return Object.fromEntries(keys.map((k) => [k, env[k]]));
    } catch { /* ignora */ }
  }
  return null;
}

const config = loadConfig();

async function chamarRpc(nome, body) {
  if (!config) return { ok: false, error: 'agent-sent-messages-writer: config ausente (.env sem SUPABASE_*/ENGAGEMENT_SECRET)' };
  const url = `https://${config.SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/${nome}`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: config.SUPABASE_PUBLISHABLE_KEY,
        authorization: `Bearer ${config.SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) return { ok: false, error: (data && data.message) || `HTTP ${r.status}` };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Registra que a Manu mandou esta mensagem — chamado logo depois de `sock.sendMessage`.
 * Fire-and-forget, igual persistirEngajamento: nunca deve travar a resposta ao cliente.
 */
export async function recordSentMessage(messageId, contactJid) {
  if (!messageId) return { ok: false, error: 'messageId ausente' };
  return chamarRpc('agent_sent_messages_insert', {
    p_secret: config?.ENGAGEMENT_SECRET,
    p_message_id: messageId,
    p_contact_jid: contactJid,
  });
}

/**
 * Dado um lote de ids de mensagem `fromMe` (vindos do histórico reenviado numa reconexão),
 * devolve só os que são conhecidos como enviados pela própria Manu. Qualquer id do lote que
 * NÃO vier na resposta é `fromMe` humano — ver o handler de `messaging-history.set` em
 * index.js pro que isso vira (com_consultora).
 */
export async function filterKnownSent(messageIds) {
  if (!messageIds || messageIds.length === 0) return { ok: true, known: new Set() };
  const r = await chamarRpc('agent_sent_messages_known', {
    p_secret: config?.ENGAGEMENT_SECRET,
    p_message_ids: messageIds,
  });
  if (!r.ok) return { ok: false, error: r.error, known: new Set() };
  return { ok: true, known: new Set(r.data || []) };
}
