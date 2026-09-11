// Harness de teste do ticket 027 (wayfinder/tickets/027-testar-self-hosted-no-numero-atual.md).
//
// Não é o runtime do agente. É só o instrumento para responder, com teste real,
// os seis pontos que o ticket deixou em aberto: o pareamento completa; os
// dispositivos já vinculados sobrevivem; mensagem de outro companion (ex.:
// WhatsApp para Windows) gera evento aqui; o ciclo de token de relação evita o
// erro 463; o próprio ato de vincular já é, sozinho, um momento de risco; e
// marcar um chat como não lido (pedido do ticket 035) sincroniza para os
// outros dispositivos vinculados.
//
// Uso: ver README.md deste diretório.

const path = require('node:path')
const express = require('express')
const pino = require('pino')
const qrcode = require('qrcode')
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys')

const PORT = process.env.PORT || 3000
const AUTH_DIR = process.env.AUTH_DIR || path.join(__dirname, 'auth')
// Nível 'trace' é o pedido explícito do ticket (item 4) — é nesse nível que o
// Baileys expõe os nós de protocolo crus, incluindo `<ack ... error='463' />`.
const LOG_LEVEL = process.env.LOG_LEVEL || 'trace'

const logger = pino({
  level: LOG_LEVEL,
  transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } },
})

// Estado exposto para as rotas HTTP — não há sessão de usuário aqui, é um
// teste de uma pessoa só, então variáveis de módulo são suficientes.
let latestQR = null
let connectionStatus = 'iniciando'
let sock = null

// Último recado visto em cada chat, na forma que o item 6 (chatModify)
// exige (`lastMessages`). Guardamos só o essencial, atualizado a cada
// messages.upsert — não é persistido, então some ao reiniciar o processo
// (aceitável: é teste manual, o operador manda uma mensagem de novo).
const lastMessageByJid = new Map()

function describeDisconnect(lastDisconnect) {
  const statusCode = lastDisconnect?.error?.output?.statusCode
  const reasonName = Object.entries(DisconnectReason).find(([, code]) => code === statusCode)?.[0]
  return { statusCode, reasonName, message: lastDisconnect?.error?.message }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version, isLatest } = await fetchLatestBaileysVersion()
  logger.info({ version, isLatest }, 'Versão do protocolo Baileys')

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    // Nome que aparece na lista "Dispositivos vinculados" do WhatsApp — deixe
    // claro que é o dispositivo de teste, para não confundir com o agente real.
    browser: ['Lais Aliski Casa - Teste 027', 'Chrome', '1.0.0'],
    printQRInTerminal: false,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      latestQR = qr
      logger.info('Novo QR gerado — abra /qr nesta URL pública e escaneie pelo aparelho de teste')
    }

    if (connection === 'connecting') {
      connectionStatus = 'conectando'
    }

    if (connection === 'open') {
      connectionStatus = 'conectado'
      latestQR = null
      logger.info(
        '>>> PAREAMENTO COMPLETO — item 1 do ticket respondido: não travou no passkey. ' +
          'Agora é o momento do item 5: confira na loja/aparelho principal se algo estranho ' +
          'aconteceu com a conta nos próximos minutos.',
      )
    }

    if (connection === 'close') {
      connectionStatus = 'desconectado'
      const { statusCode, reasonName, message } = describeDisconnect(lastDisconnect)
      logger.warn({ statusCode, reasonName, message }, 'Conexão fechada')

      const isLoggedOut = statusCode === DisconnectReason.loggedOut
      if (isLoggedOut) {
        logger.error(
          '>>> Sessão deslogada pelo WhatsApp (não foi só queda de rede). Se isso aconteceu ' +
            'sem ação manual, é o sinal de risco do item 5 ou o escalonamento do erro 463 ' +
            'descrito no research 026 — pare o teste e registre o horário exato.',
        )
        return
      }

      logger.info('Tentando reconectar em 3s...')
      setTimeout(start, 3000)
    }
  })

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    for (const msg of messages) {
      const preview =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        (msg.message ? `[${Object.keys(msg.message)[0]}]` : '[sem conteúdo]')

      // Item 6 precisa do último recado do chat no formato que chatModify
      // exige (`lastMessages: [{ key, messageTimestamp }]`) — guardamos aqui
      // para a rota /mark-unread usar, sem precisar caçar no log.
      if (msg.key.remoteJid) {
        lastMessageByJid.set(msg.key.remoteJid, {
          key: msg.key,
          messageTimestamp: msg.messageTimestamp,
        })
      }

      logger.info(
        {
          fromMe: msg.key.fromMe,
          remoteJid: msg.key.remoteJid,
          messageId: msg.key.id,
          timestamp: msg.messageTimestamp,
          upsertType: type,
          preview,
        },
        msg.key.fromMe
          ? '>>> Mensagem própria vista pelo socket (fromMe: true) — se você acabou de mandar ' +
              'essa mensagem de OUTRO dispositivo (Web, celular 2, Windows), este é o evento ' +
              'do item 3 do ticket. Confira o "preview" contra o que você mandou.'
          : 'Mensagem recebida de um contato',
      )
    }
  })
}

start().catch((err) => {
  logger.fatal({ err }, 'Falha ao iniciar o socket')
  process.exit(1)
})

// Servidor HTTP só para expor o QR code (Railway/VPS não tem terminal
// interativo à mão) e um health check simples.
const app = express()

app.get('/', (_req, res) => {
  res.type('text/plain').send(
    `status: ${connectionStatus}\n` +
      'qr disponível em /qr quando status = conectando\n' +
      '/chats — lista os jids de que este harness já viu recado\n' +
      '/mark-unread?jid=<jid> — dispara o teste do item 6 (marcar como não lida)',
  )
})

app.get('/qr', async (_req, res) => {
  if (!latestQR) {
    res.type('text/plain').send(
      connectionStatus === 'conectado'
        ? 'Já conectado — não há QR pendente.'
        : 'Nenhum QR disponível ainda. Atualize a página em alguns segundos.',
    )
    return
  }
  const dataUrl = await qrcode.toDataURL(latestQR)
  res.type('html').send(
    `<html><body style="display:flex;flex-direction:column;align-items:center;font-family:sans-serif">
      <h1>Escaneie com o WhatsApp do aparelho de teste</h1>
      <img src="${dataUrl}" width="320" height="320" />
      <p>Aparelhos vinculados &gt; Vincular aparelho</p>
    </body></html>`,
  )
})

app.get('/health', (_req, res) => res.json({ status: connectionStatus }))

// Item 6 do ticket: listar os chats de que o harness já viu recado, para o
// operador escolher o jid sem caçar no log em trace.
app.get('/chats', (_req, res) => {
  const chats = [...lastMessageByJid.entries()].map(([jid, last]) => ({
    jid,
    ultimoRecadoEm: last.messageTimestamp,
  }))
  res.json({ chats })
})

// Item 6 do ticket: dispara chatModify({ markRead: false }, jid) sob demanda
// — precisa ser manual porque o teste é "marquei não lida aqui, foi para os
// outros dispositivos (celular, Web, Windows)?", uma verificação visual que
// só o operador faz. AVISO da própria doc do Baileys: um chatModify malformado
// pode deslogar a conta de todos os dispositivos — por isso a rota exige o
// jid exato e só usa o último recado que o harness já confirmou ter visto.
app.get('/mark-unread', async (req, res) => {
  const { jid } = req.query
  if (!jid) {
    res.status(400).json({ erro: 'passe ?jid=<remoteJid>, ver /chats para os conhecidos' })
    return
  }
  if (connectionStatus !== 'conectado' || !sock) {
    res.status(409).json({ erro: `socket não está conectado (status: ${connectionStatus})` })
    return
  }
  const lastMessage = lastMessageByJid.get(jid)
  if (!lastMessage) {
    res.status(404).json({
      erro: 'nenhum recado visto ainda para esse jid — mande uma mensagem nesse chat primeiro (ver /chats)',
    })
    return
  }

  logger.info({ jid }, '>>> Item 6: disparando chatModify({ markRead: false }, jid) — ' +
    'confira agora nos outros dispositivos vinculados (celular, WhatsApp Web, app de Windows) ' +
    'se o chat aparece como não lido, e observe a conexão pelos próximos minutos.')

  try {
    await sock.chatModify({ markRead: false, lastMessages: [lastMessage] }, jid)
    logger.info({ jid }, '>>> Item 6: chatModify aplicado sem erro no lado do Baileys — isso ' +
      'responde (a) do item 6. Falta confirmar (b) nos outros aparelhos e (c) que não gerou ' +
      'nada estranho na conexão (mesmo cuidado do item 5).')
    res.json({ ok: true, jid })
  } catch (err) {
    logger.error({ err, jid }, '>>> Item 6: chatModify falhou — registrar no ticket como resultado real')
    res.status(500).json({ ok: false, erro: err.message })
  }
})

app.listen(PORT, () => logger.info({ port: PORT }, 'Servidor HTTP no ar'))
