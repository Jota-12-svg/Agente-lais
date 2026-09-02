# web — SPA da plataforma das consultoras

Vite + Svelte 5. Uma tela: a fila de chamados. Sem backend — fala direto com o Supabase
pela *publishable key* + RLS.

## Só ver a tela (modo demo, sem Supabase)

```sh
cd advisor-platform/web
npm install
VITE_DEMO=1 npm run dev        # http://localhost:5173
```

Dados fictícios em memória (`src/lib/demo.js`), nada é salvo. O login é um clique
(sem Google de verdade). Serve para visualizar e navegar o fluxo: fila → assumir →
fechar.

## Rodar contra o Supabase de verdade

```sh
cd advisor-platform/web
cp .env.example .env.local     # e preencha as duas variáveis
npm install
npm run dev                    # http://localhost:5173
```

Para o login Google funcionar em local, o `http://localhost:5173` precisa estar em
**Authentication > URL Configuration > Redirect URLs** no painel do Supabase (o
`config.toml` já lista, mas o painel é a fonte da verdade do projeto remoto).

Para ver dados sem o agente: `supabase db reset` aplica `../supabase/migrations` +
`../supabase/seed.sql` (allow-list placeholder + 4 chamados fictícios).

## Build

```sh
npm run build      # gera dist/
```

`dist/` é o que vai para a Cloudflare Pages. Variáveis de build (`VITE_*`) são
configuradas no painel da Pages — ver o wizard do ticket 037.

## O que a tela faz (escopo v1 — ticket 035 §3)

- **Entrar com o Google.** Quem não está na `advisor_allowlist` vê "sem acesso".
- **Ver a fila** — só `pending` + `assumed`, mais antigo no topo, atualiza sozinha (Realtime).
- **Assumir** — carimba quem pegou e a hora. Trava suave: qualquer uma pode devolver à fila.
- **Fechar** — `business_outcome` + `advisor_verdict` + nota. Sai da fila.

Fora do v1: corrigir dado que o agente extraiu, ver a conversa, visão de admin.
