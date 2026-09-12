// Runtime PROVISÓRIO do agente (Manu) — junta as três peças já validadas separadamente
// (conversa via Gemini do prototipo-tom-014, escrita real na fila do 031, conexão Baileys
// do harness do 027) num processo só, respondendo a QUALQUER cliente real que escrever pro
// número vinculado. Decisão explícita do dono do projeto (2026-09-11): ir ao ar agora, com
// o que já existe, em vez de esperar a versão definitiva do ticket 044.
//
// O QUE FALTA para ser a versão do 044 (registrado, não escondido):
//   - Auth do Baileys em disco (useMultiFileAuthState), não Supabase — todo redeploy sem
//     volume persistente pede o QR de novo. Precisa de um Volume montado em /data no Railway.
//   - Estado de conversa em memória (Map), não Supabase — perde tudo se o processo reiniciar
//     no meio de uma qualificação.
//   - Sem idempotência na escalada (mensagem de gatilho reprocessada pode escalar 2x).
//   - Sem SMS/Telegram no watchdog — só o /health, pra quem configurar depois.
//
// O QUE JÁ TEM, ligado de verdade:
//   - Freio de mão global (036): assina `agent_settings` via Supabase Realtime — se
//     `agent_enabled = false`, o runtime não responde ninguém, em nenhuma conversa.
//   - Silêncio por conversa (009/012): se uma mensagem chegar de outro dispositivo seu
//     (fromMe, não eco da própria Manu), aquela conversa entra em silêncio.
//   - Escalada grava na fila real (031) com o telefone de verdade do cliente.

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import pino from 'pino'
import qrcode from 'qrcode'
import { createClient } from '@supabase/supabase-js'
import { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import { writeHandoff, handoffWriterDisponivel, telefoneDoJid } from './handoff-writer.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const AUTH_DIR = process.env.AUTH_DIR || path.join(HERE, 'auth')
const MODEL = process.env.LLM_MODEL || 'gemini-3.6-flash' // default de produção (ticket 017), não o barato do protótipo
const SYSTEM_PROMPT = readFileSync(path.join(HERE, 'system-prompt.md'), 'utf8')

function parseEnv(txt) {
  const env = {}
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

function loadEnvVar(name) {
  if (process.env[name]) return process.env[name]
  const candidatos = ['C:/Agente Lais/.env', path.join(HERE, '..', '.env')]
  for (const p of candidatos) {
    if (!existsSync(p)) continue
    const env = parseEnv(readFileSync(p, 'utf8'))
    if (env[name]) return env[name]
  }
  return null
}

const GEMINI_API_KEY = loadEnvVar('GEMINI_API_KEY')
const SUPABASE_PROJECT_REF = loadEnvVar('SUPABASE_PROJECT_REF')
const SUPABASE_PUBLISHABLE_KEY = loadEnvVar('SUPABASE_PUBLISHABLE_KEY')
// Restrição opcional a um único jid — decisão do dono em 2026-09-12, primeiro dia no número
// real da loja: validar com um contato de teste antes de abrir pra qualquer cliente. Vazio
// (não setado) = comportamento normal, responde todo mundo. Mesmo padrão do
// whatsapp-self-hosted-test/manu-live-bridge.mjs (sessão 14 de 2026-09-11), aplicado aqui ao
// runtime real em vez de um bridge descartável.
const ALLOWED_JID = loadEnvVar('ALLOWED_JID') || null

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY não encontrada — nem em process.env, nem no .env do repo.')
  process.exit(1)
}

const logger = pino({ level: process.env.LOG_LEVEL || 'info', transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } } })

// ---- Freio de mão global (036) — Realtime na tabela agent_settings ----
let agentEnabled = true // otimista até a primeira leitura confirmar
if (SUPABASE_PROJECT_REF && SUPABASE_PUBLISHABLE_KEY) {
  const supabase = createClient(`https://${SUPABASE_PROJECT_REF}.supabase.co`, SUPABASE_PUBLISHABLE_KEY)
  supabase.from('agent_settings').select('agent_enabled').eq('id', 1).single().then(({ data, error }) => {
    if (error) { logger.warn({ error }, 'Não consegui ler agent_settings — assumindo ligado até a próxima leitura.'); return }
    agentEnabled = data.agent_enabled
    logger.info({ agentEnabled }, 'Estado inicial do freio de mão lido.')
  })
  supabase
    .channel('agent_settings_runtime')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'agent_settings', filter: 'id=eq.1' }, (payload) => {
      agentEnabled = payload.new.agent_enabled
      logger.warn({ agentEnabled, toggledBy: payload.new.toggled_by }, '>>> FREIO DE MÃO: estado mudou via Realtime.')
    })
    .subscribe((status) => logger.info({ status }, 'Assinatura Realtime do freio de mão'))
} else {
  logger.warn('SUPABASE_PROJECT_REF/SUPABASE_PUBLISHABLE_KEY ausentes — freio de mão global NÃO está ligado (agente sempre responde).')
}

// ---- Estado por conversa (jid → {history, status, sentByBridge}) ----
// status: 'qualificando' | 'escalado' | 'com_consultora'. Tudo em memória — some num restart.
const conversas = new Map()
function estadoDe(jid) {
  if (!conversas.has(jid)) conversas.set(jid, { history: [], status: 'qualificando', sentByBridge: new Set() })
  return conversas.get(jid)
}

function foraDoExpediente() {
  const agora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const dia = agora.getDay() // 0=dom .. 6=sáb
  const hora = agora.getHours() + agora.getMinutes() / 60
  if (dia === 0) return true // domingo, loja fechada
  if (dia === 6) return !(hora >= 9 && hora < 13)
  return !(hora >= 9 && hora < 18)
}

async function askManu(history) {
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const fde = foraDoExpediente()
  const contexto = [
    '## Contexto agora (não é mensagem do cliente)',
    `- Data e hora: ${agora} (horário de Brasília).`,
    '- Horário de atendimento da loja: segunda a sexta 9h–18h, sábado 9h–13h.',
    `- Situação: ${fde ? 'FORA do horário de atendimento — qualifique, mas não prometa que alguém responde agora; diga quando o atendimento volta.' : 'DENTRO do horário de atendimento.'}`,
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

// Mesmo parser do run.mjs/manu-live-bridge.mjs (trigger=X;nome=Y;motivo=Z, com fallback).
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
let latestQR = null
let connectionStatus = 'iniciando'

async function start() {
  const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: authState,
    logger: pino({ level: 'warn' }),
    browser: ['Lais Aliski Casa - Manu', 'Chrome', '1.0.0'],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      latestQR = qr
      connectionStatus = 'conectando'
      logger.info('Novo QR gerado — abra /qr nesta URL pública e escaneie pelo WhatsApp da loja.')
    }
    if (connection === 'open') {
      connectionStatus = 'conectado'
      latestQR = null
      if (ALLOWED_JID) {
        logger.warn({ ALLOWED_JID }, '>>> Runtime conectado — MODO TESTE: só responde este jid, qualquer outro é ignorado em silêncio.')
      } else {
        logger.info('>>> Runtime conectado — Manu responde clientes reais a partir de agora.')
      }
    }
    if (connection === 'close') {
      connectionStatus = 'desconectado'
      const statusCode = lastDisconnect?.error?.output?.statusCode
      if (statusCode === DisconnectReason.loggedOut) {
        logger.error('Sessão deslogada pelo WhatsApp — precisa vincular de novo em /qr.')
        return
      }
      logger.warn({ statusCode }, 'Conexão fechada, reconectando em 3s...')
      setTimeout(start, 3000)
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      const jid = msg.key.remoteJid

      // Grupos e newsletters não são clientes 1:1 — a Manu não responde ali.
      if (jid?.endsWith('@g.us') || jid?.endsWith('@newsletter')) continue

      // Restrição de teste (ver ALLOWED_JID acima) — ignora silenciosamente qualquer outro
      // contato, sem logar nem tocar em estado. Cliente real nenhum recebe resposta enquanto
      // isso estiver setado.
      if (ALLOWED_JID && jid !== ALLOWED_JID) continue

      // Histórico recente reenviado ao reconectar (item 3 do 027) não é evento de agora.
      const idadeMs = Date.now() - Number(msg.messageTimestamp) * 1000
      if (!Number.isFinite(idadeMs) || idadeMs > 15000) continue

      const st = estadoDe(jid)

      if (msg.key.fromMe) {
        if (st.sentByBridge.has(msg.key.id)) { st.sentByBridge.delete(msg.key.id); continue }
        if (st.status !== 'com_consultora') {
          st.status = 'com_consultora'
          logger.info({ jid }, '>>> Consultora assumiu esta conversa (envio direto de outro aparelho) — Manu em silêncio aqui.')
        }
        continue
      }

      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text
      if (!texto) continue

      if (!agentEnabled) {
        logger.warn({ jid }, '>>> FREIO DE MÃO ligado — agente não responde (nem loga como qualificando).')
        continue
      }

      if (st.status === 'escalado' || st.status === 'com_consultora') {
        logger.info({ jid, status: st.status }, 'Silêncio — já escalado/com consultora.')
        continue
      }

      logger.info({ jid, texto }, 'Mensagem de cliente — pedindo resposta à Manu (Gemini)...')
      st.history.push({ role: 'client', text: texto })

      try {
        const bruto = await askManu(st.history)
        const { texto: respostaLimpa, escalou } = extrairEscalada(bruto)
        st.history.push({ role: 'agent', text: bruto })

        const enviado = await sock.sendMessage(jid, { text: respostaLimpa })
        if (enviado?.key?.id) st.sentByBridge.add(enviado.key.id)
        logger.info({ jid, resposta: respostaLimpa }, 'Manu respondeu.')

        if (escalou) {
          st.status = 'escalado'
          logger.info({ jid, escalou }, '>>> Escalada detectada — silêncio a partir de agora nesta conversa.')
          writeHandoff({
            trigger: escalou.trigger,
            motivo: escalou.motivo,
            contactName: escalou.nome,
            contactPhone: telefoneDoJid(jid),
          }).then((r) => {
            if (r.ok) logger.info({ jid, id: r.id }, '>>> Chamado gravado na fila real.')
            else logger.error({ jid, erro: r.error }, '>>> NÃO gravou na fila real (resposta ao cliente já foi enviada).')
          })
        }
      } catch (err) {
        logger.error({ jid, err: err.message }, 'Falha ao pedir/enviar resposta — nada foi mandado.')
      }
    }
  })
}

start().catch((err) => {
  logger.fatal({ err }, 'Falha ao iniciar')
  process.exit(1)
})

// ---- HTTP: QR público (pra qualquer consultora abrir do próprio computador) + health ----
const app = express()

app.get('/', (_req, res) => {
  res.type('text/plain').send(
    `status: ${connectionStatus}\n` +
      `freio de mão: ${agentEnabled ? 'ligado (agente responde)' : 'DESLIGADO (agente em silêncio)'}\n` +
      'qr disponível em /qr quando status = conectando',
  )
})

// Endpoint só de dados, consultado via polling pela página /qr — existe porque o QR do
// WhatsApp expira a cada 20-60s (ver connection.update no start()) e uma imagem estática
// escaneada tarde demais dá exatamente o erro "não é possível conectar o aparelho" no
// celular, sem gerar log nenhum do lado do servidor (achado real, 2026-09-12).
app.get('/qr-data', async (_req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({
    status: connectionStatus,
    qr: latestQR ? await qrcode.toDataURL(latestQR) : null,
  })
})

app.get('/qr', (_req, res) => {
  res.type('html').send(
    `<html><body style="display:flex;flex-direction:column;align-items:center;font-family:sans-serif;padding-top:2rem">
      <h1>Vincular a Manu ao WhatsApp da loja</h1>
      <div id="qr-box"><p>Carregando QR…</p></div>
      <p id="msg">No celular da loja: Aparelhos vinculados &gt; Vincular aparelho</p>
      <p style="opacity:.6">Esta página se atualiza sozinha — o QR do WhatsApp expira a cada
      20-60s, não precisa recarregar nem escanear correndo.</p>
      <script>
        async function tick() {
          try {
            const r = await fetch('/qr-data', { cache: 'no-store' })
            const d = await r.json()
            const box = document.getElementById('qr-box')
            const msg = document.getElementById('msg')
            if (d.status === 'conectado') {
              box.innerHTML = '<p style="font-size:1.3rem">✅ Conectado!</p>'
              msg.textContent = 'A Manu já está respondendo neste número.'
              return // para de perguntar, já terminou
            }
            if (d.qr) {
              box.innerHTML = '<img src="' + d.qr + '" width="320" height="320" />'
              msg.textContent = 'No celular da loja: Aparelhos vinculados > Vincular aparelho'
            } else {
              box.innerHTML = '<p>Gerando QR novo…</p>'
            }
          } catch (e) { /* rede falhou nesta rodada — tenta de novo no próximo tick */ }
          setTimeout(tick, 4000)
        }
        tick()
      </script>
    </body></html>`,
  )
})

app.get('/health', (_req, res) => res.json({ status: connectionStatus, agentEnabled }))

app.listen(PORT, () => logger.info({ port: PORT }, 'Servidor HTTP no ar'))
