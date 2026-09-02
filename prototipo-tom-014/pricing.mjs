// Estimativa de custo do Gemini (tier pago / Standard), por 1M de tokens.
//
// ATENÇÃO — calibração (2026-09-02):
// A doc oficial (https://ai.google.dev/gemini-api/docs/pricing) lista, para o
// gemini-3.6-flash, um preço PROMOCIONAL de $0,75 in / $3,75 out "through December 31, 2026".
// Mas o billing real desta conta (painel do AI Studio) subiu ~2× mais rápido que essa
// estimativa num teste com ~7 respostas. Ou seja: a promo NÃO está sendo aplicada a esta
// conta / projeto. Por isso o padrão aqui é o **preço cheio** ($1,50 / $7,50), que bateu com
// o billing observado. Se a sua conta tiver a promo, ajuste com as variáveis de ambiente
// abaixo, ou o multiplicador COST_CALIBRATION.
//
// Variáveis de ambiente que sobrescrevem (todas opcionais, em US$ por 1M de tokens):
//   GEMINI_PRICE_IN, GEMINI_PRICE_OUT, GEMINI_PRICE_CACHE_HIT
//   COST_CALIBRATION   — multiplicador final (ex.: 0.5 se a promo valer; default 1)
//
// O número da FATURA continua sendo o do painel do Google AI Studio. Isto aqui é ordem de
// grandeza e comparação entre modelos.

export const USD_BRL = Number(process.env.USD_BRL) || 5.5; // aproximação
export const CALIBRATION = Number(process.env.COST_CALIBRATION) || 1;

// Preço CHEIO (sem promo) — calibrado ao billing real desta conta.
// cacheHit: preço do token cacheado (prefixo). No 3.6-flash é ~1/10 da entrada.
// No 3.5-flash-lite a página de preços diz "Context caching: Not available" — o cache
// FUNCIONA na API (testado 02/09: cria e devolve cachedContentTokenCount) mas provavelmente
// NÃO tem desconto. Aqui = mesmo preço da entrada, até a fatura confirmar. Ver CUSTOS.md.
const TABLE = {
  'gemini-3.6-flash':       { input: 1.50, output: 7.50, cacheHit: 0.15 },
  'gemini-3.7-flash':       { input: 1.50, output: 7.50, cacheHit: 0.15 },
  'gemini-3.5-flash':       { input: 1.50, output: 9.00, cacheHit: 0.15 },
  'gemini-3.5-flash-lite':  { input: 0.30, output: 2.50, cacheHit: 0.30 }, // sem desconto de cache (ver acima)
  'gemini-3-flash-preview': { input: 0.50, output: 3.00, cacheHit: 0.05 }, // simplificado (áudio tem sobretaxa)
};

export function rateFor(model) {
  // prefixo mais longo primeiro: "gemini-3.5-flash-lite" antes de "gemini-3.5-flash"
  const key = Object.keys(TABLE)
    .sort((a, b) => b.length - a.length)
    .find((k) => (model || '').startsWith(k)) || 'gemini-3.6-flash';
  const base = { ...TABLE[key] };
  if (process.env.GEMINI_PRICE_IN) base.input = Number(process.env.GEMINI_PRICE_IN);
  if (process.env.GEMINI_PRICE_OUT) base.output = Number(process.env.GEMINI_PRICE_OUT);
  if (process.env.GEMINI_PRICE_CACHE_HIT) base.cacheHit = Number(process.env.GEMINI_PRICE_CACHE_HIT);
  return { model: key, ...base };
}

// usage = usageMetadata da resposta. thinking (thoughtsTokenCount) é cobrado como saída
// (research 017 §6). Com thinking_level "minimal" ele volta ausente/0 — confirmado empiricamente.
// cachedContentTokenCount, quando presente, é cobrado no preço de cache em vez de entrada.
export function costOfCall(model, usage = {}) {
  const r = rateFor(model);
  const prompt = usage.promptTokenCount ?? 0;
  const cached = usage.cachedContentTokenCount ?? 0;
  const billedInput = Math.max(0, prompt - cached);
  const output = usage.candidatesTokenCount ?? 0;
  const thoughts = usage.thoughtsTokenCount ?? 0;
  const usd = CALIBRATION * (
    (billedInput / 1e6) * r.input +
    (cached / 1e6) * r.cacheHit +
    ((output + thoughts) / 1e6) * r.output
  );
  return { usd, brl: usd * USD_BRL, rate: r, tokens: { prompt, cached, billedInput, output, thoughts } };
}

export const fmtUsd = (n) => '$' + n.toFixed(n < 0.01 ? 5 : 4);
export const fmtBrl = (n) => 'R$ ' + n.toFixed(n < 0.1 ? 4 : 2).replace('.', ',');
