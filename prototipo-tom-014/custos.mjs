// Resumo dos custos registrados em custos.jsonl.  Uso:  node custos.mjs
// Estimativa (tokens × preço de tabela × câmbio). Fatura real: painel do Google AI Studio.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fmtUsd, fmtBrl, USD_BRL, CALIBRATION, rateFor } from './pricing.mjs';

const LOG = join(dirname(fileURLToPath(import.meta.url)), 'custos.jsonl');

if (!existsSync(LOG)) {
  console.log('\n  Nenhum custo registrado ainda (custos.jsonl não existe).');
  console.log('  Rode o servidor e converse com a Manu primeiro.\n');
  process.exit(0);
}

const rows = readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

const t = { usd: 0, brl: 0, in: 0, out: 0, think: 0 };
const porModelo = {};
const porConversa = {};
for (const r of rows) {
  t.usd += r.usd; t.brl += r.brl;
  t.in += r.tokens?.prompt || 0; t.out += r.tokens?.output || 0; t.think += r.tokens?.thoughts || 0;
  (porModelo[r.model] ||= { n: 0, usd: 0, brl: 0 });
  porModelo[r.model].n++; porModelo[r.model].usd += r.usd; porModelo[r.model].brl += r.brl;
  (porConversa[r.conversationId] ||= { n: 0, brl: 0, ts: r.ts });
  porConversa[r.conversationId].n++; porConversa[r.conversationId].brl += r.brl;
}
const conversas = Object.values(porConversa);
const mediaChamada = t.brl / rows.length;
const mediaConversa = t.brl / conversas.length;
const projMes = mediaChamada * 8 * 10 * 26; // 8 msg/atendimento × 10/dia × 26 dias (seg–sáb)
const pr = rateFor('gemini-3.6-flash');

const p = (s) => console.log('  ' + s);
console.log('\n  CUSTOS — protótipo de tom da Manu   (câmbio ~R$ ' + USD_BRL + '/US$)');
p('─'.repeat(58));
p(`período:   ${rows[0].ts.slice(0, 16).replace('T', ' ')}  →  ${rows.at(-1).ts.slice(0, 16).replace('T', ' ')}`);
p(`chamadas:  ${rows.length}   ·   conversas: ${conversas.length}`);
p('');
p(`TOTAL:               ${fmtUsd(t.usd)}   ${fmtBrl(t.brl)}`);
p(`média por mensagem:  ${fmtUsd(t.usd / rows.length)}   ${fmtBrl(mediaChamada)}`);
p(`média por conversa:  ${fmtBrl(mediaConversa)}`);
p('');
p('por modelo:');
for (const [m, v] of Object.entries(porModelo)) p(`  ${m.padEnd(24)} ${String(v.n).padStart(4)} ch.   ${fmtBrl(v.brl)}`);
p('');
p(`tokens:  entrada ${t.in.toLocaleString('pt-BR')}   saída ${t.out.toLocaleString('pt-BR')}   pensamento ${t.think.toLocaleString('pt-BR')}`);
p('');
p(`preço usado:  $${pr.input}/1M entrada · $${pr.output}/1M saída · calibração ×${CALIBRATION}`);
p(`projeção grosseira:  ~${fmtBrl(projMes)}/mês  (8 msg/atendimento × 10/dia × 26 dias)`);
p('  SEM cache de prefixo (o protótipo reenvia o system prompt inteiro a cada turno).');
p('  Em produção o prompt cacheado derruba a entrada — ver research 017 §11.4 (~R$ 28/mês).');
p('');
p('Calibração: compare o TOTAL acima com o delta do painel de billing do Google AI Studio');
p('(tem ~10 min de atraso). Se divergir, ajuste COST_CALIBRATION no .env e rode de novo.');
console.log('');
