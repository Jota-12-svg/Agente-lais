import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// SPA estática — build vai para dist/, hospedada em Cloudflare Pages (ticket 037).
export default defineConfig({
  plugins: [svelte()],
  build: { target: 'es2022' },
});
