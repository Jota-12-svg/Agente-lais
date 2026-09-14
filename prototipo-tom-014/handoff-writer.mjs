// Ponte de teste do ticket 031 — grava o chamado escalado na fila de verdade (Supabase),
// pra validar ao vivo que "a Manu escala" e "o chamado aparece na plataforma" são a mesma
// coisa. NÃO é o mecanismo final de produção: aquele mora no runtime do agente (névoa do
// mapa) e ainda precisa da decisão completa do 031. Este módulo só prova o caminho.
//
// Não guarda credencial de Postgres — só a publishable key (pública por design, protegida
// pelo RLS) e um segredo de gate (HANDOFF_INSERT_SECRET) que a RPC `handoffs_insert`
// confere no lado do banco (security definer, sem política de INSERT direta pra
// anon/authenticated — ver ticket 037 §RLS).

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

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
  const candidates = [
    join(HERE, '.env.local'),
    join(HERE, '..', '..', '..', '..', '.env'), // worktree -> raiz do repo real
    'C:/Agente Lais/.env',
    join(HERE, '..', '.env'),
  ];
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

// Enum handoff_trigger da migração do 037 — o que a Manu não mandar cai em 'qualified'.
const TRIGGERS_VALIDOS = new Set([
  'purchase_intent', 'architect', 'human_requested', 'irritation', 'price_negotiation', 'qualified',
]);

export function handoffWriterDisponivel() {
  return !!config;
}

/**
 * Grava o chamado na fila de verdade. Nunca lança — quem chama decide o que fazer com
 * {ok, id|error} (ver run.mjs: não bloqueia a resposta ao cliente, só loga).
 */
export async function writeHandoff({ trigger, motivo, conversationId, contactName, desiredTimeframe, budget }) {
  if (!config) return { ok: false, error: 'handoff-writer: config ausente (.env sem SUPABASE_*/HANDOFF_INSERT_SECRET)' };

  const triggerValido = TRIGGERS_VALIDOS.has(trigger) ? trigger : 'qualified';
  const engagementMode = triggerValido === 'architect' ? 'architect' : 'consumer';

  const url = `https://${config.SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/handoffs_insert`;
  const body = {
    p_secret: config.HANDOFF_INSERT_SECRET,
    p_contact_phone: `TESTE-PROTOTIPO-014 (${conversationId || 'sem-id'})`,
    p_summary: motivo || 'não informado',
    p_engagement_mode: engagementMode,
    p_trigger: triggerValido,
    p_contact_name: contactName || null,
    p_desired_timeframe: desiredTimeframe || null,
    p_budget: budget || null,
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
