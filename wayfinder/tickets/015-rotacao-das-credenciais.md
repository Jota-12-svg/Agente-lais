---
id: "015"
title: Decidir a rotação das credenciais expostas
labels: [wayfinder:task]
status: closed
assignee: Claude
blocked-by: ["002"]
---

## Question

As credenciais do `.env` vieram de um projeto anterior e circularam fora de um cofre. Uma
credencial que já apareceu em texto deve ser considerada comprometida — o próprio arquivo
registra que o `SUPABASE_ACCESS_TOKEN` já foi trocado uma vez, em 2026-08-01, "após o
anterior ser exposto no chat".

Bloqueado por [Inventariar e limpar o projeto Supabase](002-limpar-o-projeto-supabase.md)
de propósito: se a decisão lá for **criar um projeto Supabase novo**, as credenciais atuais
morrem junto e este ticket vira quase nada. Rotacionar antes seria trabalho jogado fora.

A decidir, credencial por credencial:

- **`SUPABASE_ACCESS_TOKEN`** — é o mais grave: alcança **todos** os projetos Supabase da
  conta, não só este. Rotacionar, e avaliar se o projeto precisa mesmo dele em runtime ou
  se ele é só ferramenta de CLI que pode viver fora do `.env` da aplicação.
- **`SUPABASE_DB_PASSWORD`** — senha do banco. Trocar pelo painel invalida strings de
  conexão existentes; verificar o que quebra.
- **`SUPABASE_PUBLISHABLE_KEY`** — pública por design, não é segredo. Provavelmente nada a
  fazer, mas confirmar que é mesmo a chave publishable e não uma legada.
- **`KIE_API_KEY`** — chave de LLM, cobrada por uso. Chave vazada é fatura de terceiro.
  Verificar se o painel da kie.ai mostra consumo inesperado antes de trocar.
- **As senhas dos papéis de banco** herdadas do projeto anterior: se aqueles papéis forem
  derrubados na limpeza, as senhas somem com eles.

Decidir também **onde as credenciais passam a morar** em produção — variável de ambiente da
plataforma de hospedagem, gerenciador de segredos, ou `.env` no servidor — porque isso muda
quem precisa ter acesso a elas.

**Resolvido quando** cada credencial tiver um destino decidido e executado. A resolução
registra o que foi rotacionado, o que não foi e por quê.

## Resolução

Nenhuma das credenciais do `.env` é usada por código hoje (busca no repo confirma — só
`GEMINI_API_KEY` é lida, pelo protótipo descartável do 014). O runtime do agente ainda não
existe, então nada quebra em produção com as trocas abaixo. `.env` nunca foi commitado
(`git log --all -- .env` vazio) — a única exposição registrada é a de chat, já sanada.

**Credencial por credencial:**

- **`SUPABASE_ACCESS_TOKEN`** — mantido, sem rotação. Já tinha sido trocado em 2026-08-01
  especificamente por causa de uma exposição em chat; é a versão pós-incidente.
- **`SUPABASE_DB_PASSWORD`** — **rotacionado**. Nunca tinha sido trocado desde a criação do
  projeto (2026-08-01) — o ticket 002 reaproveitou o projeto e registrou "credenciais:
  nenhuma mudou". Trocado via `PATCH /v1/projects/{ref}/database/password` (Management API,
  descoberto nesta sessão — o endpoint genérico `database/query` recusa `ALTER USER` no papel
  `postgres` por ser papel privilegiado). Projeto precisou ser reativado antes (estava
  `INACTIVE`, pausado pelo plano free após uma semana sem uso — ver nota abaixo). `.env`
  atualizado (`SUPABASE_DB_PASSWORD` e `DATABASE_URL_MIGRATIONS`). Não validado por conexão
  Postgres direta (não existe ferramenta de migração ainda para testar) — validado pela
  resposta `200 Successfully updated password` do endpoint oficial.
- **`SUPABASE_PUBLISHABLE_KEY`** — confirmado, já no formato novo (`sb_publishable_...`), não
  é legado. Nenhuma ação — é pública por design.
- **`KIE_API_KEY`** (+ `KIE_BASE_URL`, `KIE_GEMINI_PATH`) — **removidas**, não rotacionadas.
  Confirmado pelo dono: kie.ai não está em uso em lugar nenhum — o papel de "protótipo e
  fallback" do ticket 008 nunca se materializou. Removidas do `.env` e do `.env.example`;
  addendum no [008](008-contrato-da-api-do-gemini.md).
- **`GEMINI_API_KEY`** (fora da lista original do ticket, incluída a pedido do dono por ser a
  credencial mais ativa hoje) — **mantida, sem rotação**. Confirmado pelo dono: criada
  manualmente por ele, funcionando, tier pago confirmado no 017. Achado à parte, registrado
  aqui para acompanhamento futuro (não é decisão deste ticket): a documentação oficial do
  Gemini API mostra que **chaves "Standard" param de funcionar em setembro/2026** — só
  chaves "auth" (vinculadas a service account) continuam aceitas; chaves criadas na AI Studio
  hoje já nascem como "auth" por padrão, então o mais provável é que não haja problema, mas
  isso não foi confirmado diretamente no painel.
- **`AGENT_DB_PASSWORD` / `DATABASE_URL_AGENT`** — **removidas** (não rotacionadas: apagadas).
  Apontavam para o papel `agent_runtime` que o **ticket 002 já derrubou** (`DROP ROLE`, era
  do projeto anterior). Campo deixado em branco de propósito — só é preenchido quando a
  primeira migração deste projeto criar o papel de verdade.
- **`PLATFORM_DB_PASSWORD` / `DATABASE_URL_PLATFORM`** — **removidas**. Mesma situação do
  `agent_runtime`: apontavam para `platform_worker`, também derrubado no 002, e o conceito de
  "papel cross-loja" é resíduo da plataforma multi-loja descartada (`CLAUDE.md`) — não faz
  parte do desenho deste projeto. `.env.example` já não tinha essas variáveis; `.env` estava
  desalinhado dele e foi realinhado.

**Achado colateral, fora do escopo deste ticket, registrado para não perder o fio:**
`LEARNING_MIN_STORES_GLOBAL` e `LEARNING_MIN_CASES_GLOBAL` (seção 5 do `.env`) também têm
cheiro de resíduo multi-loja — não são credencial, então não foram tocadas aqui. Comentário
deixado no próprio `.env` apontando para revisão quando o desenho do laço de aprendizado
(névoa do mapa) for decidido.

**Onde as credenciais moram em produção** (a outra pergunta do ticket): segue **sem decisão**
— condicionada à stack de runtime, que ainda é névoa no mapa. Hoje o `.env` local é o cofre,
por decisão já registrada no `CLAUDE.md`/mapa; quando o runtime for escolhido, essa escolha
(variável de ambiente da hospedagem, gerenciador de segredos, etc.) volta como parte
daquela decisão, não como reabertura deste ticket.

**Descoberta incidental:** o projeto Supabase pausa sozinho (`INACTIVE`) depois de ~1 semana
sem uso, no plano free — vai continuar acontecendo enquanto não houver runtime batendo nele
regularmente. Não é um problema a resolver agora, só um fato a lembrar em sessões futuras que
tentem falar com o banco.
