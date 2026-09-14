# Tracker — Agente de WhatsApp da Lais Aliski Casa

Tracker local em markdown (nenhum tracker de issues foi configurado neste repositório).

- O **mapa** é [`map.md`](map.md) — destino, notas, decisões tomadas, névoa e fora de escopo.
- Cada **ticket** é um arquivo em [`tickets/`](tickets/), com `status`, `labels`,
  `assignee` e `blocked-by` no frontmatter.
- Um ticket está **desbloqueado** quando todos os tickets em `blocked-by` estão fechados.
- A **fronteira** são os tickets abertos, desbloqueados e sem `assignee` — é de lá que a
  próxima sessão puxa trabalho.
- Para **reivindicar** um ticket, preencha `assignee` antes de começar. Ao resolver:
  registre a resposta no fim do arquivo sob `## Resolução`, mude `status` para `closed` e
  acrescente uma linha em **Decisions so far** no mapa.

## Fronteira — pode ser puxado agora

| # | Ticket | Tipo |
|---|---|---|
| 046 | [Endurecer o runtime do agente — estado persistido, idempotência e deploy automático](tickets/046-endurecer-runtime-estado-idempotencia-deploy.md) | task · **in-progress** — item 1 (`engagements`) fechado por grilling e **codificado** (2026-09-14), falta só aplicar a migration/segredo em produção (ação humana, ver ticket); itens 2 (idempotência) e 3 (deploy automático) seguem sem tocar |
| 021 | [Instagram como porta de entrada para o WhatsApp](tickets/021-instagram-porta-de-entrada.md) | task |
| 038 | [Estratégia de rollout do agente — piloto, horário, fallback, canal de erro](tickets/038-estrategia-de-rollout.md) | grilling · **in-progress** |
| 039 | [Laço de contexto — o contexto do agente evoluindo com os atendimentos](tickets/039-laco-de-contexto-do-agente.md) | grilling · trazido da reconciliação do 014; não urgente, refinamento contínuo |

> **041 fechado** (2026-09-14): o dono decidiu conscientemente **não** converter pra
> pré-pagamento agora — investigado antes (só leitura, nada confirmado): a troca é via de mão
> única, exige comprar crédito, mas **não afeta** rate limit nem o `serviceTier: standard`
> (LGPD, 017/018). Risco aceito: se faltar conversão, a Google avisa "interrupções no
> serviço" — na prática o Gemini pode parar de responder a Manu; troca reativa se acontecer.
> Ver `## Resolução` no ticket.
>
> **044 fechado** (2026-09-14): adotado o runtime provisório (`agente-runtime/`) como a v1 —
> o critério "Resolvido quando" já tinha sido cumprido ao vivo em produção (09-11/12). Três
> entregas do desenho original (estado de conversa em Supabase, idempotência, deploy via
> GitHub) viraram o **046**. Ver `## Resolução` no ticket.
>
> **046 item 1 fechado por grilling e codificado** (2026-09-14): esquema de `engagements`
> decidido (8 perguntas) e implementado (migrations + `engagement-writer.mjs` + `index.js`) —
> falta só aplicar em produção (ação humana, ver seção "Pendente" do ticket). Itens 2/3 não
> tocados.
>
> **042 fechado** (2026-09-11, grilling): a **última névoa grande de arquitetura do mapa**
> fechou. Runtime = processo único (WhatsApp + qualificação + Gemini), novo serviço no mesmo
> projeto Railway da plataforma das consultoras; sessão do WhatsApp e estado da conversa no
> **Supabase**, não em disco; freio de mão (036) integra via Realtime; watchdog do 038 é
> uptime monitoring externo (UptimeRobot/Better Stack) com SMS/Telegram, não o healthcheck
> nativo do Railway (só atua no deploy); segredos em variáveis de ambiente do serviço Railway,
> isoladas da plataforma — resolve a pendência do **015**. Dá lugar concreto para a chamada de
> escrita do **031**. Ver `## Resolução` no ticket para os fatos e fontes.
>
> **027 fechado** (2026-09-11/12): testado ao vivo, sem chip comprado a tempo (research
> 043) — o dono aceitou testar no **próprio número pessoal**, WhatsApp comum, ciente do risco
> do research 028. **Os seis pontos passaram**: pareamento sem travar no passkey, dispositivos
> sobreviventes, evento de companion confirmado 3×, sem erro 463 (contato novo, resposta
> observada), sem sinal de risco em ~20min contínuos (incluindo um restart), marca de não-lida
> sincronizando. **Recomendação: viável ir para o número real da loja.** Ver `## Resolução`
> no ticket para o detalhe item a item e a ressalva sobre fidelidade do teste (WhatsApp comum,
> não Business; poucos companions reais).
>
> **Runtime provisório em construção, fora do 044 formal** (2026-09-11/12, mesma sessão): o
> dono decidiu ir direto ao número real da loja no mesmo dia, sem esperar a versão definitiva
> do [044](tickets/044-construir-runtime-do-agente.md) (que segue reivindicado, em construção
> **noutra sessão em paralelo** — cuidado com duplicação). Criado `agente-runtime/` — Baileys +
> Gemini + escrita real na fila (031) + assinatura Realtime do freio de mão (036, tabela
> `agent_settings`), tudo num processo só, respondendo qualquer cliente real (não restrito a um
> jid, ao contrário do `manu-live-bridge.mjs` usado no teste pessoal). **Faltas conhecidas,
> registradas de propósito, que o 044 formal ainda resolve**: auth do Baileys em disco (não
> Supabase — todo redeploy sem Volume pede QR de novo), estado de conversa em memória (não
> Supabase — perde tudo num restart), sem idempotência na escalada, sem watchdog SMS/Telegram.
> **Achado no caminho**: `agent_settings` tinha RLS restrita a advisors autenticados — o
> runtime não faz login Google, então nunca lia a flag. Migração
> `20260911190500_agent_settings_public_read.sql` abre SELECT público (só leitura; UPDATE
> continua restrito à allow-list) — **aplicada em produção em 2026-09-12** (sessão seguinte,
> sem o bloqueio de permissão que a sessão 13/14 tinha documentado; bookkeeping da migração
> anterior, aplicada via Management API, precisou de `supabase migration repair` primeiro).
>
> **2026-09-12: `agente-runtime/` publicado no Railway, no ar.** Novo serviço `agente-runtime`
> no mesmo projeto (`plataforma-consultoras-lais`), com **Volume persistente em `/data`**
> (`AUTH_DIR=/data/auth` — sem isso todo redeploy pede QR de novo). Domínio público:
> `https://agente-runtime-production.up.railway.app` (`/health` responde, freio de mão lido
> certo). **Achado de deploy, vale para qualquer serviço novo deste monorepo**: `railway up`
> por padrão sobe a raiz do repositório git inteira (não o cwd), fazendo o Railpack falhar por
> não achar um único projeto reconhecível — a flag `--path-as-root` resolve
> (`railway up ./agente-runtime --path-as-root --service agente-runtime`). **Rotação**:
> `HANDOFF_INSERT_SECRET` apareceu em texto (achado incidental ao investigar por que a variável
> não estava no `.env` principal — estava presa no `.env` de uma worktree órfã) e foi trocado
> por decisão do `CLAUDE.md` (§4) — valor novo gravado na função `handoffs_insert` e nas
> variáveis do serviço Railway, nunca colado em texto.
>
> **Falta só a ação física**: abrir `/qr` (ou mandar o link pras consultoras) e vincular o
> **WhatsApp real da loja** — decisão que espera confirmação explícita do dono sobre o momento
> (fora do horário de atendimento, plano de reverter em mente, mesmo cuidado do item 5 do 027).
> Sem isso o runtime fica "conectando" indefinidamente, sem responder ninguém de verdade.
>
> **2026-09-12, sessão seguinte: bug de áudio corrigido, novo ticket 045 aberto.** O runtime
> (`agente-runtime/index.js` e `manu-live-bridge.mjs`) só extraía texto de
> `conversation`/`extendedTextMessage` — nota de voz do cliente caía num `if (!texto) continue`
> e era descartada em silêncio, contrariando o comportamento já fechado no
> [014](014-como-o-agente-soa.md). Corrigido: baixa o buffer via `downloadMediaMessage`
> (Baileys) e manda como `inlineData` pro Gemini, mesmo contrato validado no
> [018](018-validar-contrato-do-llm.md) (OGG/Opus sem transcodificar). Registrado como lacuna
> a portar no **044** (não era esquecimento consciente — ver o próprio ticket). Grilling do
> mesmo pedido abriu o **045** (botão "devolver ao agente" na plataforma) e um addendum no
> **012** (terceira exceção ao "caminho de volta"). **Correção do dono, mesma sessão**: o
> critério da exceção não é "só antes da consultora responder" — é **sem restrição**, mesma
> confiança já dada ao "Devolver à fila" de hoje; 012 e 045 atualizados.
>
> **045 fechado na mesma sessão, mais tarde** — o dono pediu pra construir já, sem esperar o
> 044 (revertendo a decisão original de esperar). Junto, dois pedidos irmãos: "fechar chamado"
> agora reinicia o atendimento do zero na próxima mensagem do cliente (addendum novo no 012,
> distinto da janela de retomada de 3 dias), e o telefone na plataforma deixa de mostrar
> "LID:..." quando consegue resolver o número de verdade (best-effort — WhatsApp não garante).
> Mecanismo: `contact_jid` novo em `handoffs` + poll a cada 15s numa RPC secret-gated
> (`handoffs_status_for_jids`), não Realtime — `handoffs` tem PII, ao contrário de
> `agent_settings`. **Achado no caminho, tratado na hora**: consultar a definição da função
> `handoffs_insert` via Management API devolveu o `HANDOFF_INSERT_SECRET` em texto na sessão —
> rotacionado de novo (segunda vez no dia; primeira foi a da worktree órfã, sessão da manhã),
> valor novo aplicado nas duas funções (`handoffs_insert` e a nova `handoffs_status_for_jids`)
> e no Railway, nunca reimpresso depois de gerado.
>
> **038 — grilling feito, ticket ainda aberto** (2026-09-10): a **estratégia de rollout** foi
> grelhada por inteiro com o dono (3 rodadas) e as decisões estão no ticket sob
> `## Decisões do grilling`. Piloto = agente 24/7 + as três consultoras desde o dia 1 (sem
> madrinha, sem horário restrito — **reverte o "piloto com uma consultora" da névoa**),
> 4 semanas + checagem; canal de erro = "reportar problema" na plataforma (037); fallback via
> watchdog→dono e freio de mão. **Segue `in-progress` por decisão do dono** — falta amarrar o
> watchdog/SMS (← runtime) e o incremento no 037. **Gate de entrada:** itens 4 (011) e 5 (014)
> já fecharam (2026-09-11); só o item 3 (027) segue aberto. **Não propagado ao map/036/037/034
> até fechar.**
>
> **031 avançado, ainda aberto** (2026-09-11): o mecanismo de autenticação do `INSERT` na fila
> foi decidido (grilling) e **testado ao vivo** — RPC Postgres `security definer` gateada por
> segredo (`HANDOFF_INSERT_SECRET`), chamada por HTTPS com a publishable key, sem senha de
> banco nem service role no código. Ligado ao `prototipo-tom-014/`: conversei de verdade com a
> Manu, ela escalou, o chamado apareceu sozinho na fila da plataforma via Realtime — duas vezes,
> incluindo nome do cliente. Falta só o runtime real (névoa do mapa) chamar o mesmo caminho.
>
> **037 fechado** (2026-09-11, task): a plataforma das consultoras foi **implantada de verdade e
> testada de ponta a ponta** — Railway (não Cloudflare Pages, decisão do dono, sem domínio
> próprio): https://plataforma-consultoras-production.up.railway.app. Login Google (mesmo
> projeto do Gemini, modo Testing), migração `handoffs`/RLS aplicada no Supabase de produção,
> fluxo completo validado (fila → assumir → fechar com desfecho+veredito → some da fila). Dois
> bugs reais corrigidos no caminho: `skip_nonce_check` duplicada no `config.toml` (quebrava
> `supabase link`) e histórico de migração órfão do projeto anterior (3 entradas sem tabela por
> trás, resíduo que o 002 não alcançou). **Canal de aviso por e-mail caiu do escopo do v1** —
> decisão do dono: as consultoras não checam e-mail, o sinal real é o "não lida" do WhatsApp
> (item 6 do 027, ainda não validado); responde de quebra a pergunta 34 do 020. Allow-list com
> 2 dos 4 e-mails reais (falta o da Lais; a Pamella usa Outlook sem Conta Google vinculada).
> Perde "037" do `blocked-by` do **034**.
>
> **040 fechado** (2026-09-11, task): a `GEMINI_API_KEY` é do tipo **"auth"** — confirmado via
> console do Google Cloud (chave com conta de serviço vinculada), já que o AI Studio não
> mostra a coluna "Tipo de chave" nesta conta. Nada a trocar; sobrevive ao corte de
> setembro/2026. Achado à parte no mesmo painel: aviso de faturamento pedindo migração para
> pré-pagamento — abriu o **041**, sem relação com o tipo da chave.
>
> **015 fechado** (2026-09-11, task): senha do banco rotacionada (nunca tinha sido trocada);
> `SUPABASE_ACCESS_TOKEN` e `GEMINI_API_KEY` confirmados limpos, sem rotação; `KIE_API_KEY`
> removido (fallback nunca usado, addendum no 008); resíduo de papéis já derrubados pelo 002
> (`agent_runtime`/`platform_worker`) limpo do `.env`. Onde as credenciais moram em produção
> segue condicionado à stack de runtime (névoa). Abriu o **040** (checar se a
> `GEMINI_API_KEY` é do tipo "auth" antes do prazo de setembro/2026 — achado do 015, não
> bloqueava seu fechamento).
>
> **011 fechado** (2026-09-11, grilling): ratificou como decisão explícita o que já estava
> implementado de fato no `prototipo-tom-014/system-prompt.md` — nunca preço/medida/material
> de peça específica, foto nunca reconhecida (sempre escala), alçada de desconto zero,
> contenção de erro pelo mecanismo pós-hoc do 038 com prioridade mais alta para erro de
> produto dentro do canal "reportar problema". Desbloqueou o **034** (perde "011" do
> `blocked-by`) e deixou requisito de conteúdo registrado no **037**.
>
> **033 fechado** (2026-09-02, grilling): a **forma** do manual está decidida — um documento,
> duas partes (A "o que o agente faz" / B "no dia a dia"), Google Doc, tom concreto com prints
> do 014, quatro pedidos à consultora + seção do freio de mão. A **redação** é o ticket
> **034** (Bloqueados), por 036, 037 e pela estratégia de rollout — **014 e 011 saíram do
> bloqueio, ambos fecharam em 2026-09-11**.
>
> **036** e **037** nascem/ficam bloqueados pela stack de runtime (névoa do mapa) — ver
> Bloqueados. O **036** (freio de mão global) foi separado do 012 numa branch paralela e se
> perdeu ao re-aplicar o 012 na trunk; requisito já decidido, não é design novo.
>
> **004 foi dividido** (2026-08-30): a planilha de clientes foi inspecionada e o 004 fechou; o
> catálogo do Mainô e as planilhas de arquiteto foram para o **032**, que **fechou em
> 2026-09-11 sem buscar os dois materiais** (decisão do dono — não vamos precisar do Mainô) e
> desbloqueou o **011**, agora na fronteira. A origem do conhecimento de produto que o 011
> ainda precisava (site + categorias/posicionamento, não o Mainô) já tinha sido respondida
> numa grelha de 2026-09-02 na branch do 014, recuperada nesta reconciliação.
>
> **014 reconciliado e fechado nesta sessão** (2026-09-11): a branch paralela
> `wayfinder/como-o-agente-soa-014` estava parada desde 2026-09-02, sem worktree ativo.
> Trazido para a trunk: `prototipo-tom-014/` (ambiente de teste ao vivo com a Manu), a
> especificação de tom v1 + sete transcrições no próprio ticket, a correção de nome/contexto
> da loja (**Lais Aliski Casa**, dona Lais Aliski que não atende, três consultoras nomeadas —
> Pamella, Gabriela/Gabi, Joslaine, corrigindo o 009) propagada a
> `CONTEXT.md`/`CLAUDE.md`/`.env.example` e a todo ticket e research não datado (handovers
> antigos ficam como registro). O ticket "033" que essa branch tinha aberto ("laço de contexto
> do agente") colidia em número com o 033 da trunk — renumerado para **039**. As sete
> "Perguntas para o dono" do próprio 014 foram respondidas na sequência (nome **Manu**, preço
> nunca, áudio nunca, 1–3 min, emoji como proposto, sempre "você", sempre se apresenta) —
> todas confirmaram a proposta v1, sem mudar o protótipo. **014 fechado.**

## Bloqueados

| # | Ticket | Tipo | Espera |
|---|---|---|---|
| 019 | [De quais dispositivos a consultora pode responder sem cegar o agente](tickets/019-companion-windows-ponto-cego.md) | task | **em pausa** — premissa (Coexistence) não é mais o caminho; ver 016 |
| 034 | [Redigir o manual do agente para as consultoras](tickets/034-redigir-o-manual-do-agente.md) | task | 036 + estratégia de rollout (névoa) — forma decidida no 033, falta a redação; 014, 011 e 037 saíram do bloqueio (todos fecharam 2026-09-11) |
| 031 | [Implementar a escrita do chamado do agente na fila (INSERT no Supabase)](tickets/031-implementar-escrita-do-chamado-na-fila.md) | task | o runtime real já chama `handoffs_insert` com telefone verdadeiro (testado ao vivo) — falta só a **idempotência** (→ 046) e `chatModify markRead:false` (solto, não depende do 046) |
| 036 | [Freio de mão global — desligamento de emergência do agente](tickets/036-freio-de-mao-global.md) | task | **044** — mecanismo, esquema e UI já construídos e testados de ponta a ponta (2026-09-11); falta só o runtime assinar a flag e provar que o agente se cala |

## Fechados

| # | Ticket | Tipo | Descobertas |
|---|---|---|---|
| 045 | [Botão "Devolver ao agente" nos chamados da plataforma](tickets/045-devolver-chamado-ao-agente.md) | task | construído em 2026-09-12 direto no provisório (dono pediu pra não esperar o 044); status novo `returned_to_agent`; correlação por `contact_jid` + poll numa RPC secret-gated (`handoffs_status_for_jids`, sem PII) em vez de Realtime, porque `handoffs` tem dado real de cliente; mesmo mecanismo resolve "fechar chamado reinicia o atendimento" (addendum no 012) e telefone `@lid` resolvido best-effort |
| 044 | [Construir o runtime do agente — v1](tickets/044-construir-runtime-do-agente.md) | task | fechado adotando o provisório (`agente-runtime/`) como v1 — critério "Resolvido quando" já cumprido ao vivo em produção (09-11/12); adapter de auth Supabase virou Volume Railway (equivalente aceito); estado de conversa em Supabase, idempotência e deploy via GitHub adiados para o **046** (esquema de `engagements` ainda não decidido); desbloqueia item 7 do gate do 038 |
| 041 | [Colocar a conta de faturamento do Gemini em pré-pagamento antes que o serviço pare](tickets/041-billing-pre-pagamento.md) | task | dono decidiu conscientemente manter pós-pagamento — Tier 1, Google migrando contas de Postpay pra Prepay (rollout de março/2026), troca é via de mão única e exige comprar crédito; confirmado direto na tela da Google que não afeta rate limit nem `serviceTier: standard` (LGPD); risco aceito de "interrupção no serviço" se não converter, troca reativa se acontecer |
| 001 | [Inicializar o repositório e proteger os segredos](tickets/001-repositorio-e-protecao-dos-segredos.md) | task | — |
| 003 | [Conseguir a exportação das conversas das consultoras](tickets/003-exportacao-das-conversas-das-consultoras.md) | task | exportação inviável; substituída pela análise do dono via grilling — desbloqueou 010, 013, 014 |
| 004 | [Inspecionar a planilha de carteira/mailing de clientes](tickets/004-acesso-a-planilha-e-ao-catalogo.md) | task | dividido; planilha é diretório de arquitetos + mailing, não CRM de consumidor final; lookup "já é cliente" do 010 não se sustenta; catálogo + planilha de arquiteto → 032; desbloqueou 030, 031 |
| 005 | [Como levar o agente ao WhatsApp sem tirar o Business das consultoras](tickets/005-caminho-de-integracao-com-o-whatsapp.md) | research | [research/005](research/005-integracao-whatsapp.md); recomendação de Coexistence revertida pelo 016 |
| 006 | [O que a integração com Google Calendar exige](tickets/006-integracao-com-google-calendar.md) | research | [research/006](research/006-google-calendar.md) |
| 007 | [O Maino tem API? O que dá para ler de lá](tickets/007-maino-tem-api.md) | research | [research/007](research/007-maino-api.md) |
| 008 | [Contrato real da API do Gemini via kie.ai](tickets/008-contrato-da-api-do-gemini.md) | research | [research/008](research/008-gemini-kie-ai.md) |
| 009 | [Como funciona o atendimento da Lais Aliski Casa hoje, ponta a ponta](tickets/009-como-funciona-o-atendimento-hoje.md) | grilling | vocabulário em [`CONTEXT.md`](../CONTEXT.md); abriu 019, 020 e 021 |
| 010 | [O que é um lead qualificado e que dados o agente extrai](tickets/010-o-que-e-um-lead-qualificado.md) | grilling | agente não é formulário; campos núcleo + oportunistas, nada obrigatório; Supabase interno + relance na fila do 012; `Atendimento qualificado` no `CONTEXT.md` · **addendum 2026-09-01**: lookup por telefone só p/ diretório de arquitetos, pergunta do modo deliberada |
| 017 | [Decidir o provedor de LLM e habilitar o billing](tickets/017-provedor-de-llm-e-billing.md) | task | chave do `.env` já no tier pago (`serviceTier: standard`); modelo `gemini-3.6-flash` (o `gemini-3-flash` do 008 sumiu), `thinking_level: "minimal"`; `flash-lite` como plano B; research 017 — desbloqueou 018 |
| 018 | [Validar empiricamente o contrato do LLM](tickets/018-validar-contrato-do-llm.md) | task | function calling OK em HTTP cru (mas `thoughtSignature` das `functionCall` é obrigatório no reenvio, senão 400); áudio OGG/Opus inline sem ffmpeg; HEIC OK; cache mínimo 1024 (não 4096); áudio 25 tok/s (não 32); `minimal` vs `low` = 540 tokens + 3× latência |
| 002 | [Inventariar e limpar o projeto Supabase](tickets/002-limpar-o-projeto-supabase.md) | task | schema `app` e papéis do projeto anterior apagados; banco em estado virgem |
| 016 | [Escolher o parceiro Meta para o onboarding do WhatsApp](tickets/016-escolher-parceiro-meta.md) | research | seis researches (016/022/023/024/025/026); decisão: self-hosted no número atual, sem parceiro — abriu 027 |
| 012 | [Quando e como o agente escala para uma consultora](tickets/012-quando-e-como-o-agente-escala.md) | grilling | roteamento por fila (não atribuição), gatilhos, transparência; freio de mão por conversa → 027, freio global → 036; abriu 029; janela de retomada = **3 dias** (addendum, decidido no 013); veículo da fila reenquadrado pelo 035 |
| 029 | [Canal de notificação da fila de chamados](tickets/029-canal-de-notificacao-da-fila.md) | research | [research/029](research/029-canal-notificacao-fila.md); e-mail via Apps Script com time-driven trigger, contornando a limitação de `onEdit`/`onChange` não disparar para gravação via API — **veículo reenquadrado pelo 035** (fila sai da planilha) |
| 013 | [Sinal de sucesso — o que se mede e como é capturado](tickets/013-sinal-de-sucesso-do-aprendizado.md) | grilling | fase 1 mede qualidade da qualificação, não desfecho de negócio; taxonomia `terminal_state` + `business_outcome`; `advisor_verdict` da consultora é o sinal de maior peso; `sem_venda`/`perdido`/`esfriado` neutros de propósito; nº único de 3 dias (esfriado + retomada); `CONTEXT.md` ganhou `Sinal de sucesso` e `Atendimento esfriado`; veículo do `advisor_verdict` → 035. Fechado em branch paralela, integrado na reconciliação de 2026-09-02 |
| 035 | [Plataforma central das consultoras — substrato da fila e desfecho](tickets/035-plataforma-central-das-consultoras.md) | grilling | plataforma web única sobre o Supabase (ver fila, assumir, fechar, `advisor_verdict`); Vite + framework leve, sem backend, login Google, Realtime; notificação **só e-mail** (webhook Supabase → Edge Function → Resend), SMS depois; agente marca conversa como "não lida" no WhatsApp ao escalar (validar no 027); esquema `handoffs` fixado; chamado fechado some da fila; construção espera o runtime — fecha 029 (conclusão)/030 (absorvido), reenquadra 031, abre 037; `CONTEXT.md` ganhou `Chamado` e `Plataforma das consultoras` |
| 030 | [Implementar o script de notificação da fila (Apps Script)](tickets/030-implementar-notificacao-da-fila.md) | task | **substituído pelo 037** — a fila saiu da planilha, o disparo virou Database Webhook do Supabase; nada a construir aqui |
| 033 | [Manual do agente para as consultoras — que forma toma](tickets/033-manual-do-agente-para-as-consultoras.md) | grilling | forma decidida (não a redação): um documento, duas partes (A "o que faz" estável / B "no dia a dia"); Google Doc; tom concreto com prints do 014; quatro pedidos à consultora + seção do freio de mão (fecha "quem aciona" do 036 incluindo consultoras); dono do manual = João Victor; abriu o **034** (redação), bloqueado por 011, 036, 037 + rollout (014 já fechou) |
| 020 | [Perguntas a levar às consultoras](tickets/020-perguntas-para-as-consultoras.md) | task | fechado sem nova rodada — não haverá informação adicional por este canal (decisão do dono, 2026-09-11); Levantamento 1 fica como resposta final; 18b/25/31/32 sem resposta e sem previsão; 34 (celular avisa e-mail?) segue como risco em aberto do 037 |
| 032 | [Obter o catálogo do Mainô e exemplos de planilha de arquiteto](tickets/032-catalogo-do-maino-e-planilha-de-arquiteto.md) | task | fechado sem buscar os dois materiais (decisão do dono, 2026-09-11) — `advisor_verdict` na plataforma das consultoras já é o sinal de sucesso, não vale integrar o Mainô; arquiteto escala sem coleta (010); derruba a premissa do 011 (catálogo como fonte de conhecimento de produto) e o desbloqueia |
| 014 | [Como o agente soa — protótipo de atendimento no tom das consultoras](tickets/014-como-o-agente-soa.md) | prototype | branch paralela reconciliada e fechada em 2026-09-11: nome **Manu**, sete transcrições + tabela de tom v1, todas as sete perguntas de tom respondidas pelo dono confirmando a proposta; `prototipo-tom-014/` (ambiente de teste ao vivo); correção de nome/contexto da loja propagada ao `CONTEXT.md`; ticket "033" colidente renumerado para **039**; desbloqueou 034 |
| 011 | [O que o agente pode afirmar sobre produto e disponibilidade](tickets/011-o-que-o-agente-pode-dizer-sobre-produto.md) | grilling | fechado 2026-09-11, ratificando o que já estava implementado no `prototipo-tom-014/system-prompt.md`: nunca preço/medida/material de peça específica, foto nunca reconhecida (sempre escala), alçada de desconto zero, contenção de erro = mecanismo pós-hoc do 038 com prioridade mais alta para erro de produto no canal "reportar problema"; fecha item 4 do gate do 038; desbloqueou 034; requisito de conteúdo registrado no 037 |
| 015 | [Decidir a rotação das credenciais expostas](tickets/015-rotacao-das-credenciais.md) | task | senha do banco rotacionada via `PATCH .../database/password` (nunca trocada desde a criação do projeto); `SUPABASE_ACCESS_TOKEN`/`GEMINI_API_KEY` confirmados limpos; `KIE_API_KEY` removido (fallback nunca usado); resíduo de papéis já derrubados pelo 002 removido do `.env`; onde as credenciais moram em produção fica condicionado à stack de runtime (névoa) |
| 040 | [Confirmar se a GEMINI_API_KEY é do tipo "auth" antes do prazo de setembro/2026](tickets/040-tipo-da-chave-gemini.md) | task | é "auth" — confirmado via console do Google Cloud (chave com conta de serviço vinculada), não pela coluna "Tipo de chave" do AI Studio (não aparece nesta conta); nada a trocar; achado à parte (aviso de billing pré-pagamento) abriu o 041 |
| 037 | [Construir a plataforma das consultoras — v1](tickets/037-construir-plataforma-consultoras-v1.md) | task | implantada no Railway (não Cloudflare — sem domínio próprio) e testada de ponta a ponta: login Google, fila, assumir, fechar com desfecho+veredito; migração `handoffs`/RLS aplicada em produção; 2 bugs reais corrigidos (`skip_nonce_check` duplicada no config.toml, histórico de migração órfão); canal de e-mail (Resend) caiu do escopo do v1 — consultoras não checam e-mail, sinal real é o "não lida" do WhatsApp (027); allow-list com 2/4 e-mails (falta Lais; Pamella usa Outlook sem Conta Google); perde "037" do `blocked-by` do 034 |
| 042 | [Stack e hospedagem do runtime do agente](tickets/042-stack-e-hospedagem-do-runtime.md) | grilling | processo único, novo serviço no mesmo projeto Railway da plataforma; sessão WhatsApp + estado da conversa no Supabase (sem adapter oficial de Baileys, adapter fino sob medida); freio de mão via Realtime; watchdog = uptime monitoring externo + SMS/Telegram (healthcheck nativo do Railway só atua no deploy); segredos em env vars do serviço, isoladas da plataforma; deploy GitHub + rollback de 1 clique; janela curta de reconexão aceita como risco residual; resolve pendência do 015, dá lugar concreto pro 031, fecha "Not yet specified" de arquitetura no mapa |
| 027 | [Testar a conexão self-hosted como dispositivo adicional, antes de tocar no número da loja](tickets/027-testar-self-hosted-no-numero-atual.md) | task | testado ao vivo no número pessoal do dono (sem chip comprado a tempo, research 043); os seis pontos passaram — pareamento sem travar no passkey, dispositivos sobreviventes, evento de companion confirmado, sem erro 463, sem sinal de risco em ~20min, marca de não-lida sincronizando; recomendação: viável ir para o número real da loja; ressalva de fidelidade (WhatsApp comum, poucos companions); efeito em cadeia: dono foi direto pro número real via runtime provisório (`agente-runtime/`), sem esperar o 044 formal |
