---
ticket: "016"
title: Catálogo de casos reais de banimento e estimativa de risco para o cenário da Lais Aliski Casa
tipo: research
data: 2026-08-11
---

# Research — Casos concretos de banimento/restrição e o que eles sustentam como estimativa de risco

Ticket: [016](../tickets/016-escolher-parceiro-meta.md) · Investigado em 2026-08-11 · Consolida e
amplia o levantamento de casos já feito em
[research 023](023-comunidade-whatsapp-ia-baixo-custo.md) (pergunta 2) e
[research 026](026-o-que-causa-banimento.md) (achado do erro 463/tokens), com o objetivo
específico de responder: **dado tudo que existe publicamente sobre casos reais, que faixa de
risco — não que número inventado — o cenário da Lais Aliski Casa sustenta?**

> **Base desta investigação.** Toda linha da tabela abaixo cita a fonte direta. Onde a fonte é
> relato de usuário em issue/discussion do GitHub, isso está marcado como **[relato direto]**;
> onde é um estudo com metodologia (mesmo que só parcialmente controlada), como
> **[metodologia verificável]**; onde é blog/conteúdo comercial, como **[comercial]**, com o
> produto vendido nomeado. **Nenhuma fonte encontrada nesta pesquisa — nem nas duas anteriores —
> publica uma taxa de banimento medida com metodologia auditável.** Os dois únicos percentuais
> que existem na literatura consultada (Z-API <0,3%, Achiya <2%/15–30%) são autodeclarados por
> quem vende algo, já registrados como tal em research 023, e continuam sendo os únicos números
> "duros" que existem — o que é, em si, parte da resposta a esta pesquisa, não uma lacuna dela.

---

## Resumo executivo

**Pergunta:** qual a estimativa de risco de banimento para um agente self-hosted (Baileys/
Evolution API), conectado como dispositivo adicional a um número WhatsApp Business Premium já
estabelecido (anos de uso humano real), operando com conexão única e comportamento majoritariamente
reativo?

**Resposta direta:** a evidência pública reunida aqui (catalogando ~40 casos concretos, dos quais
cerca de 20 são novos em relação aos research 023/026) sustenta uma faixa qualitativa de
**risco baixo-moderado** — não "baixo" puro, porque vários casos novos encontrados nesta pesquisa
mostram que **nem idade do número nem comportamento estritamente reativo protegem por completo**
(Evolution API [#1650](https://github.com/EvolutionAPI/evolution-api/issues/1650) e
[#2497](https://github.com/evolution-foundation/evolution-api/issues/2497): números antigos
banidos **antes de qualquer mensagem ser enviada**, só por vincular a sessão; whatsapp-web.js
[#3565](https://github.com/pedroslopez/whatsapp-web.js/issues/3565): clientes estabelecidos,
alegadamente só reativos, banidos "sem motivo aparente"; whatsmeow
[#561](https://github.com/tulir/whatsmeow/issues/561): sessão de mais de um ano forçada a
logout). Mas também não é "alto" nem "quase certo" — a mesma busca encontrou casos de exposição
parecida sem problema nenhum (bridge pessoal rodando 4+ anos em 3 números diferentes; dois
relatos de autoresponder reativo sem banimento; e, principalmente, o achado de maior peso
metodológico de toda a pesquisa: um **paper acadêmico peer-reviewed** (NDSS 2026, Gegenhuber et
al., Universidade de Viena/SBA Research) que operou 5 contas whatsmeow por ~5 meses sem nenhum
banimento permanente — com a ressalva importante de que a ação testada ali foi consulta em massa
de números, não conversação 1:1).

**Se for exigida uma faixa numérica**, o máximo que esta pesquisa sustenta, com todas as
ressalvas de validade estatística explicitadas na seção de metodologia, é: dentro da amostra de
conveniência reunida (que **superrepresenta problema**, porque ninguém abre issue no GitHub para
dizer "funcionou sem incidente") — dos casos que mais se parecem com o perfil do projeto
(conexão única, biblioteca tipo Baileys/whatsmeow, conta com histórico, uso majoritariamente
reativo), aproximadamente **8 relatam algum tipo de problema** (de aviso a banimento definitivo)
contra **~5 relatam nenhum problema**, incluindo o paper acadêmico. Isso **não é uma taxa de
incidência** — é uma proporção dentro de uma amostra pequena, autosselecionada e enviesada para
o lado do problema. A leitura honesta que essa proporção sustenta é: **a hipótese "reativo +
conta antiga = seguro" não tem confirmação empírica forte o suficiente para ser tratada como
garantia**, mas também não há evidência de que o risco seja alto o bastante para inviabilizar a
arquitetura já decidida no ticket 016 — só o bastante para justificar o checklist do research 026
como obrigatório, não opcional, e o teste do ticket 027 como pré-requisito antes de produção.

**Nenhuma fonte encontrada nesta pesquisa — incluindo o paper acadêmico — mede uma taxa de
banimento para o cenário exato da Lais Aliski Casa** (dispositivo adicional numa conta Premium com anos
de histórico humano, uso reativo de atendimento de loja). Essa combinação específica não foi
testada por ninguém publicamente. A única forma de fechar essa lacuna continua sendo o teste do
ticket [027](../tickets/027-testar-self-hosted-no-numero-atual.md).

---

## Tabela de casos

Legenda de **Comportamento**: `Ativo` = mensagem iniciada pela conta/disparo/campanha; `Reativo`
= só responde quem chamou primeiro; `Nenhum` = banimento ocorreu antes de qualquer mensagem
(só ao vincular sessão ou fazer consulta); `Misto` = evidência não permite separar.

Legenda de **Status**: `[023]`/`[026]` = já catalogado nos research anteriores, reproduzido aqui
para a tabela ficar completa; `NOVO` = encontrado só nesta pesquisa.

| # | Fonte | Biblioteca | Volume / contexto | Comportamento | Idade da conta/sessão | Desfecho | Detalhe técnico relevante | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | [whatsapp-web.js #532](https://github.com/pedroslopez/whatsapp-web.js/issues/532) | whatsapp-web.js | ~200 msgs de promoção semanal p/ ~1500 contatos | Ativo (campanha) | Não informado | Banimento | Disparo de marketing recorrente | [023] |
| 2 | [Evolution API #1870](https://github.com/EvolutionAPI/evolution-api/issues/1870) | Baileys/Evolution | Reduziu p/ 40–50 msgs/dia (vinha de 1000/dia) | Ativo (campanha, com tentativa de burlar detecção via proxy) | Não informado | Banimento | Sem solução na thread | [023] |
| 3 | [Evolution API #439](https://github.com/EvolutionAPI/evolution-api/issues/439) | Baileys/Evolution | 10 mensagens paralelas p/ contatos diferentes | Misto | Não informado | Restrição temporária (1–2 dias) | Mostra que o limiar não é fixo | [023] |
| 4 | Evolution API #2298 (citado em 023) | Baileys/Evolution | Não detalhado em 023 | Misto | Não informado | Não detalhado | — | [023] |
| 5 | [whatsmeow #810](https://github.com/tulir/whatsmeow/issues/810) | whatsmeow/Baileys | Múltiplos clientes de um gateway comercial | **Reativo** (manual e com IA) | Não informado | Aviso "at risk"; parte evoluiu p/ banimento | **Achado central**: reativo puro não é imune; Meta Verified parou avisos em relato único; fechada "not planned" | [026] |
| 6 | [Baileys #2441](https://github.com/WhiskeySockets/Baileys/issues/2441) | Baileys | Investigação de protocolo, não é "caso" de volume | N/A | N/A | N/A | Mecanismo do erro 463 (`NackCallerReachoutTimelocked`) e tokens `tctoken`/`cstoken`, aberta por mantenedor (`purpshell`, MEMBER) | [026] |
| 7 | Comentário `ZzJordan` na #2441 (22/07/2026) | Evolution API (Baileys) | Mensagens 1:1 aceitas mas nunca entregues | **Reativo** | Sessão nova **vs.** sessão de ~4 semanas, mesma infra | Sessão nova: erro 463 consistente. Sessão de 4 semanas: nenhum problema | Comparação controlada, única variável = idade da sessão | [026] |
| 8 | [Baileys #1869](https://github.com/WhiskeySockets/Baileys/issues/1869) | Baileys | 5 bots banidos numa semana, ~9 grupos cada | Misto (atividade de grupo) | 2 dos 5 bots com **3 anos** sem banimento prévio | Banimento | Contraponto: histórico limpo não é imunidade permanente; Meta muda detecção ao longo do tempo | [026] |
| 9 | [whatsmeow discussion #199](https://github.com/tulir/whatsmeow/discussions/199) — `roniahmad` | whatsmeow | 30 números fora da agenda, delay de 30s entre cada | Ativo/frio | Não informado | Banimento | Atraso sozinho não neutraliza mensagem fria | [026] |
| 10 | [whatsmeow discussion #567](https://github.com/tulir/whatsmeow/discussions/567) — `hrizal` | **WhatsApp Web oficial** | 5 mensagens | Ativo/frio (cliente oficial, não biblioteca não-oficial) | Não informado | Banimento | Mostra que o gatilho é o destinatário desconhecido, não o cliente usado | [026] |
| 11 | Comentário `azeezeladl` na #2441 | Baileys | Envio p/ número não registrado no WhatsApp | Reativo/ativo indiferente | N/A | Consome orçamento de reach-out, pode acionar `RESTRICT_ALL_COMPANIONS`/463 | Mitigação: validar com `onWhatsApp` antes de enviar | [026] |
| 12 | Comentário `zhamghaoran` na #2441 | Baileys | Adicionar pessoas a grupo | Ativo | N/A | 463 | Trava de reach-out não é exclusiva de mensagem 1:1 | [026] |
| 13 | [WhatsApp Help Center](https://faq.whatsapp.com/5957850900902049) | Oficial | Política de bulk/automated messaging | N/A | N/A | N/A | **[primária oficial]** "receiving many messages at once will not result in an account ban" — só volume enviado importa | [026] |
| 14 | [Baileys #2309](https://github.com/WhiskeySockets/Baileys/issues/2309) | Baileys | Upload de status em lotes de 100, conta com 2000–3000 contatos | Ativo (bulk status) | Não informado | Banido temporariamente 2x, depois **permanente** | Só ocorre em produção, não local — sugere fator de infraestrutura (IP/geo) além do comportamento | NOVO |
| 15 | [Baileys #2260](https://github.com/WhiskeySockets/Baileys/issues/2260) | Baileys | Pós-atualização p/ ES Module | Indeterminado | Não informado | Restrição de 24h, recorrente ("most of the times") | Relato de baixa qualidade, sem volume nem contexto | NOVO |
| 16 | [Baileys #1925](https://github.com/WhiskeySockets/Baileys/issues/1925) | Baileys | 10 números conectados, todos banidos ao postar em grupo | Ativo (postagem em grupo; farm de 10 números) | Não informado | Banimento; migrou p/ whatsapp-web.js e não teve mais problema | Indício (não prova) de diferença de detecção entre bibliotecas, ou de que o gatilho era a atividade de grupo | NOVO |
| 17 | [Baileys #2075](https://github.com/WhiskeySockets/Baileys/issues/2075) | Baileys | "Repeated bans... affecting operations" | Indeterminado | Não informado | Banimento repetido | Sem detalhe técnico | NOVO |
| 18 | [Baileys #1392](https://github.com/WhiskeySockets/Baileys/issues/1392) | Baileys | Aviso (screenshot, sem texto) | Indeterminado | Não informado | Aviso | Relato de baixíssima qualidade | NOVO |
| 19 | [Baileys #2658](https://github.com/WhiskeySockets/Baileys/issues/2658) | Baileys | "Your account may soon be subject to restrictions" via interface baseada em Baileys | Indeterminado | Não informado | Aviso apenas | Pergunta exploratória, sem resposta na thread | NOVO |
| 20 | [Baileys #935](https://github.com/WhiskeySockets/Baileys/issues/935) | Baileys | Banimentos contínuos por 2 semanas em vários números; conta nova banida em horas | Alegado cauteloso ("no misusage, no spam") | Mista (números variados; um caso é conta nova) | Banimento | Próprio autor questiona se é falha de implementação própria, não da biblioteca | NOVO |
| 21 | [Baileys #1850](https://github.com/WhiskeySockets/Baileys/issues/1850) | Baileys | 100 alunos, 400 conversas em ~2h | **Reativo, mas rajada de alta velocidade** | Sessão vinculada há **~2 horas** (nova) | Restrição em ~2h após vincular | Combinação sessão nova + rajada de volume, mesmo sendo reativo | NOVO |
| 22 | [Evolution API #1650](https://github.com/EvolutionAPI/evolution-api/issues/1650) | Baileys/Evolution | Nenhuma mensagem enviada | **Nenhum** (banido antes de qualquer envio) | Não informado | Suspensão temporária | Ocorreu logo após ler o QR code — mostra que só vincular a sessão já é sinal | NOVO |
| 23 | [Evolution API #2497](https://github.com/evolution-foundation/evolution-api/issues/2497) | Baileys/Evolution | Nenhuma mensagem enviada, 2 números | **Nenhum** | **Número com "bastante tempo de uso"**, mas sessão nova | Banimento | Caso forte: número antigo **não impediu** banimento ao só conectar | NOVO |
| 24 | [Evolution API #2228](https://github.com/EvolutionAPI/evolution-api/issues/2228) | Baileys/Evolution | Verificação em massa de números via endpoint `whatsappNumbers` | Ativo (verificação em lote, não mensagem) | Não informado | Banimento/restrição | Relevante p/ Lais: validar número antes de enviar (recomendado no research 026) tem risco próprio se feito em lote/rápido, não é mitigação de custo zero | NOVO |
| 25 | [Evolution API #687](https://github.com/EvolutionAPI/evolution-api/issues/687) | Baileys/Evolution | "Quando ativo o serviço de envio" | Indeterminado | Número novo (trocado repetidamente) | Banimento em <24h | v1.8.1, sem detalhe de volume | NOVO |
| 26 | [whatsmeow #807](https://github.com/tulir/whatsmeow/issues/807) | whatsmeow | Múltiplos clientes; autor nega atividade excessiva | **Reativo alegado** ("nothing out of the ordinary or excessive") | Não informado | Banimento; fechada "not planned" | Mantenedor não vê como bug da biblioteca | NOVO |
| 27 | [whatsmeow #561](https://github.com/tulir/whatsmeow/issues/561) | whatsmeow | Uso pessoal, mensagens e arquivos | **Reativo/pessoal** | **Mais de 1 ano de uso** | Logout forçado ("using an unofficial app"), exige reverificação — não é ban permanente, mas é interrupção severa | Sequência técnica: erro 503 → reconexão → 403 com logout | NOVO — caso forte: sessão **antiga** ainda foi atingida |
| 28 | [whatsapp-web.js #981](https://github.com/pedroslopez/whatsapp-web.js/issues/981) | whatsapp-web.js | 5 mensagens, delay 1–4s, loop p/ 10–20 números ("maioria conversas em andamento") | Misto (loop ativo, mas alega conversas existentes) | Não informado | Banimento | 2021, resposta oficial citou "unauthorized application" | NOVO |
| 29 | [whatsapp-web.js #1872](https://github.com/pedroslopez/whatsapp-web.js/issues/1872) | whatsapp-web.js | 20 mensagens a não-contatos em 30 min | Ativo/frio | Não informado | Bloqueio | — | NOVO |
| 30 | [whatsapp-web.js #3565](https://github.com/pedroslopez/whatsapp-web.js/issues/3565) | whatsapp-web.js | Clientes estabelecidos de um SaaS | **Reativo alegado** ("we only send messages when they send us") | **Clientes usando o projeto há muito tempo** | Banimento "sem motivo aparente" | Fechada sem resolução documentada | NOVO — **contraexemplo direto à tese "reativo = seguro"** |
| 31 | [whatsapp-web.js #2701](https://github.com/pedroslopez/whatsapp-web.js/issues/2701) | whatsapp-web.js | SaaS com ~30 clientes conectados | Misto | Não informado | Banimento parcial da base (alguns sim, outros não) | Suspeita do autor: IP de datacenter (Hetzner/Helsinki) vs. SIM brasileiro, e volume de conexões do mesmo IP | NOVO |
| 32 | [whatsapp-web.js #3056](https://github.com/pedroslopez/whatsapp-web.js/issues/3056) | whatsapp-web.js | — | Indeterminado | Não informado | Banimento permanente, mesmo após trocar IP e número | — | NOVO |
| 33 | [WPPConnect #715](https://github.com/wppconnect-team/wppconnect/issues/715) | WPPConnect (wa-js, não Baileys) | Avisos de cobrança | **Ativo** (mensagens de cobrança são iniciadas pela empresa) | "Já algum tempo" de uso | Banimento | Biblioteca de base diferente (wa-js), mas mesmo padrão de detecção de cliente não-oficial | NOVO |
| 34 | [Gegenhuber et al., NDSS 2026](https://arxiv.org/html/2511.20252v1) — "Hey there! You are using WhatsApp" (Universidade de Viena / SBA Research) | whatsmeow | **5 contas**, ~5 meses (dez/2024–abr/2025), consulta de **7.000 números/segundo** (contact-discovery, não troca de mensagens 1:1) | Ação diferente da conversação — consulta em massa | Não especificado, mas servidor de universidade com contato de abuso público | **Nenhum banimento permanente**; 1 banimento temporário autoinduzido por erro próprio | **[metodologia verificável, peer-reviewed]** — fonte de maior credibilidade de toda a pesquisa (023+026+028), mas ação testada não é comparável 1:1 a atendimento conversacional | NOVO — ver ressalva na seção seguinte |
| 35 | [Hacker News #43533549](https://news.ycombinator.com/item?id=43533549) — `kinduff` | whatsmeow (bridge Matrix) | Uso pessoal, 3 números diferentes | **Reativo/pessoal** | **4+ anos** | **Sem banimento** | "The controls they have in place are probably based on behavior, rather than on access" | NOVO |
| 36 | Mesma thread HN — `vdfs` | Genérico | Opinião, sem caso concreto | N/A | N/A | N/A | Alega que automação detectada quase sempre bane — sem caso citado, baixo valor probatório | NOVO (fraco) |
| 37 | whatsmeow discussion #199 — `giuseongit` (out/2025) | whatsmeow | Notificações de consulta, só a contatos já salvos, janela 9h–12h, delay ≥500ms | **Reativo/controlado** | Não informado | **Sem banimento** até a data do relato | — | NOVO |
| 38 | whatsmeow discussion #199 — `wxnnvs` (dez/2025) | whatsmeow (Baileys citado como padrão similar) | Autoresponder ping-pong, só contatos que iniciaram | **Reativo** | Não informado | **Sem banimento** | — | NOVO |
| 39 | whatsmeow discussion #199 — `deven96` (2022), `kalijassy` (2022) | whatsmeow | Não detalhado | Indeterminado | Não informado | Banimento (ambos) | Relatos de baixa qualidade, sem volume | NOVO (fraco) |

---

## A narrativa "crackdown de janeiro de 2026" — encontrada, e descartada como evidência

Um achado lateral relevante: a alegação de que "a partir de janeiro de 2026 a Meta intensificou
de forma coordenada a detecção de bibliotecas não-oficiais, com instâncias que rodavam há meses
caindo em 24–48h" aparece, quase palavra por palavra, em pelo menos quatro blogs comerciais
diferentes:

- [Cubo Suite](https://blog.cubosuite.com.br/venom-bot-e-whatsapp-web-js-bibliotecas-nao-oficiais-e-o-risco-de-ban/)
  — alega "40–60% das contas rodando API paralela sofreram suspensão no Q1 2026"; cita
  `[fonte: Meta]` sem link; vende a própria "Cloud API oficial, gerenciada e white label".
- [DAS Tecnologia](https://blog.dastecnologia.com/whatsapp-business-ai-brasil-bloqueios-meta-2026.html)
  — mesma narrativa, "relatos do mercado" sem link nenhum; vende "desenvolvimento de software sob
  medida" para migração.
- Agência Café Online e blog.tipefy.com — mesmo padrão, mesma ausência de fonte primária citável.

**Nenhum dos quatro cita uma política publicada da Meta, uma issue de mantenedor, ou qualquer dado
com metodologia.** É conteúdo de SEO reciclando a mesma alegação não verificada entre si, todos
vendendo a mesma alternativa (migração para API oficial). Isto não invalida que a atenção da Meta a
bibliotecas não-oficiais possa ter aumentado — vários casos NOVOS catalogados acima (Evolution API
#1650, #2497, #2228) são de fato de 2025–2026 e mostram padrão consistente com maior severidade —
mas a alegação específica de "crackdown coordenado em janeiro de 2026" com percentual "40–60%"
**não tem nenhuma fonte independente encontrada nesta pesquisa** e deve ser tratada como marketing,
não como fato, na mesma linha do que research 023 já havia feito com Z-API e Achiya.

---

## Cruzamento com o perfil específico do projeto

O ticket 016 já decidiu por: **conexão única, biblioteca tipo Baileys (self-hosted), número com
anos de histórico humano real (WhatsApp Business Premium), uso majoritariamente reativo**. Nenhum
caso encontrado nesta pesquisa nem nas duas anteriores testa exatamente essa combinação — o mais
próximo é o whatsmeow #561 (sessão de mais de um ano, ainda assim atingida) e o par
ZzJordan/#2441 (idade da *sessão*, não da conta humana por trás, reduz risco de forma mensurável).
Ainda assim, dá para separar os casos por quantos fatores de proteção do projeto cada um
compartilha:

**Casos que combinam conexão única + biblioteca tipo Baileys/whatsmeow + reativo (ou quase) + teve
problema** (8): #5 (whatsmeow #810), #8 (Baileys #1869, parcial — grupo, não 1:1), #21 (Baileys
#1850, rajada), #22 (Evolution API #1650), #23 (Evolution API #2497), #26 (whatsmeow #807), #27
(whatsmeow #561), #30 (whatsapp-web.js #3565).

**Casos com o mesmo perfil que NÃO tiveram problema** (5, incluindo o de maior credibilidade
metodológica): #7 (ZzJordan, sessão de 4 semanas), #34 (paper NDSS — ressalva: ação diferente),
#35 (kinduff, 4+ anos), #37 (giuseongit), #38 (wxnnvs).

**Isto não é uma proporção estatística válida** — é uma contagem de conveniência dentro de uma
amostra pequena e enviesada (issues de GitHub existem porque algo deu errado; ninguém abre issue
para relatar "funcionou"). A leitura honesta que essa contagem sustenta: **existe evidência real e
recorrente de que o perfil "reativo + conta com histórico" não é imune**, o suficiente para
rejeitar qualquer leitura de "risco desprezível". Mas também existe evidência real, incluindo a
fonte mais confiável de toda a pesquisa, de que esse mesmo perfil **frequentemente não dá
problema**. As duas coisas são verdadeiras ao mesmo tempo, e é isso que sustenta "baixo-moderado"
em vez de "baixo" ou "alto".

### Fatores redutores já identificados (research 026), reforçados ou matizados aqui

- **Idade da sessão reduz risco, de forma mensurável** — reforçado pelo par ZzJordan (#7) e por
  kinduff (#35, 4+ anos sem problema). Mas #23 (Evolution API #2497) mostra que **idade do número
  não é o mesmo que idade da sessão**, e só a segunda parece proteger de forma consistente — o
  ponto que o research 026 já havia sinalizado como não confirmado ("idade da conta humana dilui o
  peso da sessão nova" é inferência, não teste).
- **Reativo-apenas reduz mas não elimina** — confirmado de novo por #26, #27, #30: mesmo relatos
  que alegam comportamento estritamente reativo tiveram problema. Consistente com o achado central
  do research 026 (token `tctoken`/`cstoken` mal implementado conta resposta como contato frio).
- **Token de relação implementado corretamente continua sendo a variável mais provável por trás da
  diferença entre casos bons e ruins** — nenhum dos casos catalogados aqui confirma ou refuta isso
  diretamente (nenhum relato de usuário verifica a versão exata do token em uso), o que continua
  sendo a lacuna mais relevante, já registrada no research 026.

### Fatores de risco residual (reforçados aqui)

- **Rollout de passkey e mudanças de política ao longo do tempo** — #8 (Baileys #1869) segue sendo
  o caso mais forte: 2 bots de 3 anos, sem incidente, banidos na mesma semana que outros três.
  Nenhum caso novo desta pesquisa contradiz isso.
- **Validação de número antes de enviar tem custo próprio** — achado novo desta pesquisa (#24,
  Evolution API #2228): verificar números em lote/rápido também pode acionar restrição. A
  recomendação do research 026 de "sempre validar com `onWhatsApp` antes de enviar" continua
  válida, mas precisa ser feita devagar, não em lote, para não criar o problema que tenta evitar.
- **IP/geografia do servidor** — reforçado por #14 (Baileys #2309, só ocorre em produção, não
  local) e #31 (whatsapp-web.js #2701, suspeita de IP de datacenter fora do Brasil). Ainda
  **heurística de comunidade, sem confirmação técnica de mantenedor**, mas agora com dois casos
  novos convergindo com o que já era apontado em research 023/026.
- **Só conectar já é sinal, independente de comportamento** — achado novo mais importante desta
  pesquisa: #22 e #23 (Evolution API #1650, #2497) mostram banimento **antes de qualquer
  mensagem**, só ao vincular a sessão. Isso é relevante em particular para o teste do ticket 027 —
  o primeiro risco não é "o agente vai se comportar mal", é "o ato de vincular pode por si só
  disparar alguma coisa", o que reforça por que testar num número descartável antes é
  indispensável, não uma cautela excessiva.

---

## Metodologia e limites desta estimativa

1. **Amostra de conveniência, não amostra estatística.** Toda a base é issues de GitHub,
   discussions, um thread de Hacker News e um paper acadêmico — nenhum desses é uma amostra
   aleatória de "todo self-hosted WhatsApp bot em operação". Não há denominador conhecido (quantos
   bots rodam sem problema e nunca aparecem em lugar nenhum).
2. **Viés de relato é estrutural, não incidental.** Um bot que funciona por anos sem incidente não
   gera issue, não gera post, não aparece em busca nenhuma. A proporção "8 problema / 5 sem
   problema" encontrada aqui está inflada para o lado do problema por essa razão — o número real de
   "sem problema" no universo de todos os deployments é quase certamente muito maior do que essa
   proporção sugere, só não é visível publicamente.
3. **Nenhuma fonte mede o cenário exato do projeto.** Conexão adicional numa conta Premium com
   anos de histórico humano real, reativo, atendimento de loja física de médio ticket — essa
   combinação específica não foi testada por ninguém publicamente, nem no paper acadêmico (que
   testa outra ação — contact discovery, não conversação).
4. **Reddit não retornou resultados substantivos.** Buscas diretas em r/WhatsApp, r/selfhosted,
   r/n8n e buscas gerais com `site:reddit.com` não trouxeram threads com relato técnico
   verificável sobre este tema — o mecanismo de busca disponível para esta pesquisa parece não
   indexar Reddit de forma útil (não é evidência de que Reddit não tenha essas discussões, é
   lacuna de ferramenta, registrada como tal).
5. **A idade exata da conta/sessão falta na maioria dos relatos.** Menos de um terço dos casos
   catalogados informa a idade da conta ou da sessão — a variável que o research 026 identificou
   como a mais determinante. Isso limita bastante o quanto a tabela consegue isolar esse fator.
6. **Vendor blogs foram buscados ativamente e descartados como evidência**, não porque sejam
   necessariamente falsos, mas porque nenhum publica metodologia verificável — tratamento
   consistente com o que research 023 já havia estabelecido como padrão de honestidade do projeto.

---

## Lacunas que esta pesquisa não fecha

1. **Segue sem existir uma taxa de banimento medida e publicada, para qualquer cenário.** Esta
   pesquisa não encontrou nada melhor que os autodeclarados de Z-API e Achiya (já registrados como
   não confiáveis em research 023) — e essa ausência, confirmada de novo depois de uma busca mais
   ampla, é ela mesma parte da resposta.
2. **Nenhum caso testa "dispositivo adicional numa conta com múltiplos companions já ativos"** —
   o arranjo exato da Lais Aliski Casa (research 024). Todos os casos catalogados são de sessão única
   nova, não de sessão nova somada a vários dispositivos humanos já conectados.
3. **O paper acadêmico (NDSS 2026) é a fonte mais confiável encontrada, mas testa ação diferente**
   (consulta de contact-discovery em massa, não troca de mensagens 1:1) — não é seguro
   generalizar "WhatsApp tolera bem contas whatsmeow" de contact-discovery para conversação, são
   sinais de detecção potencialmente distintos.
4. **Não foi possível confirmar, para nenhum caso novo, se a biblioteca em uso tinha o ciclo
   `tctoken`/`cstoken` implementado corretamente** — a variável que o research 026 identificou
   como provável explicação central para banimento em uso reativo. Sem essa informação, não dá
   para saber quantos dos 8 "casos ruins parecidos com o perfil" são explicados por essa lacuna de
   implementação (mitigável) versus por um fator fora do controle do projeto.
5. **A proporção 8/5 não tem, e não pode ter, intervalo de confiança.** Reafirmando o ponto 2 da
   metodologia: qualquer tentativa de tratar essa proporção como probabilidade seria fabricar
   precisão que a evidência não tem.

---

## Recomendação (não-vinculante — a decisão é do dono do projeto)

A leitura desta pesquisa, somando os ~40 casos catalogados (novos e antigos) ao que os research
023 e 026 já haviam estabelecido: **a estimativa de risco para o cenário da Lais Aliski Casa é
baixo-moderado, não baixo puro** — a pesquisa adicional puxou a leitura ligeiramente para cima em
relação ao tom mais otimista do research 026, porque encontrou casos novos e concretos (Evolution
API #1650 e #2497 acima de tudo) em que número antigo e ausência total de atividade não evitaram
problema. Isso não muda a decisão já tomada no ticket 016 — nenhuma fonte nova sustenta que o
risco seja alto o suficiente para justificar abandonar a arquitetura escolhida — mas reforça, com
mais evidência do que existia antes, que:

1. **O checklist do research 026 não é uma lista de boas práticas opcionais — é o que separa,
   pela leitura desta pesquisa, os casos "parecidos e sem problema" dos "parecidos e com
   problema"**, na medida em que essa separação é visível na amostra (implementação correta do
   token de relação, validação de número devagar não em lote, hospedagem estável, jitter).
2. **O teste do ticket 027 precisa incluir explicitamente monitorar o momento da própria
   vinculação da sessão**, não só o comportamento depois — dado que dois casos novos (#22, #23)
   mostram banimento antes de qualquer mensagem.
3. **Nenhum número desta pesquisa, nem dos research anteriores, deve aparecer em material voltado
   ao dono do projeto ou a terceiros como se fosse uma taxa medida.** A frase mais honesta que
   esta pesquisa sustenta é: "o risco é real, provavelmente administrável dentro do padrão baixo-
   moderado observado na comunidade, e não existe hoje, em lugar nenhum publicamente, uma medição
   confiável melhor do que isso."
