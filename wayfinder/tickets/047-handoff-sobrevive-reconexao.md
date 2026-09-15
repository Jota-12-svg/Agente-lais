---
id: "047"
title: Detecção de handoff sobrevive a reconexão/boot do runtime
labels: [wayfinder:incident]
status: in-progress
assignee: Claude
blocked-by: []
---

## Question

Achado real em produção, 2026-09-14: a Manu respondeu um cliente (`269990234169473@lid`) que
já estava em conversa com a consultora Viviane Loyola — a consultora tinha mandado dois
áudios pelo número da loja 40 minutos antes de o runtime subir (deploy que removeu o
`ALLOWED_JID`, 20:12:34 UTC); a Manu nunca viu esse evento `fromMe` e tratou a próxima
mensagem do cliente como atendimento novo, recomeçando a qualificação do zero (log real em
`railway logs`, confirmado linha a linha contra o print do dono).

**Causa raiz**: `estadoDe(jid)` (`agente-runtime/index.js:134`) cria estado novo como
`qualificando` por padrão para qualquer jid desconhecido. A detecção de handoff (009/012) só
existe como efeito colateral de observar um evento `fromMe` **enquanto o processo está
conectado**. Se o processo não estava no ar (ou reconectando) no instante em que a
consultora escreveu, o sinal se perde para sempre — não é um `continue` reversível, é
ausência total de sinal. Isso não é específico de restart de deploy: os logs mostram o
Baileys reconectando sozinho com frequência, fora de qualquer deploy.

A decidir/construir:

- Como recuperar o sinal `fromMe` perdido quando o processo reconecta (via o histórico que o
  Baileys reenvia, hoje descartado por um filtro de idade que serve a um propósito diferente).
- Como diferenciar, nesse histórico reenviado, uma mensagem `fromMe` da própria Manu de uma
  mensagem `fromMe` humana — as duas são indistinguíveis no evento cru.
- Até onde no tempo esse sinal vale (mesma pergunta que 012/013 já resolveram para "contato
  perdido").
- O que fazer enquanto a correção não está validada ao vivo — rede de segurança na conversa.

**Resolvido quando** a detecção sobreviver a uma reconexão real testada de propósito (não só
`node --check`), com o mesmo padrão de prova ao vivo usado no 036.

---

## Resolução

Sessão de grilling em 2026-09-14 (3 rodadas, 10 perguntas, todas confirmadas pelo dono).
Fatos levantados antes de perguntar (não suposição): `railway logs --since/--until` da janela
do incidente, inspeção local da lib Baileys (`6.7.24`) instalada só para leitura.

### Diagnóstico confirmado

- O processo só subiu às 20:12:34 UTC nesse deploy, reidratando `total: 0` engajamentos —
  esse cliente nunca tinha conversa registrada com o agente.
- Os áudios da consultora (19:32 UTC) foram mandados antes desse boot — o socket do agente
  não existia pra ver o evento.
- 3 minutos depois de a Manu errar (20:31:51 UTC), a consultora escreveu de novo já com o
  processo no ar — aí sim `>>> Consultora assumiu esta conversa... Manu em silêncio aqui`. O
  mecanismo funciona; só chega tarde quando perde a janela de boot/reconexão.
- Achado técnico: a lib expõe um evento `messaging-history.set`, emitido quando o WhatsApp
  reenvia histórico numa (re)conexão — é a fonte que o comentário do código já citava
  ("histórico recente reenviado ao reconectar"). Hoje esse conteúdo é descartado por um
  filtro único (`idadeMs > 15000`) que serve dois propósitos diferentes: não re-responder
  mensagem de cliente já respondida (correto) e não perder sinal `fromMe` humano (incorreto —
  são propósitos opostos usando o mesmo filtro).

### Decisão

1. **Rede de segurança imediata (conversa)** — seção nova no `system-prompt.md` (espelhada em
   `prototipo-tom-014/system-prompt.md`), no padrão da seção "Quando não é cliente": se a
   primeira mensagem que a Manu vê de um jid não faz sentido como resposta a uma pergunta
   dela (confirma algo que ela não perguntou, manda endereço sem ter sido pedido), ela
   pergunta se o cliente já está falando com uma consultora antes de recomeçar a qualificação
   do zero. Não resolve a causa raiz — é o intervalo até o fix técnico entrar no ar.
2. **Backfill em toda reconexão, não só no boot** — o runtime escuta `messaging-history.set`
   toda vez que o socket (re)conecta (`start()` já roda de novo em cada reconexão hoje).
   Qualquer mensagem `fromMe` **humana** dentro da janela de 3 dias (mesmo número já fixado em
   012/013 para "contato perdido", reaproveitado aqui em vez de um quarto número novo) marca o
   jid como `com_consultora` — **inclusive sobrepondo um atendimento `encerrado`**: se a
   consultora escreveu depois do fechamento, ela está com o caso na mão de novo, e deixar a
   Manu recomeçar por cima disso é o mesmo erro que este ticket corrige.
3. **Desambiguação robusta (não a versão simples)** — tabela nova `agent_sent_messages`
   (`message_id`, `contact_jid`, `sent_at`), gravada no mesmo ponto onde a Manu envia
   mensagem hoje (`index.js`, logo após `sock.sendMessage`), com limpeza das linhas com mais
   de 3 dias. É o que permite saber que uma mensagem `fromMe` antiga é da própria Manu (não
   conta como handoff) mesmo depois de um restart, sem isso a decisão 2 acima arriscaria
   nunca reconhecer handoff nenhum quando na verdade era a própria Manu falando antes de cair.
   Mesmo padrão de segredo/RPC de `engagements` (Vault, `security definer`) — reaproveita o
   `engagement_secret` já existente, não cria um segredo novo só pra isso.
4. **Validação ao vivo obrigatória antes de fechar** — mesmo padrão do 036: forçar uma
   reconexão real com uma mensagem `fromMe` de teste chegando via histórico reenviado, não só
   `node --check`/revisão de código.

### O que fica de fora, de propósito

- Checagem ativa via `fetchMessageHistory` (consultar Baileys sob demanda antes de responder a
  um jid nunca visto) — descartada como mecanismo principal: a API exige uma msg-key de
  referência que não existe pra um jid nunca visto, e adicionaria latência a cada primeira
  resposta. Fica registrada como fallback se o backfill via `messaging-history.set` se
  mostrar insuficiente na validação ao vivo.
- Checklist manual de reconciliação a cada reconexão — não escala pra quando o agente
  reconecta sozinho fora de uma sessão.

**Migration aplicada em produção em 2026-09-14**, via SQL Editor (mesmo caminho do 046 —
`db push`/CLI seguiram fora do alcance desta worktree, sem bloqueio de permissão desta vez).
Confirmado por leitura direta, não só pela mensagem de sucesso: as 3 colunas de
`agent_sent_messages` batem no `information_schema`, as duas RPCs existem com `EXECUTE`
concedido a `anon`, e uma chamada de propósito com segredo errado devolveu `ERROR 28000:
forbidden` — o mesmo padrão de prova usado no 046 pro `engagement_secret`.

**Pendente:** só a validação ao vivo do item 4 — uma reconexão real do runtime com uma
mensagem `fromMe` de teste chegando via histórico reenviado. Depende de alguém escanear o QR
de novo no número da loja, o que também é pré-requisito para o próprio agente voltar a
responder qualquer cliente (`/health` mostrando `"conectando"` desde as 20:43 UTC de hoje).
Ticket segue `in-progress` até esse teste acontecer.

---

## Addendum — 2026-09-14, mesmo dia (validação ao vivo corrigiu o mecanismo da decisão 2)

**A decisão 2 acima estava errada na escolha do evento.** Testado ao vivo (dono conectou o
próprio celular pessoal num contato de teste, com `ALLOWED_JID` restrito a ele, forçou logout
completo e reescaneou o QR — reconexão de verdade, não simulada): `messaging-history.set`
**nunca disparou**. Investigado no código da lib instalada localmente
(`@whiskeysockets/baileys@6.7.24`): esse evento só é processado quando `shouldSyncHistoryMessage`
manda (`Socket/index.js`), que por padrão só retorna `true` se `syncFullHistory: true` estiver
setado — e não está, nem deveria estar só pra isso (baixar histórico completo de conversa é um
escopo de dado bem maior que o necessário, questão de LGPD que o mapa não decidiu).

**O mecanismo certo é mais simples e já estava parcialmente construído**: mensagem enviada
enquanto o aparelho estava offline chega pelo `messages.upsert` normal de qualquer forma — o
Baileys marca `offline: true` no node do lado do servidor e entrega via `type: 'append'`
(`Socket/messages-recv.js`), pelo MESMO handler que já trata `fromMe` em tempo real (009/012).
O bug nunca foi "o sinal não chega" — é que o filtro de "mensagem velha, não é evento de agora"
(15s, pensado só pra não re-responder cliente) descartava a mensagem antes da checagem de
`fromMe`, porque os dois casos passavam pelo mesmo `continue`.

**Correção aplicada**: `fromMe` agora é tratado ANTES desse filtro de 15s, com a janela própria
de 3 dias (item 2 da decisão original, número mantido) usando a MESMA tabela
`agent_sent_messages` (item 3, sem mudança) pra desambiguar. A função `tratarHistoricoReenviado`
e o listener de `messaging-history.set` foram removidos — código morto que nunca executaria
nesta configuração. `fetchMessageHistory` como fallback (seção "O que fica de fora") também
deixa de fazer sentido como próximo passo — o caminho que funciona já está em produção.

Reprodução isolada (`test-fromme-window.mjs`, 6 casos: replay de 40min, dentro/fora da janela
de 3 dias, eco da própria sessão, mensagem antiga da própria Manu via tabela persistida, sem
id) rodada antes do redeploy — todos os casos bateram o esperado.

**Validação ao vivo do item 4 (pendência): em andamento**, mesma sessão — aguardando o
resultado do teste real na conversa de teste depois deste redeploy corrigido.

---

## Addendum — 2026-09-14/15, madrugada (tentativas de validação ao vivo — parcial, não conclusiva)

Múltiplas tentativas de validação ao vivo no número **pessoal** do dono (celular próprio, não o
Business da loja), com um contato de teste real ("Larissa"). Resultado misto — registrado
completo, incluindo os enganos no caminho, porque a próxima sessão precisa saber o que já foi
tentado e o que não prova nada:

- **Achado de infraestrutura, resolvido no caminho**: os primeiros `railway up` falharam
  (`Root directory "/agente-runtime" was not found`) por usar `--path-as-root` de dentro da
  pasta `agente-runtime/`, conflitando com o `rootDirectory` que o 046 já tinha configurado no
  serviço. Corrigido via PR (`main` estava 159 commits atrás de `wayfinder/atendimento-hoje` —
  achado à parte, ver handover) — deploy via GitHub confirmado funcionando.
- **Uma detecção ao vivo bem-sucedida, real**: `>>> Consultora assumiu esta conversa...
  jid: "97624673771575@lid"`, às 23:47:54, com o código corrigido já em produção. Prova que a
  lógica de desambiguação (`agent_sent_messages`) funciona de ponta a ponta. **Não prova**,
  sozinha, a recuperação de mensagem perdida em reconexão (era uma mensagem chegando com o
  processo já conectado, não uma mensagem "presa" de quando ele estava fora do ar).
- **Dois enganos de diagnóstico feitos e corrigidos na hora, registrados para não se repetir**:
  (1) um jid errado (`554191953551@s.whatsapp.net`) foi tratado como sendo da Larissa por
  coincidência de horário no log — o dono confirmou depois que é o **próprio número dele**, e
  as mensagens vistas ali eram ruído de auto-mensagem (ver research aberto sobre isso). (2) um
  reset de estado feito direto no Supabase (`status = 'qualificando'`) não teve efeito porque
  `rehidratarEngajamentos()` só roda uma vez por processo — um logout de WhatsApp sozinho não
  reinicia o processo Node, só reconecta o socket; sem restart completo do container, a memória
  do processo nunca recarrega o estado do banco.
- **A tentativa final de teste limpo (reset + restart completo + logout + mensagem offline +
  reconexão) não produziu evidência clara nem a favor nem contra**: a mensagem de teste enviada
  à Larissa durante a janela offline não apareceu em log nenhum — nem processada, nem ignorada
  por `ALLOWED_JID` — o que sugere falha de descriptografia (ver próximo item), não uma falha da
  lógica do 047.
- **Ruído recorrente identificado, em investigação separada**: toda reconexão no número pessoal
  produziu uma rajada de eventos `fromMe: true` com `remoteJid` igual ao **próprio número da
  conta conectada** (`pushName: null`), acompanhada de erros de sessão do protocolo Signal
  (`PreKeyError`, `SessionError`, `MessageCounterError`). Não apareceu no incidente real desta
  manhã (número Business, sem re-pareamentos repetidos). Hipótese de trabalho: corrupção de
  sessão Signal por múltiplos logout/relogin em menos de uma hora no mesmo número. Pesquisa
  disparada em `wayfinder/research/047-ruido-fromme-proprio-numero.md` para confirmar contra
  fontes primárias (código do Baileys, issues da comunidade) antes de decidir se isso pede
  alguma mudança defensiva no `index.js`.
- **Decisão do dono: parar a validação ao vivo por esta noite.** A lógica está validada por
  dois ângulos sólidos e independentes da instabilidade do WhatsApp pessoal (teste unitário
  isolado, 6/6 casos; a detecção ao vivo real de 23:47:54). A prova específica de "mensagem
  chegando via reconexão depois de ficar presa" segue **pendente**, agora bloqueada por
  instabilidade de protocolo no ambiente de teste, não por dúvida sobre o código.

**Efeito colateral operacional, registrar com destaque**: o número **Business da loja está
desconectado** desde as 20h43 UTC de ontem — a madrugada inteira de testes usou o celular
**pessoal** do dono como substituto. Nenhum cliente real está sendo atendido enquanto isso.
Reconectar o número da loja (não o pessoal) continua sendo a prioridade #0 herdada do handover
anterior — ver "Pendências" do handover de hoje.

**Ticket segue `in-progress`.** Próximos passos, em ordem: (1) ler o research sobre o ruído de
auto-mensagem quando terminar; (2) reconectar o número real da loja; (3) só então repetir a
validação ao vivo do item 4, idealmente sem múltiplos logout/relogin em sequência rápida (o
próprio padrão que corrompeu a sessão hoje).
