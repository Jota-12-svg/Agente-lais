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
| 005 | [Como levar o agente ao WhatsApp sem tirar o Business das consultoras](tickets/005-caminho-de-integracao-com-o-whatsapp.md) | research |
| 006 | [O que a integração com Google Calendar exige](tickets/006-integracao-com-google-calendar.md) | research |
| 007 | [O Maino tem API? O que dá para ler de lá](tickets/007-maino-tem-api.md) | research |
| 008 | [Contrato real da API do Gemini via kie.ai](tickets/008-contrato-da-api-do-gemini.md) | research |
| 009 | [Como funciona o atendimento da Lais Casa hoje, ponta a ponta](tickets/009-como-funciona-o-atendimento-hoje.md) | grilling |

## Bloqueados

| # | Ticket | Tipo | Espera |
|---|---|---|---|
| 010 | [O que é um lead qualificado e que dados o agente extrai](tickets/010-o-que-e-um-lead-qualificado.md) | grilling | 009, 003 |
| 011 | [O que o agente pode afirmar sobre produto e disponibilidade](tickets/011-o-que-o-agente-pode-dizer-sobre-produto.md) | grilling | 009, 004 |
| 012 | [Quando e como o agente escala para uma consultora](tickets/012-quando-e-como-o-agente-escala.md) | grilling | 009 |
| 013 | [Sinal de sucesso — o que se mede e como é capturado](tickets/013-sinal-de-sucesso-do-aprendizado.md) | grilling | 009, 003 |
| 014 | [Como o agente soa — protótipo de atendimento no tom das consultoras](tickets/014-como-o-agente-soa.md) | prototype | 003, 009 |
| 015 | [Decidir a rotação das credenciais expostas](tickets/015-rotacao-das-credenciais.md) | task | 002 |

## Fechados

| # | Ticket | Tipo |
|---|---|---|
| 001 | [Inicializar o repositório e proteger os segredos](tickets/001-repositorio-e-protecao-dos-segredos.md) | task |
