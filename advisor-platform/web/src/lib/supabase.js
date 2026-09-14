import { createClient } from '@supabase/supabase-js';
import { demoClient } from './demo.js';

const DEMO = ['1', 'true'].includes(String(import.meta.env.VITE_DEMO));

let client;

if (DEMO) {
  // Modo visualização — sem Supabase, dados em memória. Ver demo.js.
  client = demoClient;
} else {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // Falha cedo e clara em vez de um erro obscuro de rede depois.
    throw new Error(
      'Faltam VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Copie web/.env.example para web/.env.local (ou rode com VITE_DEMO=1).',
    );
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = client;
