---
id: "003"
title: Conseguir a exportação das conversas das consultoras
labels: [wayfinder:task]
status: closed
assignee: Jota
blocked-by: []
---

## Question

Trabalho manual que só o usuário pode fazer, e que destrava as decisões mais importantes do
mapa: **tom do agente, campos da qualificação, gatilho de escalonamento e sinal de sucesso**
todos dependem de ver atendimento real, não de imaginá-lo.

O que precisa ser obtido:

- Exportação de conversas do WhatsApp Business das consultoras — as conversas com clientes,
  não as internas. O WhatsApp exporta por conversa (`Exportar conversa`, com ou sem mídia),
  gerando um `.txt` por conversa.
- Cobertura que valha a pena: conversas de **mais de uma consultora**, incluindo casos que
  **deram certo e casos que não deram**, e exemplos dos **dois públicos** — consumidor final
  e arquiteto mandando planilha. Conversa boa demais só ensina metade.
- Para cada conversa, se possível, o desfecho real: virou venda? virou reunião? o cliente
  sumiu? Sem isso o material vira só estilo, não sinal.

Pontos a resolver junto com o usuário:

- **Consentimento e LGPD.** São conversas de clientes reais com dado pessoal. Definir o que
  pode ser lido, onde fica armazenado e se precisa ser anonimizado antes de entrar no
  repositório.
- Onde os arquivos ficam: **fora do git**, dado o conteúdo.

**Resolvido quando** os arquivos estiverem acessíveis e eu tiver confirmado o formato e o
volume. A resolução registra quantas conversas, de quantas consultoras, que período cobrem
e onde estão.

---

## Resolução — 2026-08-30

**A exportação não foi viável.** O dono do projeto não conseguiu extrair os `.txt` de
conversa do WhatsApp Business das consultoras. Em vez de deixar o ticket aberto
indefinidamente e travando metade do mapa, decidiu-se (decisão do dono do projeto, registrada
aqui) um **substituto**: o dono do projeto **analisou por conta própria como as consultoras
respondem os clientes** e alimenta essa análise diretamente nas sessões de grilling e no
protótipo que dependiam deste ticket.

**O que o substituto entrega, e o que perde:**

- **Entrega:** padrão de condução da conversa, campos que a consultora puxa, tom, ritmo,
  formulações de ouro (ex.: "vou verificar e te retorno") — o suficiente para os tickets
  [010](010-o-que-e-um-lead-qualificado.md) (campos da qualificação) e
  [013](013-sinal-de-sucesso-do-aprendizado.md) (sinal de sucesso) fecharem.
- **Perde:** fidelidade de transcrição literal. Não há corpus real para o protótipo do
  [014](014-como-o-agente-soa.md) comparar linha a linha, nem material bruto para o laço de
  aprendizado calibrar depois. O tom do 014 sai da descrição do dono do projeto + da amostra
  da planilha, não de conversa real — é ponto de partida, não referência definitiva.
- **Mitigação parcial:** a planilha compartilhada de clientes (ticket
  [004](004-acesso-a-planilha-e-ao-catalogo.md)) já está acessível e mostra, de forma
  objetiva, que dados as consultoras de fato guardam de cada cliente.

**Se as conversas exportadas aparecerem mais tarde**, revisar 010/013/014 contra elas — este
fechamento é deliberadamente uma troca de fidelidade por desbloqueio, não uma afirmação de
que o material verbal basta para tudo.

Desbloqueia [010](010-o-que-e-um-lead-qualificado.md),
[013](013-sinal-de-sucesso-do-aprendizado.md) e [014](014-como-o-agente-soa.md).
