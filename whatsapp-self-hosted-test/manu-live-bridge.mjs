// EXPERIMENTO DESCARTÁVEL, fora do ticket 027 — não é o runtime do agente (isso é o
// ticket 044, em construção numa sessão paralela). Existe só para responder, uma vez, à
// pergunta "a Manu funciona de ponta a ponta com WhatsApp real, com as restrições, o tom e
// o handoff todos juntos?": reusa a MESMA sessão pareada pelo harness do 027 (auth em disco,
// sem escanear de novo), liga a lógica de resposta do prototipo-tom-014/system-prompt.md e o
// escritor real de handoffs do 031 (grava na fila de verdade, marcado como TESTE) — mas só
// dentro de UM jid, escolhido à mão. Qualquer mensagem de outro chat é ignorada, nunca
// respondida.
//
// Uso: node manu-live-bridge.mjs
// Variável opcional: MANU_BRIDGE_JID=<jid> (default: o jid já validado nesta sessão)

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pino from 'pino'
import qrcode from 'qrcode'
import { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import { writeHandoff, handoffWriterDisponivel } from '../prototipo-tom-014/handoff-writer.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const AUTH_DIR = process.env.AUTH_DIR || path.join(HERE, 'auth') // mesma pasta do harness do 027
// Default fixado no jid da Larissa (já confirmado nesta sessão) — trocado do contato
// anterior porque aquela conversa acumulou estado de teste (silêncio travado). Pode ser
// sobrescrito por env var se precisar mudar de novo.
const ALLOWED_JID = process.env.MANU_BRIDGE_JID || '97624673771575@lid'
const SYSTEM_PROMPT_PATH = path.join(HERE, '..', 'prototipo-tom-014', 'system-prompt.md')
const MODEL = process.env.PROTOTIPO_MODEL || 'gemini-3.5-flash-lite' // mesmo default de custo do prototipo-tom-014

function parseEnv(txt) {
  const env = {}
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

function loadGeminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  const candidatos = ['C:/Agente Lais/.env', path.join(HERE, '..', '.env')]
  for (const p of candidatos) {
    if (!existsSync(p)) continue
    const env = parseEnv(readFileSync(p, 'utf8'))
    if (env.GEMINI_API_KEY) return env.GEMINI_API_KEY
  }
  return null
}

const GEMINI_API_KEY = loadGeminiKey()
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY não encontrada (nem em process.env, nem no .env do repo).')
  process.exit(1)
}

const SYSTEM_PROMPT = readFileSync(SYSTEM_PROMPT_PATH, 'utf8')

const logger = pino({ level: 'info', transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } } })

logger.info(
  { allowedJid: ALLOWED_JID, handoffReal: handoffWriterDisponivel() },
  handoffWriterDisponivel()
    ? '>>> Fila real LIGADA — se escalar, grava em handoffs de verdade (marcado como TESTE, apagar depois).'
    : '>>> Fila real DESLIGADA — faltam SUPABASE_*/HANDOFF_INSERT_SECRET no .env; escalada só fica local.',
)

// Histórico e estado de handoff só em memória, só do jid permitido — some ao reiniciar.
// status: 'qualificando' | 'escalado' | 'com_consultora' (mesma taxonomia do run.mjs/012/009).
const history = []
const state = { status: 'qualificando' }
// IDs das mensagens que O PRÓPRIO SCRIPT mandou — para distinguir, num evento fromMe:true,
// "isso é o eco da minha própria resposta" de "isso é você digitando direto do seu aparelho"
// (a segunda é o sinal real de consultora assumindo, ver ticket 009).
const sentByBridge = new Set()

async function askManu() {
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const contexto = [
    '## Contexto agora (não é mensagem do cliente)',
    `- Data e hora: ${agora} (horário de Brasília).`,
    '- Situação: DENTRO do horário de atendimento.',
  ].join('\n')

  const contents = history.map((m) => ({ role: m.role === 'agent' ? 'model' : 'user', parts: [{ text: m.text }] }))

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT + '\n\n---\n' + contexto }] },
    contents,
    generationConfig: { temperature: 0.75, maxOutputTokens: 800, thinkingConfig: { thinkingLevel: 'minimal' } },
  }

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify(body),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error?.message || JSON.stringify(data))

  const cand = data.candidates?.[0]
  const text = (cand?.content?.parts || []).map((p) => p.text).filter(Boolean).join('').trim()
  return text || '(sem texto na resposta)'
}

// Mesmo parser do run.mjs (formato novo trigger=X;nome=Y;motivo=Z, com fallback pro antigo).
function extrairEscalada(textoBruto) {
  const m = textoBruto.match(/\[\[\s*ESCALAR\s*:([^\]]*)\]\]/i)
  if (!m) return { texto: textoBruto, escalou: null }
  const texto = textoBruto
    .replace(/\n*\s*\[\[\s*ESCALAR[^\]]*\]\]\s*/i, '')
    .replace(/\s*\n\s*-{3,}\s*$/, '')
    .trim()
  const corpo = m[1] || ''
  const mStruct = corpo.match(/trigger\s*=\s*([a-z_]+)\s*;\s*nome\s*=\s*([^;]*)\s*;\s*motivo\s*=\s*(.*)/i)
  const mSemNome = mStruct ? null : corpo.match(/trigger\s*=\s*([a-z_]+)\s*;\s*motivo\s*=\s*(.*)/i)
  const trigger = (mStruct?.[1] || mSemNome?.[1] || 'qualified').trim()
  const nome = (mStruct?.[2] || '').trim() || null
  const motivo = (mStruct?.[3] ?? mSemNome?.[2] ?? corpo).trim() || 'não informado'
  return { texto, escalou: { trigger, nome, motivo } }
}

let sock = null

async function start() {
  const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: authState,
    logger: pino({ level: 'warn' }), // trace já serviu seu propósito no 027; aqui só quer sinal de problema
    browser: ['Lais Aliski Casa - Teste 027', 'Chrome', '1.0.0'],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    // Baileys aposentou `printQRInTerminal` — trata o campo `qr` na mão, com ASCII no
    // próprio terminal (não precisa de servidor HTTP, é o operador rodando localmente).
    if (qr) {
      try {
        const ascii = await qrcode.toString(qr, { type: 'terminal', small: true })
        console.log(ascii)
        logger.info('>>> QR acima — escaneie com o WhatsApp (Aparelhos vinculados > Vincular aparelho). Expira em ~60s, renova sozinho.')
      } catch (err) {
        logger.error({ err: err.message }, 'Falha ao renderizar o QR no terminal')
      }
    }
    if (connection === 'open') {
      logger.info({ allowedJid: ALLOWED_JID }, '>>> Conectado — Manu vai responder SÓ neste jid, tudo o mais é ignorado.')
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      if (statusCode === DisconnectReason.loggedOut) {
        logger.error('Sessão deslogada pelo WhatsApp — pare e verifique antes de tentar de novo.')
        return
      }
      logger.warn({ statusCode }, 'Conexão fechada, reconectando em 3s...')
      setTimeout(start, 3000)
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.remoteJid !== ALLOWED_JID) {
        logger.info({ remoteJid: msg.key.remoteJid }, 'Mensagem de outro chat — ignorada de propósito (fora do escopo deste teste).')
        continue
      }

      // O WhatsApp reenvia um histórico recente ao reconectar (visto no item 3 do 027) —
      // sem isso, uma mensagem antiga (ex.: de um teste anterior) parece "acabou de chegar"
      // e dispara reação errada (resposta a algo velho, ou falso "consultora assumiu").
      // Só trata como evento de agora se o timestamp for de fato recente.
      const idadeMs = Date.now() - Number(msg.messageTimestamp) * 1000
      // NaN (timestamp ausente/inválido) precisa cair pro lado "ignora", não "passa" —
      // "NaN > 15000" é false, então sem esta checagem extra uma mensagem sem timestamp
      // válido colaria como "recente" por padrão. Foi exatamente isso que causou um falso
      // "consultora assumiu" na rodada anterior deste teste.
      if (!Number.isFinite(idadeMs) || idadeMs > 15000) {
        logger.info({ idadeMs, remoteJid: msg.key.remoteJid }, 'Mensagem antiga (replay de histórico da reconexão) — ignorada, não é evento de agora.')
        continue
      }

      if (msg.key.fromMe) {
        if (sentByBridge.has(msg.key.id)) {
          sentByBridge.delete(msg.key.id) // eco da própria resposta da Manu — nada a fazer
          continue
        }
        // fromMe, mas NÃO foi o script quem mandou → você digitou direto de outro aparelho.
        // É o sinal real de "consultora assumiu" (ticket 009/012): a Manu cala a partir daqui.
        if (state.status !== 'com_consultora') {
          state.status = 'com_consultora'
          logger.info('>>> Detectado envio humano direto (fromMe, não é eco da Manu) — consultora assumiu, agente em silêncio nesta conversa.')
        }
        continue
      }

      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text
      if (!texto) continue

      if (state.status === 'escalado' || state.status === 'com_consultora') {
        logger.info({ status: state.status }, '>>> Silêncio — já escalado/com consultora, o agente não responde por cima.')
        continue
      }

      logger.info({ texto }, '>>> Mensagem do chat permitido — pedindo resposta à Manu (Gemini)...')
      history.push({ role: 'client', text: texto })

      try {
        const bruto = await askManu()
        const { texto: respostaLimpa, escalou } = extrairEscalada(bruto)
        history.push({ role: 'agent', text: bruto }) // histórico guarda com o marcador, igual ao run.mjs

        await sock.sendMessage(ALLOWED_JID, { text: respostaLimpa }).then((r) => {
          if (r?.key?.id) sentByBridge.add(r.key.id)
        })
        logger.info({ resposta: respostaLimpa }, '>>> Manu respondeu — enviado pelo WhatsApp real.')

        if (escalou) {
          state.status = 'escalado'
          logger.info({ escalou }, '>>> Sinal de escalada detectado — agente entra em silêncio a partir de agora.')
          writeHandoff({
            trigger: escalou.trigger,
            motivo: escalou.motivo,
            contactName: escalou.nome,
            conversationId: `manu-live-bridge:${ALLOWED_JID}`,
          }).then((r) => {
            if (r.ok) logger.info({ id: r.id }, '>>> Chamado gravado na fila real — apagar depois do teste.')
            else logger.warn({ erro: r.error }, '>>> NÃO gravou na fila real — resposta ao cliente já foi enviada, só a fila falhou.')
          })
        }
      } catch (err) {
        logger.error({ err: err.message }, '>>> Falha ao pedir/enviar a resposta da Manu — nada foi mandado.')
      }
    }
  })
}

start().catch((err) => {
  logger.fatal({ err }, 'Falha ao iniciar')
  process.exit(1)
})
