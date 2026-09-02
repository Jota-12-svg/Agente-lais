// Modo DEMO — roda a tela sem Supabase nenhum, com dados em memória.
// Ligado por VITE_DEMO=1. Serve só para visualizar a interface; nada persiste.

const DEMO_EMAIL = 'consultora@demo.local';

const NAMES = {
  'consultora@demo.local': 'GABRIELA',
  'pamella@demo.local': 'PAMELLA',
  'joslaine@demo.local': 'JOSLAINE',
  'lais@demo.local': 'Laís (dona)',
};

const ago = (min) => new Date(Date.now() - min * 60000).toISOString();

let handoffs = [
  {
    id: 'd1', engagement_id: null, created_at: ago(4),
    contact_phone: '+55 69 99161-0001', contact_name: 'Marina Alves',
    summary: 'Quer 2 vasos grandes de chão para a sala de estar',
    desired_timeframe: 'ainda este mês', budget: 'até R$ 4.000',
    engagement_mode: 'consumer', is_returning_client: false, owner_advisor: null,
    trigger: 'qualified', status: 'pending',
    assumed_by: null, assumed_at: null, closed_by: null, closed_at: null,
    business_outcome: null, advisor_verdict: null, advisor_verdict_note: null,
  },
  {
    id: 'd2', engagement_id: null, created_at: ago(23),
    contact_phone: '+55 69 99161-0002', contact_name: 'Escritório TRAMA Arquitetura',
    summary: 'Mandou planilha com 18 itens para um apartamento em Porto Velho',
    desired_timeframe: 'orçamento em 1 semana', budget: null,
    engagement_mode: 'architect', is_returning_client: false, owner_advisor: 'GABRIELA',
    trigger: 'architect', status: 'pending',
    assumed_by: null, assumed_at: null, closed_by: null, closed_at: null,
    business_outcome: null, advisor_verdict: null, advisor_verdict_note: null,
  },
  {
    id: 'd3', engagement_id: null, created_at: ago(65),
    contact_phone: '+55 69 99161-0003', contact_name: 'Rafael Siqueira',
    summary: 'Perguntou o preço de uma mesa de jantar de 8 lugares e quer negociar',
    desired_timeframe: 'sem pressa', budget: 'R$ 8.000 a R$ 12.000',
    engagement_mode: 'consumer', is_returning_client: false, owner_advisor: null,
    trigger: 'price_negotiation', status: 'assumed',
    assumed_by: 'pamella@demo.local', assumed_at: ago(55),
    closed_by: null, closed_at: null,
    business_outcome: null, advisor_verdict: null, advisor_verdict_note: null,
  },
  {
    id: 'd4', engagement_id: null, created_at: ago(11),
    contact_phone: '+55 69 99161-0004', contact_name: 'Carla Menezes',
    summary: 'Quer ir à loja no sábado ver luminárias pessoalmente',
    desired_timeframe: 'sábado', budget: null,
    engagement_mode: 'consumer', is_returning_client: false, owner_advisor: null,
    trigger: 'purchase_intent', status: 'pending',
    assumed_by: null, assumed_at: null, closed_by: null, closed_at: null,
    business_outcome: null, advisor_verdict: null, advisor_verdict_note: null,
  },
];

let realtimeListeners = [];
const fireRealtime = () => realtimeListeners.forEach((fn) => fn({}));
const ok = (data) => Promise.resolve({ data, error: null });
const clone = (x) => JSON.parse(JSON.stringify(x));

class Query {
  constructor(table) {
    this.table = table;
    this._filters = [];
    this._order = null;
    this._single = false;
  }
  select() { return this; }
  in(col, vals) { this._filters.push((r) => vals.includes(r[col])); return this; }
  eq(col, val) { this._filters.push((r) => r[col] === val); return this; }
  order(col, opts = {}) { this._order = { col, asc: opts.ascending !== false }; return this; }
  maybeSingle() { this._single = true; return this._run(); }

  update(patch) {
    return {
      eq: (col, val) => {
        handoffs = handoffs.map((h) => (h[col] === val ? { ...h, ...patch } : h));
        fireRealtime();
        return ok(null);
      },
    };
  }

  _rows() {
    let rows =
      this.table === 'handoffs'
        ? handoffs.map(clone)
        : Object.entries(NAMES).map(([email, name]) => ({ email, name }));
    rows = rows.filter((r) => this._filters.every((f) => f(r)));
    if (this._order) {
      const { col, asc } = this._order;
      rows.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
    }
    return rows;
  }
  _run() {
    const rows = this._rows();
    return ok(this._single ? rows[0] ?? null : rows);
  }
  then(resolve, reject) { return this._run().then(resolve, reject); }
}

let session = null;
let authCb = null;

export const demoClient = {
  auth: {
    async getSession() { return { data: { session }, error: null }; },
    onAuthStateChange(cb) {
      authCb = cb;
      return { data: { subscription: { unsubscribe() { authCb = null; } } } };
    },
    async signInWithOAuth() {
      session = { user: { email: DEMO_EMAIL } };
      authCb?.('SIGNED_IN', session);
      return { data: {}, error: null };
    },
    async signOut() {
      session = null;
      authCb?.('SIGNED_OUT', null);
      return { error: null };
    },
  },
  from(table) { return new Query(table); },
  channel() {
    const cbs = [];
    return {
      on(_evt, _filter, cb) { cbs.push(cb); return this; },
      subscribe() { realtimeListeners.push(...cbs); this._cbs = cbs; return this; },
      _cbs: cbs,
    };
  },
  removeChannel(ch) {
    realtimeListeners = realtimeListeners.filter((l) => !ch._cbs.includes(l));
  },
};
