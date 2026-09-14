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
