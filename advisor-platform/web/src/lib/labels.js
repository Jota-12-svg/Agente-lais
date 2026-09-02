// Rótulos em português para os enums do banco (que são em inglês, conforme o CLAUDE.md).
// A consultora só vê o texto em português.

export const MODE_LABEL = {
  consumer: 'Casa própria',
  architect: 'Arquiteto',
};

export const TRIGGER_LABEL = {
  purchase_intent: 'Quer comprar',
  architect: 'Arquiteto com planilha',
  human_requested: 'Pediu uma pessoa',
  irritation: 'Cliente irritado',
  price_negotiation: 'Quer negociar preço',
  qualified: 'Qualificado',
};

// Formulário de fechar — a ordem aqui é a ordem na tela.
export const OUTCOME_OPTIONS = [
  { value: 'sale', label: 'Vendeu' },
  { value: 'store_visit', label: 'Marcou visita' },
  { value: 'no_sale', label: 'Não vendeu' },
  { value: 'lost', label: 'Perdeu o cliente' },
];

export const VERDICT_OPTIONS = [
  { value: 'agent_did_well', label: 'O agente mandou bem' },
  { value: 'agent_hindered', label: 'O agente atrapalhou' },
  { value: '', label: 'Prefiro não dizer' },
];

// "espera há 22 min" / "espera há 1 h 05" / "espera há 2 dias"
export function waitedSince(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  if (h < 24) return `há ${h} h${rem ? ' ' + String(rem).padStart(2, '0') : ''}`;
  const d = Math.floor(h / 24);
  return `há ${d} ${d === 1 ? 'dia' : 'dias'}`;
}

// "14h03"
export function clock(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).replace(':', 'h');
}
