// Cache de prefixo (context caching) — registra o system prompt ESTÁTICO num objeto
// `cachedContents` da Google e referencia por id nas chamadas, em vez de reenviar o texto
// inteiro. No gemini-3.6-flash o token cacheado custa ~1/10 da entrada.
//
// Regras que este módulo respeita (validadas em CUSTOS.md / CUSTOS-api-referencia.md):
//  - o cache guarda SÓ o system prompt estático. Data/hora e estado da loja são dinâmicos e
//    vão em `contents`, nunca aqui (senão o prefixo muda a cada chamada e não há hit).
//  - `systemInstruction`, `tools` e `tool_config` NÃO podem acompanhar `cachedContent` numa
//    chamada — tudo isso mora dentro do objeto de cache.
//  - um objeto de cache é por-modelo (`models/<modelo>`).
//  - os objetos são marcados com displayName "prototipo-tom-014" para a limpeza saber quais
//    são nossos.

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const TAG = 'prototipo-tom-014';
const TTL_SEC = 1800;              // 30 min
const RENEW_BEFORE_MS = 120_000;  // recria quando faltam < 2 min

const registry = new Map(); // modelo -> { name, expiresAt, inflight }

async function apiCreate(model, apiKey, systemText) {
  const r = await fetch(`${BASE}/cachedContents`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      model: `models/${model}`,
      displayName: TAG,
      systemInstruction: { parts: [{ text: systemText }] },
      ttl: `${TTL_SEC}s`,
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`cache create ${r.status}: ${d.error?.message || JSON.stringify(d)}`);
  return { name: d.name, tokens: d.usageMetadata?.totalTokenCount ?? null };
}

async function apiDelete(name, apiKey) {
  try {
    await fetch(`${BASE}/${name}`, { method: 'DELETE', headers: { 'x-goog-api-key': apiKey } });
  } catch { /* best-effort */ }
}

/** Retorna o `cachedContents/<id>` para o modelo, criando/renovando se preciso. */
export async function getPrefixCache(model, apiKey, systemText) {
  const now = Date.now();
  const cur = registry.get(model);
  if (cur?.name && cur.expiresAt - now > RENEW_BEFORE_MS) return cur.name;
  if (cur?.inflight) return cur.inflight;

  const inflight = (async () => {
    if (cur?.name) await apiDelete(cur.name, apiKey); // renovação = recria (simples e barato)
    const { name, tokens } = await apiCreate(model, apiKey, systemText);
    registry.set(model, { name, tokens, expiresAt: Date.now() + TTL_SEC * 1000 });
    console.log(`  cache criado: ${name}  (${model}, ${tokens} tok, ttl ${TTL_SEC}s)`);
    return name;
  })();

  registry.set(model, { ...(cur || {}), inflight });
  try {
    return await inflight;
  } catch (e) {
    registry.delete(model);
    throw e;
  }
}

/** Chamar quando uma resposta indicar que o cache sumiu (404/PERMISSION_DENIED). */
export function invalidate(model) {
  registry.delete(model);
}

export function status() {
  return [...registry.entries()].map(([model, v]) => ({
    model,
    name: v.name || null,
    tokens: v.tokens ?? null,
    expiresInSec: v.expiresAt ? Math.max(0, Math.round((v.expiresAt - Date.now()) / 1000)) : null,
  }));
}

/** Apaga todos os objetos de cache com o nosso displayName (na conta toda). */
export async function cleanup(apiKey) {
  // apaga os que este processo criou
  for (const [, v] of registry) if (v.name) await apiDelete(v.name, apiKey);
  registry.clear();
  // varre órfãos de execuções anteriores
  try {
    const r = await fetch(`${BASE}/cachedContents?pageSize=100`, { headers: { 'x-goog-api-key': apiKey } });
    const d = await r.json().catch(() => ({}));
    for (const c of d.cachedContents || []) {
      if (c.displayName === TAG && c.name) await apiDelete(c.name, apiKey);
    }
  } catch { /* best-effort */ }
}
