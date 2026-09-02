# Tracker — Agente de WhatsApp da Lais Casa

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
| 014 | [Como o agente soa — protótipo de atendimento no tom das consultoras](tickets/014-como-o-agente-soa.md) | prototype |
| 015 | [Decidir a rotação das credenciais expostas](tickets/015-rotacao-das-credenciais.md) | task |
| 020 | [Perguntas a levar às consultoras](tickets/020-perguntas-para-as-consultoras.md) | task |
| 021 | [Instagram como porta de entrada para o WhatsApp](tickets/021-instagram-porta-de-entrada.md) | task |
| 027 | [Testar a conexão self-hosted como dispositivo adicional, antes de tocar no número da loja](tickets/027-testar-self-hosted-no-numero-atual.md) | task |
| 030 | [Implementar o script de notificação da fila (Apps Script)](tickets/030-implementar-notificacao-da-fila.md) | task |
| 031 | [Implementar a escrita do chamado do agente na aba de fila (Sheets API)](tickets/031-implementar-escrita-do-chamado-na-fila.md) | task |
| 032 | [Obter o catálogo do Mainô e exemplos de planilha de arquiteto](tickets/032-catalogo-do-maino-e-planilha-de-arquiteto.md) | task |
| 033 | [Superfície das consultoras para o agente](tickets/033-superficie-das-consultoras-para-o-agente.md) | task |

> **004 foi dividido** (2026-08-30): a planilha de clientes foi inspecionada e o 004 fechou; o
> catálogo do Mainô e as planilhas de arquiteto foram para o **032**, que segue aberto e ainda
> bloqueia **011**.
>
> **030 e 031** saíram de Bloqueados com o fechamento do 004, mas ainda dependem de **acesso de
> edição à planilha viva do Google** — pendência dentro do escopo deles, não um bloqueio de
> ticket.

## Bloqueados

| # | Ticket | Tipo | Espera |
|---|---|---|---|
| 011 | [O que o agente pode afirmar sobre produto e disponibilidade](tickets/011-o-que-o-agente-pode-dizer-sobre-produto.md) | grilling | 032 |
| 019 | [De quais dispositivos a consultora pode responder sem cegar o agente](tickets/019-companion-windows-ponto-cego.md) | task | **em pausa** — premissa (Coexistence) não é mais o caminho; ver 016 |

## Fechados

| # | Ticket | Tipo | Descobertas |
|---|---|---|---|
| 001 | [Inicializar o repositório e proteger os segredos](tickets/001-repositorio-e-protecao-dos-segredos.md) | task | — |
| 003 | [Conseguir a exportação das conversas das consultoras](tickets/003-exportacao-das-conversas-das-consultoras.md) | task | exportação inviável; substituída pela análise do dono via grilling — desbloqueou 010, 013, 014 |
| 004 | [Inspecionar a planilha de carteira/mailing de clientes](tickets/004-acesso-a-planilha-e-ao-catalogo.md) | task | dividido; planilha é diretório de arquitetos + mailing, não CRM de consumidor final; lookup "já é cliente" do 010 não se sustenta; catálogo + planilha de arquiteto → 032; desbloqueou 030, 031 |
| 005 | [Como levar o agente ao WhatsApp sem tirar o Business das consultoras](tickets/005-caminho-de-integracao-com-o-whatsapp.md) | research | [research/005](research/005-integracao-whatsapp.md); recomendação de Coexistence revertida pelo 016 |
| 006 | [O que a integração com Google Calendar exige](tickets/006-integracao-com-google-calendar.md) | research | [research/006](research/006-google-calendar.md) |
| 007 | [O Maino tem API? O que dá para ler de lá](tickets/007-maino-tem-api.md) | research | [research/007](research/007-maino-api.md) |
| 008 | [Contrato real da API do Gemini via kie.ai](tickets/008-contrato-da-api-do-gemini.md) | research | [research/008](research/008-gemini-kie-ai.md) |
| 009 | [Como funciona o atendimento da Lais Casa hoje, ponta a ponta](tickets/009-como-funciona-o-atendimento-hoje.md) | grilling | vocabulário em [`CONTEXT.md`](../CONTEXT.md); abriu 019, 020 e 021 |
| 010 | [O que é um lead qualificado e que dados o agente extrai](tickets/010-o-que-e-um-lead-qualificado.md) | grilling | agente não é formulário; campos núcleo + oportunistas, nada obrigatório; Supabase interno + relance na fila do 012; `Atendimento qualificado` no `CONTEXT.md` · **addendum 2026-09-01**: lookup por telefone só p/ diretório de arquitetos, pergunta do modo deliberada |
| 017 | [Decidir o provedor de LLM e habilitar o billing](tickets/017-provedor-de-llm-e-billing.md) | task | chave do `.env` já no tier pago (`serviceTier: standard`); modelo `gemini-3.6-flash` (o `gemini-3-flash` do 008 sumiu), `thinking_level: "minimal"`; `flash-lite` como plano B; research 017 — desbloqueou 018 |
| 018 | [Validar empiricamente o contrato do LLM](tickets/018-validar-contrato-do-llm.md) | task | function calling OK em HTTP cru (mas `thoughtSignature` das `functionCall` é obrigatório no reenvio, senão 400); áudio OGG/Opus inline sem ffmpeg; HEIC OK; cache mínimo 1024 (não 4096); áudio 25 tok/s (não 32); `minimal` vs `low` = 540 tokens + 3× latência |
| 002 | [Inventariar e limpar o projeto Supabase](tickets/002-limpar-o-projeto-supabase.md) | task | schema `app` e papéis do projeto anterior apagados; banco em estado virgem |
| 016 | [Escolher o parceiro Meta para o onboarding do WhatsApp](tickets/016-escolher-parceiro-meta.md) | research | seis researches (016/022/023/024/025/026); decisão: self-hosted no número atual, sem parceiro — abriu 027 |
| 012 | [Quando e como o agente escala para uma consultora](tickets/012-quando-e-como-o-agente-escala.md) | grilling | roteamento por fila (não atribuição), gatilhos, transparência, freio de mão adiado para 027 — abriu 029; janela de retomada = **3 dias** (addendum, decidido no 013) |
| 029 | [Canal de notificação da fila de chamados](tickets/029-canal-de-notificacao-da-fila.md) | research | [research/029](research/029-canal-notificacao-fila.md); e-mail via Apps Script com time-driven trigger, contornando a limitação de `onEdit`/`onChange` não disparar para gravação via API |
| 013 | [Sinal de sucesso — o que se mede e como é capturado](tickets/013-sinal-de-sucesso-do-aprendizado.md) | grilling | fase 1 mede qualidade da qualificação, não desfecho de negócio; taxonomia `terminal_state` + `business_outcome`; `advisor_verdict` da consultora é o sinal de maior peso; `sem_venda`/`perdido`/`esfriado` neutros de propósito; nº único de 3 dias (esfriado + retomada); `CONTEXT.md` ganhou `Sinal de sucesso` e `Atendimento esfriado` — abriu 033 |
