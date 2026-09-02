import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // Falha cedo e clara em vez de um erro obscuro de rede depois.
  throw new Error(
    'Faltam VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Copie web/.env.example para web/.env.local.',
  );
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
