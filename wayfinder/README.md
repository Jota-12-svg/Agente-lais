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
| 002 | [Inventariar e limpar o projeto Supabase](tickets/002-limpar-o-projeto-supabase.md) | task |
| 003 | [Conseguir a exportação das conversas das consultoras](tickets/003-exportacao-das-conversas-das-consultoras.md) | task |
| 004 | [Obter acesso à planilha de clientes e ao catálogo de produtos](tickets/004-acesso-a-planilha-e-ao-catalogo.md) | task |
| 009 | [Como funciona o atendimento da Lais Casa hoje, ponta a ponta](tickets/009-como-funciona-o-atendimento-hoje.md) | grilling |
| 017 | [Decidir o provedor de LLM e habilitar o billing](tickets/017-provedor-de-llm-e-billing.md) | task |
| 020 | [Perguntas a levar às consultoras](tickets/020-perguntas-para-as-consultoras.md) | task |
| 021 | [Instagram como porta de entrada para o WhatsApp](tickets/021-instagram-porta-de-entrada.md) | task |

## Bloqueados

| # | Ticket | Tipo | Espera |
|---|---|---|---|
| 010 | [O que é um lead qualificado e que dados o agente extrai](tickets/010-o-que-e-um-lead-qualificado.md) | grilling | 009, 003 |
| 011 | [O que o agente pode afirmar sobre produto e disponibilidade](tickets/011-o-que-o-agente-pode-dizer-sobre-produto.md) | grilling | 009, 004 |
| 012 | [Quando e como o agente escala para uma consultora](tickets/012-quando-e-como-o-agente-escala.md) | grilling | 009 |
| 013 | [Sinal de sucesso — o que se mede e como é capturado](tickets/013-sinal-de-sucesso-do-aprendizado.md) | grilling | 009, 003 |
| 014 | [Como o agente soa — protótipo de atendimento no tom das consultoras](tickets/014-como-o-agente-soa.md) | prototype | 003, 009 |
| 015 | [Decidir a rotação das credenciais expostas](tickets/015-rotacao-das-credenciais.md) | task | 002 |
| 016 | [Escolher o parceiro Meta para o onboarding do WhatsApp](tickets/016-escolher-parceiro-meta.md) | research | 009 |
| 018 | [Validar empiricamente o contrato do LLM](tickets/018-validar-contrato-do-llm.md) | task | 017 |
| 019 | [De quais dispositivos a consultora pode responder sem cegar o agente](tickets/019-companion-windows-ponto-cego.md) | task | 016 |

## Fechados

| # | Ticket | Tipo | Descobertas |
|---|---|---|---|
| 001 | [Inicializar o repositório e proteger os segredos](tickets/001-repositorio-e-protecao-dos-segredos.md) | task | — |
| 005 | [Como levar o agente ao WhatsApp sem tirar o Business das consultoras](tickets/005-caminho-de-integracao-com-o-whatsapp.md) | research | [research/005](research/005-integracao-whatsapp.md) |
| 006 | [O que a integração com Google Calendar exige](tickets/006-integracao-com-google-calendar.md) | research | [research/006](research/006-google-calendar.md) |
| 007 | [O Maino tem API? O que dá para ler de lá](tickets/007-maino-tem-api.md) | research | [research/007](research/007-maino-api.md) |
| 008 | [Contrato real da API do Gemini via kie.ai](tickets/008-contrato-da-api-do-gemini.md) | research | [research/008](research/008-gemini-kie-ai.md) |
