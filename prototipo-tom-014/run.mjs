// PROTÓTIPO DESCARTÁVEL — ticket 014 (Como o agente soa).
// Ambiente de teste ao vivo: você digita como cliente, a "Manu" responde via Gemini.
// Não é código de produção. Zero dependências — Node 20+ (testado no 22).
//
//   node --env-file="C:\Agente Lais\.env" run.mjs
//   (ou:  node run.mjs   — ele tenta achar o .env sozinho)
//
// A chave nunca é logada nem gravada. system-prompt.md é o que está sendo testado — edite e
// clique em "Reiniciar" para provar de novo.

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PROTOTIPO_PORT) || 4014;

function parseEnv(txt) {
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function loadCreds() {
  if (process.env.GEMINI_API_KEY) {
    return {
      key: process.env.GEMINI_API_KEY,
      model: process.env.LLM_MODEL,
      thinking: process.env.LLM_THINKING_LEVEL,
      from: 'process.env (--env-file ou shell)',
    };
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
      if (env.GEMINI_API_KEY) {
        return { key: env.GEMINI_API_KEY, model: env.LLM_MODEL, thinking: env.LLM_THINKING_LEVEL, from: p };
      }
    } catch { /* ignora */ }
  }
  return null;
}

const creds = loadCreds();
const MODEL = (creds && creds.model) || 'gemini-3.6-flash';
const THINKING = (creds && creds.thinking) || 'minimal';
const SYSTEM_PROMPT = readFileSync(join(HERE, 'system-prompt.md'), 'utf8');
const INDEX_HTML = readFileSync(join(HERE, 'public', 'index.html'), 'utf8');

console.log('\n  Manu · protótipo de tom (ticket 014)\n  ' + '-'.repeat(42));
if (!creds) {
  console.log('  ⚠  GEMINI_API_KEY não encontrada.');
  console.log('     Rode:  node --env-file="C:\\Agente Lais\\.env" run.mjs');
  console.log('     ou crie  prototipo-tom-014/.env.local  com  GEMINI_API_KEY=...');
} else {
  console.log(`  modelo:   ${MODEL}`);
  console.log(`  thinking: ${THINKING}`);
  console.log(`  chave:    …${creds.key.slice(-4)}  (de ${creds.from})`);
}
console.log(`  abra:     http://localhost:${PORT}\n`);

// A doc oficial (research 017) diz que os modelos 3.x usam `thinking_level` em
// `generationConfig`, mas não fixa se é `generationConfig.thinkingLevel` ou
// `generationConfig.thinkingConfig.thinkingLevel`. Tentamos as duas formas e caímos para
// nenhuma — e reportamos qual funcionou (dado útil para o ticket 018).
function bodyVariants(base) {
  return [
    { label: 'thinkingConfig.thinkingLevel', body: { ...base, generationConfig: { ...base.generationConfig, thinkingConfig: { thinkingLevel: THINKING } } } },
    { label: 'generationConfig.thinkingLevel', body: { ...base, generationConfig: { ...base.generationConfig, thinkingLevel: THINKING } } },
    { label: 'sem thinking_level', body: base },
  ];
}

async function askManu(history, foraDoExpediente) {
  if (!creds) throw new Error('Sem GEMINI_API_KEY — veja o console.');
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const contexto = [
    '\n\n---\n## Contexto agora (não é mensagem do cliente)',
    `- Data e hora: ${agora} (horário de Brasília).`,
    '- Horário de atendimento da loja: segunda a sexta 9h–18h, sábado 9h–13h.',
    `- Situação: ${foraDoExpediente ? 'FORA do horário de atendimento — qualifique, mas não prometa que alguém responde agora; diga quando o atendimento volta.' : 'DENTRO do horário de atendimento.'}`,
  ].join('\n');

  const base = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT + contexto }] },
    contents: history.map((m) => ({
      role: m.role === 'agent' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
    generationConfig: { temperature: 0.75, maxOutputTokens: 800 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  let lastErr;
  for (const variant of bodyVariants(base)) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': creds.key },
      body: JSON.stringify(variant.body),
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok) {
      const cand = data.candidates?.[0];
      const text = (cand?.content?.parts || []).map((p) => p.text).filter(Boolean).join('').trim();
      return {
        text: text || '(o modelo não devolveu texto — ' + (cand?.finishReason || 'sem finishReason') + ')',
        thinkingField: variant.label,
        model: data.modelVersion || MODEL,
        usage: data.usageMetadata || null,
        finishReason: cand?.finishReason || null,
      };
    }
    lastErr = { status: r.status, error: data.error?.message || data };
    console.warn(`  variante "${variant.label}" → ${r.status}: ${lastErr.error}`);
    if (r.status !== 400) break; // 401/403/429/5xx não melhoram trocando o campo
  }
  throw new Error(typeof lastErr?.error === 'string' ? lastErr.error : JSON.stringify(lastErr));
}

const send = (res, code, type, body) => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      return send(res, 200, 'text/html; charset=utf-8', INDEX_HTML);
    }
    if (req.method === 'GET' && req.url === '/system-prompt') {
      return send(res, 200, 'text/plain; charset=utf-8', SYSTEM_PROMPT);
    }
    if (req.method === 'GET' && req.url === '/health') {
      return send(res, 200, 'application/json', JSON.stringify({ ok: !!creds, model: MODEL, thinking: THINKING }));
    }
    if (req.method === 'POST' && req.url === '/chat') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const { history = [], foraDoExpediente = false } = JSON.parse(raw || '{}');
      const t0 = Date.now();
      const out = await askManu(history, foraDoExpediente);
      out.ms = Date.now() - t0;
      return send(res, 200, 'application/json', JSON.stringify(out));
    }
    return send(res, 404, 'text/plain', 'não encontrado');
  } catch (err) {
    console.error('  erro:', err.message);
    return send(res, 500, 'application/json', JSON.stringify({ error: err.message }));
  }
}).listen(PORT);
