// Estimativa de custo do tier pago (Standard) do Gemini, por 1M de tokens.
// Fonte: research 017 §11.1 — https://ai.google.dev/gemini-api/docs/pricing (2026-09-01).
// É ESTIMATIVA: token count × preço de tabela × câmbio aproximado. O valor de fatura real
// está no painel do Google AI Studio (research 017 §7 e §10.5). Serve para ordem de grandeza
// e para comparar modelos, não para fechar contabilidade.

export const USD_BRL = 5.5; // aproximação — só ordem de grandeza

// promo2026 vale até 31/12/2026; from2027 = preço dobrado dos Flash 3.x (o lite não muda).
const TABLE = {
  'gemini-3.6-flash':        { promo2026: { input: 0.75, output: 3.75, cacheHit: 0.075 }, from2027: { input: 1.5, output: 7.5, cacheHit: 0.15 } },
  'gemini-3.7-flash':        { promo2026: { input: 0.75, output: 3.75, cacheHit: 0.075 }, from2027: { input: 1.5, output: 7.5, cacheHit: 0.15 } },
  'gemini-3.5-flash-lite':   { promo2026: { input: 0.30, output: 2.50, cacheHit: 0.03 },  from2027: { input: 0.3, output: 2.5, cacheHit: 0.03 } },
  'gemini-3.5-flash':        { promo2026: { input: 1.50, output: 9.00, cacheHit: 0.15 },  from2027: { input: 1.5, output: 9.0, cacheHit: 0.15 } },
  'gemini-3-flash-preview':  { promo2026: { input: 0.50, output: 3.00, cacheHit: 0.05 },  from2027: { input: 0.5, output: 3.0, cacheHit: 0.05 } },
};

export function rateFor(model, when = new Date()) {
  const key = Object.keys(TABLE).find((k) => (model || '').startsWith(k)) || 'gemini-3.6-flash';
  const period = when >= new Date('2027-01-01T00:00:00Z') ? 'from2027' : 'promo2026';
  return { model: key, period, ...TABLE[key][period] };
}

// usage = usageMetadata da resposta do Gemini.
// thinking é cobrado como saída (research 017 §6). cache hit desconta da entrada.
export function costOfCall(model, usage = {}, when = new Date()) {
  const r = rateFor(model, when);
  const prompt = usage.promptTokenCount ?? 0;
  const cached = usage.cachedContentTokenCount ?? 0;
  const billedInput = Math.max(0, prompt - cached);
  const output = usage.candidatesTokenCount ?? 0;
  const thoughts = usage.thoughtsTokenCount ?? 0;
  const usd =
    (billedInput / 1e6) * r.input +
    (cached / 1e6) * r.cacheHit +
    ((output + thoughts) / 1e6) * r.output;
  return { usd, brl: usd * USD_BRL, rate: r, tokens: { prompt, cached, billedInput, output, thoughts } };
}

export const fmtUsd = (n) => '$' + n.toFixed(n < 0.01 ? 5 : 4);
export const fmtBrl = (n) => 'R$ ' + n.toFixed(n < 0.1 ? 4 : 2).replace('.', ',');
