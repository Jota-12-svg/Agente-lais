// Harness de teste do ticket 027 (wayfinder/tickets/027-testar-self-hosted-no-numero-atual.md).
//
// Não é o runtime do agente. É só o instrumento para responder, com teste real,
// as cinco perguntas que o research 024/026 deixou em aberto: o pareamento
// completa; os dispositivos já vinculados sobrevivem; mensagem de outro
// companion (ex.: WhatsApp para Windows) gera evento aqui; o ciclo de token de
// relação evita o erro 463; e o próprio ato de vincular já é, sozinho, um
// momento de risco.
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

// Estado exposto para a rota /qr — não há sessão de usuário aqui, é um teste
// de uma pessoa só, então uma variável de módulo é suficiente.
let latestQR = null
let connectionStatus = 'iniciando'

function describeDisconnect(lastDisconnect) {
  const statusCode = lastDisconnect?.error?.output?.statusCode
  const reasonName = Object.entries(DisconnectReason).find(([, code]) => code === statusCode)?.[0]
  return { statusCode, reasonName, message: lastDisconnect?.error?.message }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version, isLatest } = await fetchLatestBaileysVersion()
  logger.info({ version, isLatest }, 'Versão do protocolo Baileys')

  const sock = makeWASocket({
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
  res.type('text/plain').send(`status: ${connectionStatus}\nqr disponível em /qr quando status = conectando`)
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

app.listen(PORT, () => logger.info({ port: PORT }, 'Servidor HTTP no ar'))
