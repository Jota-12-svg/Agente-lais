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
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { costOfCall, rateFor, fmtUsd, fmtBrl, USD_BRL, CALIBRATION } from './pricing.mjs';
import * as cache from './cache.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PROTOTIPO_PORT) || 4014;
const CUSTOS_LOG = join(HERE, 'custos.jsonl');
const session = { started: new Date().toISOString(), calls: 0, usd: 0, brl: 0 };
const SP_TOKENS_APPROX = Math.round(readFileSync(join(HERE, 'system-prompt.md'), 'utf8').length / 3.7);

// Estado do handoff por conversa. status: 'qualificando' | 'escalado' | 'com_consultora'.
// Regra (tickets 009/012): depois de escalar OU de uma consultora falar, a Manu fica em
// SILÊNCIO nessa conversa — não responde por cima. Única exceção: janela de retomada curta
// (o cliente volta dias depois → uma reafirmação, sem retomar a qualificação; o número exato
// é decisão do ticket 013).
const handoff = new Map();
const REAFIRMACAO = 'Oi! Sua conversa já está com uma das nossas consultoras — ela te responde por aqui assim que possível. Qualquer coisa, é só aguardar que ela te procura.';

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
// Default do protótipo: gemini-3.5-flash-lite (teste de tom + custo). O LLM_MODEL do .env
// (gemini-3.6-flash, decisão do ticket 017) é o default de PRODUÇÃO — aqui é desacoplado.
// Trocar: PROTOTIPO_MODEL no ambiente, ou o seletor de modelo no chat.
const MODEL = process.env.PROTOTIPO_MODEL || 'gemini-3.5-flash-lite';
const THINKING = (creds && creds.thinking) || 'minimal';
const SYSTEM_PROMPT = readFileSync(join(HERE, 'system-prompt.md'), 'utf8');
const INDEX_HTML = readFileSync(join(HERE, 'public', 'index.html'), 'utf8');

console.log('\n  Manu · protótipo de tom (ticket 014)\n  ' + '-'.repeat(42));
if (!creds) {
  console.log('  ⚠  GEMINI_API_KEY não encontrada.');
  console.log('     Rode:  node --env-file="C:\\Agente Lais\\.env" run.mjs');
  console.log('     ou crie  prototipo-tom-014/.env.local  com  GEMINI_API_KEY=...');
} else {
  console.log(`  modelo:   ${MODEL}   (troca no chat; produção = ${creds.model || 'gemini-3.6-flash'})`);
  console.log(`  thinking: ${THINKING}`);
  console.log(`  chave:    …${creds.key.slice(-4)}  (de ${creds.from})`);
  const pr = rateFor(MODEL);
  console.log(`  preço:    $${pr.input}/1M in · $${pr.output}/1M out · calibração ×${CALIBRATION}  (ajuste: COST_CALIBRATION no .env)`);
}
console.log(`  abra:     http://localhost:${PORT}`);
console.log(`  custos:   http://localhost:${PORT}/custos    ·    cache: http://localhost:${PORT}/cache`);
console.log(`  cache de prefixo: liga/desliga na barra do chat (cria um cachedContents com o system prompt)`);
console.log(`  handoff: "enviar como Consultora" na barra → o agente cala; toggle do ponto cego simula o dispositivo não suportado\n`);

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

const MODELOS_OK = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.5-flash'];

async function askManu(history, foraDoExpediente, modelOverride, usarCache) {
  if (!creds) throw new Error('Sem GEMINI_API_KEY — veja o console.');
  const modelo = MODELOS_OK.includes(modelOverride) ? modelOverride : MODEL;
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const contexto = [
    '## Contexto agora (não é mensagem do cliente)',
    `- Data e hora: ${agora} (horário de Brasília).`,
    '- Horário de atendimento da loja: segunda a sexta 9h–18h, sábado 9h–13h.',
    `- Situação: ${foraDoExpediente ? 'FORA do horário de atendimento — qualifique, mas não prometa que alguém responde agora; diga quando o atendimento volta.' : 'DENTRO do horário de atendimento.'}`,
  ].join('\n');

  // Um turno pode carregar mídia (imagem/áudio) em `attachments: [{mimeType, data(base64)}]`.
  // A mídia entra como `inlineData` em `parts`, junto do texto.
  const turnosCliente = history.map((m) => {
    const parts = [];
    // turno da consultora: entra rotulado (a API vê como 'model', mas o texto marca a autoria)
    if (m.role === 'advisor' && m.text) parts.push({ text: '[mensagem enviada por uma consultora humana] ' + m.text });
    else if (m.text && m.text.trim()) parts.push({ text: m.text });
    for (const a of m.attachments || []) {
      if (a && a.mimeType && a.data) parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } });
    }
    if (parts.length === 0) parts.push({ text: '(mensagem vazia)' });
    return { role: (m.role === 'agent' || m.role === 'advisor') ? 'model' : 'user', parts };
  });

  // Resolve o cache de prefixo, se pedido. O prefixo cacheado é SÓ o system prompt estático;
  // o `contexto` dinâmico entra como primeiro turno de `contents` (não pode ir junto do
  // cachedContent — a API rejeita systemInstruction com cachedContent).
  let cacheName = null;
  let cacheInfo = { pedido: !!usarCache, usado: false, erro: null };
  if (usarCache) {
    try {
      cacheName = await cache.getPrefixCache(modelo, creds.key, SYSTEM_PROMPT);
      cacheInfo.usado = true;
    } catch (e) {
      cacheInfo.erro = e.message;
      console.warn('  cache de prefixo falhou, caindo pra inline:', e.message);
    }
  }

  const inlineBase = () => ({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT + '\n\n---\n' + contexto }] },
    contents: turnosCliente,
    generationConfig: { temperature: 0.75, maxOutputTokens: 800 },
  });
  const cachedBase = (name) => ({
    cachedContent: name,
    contents: [
      { role: 'user', parts: [{ text: contexto }] },
      { role: 'model', parts: [{ text: 'Entendido, vou seguir as instruções.' }] },
      ...turnosCliente,
    ],
    generationConfig: { temperature: 0.75, maxOutputTokens: 800 },
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

  // Tenta um corpo pelas 3 variantes de thinking_level. Devolve {ok, data, label} ou {ok:false, err}.
  async function attempt(base) {
    let err;
    for (const variant of bodyVariants(base)) {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': creds.key },
        body: JSON.stringify(variant.body),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) return { ok: true, data, label: variant.label };
      err = { status: r.status, error: data.error?.message || data };
      console.warn(`  variante "${variant.label}" → ${r.status}: ${err.error}`);
      if (r.status !== 400) break;
    }
    return { ok: false, err };
  }

  let res = await attempt(cacheName ? cachedBase(cacheName) : inlineBase());

  // cache sumiu entre a checagem e o uso (TTL) → invalida e refaz inline
  if (!res.ok && cacheName && /cachedcontent|not found|permission_denied/i.test(String(res.err?.error))) {
    cache.invalidate(modelo);
    cacheName = null;
    cacheInfo = { pedido: true, usado: false, erro: 'cache havia expirado; refeito inline' };
    res = await attempt(inlineBase());
  }

  if (!res.ok) {
    const e = res.err?.error;
    throw new Error(typeof e === 'string' ? e : JSON.stringify(res.err));
  }

  const cand = res.data.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p) => p.text).filter(Boolean).join('').trim();
  return {
    text: text || '(o modelo não devolveu texto — ' + (cand?.finishReason || 'sem finishReason') + ')',
    thinkingField: res.label,
    model: res.data.modelVersion || modelo,
    usage: res.data.usageMetadata || null,
    finishReason: cand?.finishReason || null,
    cache: cacheInfo,
  };
}

const send = (res, code, type, body) => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

// ---- tracking de custo: agregação do custos.jsonl ----
function lerLog() {
  if (!existsSync(CUSTOS_LOG)) return [];
  return readFileSync(CUSTOS_LOG, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

function custosResumo() {
  const rows = lerLog();
  const total = { calls: rows.length, usd: 0, brl: 0, tokIn: 0, tokOut: 0, tokThoughts: 0 };
  const porModelo = {};
  const porConversa = {};
  for (const r of rows) {
    total.usd += r.usd; total.brl += r.brl;
    total.tokIn += r.tokens?.prompt || 0;
    total.tokOut += r.tokens?.output || 0;
    total.tokThoughts += r.tokens?.thoughts || 0;
    const m = (porModelo[r.model] ||= { calls: 0, usd: 0, brl: 0 });
    m.calls++; m.usd += r.usd; m.brl += r.brl;
    const c = (porConversa[r.conversationId] ||= { calls: 0, usd: 0, brl: 0, ts: r.ts });
    c.calls++; c.usd += r.usd; c.brl += r.brl;
  }
  const conversas = Object.values(porConversa);
  const mediaPorConversa = conversas.length ? total.brl / conversas.length : 0;
  const mediaPorChamada = rows.length ? total.brl / rows.length : 0;
  // projeção grosseira: ~8 mensagens do cliente por atendimento de qualificação,
  // ~10 atendimentos/dia (dado da dona), ~26 dias (seg–sáb). O protótipo NÃO usa cache de
  // prefixo — em produção o system prompt cacheado derruba a parte de entrada. Ver
  // research 017 §11.4 (~R$ 28/mês típico COM cache).
  const projMensalBrl = mediaPorChamada * 8 * 10 * 26;
  return {
    arquivo: 'custos.jsonl',
    de: rows[0]?.ts || null,
    ate: rows.at(-1)?.ts || null,
    total,
    porModelo,
    conversas: conversas.length,
    mediaPorConversaBrl: mediaPorConversa,
    mediaPorChamadaBrl: mediaPorChamada,
    projecaoMensalBrl: projMensalBrl,
    systemPromptTokens: SP_TOKENS_APPROX,
    systemPromptPct: total.tokIn > 0 ? Math.round((100 * SP_TOKENS_APPROX * rows.length) / total.tokIn) : 0,
    sessaoAtual: session,
    cambioUsdBrl: USD_BRL,
    calibracao: CALIBRATION,
    precoAtual: rateFor('gemini-3.6-flash'),
    aviso: 'Estimativa: tokens (reais, da API) × preço de tabela × câmbio. O preço está calibrado ao billing CHEIO ($1,50 in / $7,50 out) — a promo de 2026 não bateu com o billing real desta conta em 02/09. Ajuste com GEMINI_PRICE_IN / GEMINI_PRICE_OUT ou COST_CALIBRATION no .env. Fatura de verdade: painel do Google AI Studio.',
  };
}

function custosPage() {
  const r = custosResumo();
  const linhasModelo = Object.entries(r.porModelo)
    .map(([m, v]) => `<tr><td>${m}</td><td>${v.calls}</td><td>${fmtUsd(v.usd)}</td><td>${fmtBrl(v.brl)}</td></tr>`)
    .join('');
  return `<!doctype html><meta charset="utf-8"><title>Custos · protótipo Manu</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font:15px/1.55 "Segoe UI",system-ui,sans-serif;margin:0;background:#14160f;color:#e9e9df;padding:1.5rem}
  @media(prefers-color-scheme:light){body{background:#eef0e9;color:#23271f}}
  h1{font-size:1.2rem;margin:0 0 .3rem}
  .sub{opacity:.7;font-size:.82rem;margin-bottom:1.4rem}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.8rem;margin-bottom:1.4rem}
  .card{background:rgba(127,160,127,.12);border:1px solid rgba(127,160,127,.3);border-radius:10px;padding:.8rem}
  .card .n{font-size:1.35rem;font-weight:700;font-variant-numeric:tabular-nums}
  .card .l{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;opacity:.7;margin-top:.15rem}
  table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;margin-bottom:1.4rem}
  th,td{text-align:left;padding:.4rem .6rem;border-bottom:1px solid rgba(127,127,110,.25);font-size:.88rem}
  th{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;opacity:.7}
  .aviso{font-size:.8rem;opacity:.7;border-left:2px solid rgba(127,160,127,.5);padding-left:.7rem}
  a{color:#8fc0a0}
</style>
<h1>Custos — protótipo de tom da Manu</h1>
<div class="sub">${r.total.calls} chamadas · ${r.conversas} conversas · ${r.de ? r.de.slice(0, 16).replace('T', ' ') : '—'} → ${r.ate ? r.ate.slice(0, 16).replace('T', ' ') : '—'} · câmbio ~R$ ${r.cambioUsdBrl}/US$</div>
<div class="grid">
  <div class="card"><div class="n">${fmtBrl(r.total.brl)}</div><div class="l">Total acumulado</div></div>
  <div class="card"><div class="n">${fmtUsd(r.total.usd)}</div><div class="l">Total (US$)</div></div>
  <div class="card"><div class="n">${fmtBrl(r.mediaPorConversaBrl)}</div><div class="l">Média por conversa</div></div>
  <div class="card"><div class="n">${fmtBrl(r.mediaPorChamadaBrl)}</div><div class="l">Média por mensagem</div></div>
  <div class="card"><div class="n">${fmtBrl(r.sessaoAtual.brl)}</div><div class="l">Nesta sessão do servidor</div></div>
  <div class="card"><div class="n">≈ ${fmtBrl(r.projecaoMensalBrl)}</div><div class="l">Projeção /mês (5 msg × 10/dia × 22)</div></div>
</div>
<table>
  <tr><th>Modelo</th><th>Chamadas</th><th>US$</th><th>R$</th></tr>
  ${linhasModelo || '<tr><td colspan="4">sem dados ainda</td></tr>'}
</table>
<p><b>Tokens somados:</b> entrada ${r.total.tokIn.toLocaleString('pt-BR')} · saída ${r.total.tokOut.toLocaleString('pt-BR')} · pensamento ${r.total.tokThoughts.toLocaleString('pt-BR')}</p>
<p class="aviso"><b>Onde o dinheiro vai:</b> o <code>system-prompt.md</code> (~${r.systemPromptTokens} tokens, as instruções da Manu) é
reenviado em <b>toda</b> chamada — a API não tem memória. Isso é <b>~${r.systemPromptPct}%</b> dos tokens de entrada
desta janela. Sua mensagem de texto é ~30 tokens; o que pesa é o manual que viaja junto.
Em produção isso é <b>cacheado</b> (10× mais barato na parte fixa) — ver research 017 §5.</p>
<p><b>Preço usado:</b> $${r.precoAtual.input}/1M entrada · $${r.precoAtual.output}/1M saída · calibração ×${r.calibracao}</p>
<p class="aviso">${r.aviso}</p>
<p class="aviso"><b>Calibrar:</b> converse um pouco, anote o total daqui, compare com o delta do painel de
billing (tem ~10 min de atraso). Se divergir, ponha <code>COST_CALIBRATION=&lt;fator&gt;</code> no
<code>.env</code> (ex.: se o billing subiu o dobro, <code>COST_CALIBRATION=2</code>) e reinicie.</p>
<p class="aviso"><b>Cache de prefixo:</b> a chave "cache de prefixo" na barra do chat liga/desliga o
<code>cachedContents</code> (só o system prompt estático; data/hora vai em <code>contents</code>).
Ligado, a linha cinza mostra <code>cache N</code> e o token cacheado é cobrado a $${r.precoAtual.cacheHit}/1M
em vez de $${r.precoAtual.input}/1M. No <code>gemini-3.5-flash-lite</code> o cache funciona mas
<b>sem desconto</b> (ver CUSTOS.md). Cache atual: <a href="/cache">/cache</a>.</p>
<p style="font-size:.8rem"><a href="/">← voltar ao chat</a> · <a href="/custos.json">JSON</a> · terminal: <code>node custos.mjs</code></p>`;
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      return send(res, 200, 'text/html; charset=utf-8', INDEX_HTML);
    }
    if (req.method === 'GET' && req.url === '/system-prompt') {
      return send(res, 200, 'text/plain; charset=utf-8', SYSTEM_PROMPT);
    }
    if (req.method === 'GET' && req.url === '/health') {
      return send(res, 200, 'application/json', JSON.stringify({ ok: !!creds, model: MODEL, thinking: THINKING, modelos: MODELOS_OK, calibracao: CALIBRATION }));
    }
    if (req.method === 'GET' && req.url === '/cache') {
      return send(res, 200, 'application/json', JSON.stringify({ ttlSec: 1800, ativos: cache.status() }, null, 2));
    }
    if (req.method === 'POST' && req.url === '/chat') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const { history = [], foraDoExpediente = false, conversationId = 'sem-id', model, cache: usarCache = false,
              as: autor = 'client', blindSpot = false, retomada = false } = JSON.parse(raw || '{}');

      const st = handoff.get(conversationId) || { status: 'qualificando' };

      // --- mensagem enviada pela CONSULTORA ---
      if (autor === 'advisor') {
        // dispositivo não suportado (ticket 009 / research 019): o agente não recebe o evento.
        if (!blindSpot) { st.status = 'com_consultora'; st.since = Date.now(); }
        handoff.set(conversationId, st);
        return send(res, 200, 'application/json', JSON.stringify({
          advisor: true, status: st.status, blindSpot,
          nota: blindSpot
            ? 'PONTO CEGO: a consultora respondeu de um dispositivo que o agente não enxerga (ex.: WhatsApp para Windows). O agente NÃO sabe que ela assumiu e pode responder por cima.'
            : 'A consultora assumiu. O agente entra em silêncio nesta conversa.',
        }));
      }

      // --- mensagem do CLIENTE com a conversa já escalada / com a consultora ---
      if (st.status === 'escalado' || st.status === 'com_consultora') {
        if (retomada) {
          // janela de retomada (ticket 012): uma reafirmação, sem retomar a qualificação.
          return send(res, 200, 'application/json', JSON.stringify({
            text: REAFIRMACAO, retomada: true, status: st.status,
            nota: 'Janela de retomada: o agente responde SÓ para reafirmar. Não retoma a qualificação. O número exato de dias é decisão do ticket 013.',
          }));
        }
        return send(res, 200, 'application/json', JSON.stringify({
          silent: true, status: st.status, motivo: st.motivo || null,
          nota: st.status === 'escalado'
            ? 'O agente já escalou e está em silêncio — aguardando a consultora. Não responde ao cliente.'
            : 'A consultora está no atendimento. O agente não responde por cima.',
        }));
      }

      // guarda de tamanho: o limite de request inline da Gemini é 20 MB (prompt + mídias).
      const mediaBytes = history.reduce((n, m) => n + (m.attachments || []).reduce((k, a) => k + (a?.data?.length || 0) * 0.75, 0), 0);
      if (mediaBytes > 18 * 1024 * 1024) {
        return send(res, 200, 'application/json', JSON.stringify({ error: 'mídia grande demais para uma chamada (limite ~18 MB somando os anexos). Reinicie a conversa ou use um arquivo menor.' }));
      }

      const t0 = Date.now();
      const out = await askManu(history, foraDoExpediente, model, usarCache);
      out.ms = Date.now() - t0;

      // --- detecta o sinal de escalada [[ESCALAR: motivo]] ---
      const mEsc = out.text.match(/\[\[\s*ESCALAR\s*:?\s*([^\]]*?)\s*\]\]/i);
      if (mEsc) {
        out.text = out.text
          .replace(/\n*\s*\[\[\s*ESCALAR[^\]]*\]\]\s*/i, '')
          .replace(/\s*\n\s*-{3,}\s*$/, '')  // separador `---` dangling antes do marcador
          .trim();
        st.status = 'escalado';
        st.motivo = (mEsc[1] || '').trim() || 'não informado';
        st.since = Date.now();
        out.escalou = { motivo: st.motivo };
      }
      handoff.set(conversationId, st);
      out.status = st.status;

      // --- tracking de custo ---
      const c = costOfCall(out.model, out.usage);
      const row = {
        ts: new Date().toISOString(),
        conversationId,
        model: out.model,
        thinkingField: out.thinkingField,
        cache: out.cache?.usado || false,
        media: history.some((m) => (m.attachments || []).length),
        rate: c.rate,
        tokens: c.tokens,
        usd: Number(c.usd.toFixed(8)),
        brl: Number(c.brl.toFixed(6)),
        ms: out.ms,
        userTurn: history.filter((m) => m.role === 'client').length,
      };
      try { appendFileSync(CUSTOS_LOG, JSON.stringify(row) + '\n'); } catch (e) { console.warn('  não gravou custo:', e.message); }
      session.calls++;
      session.usd += c.usd;
      session.brl += c.brl;
      out.cost = { usd: c.usd, brl: c.brl, rate: c.rate };
      out.session = { calls: session.calls, usd: session.usd, brl: session.brl };

      return send(res, 200, 'application/json', JSON.stringify(out));
    }

    if (req.method === 'GET' && req.url === '/custos') {
      return send(res, 200, 'text/html; charset=utf-8', custosPage());
    }
    if (req.method === 'GET' && req.url === '/custos.json') {
      return send(res, 200, 'application/json', JSON.stringify(custosResumo()));
    }
    return send(res, 404, 'text/plain', 'não encontrado');
  } catch (err) {
    console.error('  erro:', err.message);
    return send(res, 500, 'application/json', JSON.stringify({ error: err.message }));
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`  ⚠  a porta ${PORT} já está em uso — provavelmente o servidor já está rodando.`);
    console.log(`     abra http://localhost:${PORT} no navegador. (para reiniciar, feche o outro primeiro.)\n`);
    process.exit(0);
  }
  console.error('  erro ao subir o servidor:', err.message);
  process.exit(1);
});
server.listen(PORT);

// Limpa objetos de cache órfãos de execuções anteriores (marcados com nosso displayName).
if (creds) cache.cleanup(creds.key).catch(() => {});

// Ao encerrar limpo (Ctrl+C), apaga os caches que este processo criou.
let encerrando = false;
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    if (encerrando) process.exit(0);
    encerrando = true;
    console.log('\n  encerrando — limpando caches…');
    if (creds) await cache.cleanup(creds.key).catch(() => {});
    process.exit(0);
  });
}
