# Research — O Maino tem API? O que dá para ler de lá

Ticket: [007](../tickets/007-maino-tem-api.md) · Investigado em 2026-08-10

---

## Resposta curta

**Sim, e é melhor do que se esperava.** O Mainô tem API REST documentada, com catálogo de
produtos rico o bastante para o agente conversar sobre produto, e consulta de notas fiscais
emitidas — que é o sinal objetivo de venda que o laço de aprendizado precisa.

- **Base URL:** `https://api.maino.com.br/api/v2`
- **Autenticação:** OAuth2, token JWT Bearer obtido no endpoint `/authentication`. A chave de
  API é solicitada dentro do próprio sistema
  ([como solicitar](http://ajuda.maino.com.br/pt-BR/articles/14116420-como-solicitar-a-chave-api),
  [autenticação](http://ajuda.maino.com.br/pt-BR/articles/13919973-autenticacao-para-api)).
- **Referência técnica:** https://changelog.maino.com.br/api-reference-maino/

---

## Catálogo de produtos — `GET /produtos`

Fonte: [Controle de estoque — API reference](https://changelog.maino.com.br/api-reference-maino/08.-controle-de-estoque.md)

Os campos vão bem além do mínimo fiscal. É catálogo de e-commerce, não só cadastro de NF:

| Grupo | Campos |
|---|---|
| Identificação | `id`, `codigo`, `descricao`, `ativo`, `ultima_modificacao` |
| Preço | `pu` (custo), `pu_saida` (venda), `pu_saida_com_ipi`, `aliquota_ipi` |
| Físico | `altura`, `comprimento`, `largura`, `peso_liquido`, `peso_bruto` |
| E-commerce | `imagem_principal`, `imagens`, `titulo_ecommerce`, `descricao_ecommerce`, `marca`, `modelo` |
| Organização | `categoria`, `subcategoria`, `tabelas_de_vendas`, `propriedades` |
| Fiscal | `ncm`, `unidade_de_medida`, `gtin`, `codigo_de_barras_interno` |
| Estoque | `qtde`, `qtde_comprometida`, `qtde_armazenada` |

Para o agente isso é bom: **dimensão, imagem, marca e descrição de e-commerce** são
exatamente o que um cliente de decoração pergunta ("cabe na minha mesa?", "tem foto?", "que
material?"). Material não tem campo próprio — pode estar em `descricao_ecommerce` ou em
`propriedades`, a confirmar com dados reais.

> ⚠️ **Os campos de estoque existem na API, mas não valem nada aqui.** A Lais Casa não faz
> controle de estoque — o estoque é o que está à vista na loja. Um `qtde` desatualizado ou
> zerado é pior que campo ausente, porque *parece* confiável. **A regra do mapa continua
> valendo integralmente: o agente não afirma disponibilidade**, mesmo com esse campo à mão.
> Isso precisa ser explícito no código e no prompt, não só no documento.

---

## Venda concretizada — `GET /notas_fiscais_emitidas`

Fonte: [Notas fiscais — API reference](https://changelog.maino.com.br/api-reference-maino/12.-notas-fiscais.md)

Endpoints de leitura relevantes:

- `GET /notas_fiscais_emitidas` — lista as notas emitidas, com filtro por **intervalo de
  data**, número da NF-e, **CNPJ do destinatário**, centro de custo, datas de pagamento e
  vencimento, com paginação.
- `GET /nfes` e `GET /nfes/{id}` — lista e detalhe.
- `GET /notas_fiscais_confirmadas` — notas confirmadas.

A resposta traz `valor_nota_nfe`, `dthr_emissao`, o destinatário, o status e a chave de
acesso. **É o suficiente para responder "esta conversa virou venda, de quanto e quando".**

**Duas ressalvas que afetam o desenho do aprendizado:**

1. **Não há webhook passivo de emissão.** O único callback documentado é o parâmetro `url`
   do `POST /nfes/transmitir` — ou seja, só recebe aviso quem *emitiu* a nota pela API. Como
   quem emite é a consultora, pela interface do Mainô, **a detecção de venda vai ser por
   polling** de `notas_fiscais_emitidas`. Não é problema: um job periódico resolve, e a
   latência de minutos é irrelevante para aprendizado.
2. **O filtro de destinatário é por CNPJ.** Isso serve para arquitetos com empresa, mas
   **consumidor final é CPF**. Confirmar com dados reais se o campo aceita CPF ou se, para
   pessoa física, a conciliação terá de ser por nome e data — que é bem mais frágil. Este é
   o ponto mais incerto deste research.

---

## Outros endpoints da família

O centro de ajuda lista 16 artigos "Via API" cobrindo, além de produtos e notas: **pedidos**,
**empresas/contatos**, **contas a receber**, **contas bancárias**, **certificados digitais**,
**NFC-e**, **pagamentos**, **movimentações de estoque**, **classificações fiscais**,
**representantes de vendas** e processos de importação/exportação.
([coleção de integrações](http://ajuda.maino.com.br/pt-BR/collections/1843910-integracoes))

Há também integrações prontas com marketplaces (Shopee, Mercado Livre, Magalu, Via Varejo,
B2W, Carrefour, Olist, Madeira Madeira, Shein) e parceiros (Tray, Mercos, Nibo, GTI Plug,
Iugu) — irrelevantes para este projeto, mas indicam que a API é usada de verdade e tem
manutenção.

**Cotações/orçamentos:** o endpoint de **pedidos** existe
([artigo](http://ajuda.maino.com.br/pt-BR/articles/3156823-integracao-via-api-para-pedidos)),
mas não confirmei se ele cobre a cotação que a consultora manda ao cliente antes da venda.
Isso importa mais para a fase 2 do que para agora.

---

## O que ficou por confirmar

Estes pontos exigem a chave de API em mãos e dados reais — não se resolvem por documentação:

1. Se `descricao_ecommerce`, `imagens` e `propriedades` estão **preenchidos** no cadastro da
   Lais Casa, ou se o cadastro tem só o mínimo fiscal. Um catálogo rico na API mas vazio na
   prática não serve para nada.
2. Se o filtro de destinatário aceita **CPF**, para conciliar venda a consumidor final.
3. Quantos produtos existem no cadastro.
4. Se "pedidos" corresponde às cotações do fluxo real da loja.

Isso liga direto ao ticket
[Obter acesso à planilha de clientes e ao catálogo de produtos](../tickets/004-acesso-a-planilha-e-ao-catalogo.md):
o caminho técnico está resolvido, falta ver o dado.

---

## Recomendação

**O Mainô é a fonte do catálogo de produtos e do sinal de venda.** Não montar catálogo à mão
nem inventar um cadastro paralelo — o dado já existe, com preço, foto e dimensão, e
duplicá-lo criaria duas verdades divergentes sobre preço, que é o pior tipo de bug num
negócio de ticket alto.

**Próximo passo concreto:** solicitar a chave de API dentro do Mainô e fazer uma chamada real
a `GET /produtos` para ver o cadastro da loja como ele é. É trabalho pequeno e derruba as
quatro incertezas acima de uma vez.
