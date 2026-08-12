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
| 003 | [Conseguir a exportação das conversas das consultoras](tickets/003-exportacao-das-conversas-das-consultoras.md) | task |
| 004 | [Obter acesso à planilha de clientes e ao catálogo de produtos](tickets/004-acesso-a-planilha-e-ao-catalogo.md) | task |
| 015 | [Decidir a rotação das credenciais expostas](tickets/015-rotacao-das-credenciais.md) | task |
| 018 | [Validar empiricamente o contrato do LLM](tickets/018-validar-contrato-do-llm.md) | task |
| 020 | [Perguntas a levar às consultoras](tickets/020-perguntas-para-as-consultoras.md) | task |
| 021 | [Instagram como porta de entrada para o WhatsApp](tickets/021-instagram-porta-de-entrada.md) | task |
| 027 | [Testar a conexão self-hosted como dispositivo adicional, antes de tocar no número da loja](tickets/027-testar-self-hosted-no-numero-atual.md) | task |
| 029 | [Canal de notificação da fila de chamados](tickets/029-canal-de-notificacao-da-fila.md) | research |

## Bloqueados

| # | Ticket | Tipo | Espera |
|---|---|---|---|
| 010 | [O que é um lead qualificado e que dados o agente extrai](tickets/010-o-que-e-um-lead-qualificado.md) | grilling | 003 |
| 011 | [O que o agente pode afirmar sobre produto e disponibilidade](tickets/011-o-que-o-agente-pode-dizer-sobre-produto.md) | grilling | 004 |
| 013 | [Sinal de sucesso — o que se mede e como é capturado](tickets/013-sinal-de-sucesso-do-aprendizado.md) | grilling | 003 |
| 014 | [Como o agente soa — protótipo de atendimento no tom das consultoras](tickets/014-como-o-agente-soa.md) | prototype | 003 |
| 019 | [De quais dispositivos a consultora pode responder sem cegar o agente](tickets/019-companion-windows-ponto-cego.md) | task | **em pausa** — premissa (Coexistence) não é mais o caminho; ver 016 |

## Fechados

| # | Ticket | Tipo | Descobertas |
|---|---|---|---|
| 001 | [Inicializar o repositório e proteger os segredos](tickets/001-repositorio-e-protecao-dos-segredos.md) | task | — |
| 005 | [Como levar o agente ao WhatsApp sem tirar o Business das consultoras](tickets/005-caminho-de-integracao-com-o-whatsapp.md) | research | [research/005](research/005-integracao-whatsapp.md); recomendação de Coexistence revertida pelo 016 |
| 006 | [O que a integração com Google Calendar exige](tickets/006-integracao-com-google-calendar.md) | research | [research/006](research/006-google-calendar.md) |
| 007 | [O Maino tem API? O que dá para ler de lá](tickets/007-maino-tem-api.md) | research | [research/007](research/007-maino-api.md) |
| 008 | [Contrato real da API do Gemini via kie.ai](tickets/008-contrato-da-api-do-gemini.md) | research | [research/008](research/008-gemini-kie-ai.md) |
| 009 | [Como funciona o atendimento da Lais Casa hoje, ponta a ponta](tickets/009-como-funciona-o-atendimento-hoje.md) | grilling | vocabulário em [`CONTEXT.md`](../CONTEXT.md); abriu 019, 020 e 021 |
| 002 | [Inventariar e limpar o projeto Supabase](tickets/002-limpar-o-projeto-supabase.md) | task | schema `app` e papéis do projeto anterior apagados; banco em estado virgem |
| 016 | [Escolher o parceiro Meta para o onboarding do WhatsApp](tickets/016-escolher-parceiro-meta.md) | research | seis researches (016/022/023/024/025/026); decisão: self-hosted no número atual, sem parceiro — abriu 027 |
| 012 | [Quando e como o agente escala para uma consultora](tickets/012-quando-e-como-o-agente-escala.md) | grilling | roteamento por fila (não atribuição), gatilhos, transparência, freio de mão adiado para 027 — abriu 029; janela de retomada depende do 013 |
| 030 | [Escolher o modelo Gemini certo para a solução](tickets/030-escolher-modelo-gemini-ideal.md) | research | comparação real entre candidatos vivos — `gemini-3.5-flash-lite` recomendado sobre `gemini-3.6-flash`, ~75% mais barato, sem perder áudio/imagem/function calling/thinking; aplicado no 017 |
| 017 | [Decidir o provedor de LLM e habilitar o billing](tickets/017-provedor-de-llm-e-billing.md) | task | Google Gemini API, tier pago, modelo `gemini-3.5-flash-lite`; chave criada, billing confirmado (painel + `serviceTier: "standard"` na resposta real da API) — abriu 030, desbloqueou 018 |
