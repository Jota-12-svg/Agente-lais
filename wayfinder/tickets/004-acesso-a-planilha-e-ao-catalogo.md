---
id: "004"
title: Inspecionar a planilha de carteira/mailing de clientes
labels: [wayfinder:task]
status: closed
assignee: Claude
blocked-by: []
---

> **Ticket dividido em 2026-08-30.** O 004 original pedia três amostras reais: (a) a planilha
> de clientes, (b) o catálogo de produtos do Mainô, (c) exemplos de planilha de arquiteto.
> Só a (a) estava acessível. As partes (b) e (c) foram para o ticket
> [032](032-catalogo-do-maino-e-planilha-de-arquiteto.md), que segue aberto. Este ticket
> passou a cobrir **só a planilha de clientes** e fecha com a inspeção dela.

## Question

O agente precisa conhecer os **clientes**, e hoje esse dado mora numa planilha fora de
qualquer banco. Este ticket é olhar para ela como ela é de verdade.

**A planilha compartilhada.** Uma aba por consultora com os clientes dela, mais uma aba de
datas importantes (aniversários e afins). Preciso ver: que colunas existem, quão
preenchidas estão, se as abas seguem o mesmo formato entre consultoras, quantos clientes
há, e onde a planilha vive (Google Sheets? Excel no drive?).

**Resolvido quando** eu tiver visto o formato real: as abas, as colunas, o volume e onde
está. A resolução registra **só o padrão** — nunca os valores (LGPD).

---

## Resolução

Inspeção feita em 2026-08-30 sobre `dados/CARTEIRA+MAILLING.xlsx` (exportação subida pelo
dono do projeto; a pasta `/dados/` é ignorada pelo git — é dado pessoal, LGPD). Leitura só
de estrutura: nomes de aba, cabeçalhos, taxa de preenchimento por coluna e tipo de dado.
**Nenhum valor de cliente foi registrado, versionado ou copiado para fora de `/dados/`.**

### O que o arquivo é

Um `.xlsx` com **8 abas**. É, na maior parte, um **diretório de arquitetos + lista de
mailing + registro de relacionamento** — não um CRM de consumidor final. Estrutura consistente
com uma exportação de Google Sheets (células tipadas como data/hora, várias abas). **O acesso
de edição à planilha viva não vem com o `.xlsx`** — ver "Pendências que isto abre".

| Aba | Linhas de dados | O que é | Preenchimento |
|---|---|---|---|
| `LISTA DE PROFISSIONAIS COMPLETA` | 1283 | Diretório-mestre de escritórios/profissionais de arquitetura. Colunas: Escritorio, Nome, CPF/CNPJ, E-mail, Telefone, Celular, Endereco, Numero, Complemento, Bairro, CEP, Cidade, Estado, Consultor, "OBSERVAÇÃO - ULTIMO CONTATO" | Contato quase completo (Nome 99,6%, E-mail 99,5%, Celular 91%, Telefone 69%, endereço ~90–95%). CPF/CNPJ 31%. **`Consultor` e `OBSERVAÇÃO - ULTIMO CONTATO` vazias (0%)** — é lista de prospecção, não tem dono nem histórico |
| `PAMELLA` | ~1003 | Aba da consultora. Seções lado a lado: lista `PROFISSIONAIS`, lista `CLIENTE FINAL` (~14 nomes), e log de brindes (`MIMOS ENVIADOS`+`DATA`, `PRESENTES ANIVERSÁRIOS`+`DATA ENVIO`, `PRESENTE VIDEO`+`DATA`) | Esparsa (0–16%). Entradas de brinde embutem o nome no texto ("Fulana - bolo"); não há coluna de telefone limpa para as listas |
| `GABRIELA` | ~1025 | Aba da consultora. Mesma ideia da PAMELLA, layout parecido mas **não idêntico**: `PROFISSIONAIS`, `CLIENTE FINAL` (~8 nomes), `ATIVAÇÕES`, `PRESENTE ANIVERSAIO` | Esparsa (0–16%) |
| `JOSLAINE` | ~708 | Aba da consultora. **Formato completamente diferente das outras duas**: `a.r`, `ARQUITETOS`, `ESCRITÓRIO/EMPRESA`, `NOME DO PROFISSIONAL`, `ANIVERSÁRIO`, `CONTATO` (telefone), `OBSERVAÇÕES GERAIS`, `OUTRAS OBSERVAÇÕES`, `RESUMO`, `ANOTAÇÕES` (histórico de contato em texto livre: "2 CONTATO 22.05, 3 contato 10.06…") | Colunas centrais ~16%; é a única com histórico de contato estruturado por linha |
| `VISITAS` | ~1005 | Log de visitas à loja. Três blocos de colunas, um por consultora (GABRIELA / PAMELLA / JOSLAINE). Campos: DATA, Horário, Nome Cliente/Escritório, "Fez pedido?", "# pedido" | Quase vazia nesta exportação (~5 linhas por bloco) — parece conter só a semana corrente / recém-limpa |
| `Entregas` | ~1005 | Log de entregas. Mesmo layout de três blocos por consultora. Campos: "# Pedido", DATA, "Horário de saída da loja", **Valor**, Nome Cliente/Escritório, "Data esperada do retorno", Comentários, **Status** (`Vendido` / `Reservado` / `Em produção`) | Quase vazia (~2–5 linhas por bloco). Interessa ao ticket 013 — ver abaixo |
| `MAILING` | 584 | Lista simples: `POS` (índice), `Nome` (escritório, em caixa alta), `CONSULTORA` | Nome 99,8%; CONSULTORA 67%. **Sem coluna de contato** — não dá para casar um telefone que chega contra esta aba |
| `GERAL` | 999 | Outra lista de arquitetos, mais leve: `ARQUITETOS`, `TELEFONE`, "LOJA veio" | ~26% preenchida |

### Respostas diretas às perguntas do ticket

- **Que colunas existem** — acima, por aba.
- **Quão preenchidas** — o diretório de profissionais é sólido em contato; as abas das
  consultoras e os logs (VISITAS, Entregas) são esparsos nesta exportação.
- **Mesmo formato entre consultoras?** — **Não.** PAMELLA e GABRIELA são parecidas mas
  divergem em colunas; JOSLAINE é um layout à parte, com histórico de contato em texto livre.
- **Quantos clientes** — não há um número único. O diretório de profissionais tem ~1283
  escritórios; o mailing, 584; as listas de **consumidor final** dentro das abas das
  consultoras somam ~30 nomes no total.
- **Onde a planilha vive** — temos só o `.xlsx`. Estrutura compatível com Google Sheets;
  **falta confirmar** e obter acesso de edição (ver abaixo).

### Descobertas que contradizem o que estava assumido

1. **Não é um CRM de consumidor final.** A fase 1 atende **só consumidor final** e escala
   arquiteto na hora ([010](010-o-que-e-um-lead-qualificado.md)). Esta planilha é,
   majoritariamente, sobre arquitetos. Para o trabalho de fase 1 do agente, ela oferece
   pouco: as listas de consumidor final têm ~30 linhas e nenhuma chave de contato confiável.

2. **O "lookup por telefone: já é cliente?" do ticket 010 não se sustenta aqui para
   consumidor final.** Onde há telefone confiável (`LISTA DE PROFISSIONAIS`, `CONTATO` da
   JOSLAINE, `GERAL`) são arquitetos. `MAILING` não tem telefone. As sub-listas `CLIENTE
   FINAL` das abas das consultoras têm nome, não telefone. **O que dá para fazer:** casar um
   número que chega contra o diretório de profissionais — o que é um **sinal de classificação
   "é arquiteto"**, não de "já é cliente" (útil para 011/012).

3. **`CONTEXT.md` descrevia a planilha de forma imprecisa** — corrigido nesta sessão. Dizia
   "uma aba por consultora listando os clientes dela e uma aba de datas importantes". Na
   realidade: **3 abas de consultora** (PAMELLA, GABRIELA, JOSLAINE — as três que atendem;
   a 4ª consultora não faz atendimento, confirmado pelo dono); elas são mais lista-de-arquiteto
   + log de brindes do que cadastro de cliente; **não há aba isolada de "datas importantes"** —
   aniversário aparece em colunas dentro de cada aba de consultora (e a JOSLAINE tem uma coluna
   `ANIVERSÁRIO`).

4. **Encoding.** Os cabeçalhos vêm com mojibake cp1252 (`OBSERVA��O`, `ANIVERS�RIO`).
   Cosmético; quem ler a planilha viva pela Sheets API recebe UTF-8 correto.

### O que serve a outros tickets

- **[013](013-sinal-de-sucesso-do-aprendizado.md) (sinal de sucesso):** a aba `Entregas` tem
  `Status` (`Vendido`/`Reservado`/`Em produção`) + `Valor` + `# Pedido` + Nome
  Cliente/Escritório — um registro **do lado da loja** de venda concretizada, com número de
  pedido. Possível ponte de atribuição pedido ↔ nota fiscal do Mainô, complementar à aposta
  da nota (pergunta 25 do ticket 020).
- **[011](011-o-que-o-agente-pode-dizer-sobre-produto.md) / [012](012-quando-e-como-o-agente-escala.md):**
  o diretório de ~1283 escritórios com telefone é um sinal usável de detecção de arquiteto.

### Confirmado com o dono do projeto (2026-08-30)

- **`CARTEIRA+MAILLING.xlsx` é a planilha viva** — em conteúdo. É a cópia que enviaram ao dono
  para trabalhar localmente; o acesso à planilha do Google Sheets das consultoras vem **no
  momento do setup do agente na loja**, para garantir dado sempre atualizado.
- **As 3 abas de consultora estão certas.** A loja tem quatro consultoras; **só três fazem o
  atendimento** e têm aba. O `CONTEXT.md` dizia "quatro" e falava da dona "que também atende" —
  corrigido nesta sessão.

### Pendências que isto abre (não bloqueiam o fechamento)

- **Acesso à planilha viva do Google** (Sheets API / Apps Script): virá no setup na loja.
  Necessário para os tickets [030](030-implementar-notificacao-da-fila.md) e
  [031](031-implementar-escrita-do-chamado-na-fila.md) — o desenho de autenticação de escrita
  pode adiantar; o teste de ponta a ponta espera o acesso.
- **Resolução do [010](010-o-que-e-um-lead-qualificado.md) precisa de um ajuste** (descoberta
  2): o lookup "já é cliente" por telefone não alcança consumidor final. O que resta é casar o
  número contra o diretório de arquitetos como sinal de classificação "é arquiteto". Decisão do
  dono do projeto — fora do escopo deste ticket.
