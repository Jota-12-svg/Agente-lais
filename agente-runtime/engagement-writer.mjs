// Persistência da memória do agente (ticket 046) — companheiro de handoff-writer.mjs, mesmo
// mecanismo (RPC security definer, publishable key, sem senha de banco, sem service role),
// segredo próprio (ENGAGEMENT_SECRET) porque a superfície de escrita é bem maior: um chamado
// só grava na escalada, um atendimento grava a CADA turno trocado.
//
// Diferença do handoff-writer: o segredo do handoffs_insert está hardcoded no corpo da função
// SQL (herdado do 031); o engagement_secret vive no Supabase Vault — ver a migration
// 20260914120100_engagements_rpc.sql pro porquê.

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

export function engagementWriterDisponivel() {
  return !!config;
}

// Tira o base64 dos attachments antes de persistir — decisão do grilling 046: o áudio já vira
// "entendimento por escrito" no texto da própria resposta da Manu (system-prompt.md), reter o
// base64 não tem uso claro e é dado pessoal retido sem necessidade (LGPD do projeto segue como
// névoa — map.md). Guarda só uma referência textual mínima, pra quem ler o histórico saber que
// houve áudio ali.
function historiaParaPersistir(history) {
  return history.map((m) => {
    if (!m.attachments || m.attachments.length === 0) return { role: m.role, text: m.text };
    return { role: m.role, text: m.text, attachments: m.attachments.map((a) => ({ mimeType: a.mimeType })) };
  });
}

/**
 * Upsert do atendimento aberto do jid — chamado depois de cada turno. Nunca lança; quem chama
 * decide o que fazer com {ok, id|error}. Falha aqui NÃO deve travar a conversa (a resposta já
 * foi mandada ao cliente antes disso) — só perde a persistência daquele turno específico.
 */
export async function upsertEngagement({ jid, phone, name, status, history, handoffId }) {
  if (!config) return { ok: false, error: 'engagement-writer: config ausente (.env sem SUPABASE_*/ENGAGEMENT_SECRET)' };

  const url = `https://${config.SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/engagements_upsert`;
  const body = {
    p_secret: config.ENGAGEMENT_SECRET,
    p_contact_jid: jid,
    p_status: status,
    p_history: historiaParaPersistir(history || []),
    p_contact_phone: phone || null,
    p_contact_name: name || null,
    p_handoff_id: handoffId || null,
  };

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
    const linha = Array.isArray(data) ? data[0] : data;
    return { ok: true, id: linha?.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Lista todos os atendimentos ainda abertos — chamado uma vez no boot, pra reidratar o Map em
 * memória depois de um restart (o motivo de existir deste arquivo todo). Nunca lança.
 */
export async function listOpenEngagements() {
  if (!config) return { ok: false, error: 'engagement-writer: config ausente', engagements: [] };

  const url = `https://${config.SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/engagements_list_open`;
  const body = { p_secret: config.ENGAGEMENT_SECRET };

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
    if (!r.ok) return { ok: false, error: (data && data.message) || `HTTP ${r.status}`, engagements: [] };
    return { ok: true, engagements: data || [] };
  } catch (e) {
    return { ok: false, error: e.message, engagements: [] };
  }
}
