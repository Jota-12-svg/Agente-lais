// Escritor de handoffs para PRODUÇÃO — adaptado do
// prototipo-tom-014/handoff-writer.mjs (ticket 031), que grava sempre com o prefixo
// "TESTE-PROTOTIPO-014" no telefone (correto pra teste, errado aqui). Aqui o telefone
// gravado é o real, extraído do jid do cliente — só cai em "TESTE-..." se a chamada
// passar `isTest: true` explicitamente (usado pelo próprio smoke-test deste runtime).
//
// Mesmo mecanismo do 031: RPC `handoffs_insert` (security definer), gateada por
// HANDOFF_INSERT_SECRET, chamada com a publishable key — sem senha de banco, sem
// service role no código.

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
  const keys = ['SUPABASE_PROJECT_REF', 'SUPABASE_PUBLISHABLE_KEY', 'HANDOFF_INSERT_SECRET'];
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

const TRIGGERS_VALIDOS = new Set([
  'purchase_intent', 'architect', 'human_requested', 'irritation', 'price_negotiation', 'qualified',
]);

export function handoffWriterDisponivel() {
  return !!config;
}

// Extrai um telefone legível do jid — @s.whatsapp.net carrega o número direto; @lid é
// endereçamento indireto do WhatsApp (não expõe o número na própria mensagem) — nesse caso
// grava o jid mesmo, marcado, em vez de inventar um número.
export function telefoneDoJid(jid) {
  if (!jid) return 'desconhecido';
  if (jid.endsWith('@s.whatsapp.net')) return jid.replace('@s.whatsapp.net', '');
  if (jid.endsWith('@lid')) return `LID:${jid.replace('@lid', '')}`;
  return jid;
}

/**
 * Grava o chamado na fila de verdade. Nunca lança — quem chama decide o que fazer com
 * {ok, id|error}.
 */
export async function writeHandoff({ trigger, motivo, contactPhone, contactName, contactJid, desiredTimeframe, budget, isTest = false }) {
  if (!config) return { ok: false, error: 'handoff-writer: config ausente (.env sem SUPABASE_*/HANDOFF_INSERT_SECRET)' };

  const triggerValido = TRIGGERS_VALIDOS.has(trigger) ? trigger : 'qualified';
  const engagementMode = triggerValido === 'architect' ? 'architect' : 'consumer';

  const url = `https://${config.SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/handoffs_insert`;
  const body = {
    p_secret: config.HANDOFF_INSERT_SECRET,
    p_contact_phone: isTest ? `TESTE-RUNTIME (${contactPhone || 'sem-id'})` : (contactPhone || 'desconhecido'),
    p_summary: motivo || 'não informado',
    p_engagement_mode: engagementMode,
    p_trigger: triggerValido,
    p_contact_name: contactName || null,
    p_desired_timeframe: desiredTimeframe || null,
    p_budget: budget || null,
    // Jid bruto, pro runtime saber depois a qual conversa este chamado corresponde (045/012 —
    // "devolver ao agente" e "fechar chamado reinicia o atendimento"). Uso interno, nunca
    // exibido na plataforma — ver contact_phone pro que a consultora vê.
    p_contact_jid: isTest ? null : (contactJid || null),
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
    return { ok: true, id: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Consulta o status atual de chamados pelo jid — RPC `handoffs_status_for_jids` (security
 * definer, mesmo segredo do handoffs_insert), devolve só {contact_jid, status}, nunca nome,
 * telefone ou resumo (045/012, "devolver ao agente" e "fechar chamado reinicia"). Nunca lança.
 */
export async function fetchHandoffStatuses(jids) {
  if (!config) return { ok: false, error: 'handoff-writer: config ausente', statuses: [] };
  if (!jids || jids.length === 0) return { ok: true, statuses: [] };

  const url = `https://${config.SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/handoffs_status_for_jids`;
  const body = { p_secret: config.HANDOFF_INSERT_SECRET, p_jids: jids };

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
    if (!r.ok) return { ok: false, error: (data && data.message) || `HTTP ${r.status}`, statuses: [] };
    return { ok: true, statuses: data || [] };
  } catch (e) {
    return { ok: false, error: e.message, statuses: [] };
  }
}
