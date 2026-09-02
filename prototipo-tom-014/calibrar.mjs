// Calibra a estimativa de custo contra o billing REAL do Google AI Studio.
//
// Por que: a doc lista preço promocional para o gemini-3.6-flash, mas o billing desta conta
// parece cobrar o preço cheio. Uma medição limpa resolve a dúvida. O billing tem ~10 min de
// atraso, então precisa ser feito sem outra atividade na chave.
//
// Passo a passo:
//   1.  node calibrar.mjs start          → zera o log e explica
//   2.  anote o valor EXATO do painel de billing (https://aistudio.google.com/ → "Gasto da API")
//   3.  converse com a Manu no chat — várias mensagens, de preferência 2-3 conversas
//   4.  espere ~15 min (latência do billing) SEM usar a chave pra mais nada
//   5.  anote o novo valor
//   6.  node calibrar.mjs 0.88 0.97      → compara e diz o que pôr no .env

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { rateFor, fmtBrl, fmtUsd, USD_BRL, CALIBRATION } from './pricing.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOG = join(HERE, 'custos.jsonl');
const [a, b] = process.argv.slice(2);

if (a === 'start') {
  writeFileSync(LOG, '');
  console.log(`
  Log zerado (custos.jsonl).

  1. Abra o painel de billing e ANOTE o valor exato agora:
     https://aistudio.google.com/  →  "Gasto da API Gemini"
  2. Converse com a Manu em http://localhost:4014 — mande várias mensagens.
     (quanto mais tokens, mais precisa fica a medição)
  3. Espere ~15 minutos SEM usar a chave pra mais nada (a Manu, scripts, etc.).
  4. Anote o novo valor do painel.
  5. Rode:  node calibrar.mjs <valor_antes> <valor_depois>
     ex.:   node calibrar.mjs 0,88 0,97
`);
  process.exit(0);
}

if (!a || !b) {
  console.log('\n  uso:  node calibrar.mjs start');
  console.log('        node calibrar.mjs <billing antes> <billing depois>\n');
  process.exit(1);
}

const antes = Number(String(a).replace(',', '.'));
const depois = Number(String(b).replace(',', '.'));
const realBrl = depois - antes;

if (!existsSync(LOG) || !readFileSync(LOG, 'utf8').trim()) {
  console.log('\n  custos.jsonl vazio — rode "node calibrar.mjs start" e converse primeiro.\n');
  process.exit(1);
}

const rows = readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
let tokIn = 0, tokOut = 0, tokThoughts = 0, estBrl = 0;
for (const r of rows) {
  tokIn += r.tokens?.prompt || 0;
  tokOut += r.tokens?.output || 0;
  tokThoughts += r.tokens?.thoughts || 0;
  estBrl += r.brl || 0;
}

let spTok = 0;
try {
  // aproximação: 1 token ~ 3.7 chars deste arquivo em pt-BR
  spTok = Math.round(readFileSync(join(HERE, 'system-prompt.md'), 'utf8').length / 3.7);
} catch {}
const spTotal = spTok * rows.length; // system prompt reenviado em cada chamada

const fator = estBrl > 0 ? realBrl / estBrl : NaN;
const pr = rateFor('gemini-3.6-flash');
// resolve o preço de entrada assumindo a mesma razão saída/entrada (5:1) da tabela
const blendTok = tokIn + (tokOut + tokThoughts) * (pr.output / pr.input);
const realInUsdPerM = blendTok > 0 ? (realBrl / USD_BRL) / (blendTok / 1e6) : NaN;

const p = (s = '') => console.log('  ' + s);
console.log('\n  CALIBRAÇÃO DE CUSTO');
p('─'.repeat(56));
p(`chamadas na janela:   ${rows.length}   (${rows[0].ts.slice(0,16).replace('T',' ')} → ${rows.at(-1).ts.slice(0,16).replace('T',' ')})`);
p('');
p(`tokens de ENTRADA:    ${tokIn.toLocaleString('pt-BR')}`);
p(`  destes, system prompt reenviado:  ~${spTotal.toLocaleString('pt-BR')}  (${Math.round(100*spTotal/Math.max(tokIn,1))}% da entrada!)`);
p(`tokens de SAÍDA:       ${tokOut.toLocaleString('pt-BR')}${tokThoughts ? `  (+ ${tokThoughts} de thinking)` : ''}`);
p('');
p(`estimado por este tracker:  ${fmtBrl(estBrl)}   (preço $${pr.input}/$${pr.output} por 1M, calibração ×${CALIBRATION})`);
p(`REAL (seu billing):         ${fmtBrl(realBrl)}   (${a} → ${b})`);
p('');
if (!isFinite(fator) || realBrl <= 0) {
  p('⚠  delta de billing <= 0 ou inválido. O billing tem ~10 min de atraso —');
  p('   espere mais e tente de novo, sem usar a chave nesse meio-tempo.');
} else {
  p(`FATOR DE CALIBRAÇÃO:   × ${fator.toFixed(2)}`);
  p(`preço de entrada implícito:  ~$${realInUsdPerM.toFixed(2)} / 1M tokens`);
  p(`  (tabela cheia = $1,50 · promo 2026 = $0,75)`);
  p('');
  if (Math.abs(fator - 1) < 0.15) {
    p('✓ a estimativa já está boa (dentro de 15%). Não precisa mexer no .env.');
  } else {
    p('→ ponha no .env (na raiz do projeto ou em prototipo-tom-014/.env.local):');
    p('');
    p(`     COST_CALIBRATION=${fator.toFixed(2)}`);
    p('');
    p('  e reinicie o servidor. Isso multiplica todas as estimativas por esse fator.');
  }
}
p('');
p('Nota: quanto menos tokens na janela, mais o arredondamento do painel (R$ 0,01)');
p('distorce o fator. Rode com 500+ tokens de conversa pra um número confiável.');
console.log('');
