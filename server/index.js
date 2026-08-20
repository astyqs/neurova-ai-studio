import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, extname, join, normalize } from 'node:path'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'

const port = Number(process.env.PORT || 8787)
const projectRoot = resolve(import.meta.dirname, '..')
// Vercel functions have a read-only project directory. /tmp is writable there,
// while local development keeps the SQLite file in server/data as before.
const databaseDir = process.env.VERCEL ? '/tmp/neurova-data' : join(projectRoot, 'server', 'data')
await mkdir(databaseDir, { recursive: true })

const db = new DatabaseSync(join(databaseDir, 'neurova.db'))
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'Free',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS bots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id TEXT NOT NULL,
    tone TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'violet',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_id INTEGER NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS plan_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_plan TEXT NOT NULL,
    to_plan TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS telegram_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id INTEGER NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    chat_id TEXT,
    username TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    connected_at TEXT
  );
  CREATE TABLE IF NOT EXISTS activity_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id INTEGER REFERENCES bots(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

try {
  db.exec("ALTER TABLE bots ADD COLUMN knowledge_text TEXT NOT NULL DEFAULT ''")
} catch (error) {
  if (!String(error.message).includes('duplicate column name')) throw error
}
for (const statement of [
  "ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE users ADD COLUMN telegram_chat_id TEXT",
  "ALTER TABLE users ADD COLUMN onboarded INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE users ADD COLUMN onboarding_json TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE bots ADD COLUMN avatar TEXT NOT NULL DEFAULT 'crystal'",
  "ALTER TABLE bots ADD COLUMN greeting TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE bots ADD COLUMN scenario_json TEXT NOT NULL DEFAULT ''",
]) {
  try { db.exec(statement) } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error }
}

const templates = [
  { id: 'support', title: 'Клиентский эксперт', label: 'Поддержка 24/7' },
  { id: 'knowledge', title: 'Навигатор знаний', label: 'PDF · База знаний' },
  { id: 'career', title: 'Карьерный тренер', label: 'HR · Обучение' },
]

const demoKnowledge = {
  support: 'Консультант помогает с расписанием, продуктами, выбором услуги, заказами и общими вопросами поддержки. Если точных данных нет, он предлагает уточнить вопрос или обратиться к менеджеру.',
  knowledge: 'Навигатор знаний объясняет, как устроена база знаний: пользователь загружает PDF, TXT или MD, а ассистент находит подходящие фрагменты и отвечает с опорой на них. Для подачи заявки обычно нужны удостоверение личности и заполненная форма.',
  career: 'Карьерный тренер проводит собеседования для frontend-разработчиков. Он задаёт уточняющие вопросы про React, JavaScript, производительность, доступность, работу с командой и даёт конструктивную обратную связь.',
}

const planConfig = {
  Free: { bots: 1, messages: 30, price: 0 },
  Studio: { bots: 3, messages: 1_000, price: 4_900 },
  Scale: { bots: 10, messages: 10_000, price: 12_900 },
}
const planLimits = Object.fromEntries(Object.entries(planConfig).map(([name, value]) => [name, value.bots]))

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

function publicJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  response.end(JSON.stringify(body))
}

function widgetSnippet(request, botId) {
  const host = request.headers.host || 'your-domain.kz'
  const protocol = request.headers['x-forwarded-proto'] || 'http'
  return `<script src="${protocol}://${host}/widget.js" data-bot-id="${botId}"></script>`
}

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 8_000_000) reject(new Error('Слишком большой запрос.'))
    })
    request.on('end', () => {
      try { resolveBody(body ? JSON.parse(body) : {}) } catch { reject(new Error('Некорректный JSON.')) }
    })
    request.on('error', reject)
  })
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${key}`
}

function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':')
  const candidate = scryptSync(password, salt, 64)
  return timingSafeEqual(candidate, Buffer.from(key, 'hex'))
}

function createSession(userId) {
  const token = randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId)
  return token
}

function currentUser(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  return db.prepare(`SELECT users.id, users.email, users.plan FROM sessions
    JOIN users ON users.id = sessions.user_id WHERE sessions.token = ?`).get(token)
}

function userProfile(userId) {
  return db.prepare('SELECT id, email, plan, display_name AS displayName, onboarded, onboarding_json AS onboardingJson, created_at AS createdAt FROM users WHERE id = ?').get(userId)
}

function logEvent(userId, type, detail, botId = null) {
  db.prepare('INSERT INTO activity_events (user_id, bot_id, type, detail) VALUES (?, ?, ?, ?)').run(userId, botId, type, String(detail).slice(0, 180))
}

function messageUsage(userId) {
  return db.prepare(`SELECT COUNT(*) AS total FROM messages JOIN bots ON bots.id = messages.bot_id
    WHERE bots.user_id = ? AND messages.role = 'user' AND messages.created_at >= datetime('now', 'start of month')`).get(userId).total
}

function usageSummary(user) {
  const config = planConfig[user.plan] || planConfig.Free
  return { bots: planLimits[user.plan] || 1, messages: config.messages, price: config.price, usedMessages: messageUsage(user.id) }
}

function canUseMessage(user) {
  const summary = usageSummary(user)
  return summary.usedMessages < summary.messages
}

async function telegramApi(method, body) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return null
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  return response.ok ? response.json() : null
}

function tokenize(value) {
  return String(value).toLocaleLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []
}

function retrieveKnowledge(knowledge, question) {
  const sentences = String(knowledge || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((sentence) => sentence.length > 4)
  const chunks = []
  let current = ''
  sentences.forEach((sentence) => {
    if ((current.length + sentence.length) > 850 && current) { chunks.push(current); current = '' }
    current += `${current ? ' ' : ''}${sentence}`
  })
  if (current) chunks.push(current)
  const terms = [...new Set(tokenize(question))]
  return chunks.map((text) => {
    const normalized = text.toLocaleLowerCase()
    const score = terms.reduce((total, term) => {
      const stem = term.length > 6 ? term.slice(0, -2) : term
      return total + (normalized.includes(term) ? 4 : 0) + (stem.length > 4 && normalized.includes(stem) ? 1 : 0)
    }, 0)
    return { text, score }
  }).filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score).slice(0, 4)
}

function answerFromKnowledge(bot, question) {
  const ranked = retrieveKnowledge(bot.knowledge_text, question)
  if (ranked[0]) {
    return { answer: `Я нашёл ответ в подключённой базе знаний: «${ranked[0].text.slice(0, 700)}»`, source: 'Загруженный документ' }
  }
  const template = templates.find((item) => item.id === bot.template_id)
  return { answer: `Я не нашёл точного ответа в своей базе знаний. Добавьте материал по этой теме или переформулируйте вопрос. Я работаю в роли «${template?.title || 'AI-ассистент'}».`, source: null }
}

async function extractPdfText(base64) {
  const bytes = Buffer.from(String(base64), 'base64')
  if (!bytes.length || bytes.length > 5_000_000) throw new Error('PDF должен быть не больше 5 МБ.')
  // Loading PDF.js only when a PDF is actually uploaded keeps serverless chat
  // requests lightweight and avoids optional canvas dependencies at startup.
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const loadingTask = getDocument({ data: new Uint8Array(bytes), useWorkerFetch: false })
  const document = await loadingTask.promise
  const pages = Math.min(document.numPages, 25)
  const chunks = []
  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    chunks.push(content.items.map((item) => item.str).join(' '))
  }
  await loadingTask.destroy()
  const text = chunks.join('\n').replace(/\s+/g, ' ').trim()
  if (!text) throw new Error('В PDF не найден текст. Для сканов понадобится OCR-обработка.')
  return text.slice(0, 200_000)
}

async function answerWithOpenAI(bot, question, history = []) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL
  if (!apiKey || !model) return null

  const relevantChunks = retrieveKnowledge(bot.knowledge_text, question)
  const knowledge = (relevantChunks.length ? relevantChunks.map((chunk, index) => `Фрагмент ${index + 1}: ${chunk.text}`).join('\n\n') : String(bot.knowledge_text || '')).slice(0, 16_000)
  const conversation = history.slice(-8).map((item) => `${item.role === 'assistant' ? 'Ассистент' : 'Пользователь'}: ${item.content}`).join('\n')
  const instructions = [
    `Вы — ${bot.name}, AI-ассистент в стиле «${bot.tone}».`,
    'Отвечайте на языке вопроса пользователя, кратко и доброжелательно.',
    'Используйте базу знаний как основной источник. Не выдумывайте факты: если информации недостаточно, честно скажите об этом.',
    knowledge ? `База знаний:\n${knowledge}` : 'База знаний пока не подключена.',
  ].join('\n\n')

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, instructions, input: `${conversation ? `Предыдущий контекст:\n${conversation}\n\n` : ''}Текущий вопрос пользователя: ${question}`, max_output_tokens: 600 }),
    })
    if (!response.ok) {
      console.warn(`OpenAI request failed with status ${response.status}; local knowledge mode used instead.`)
      return null
    }
    const data = await response.json()
    const answer = String(data.output_text || '').trim()
    return answer ? { answer, source: knowledge ? 'AI + подключённая база знаний' : 'AI-модель' } : null
  } catch (error) {
    console.warn('OpenAI request failed; local knowledge mode used instead.', error.message)
    return null
  }
}

async function answerWithGemini(bot, question, history = []) {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!apiKey || !model) return null

  const relevantChunks = retrieveKnowledge(bot.knowledge_text, question)
  const knowledge = (relevantChunks.length ? relevantChunks.map((chunk, index) => `Фрагмент ${index + 1}: ${chunk.text}`).join('\n\n') : String(bot.knowledge_text || '')).slice(0, 16_000)
  const instructions = [
    `Вы — ${bot.name}, AI-ассистент в стиле «${bot.tone}».`,
    'Отвечайте на языке вопроса пользователя, кратко и доброжелательно.',
    'Используйте базу знаний как основной источник. Не выдумывайте факты: если информации недостаточно, честно скажите об этом.',
    knowledge ? `База знаний:\n${knowledge}` : 'База знаний пока не подключена.',
  ].join('\n\n')
  const contents = [
    ...history.slice(-8).map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.content).slice(0, 4_000) }],
    })),
    { role: 'user', parts: [{ text: question }] },
  ]

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents,
        generationConfig: { temperature: 0.45, maxOutputTokens: 600 },
      }),
    })
    if (!response.ok) {
      console.warn(`Gemini request failed with status ${response.status}; trying fallback mode.`)
      return null
    }
    const data = await response.json()
    const answer = String(data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '').trim()
    return answer ? { answer, source: knowledge ? 'Gemini + подключённая база знаний' : 'Gemini AI' } : null
  } catch (error) {
    console.warn('Gemini request failed; trying fallback mode.', error.message)
    return null
  }
}

let telegramOffset = 0
let telegramPolling = false
async function processTelegramUpdate(update) {
  const message = update.message
  if (!message?.chat?.id || !message.text) return
  const chatId = String(message.chat.id)
  const start = message.text.match(/^\/start\s+([\w-]+)/i)
  if (start) {
    const link = db.prepare('SELECT * FROM telegram_links WHERE code = ?').get(start[1])
    if (!link) return telegramApi('sendMessage', { chat_id: chatId, text: 'Ссылка подключения устарела. Создайте новую в Neurova.' })
    db.prepare('UPDATE telegram_links SET chat_id = ?, username = ?, connected_at = CURRENT_TIMESTAMP WHERE id = ?').run(chatId, String(message.from?.username || ''), link.id)
    return telegramApi('sendMessage', { chat_id: chatId, text: 'Готово! Этот чат подключён к вашему AI-ассистенту Neurova. Теперь просто напишите вопрос.' })
  }
  const link = db.prepare('SELECT telegram_links.*, bots.* FROM telegram_links JOIN bots ON bots.id = telegram_links.bot_id WHERE telegram_links.chat_id = ?').get(chatId)
  if (!link) return telegramApi('sendMessage', { chat_id: chatId, text: 'Сначала подключите AI-ассистента по персональной ссылке из кабинета Neurova.' })
  const owner = db.prepare('SELECT id, plan FROM users WHERE id = ?').get(link.user_id)
  if (!owner || !canUseMessage(owner)) return telegramApi('sendMessage', { chat_id: chatId, text: 'Лимит сообщений текущего тарифа исчерпан. Обновите тариф в Neurova.' })
  const history = db.prepare('SELECT role, content FROM messages WHERE bot_id = ? ORDER BY id DESC LIMIT 8').all(link.bot_id).reverse()
  const result = await answerWithGemini(link, message.text, history) || await answerWithOpenAI(link, message.text, history) || answerFromKnowledge(link, message.text)
  db.prepare('INSERT INTO messages (bot_id, role, content) VALUES (?, ?, ?), (?, ?, ?)').run(link.bot_id, 'user', message.text, link.bot_id, 'assistant', result.answer)
  return telegramApi('sendMessage', { chat_id: chatId, text: result.answer.slice(0, 4000) })
}

async function pollTelegram() {
  if (telegramPolling || !process.env.TELEGRAM_BOT_TOKEN) return
  telegramPolling = true
  try {
    const payload = await telegramApi('getUpdates', { offset: telegramOffset, timeout: 0, allowed_updates: ['message'] })
    for (const update of payload?.result || []) { telegramOffset = update.update_id + 1; await processTelegramUpdate(update) }
  } catch (error) { console.warn('Telegram polling failed.', error.message) } finally { telegramPolling = false }
}

async function api(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/templates') return json(response, 200, { templates })

  if (request.method === 'POST' && pathname === '/api/demo/chat') {
    const { templateId, message } = await readJson(request)
    const template = templates.find((item) => item.id === templateId)
    const content = String(message || '').trim().slice(0, 1_500)
    if (!template || !content) return json(response, 400, { error: 'Выберите сценарий и напишите сообщение.' })
    const demoBot = { name: template.title, tone: 'дружелюбный эксперт', template_id: template.id, knowledge_text: demoKnowledge[template.id] || '' }
    const result = await answerWithGemini(demoBot, content) || await answerWithOpenAI(demoBot, content) || answerFromKnowledge(demoBot, content)
    return json(response, 200, result)
  }

  const publicProfile = pathname.match(/^\/api\/public\/bots\/(\d+)$/)
  if (request.method === 'GET' && publicProfile) {
    const bot = db.prepare('SELECT id, name, template_id AS templateId, tone, color, avatar, greeting FROM bots WHERE id = ?').get(Number(publicProfile[1]))
    return bot ? publicJson(response, 200, { bot }) : publicJson(response, 404, { error: 'AI-ассистент не найден.' })
  }

  const publicChat = pathname.match(/^\/api\/public\/bots\/(\d+)\/chat$/)
  if (request.method === 'POST' && publicChat) {
    const { message } = await readJson(request)
    const content = String(message || '').trim().slice(0, 3_000)
    if (!content) return publicJson(response, 400, { error: 'Напишите сообщение для AI-ассистента.' })
    const bot = db.prepare('SELECT * FROM bots WHERE id = ?').get(Number(publicChat[1]))
    if (!bot) return publicJson(response, 404, { error: 'AI-ассистент не найден.' })
    const owner = db.prepare('SELECT id, plan FROM users WHERE id = ?').get(bot.user_id)
    if (!owner || !canUseMessage(owner)) return publicJson(response, 429, { error: 'Лимит сообщений текущего тарифа исчерпан.' })
    const history = db.prepare('SELECT role, content FROM messages WHERE bot_id = ? ORDER BY id DESC LIMIT 8').all(bot.id).reverse()
    const result = await answerWithGemini(bot, content, history) || await answerWithOpenAI(bot, content, history) || answerFromKnowledge(bot, content)
    db.prepare('INSERT INTO messages (bot_id, role, content) VALUES (?, ?, ?), (?, ?, ?)').run(bot.id, 'user', content, bot.id, 'assistant', result.answer)
    return publicJson(response, 200, { answer: result.answer })
  }

  if (request.method === 'POST' && pathname === '/api/auth/register') {
    const { email, password, plan } = await readJson(request)
    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return json(response, 400, { error: 'Введите корректный email.' })
    if (String(password || '').length < 6) return json(response, 400, { error: 'Пароль должен содержать минимум 6 символов.' })
    try {
      const selectedPlan = planLimits[plan] ? plan : 'Free'
      const result = db.prepare('INSERT INTO users (email, password_hash, plan) VALUES (?, ?, ?)').run(normalizedEmail, hashPassword(password), selectedPlan)
      const user = { id: Number(result.lastInsertRowid), email: normalizedEmail, plan: selectedPlan }
      logEvent(user.id, 'account', 'Аккаунт Neurova создан')
      return json(response, 201, { token: createSession(user.id), user })
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) return json(response, 409, { error: 'Этот email уже зарегистрирован.' })
      throw error
    }
  }

  if (request.method === 'POST' && pathname === '/api/auth/login') {
    const { email, password } = await readJson(request)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').trim().toLowerCase())
    if (!user || !verifyPassword(String(password || ''), user.password_hash)) return json(response, 401, { error: 'Неверный email или пароль.' })
    return json(response, 200, { token: createSession(user.id), user: { id: user.id, email: user.email, plan: user.plan } })
  }

  const user = currentUser(request)
  if (pathname.startsWith('/api/') && !user) return json(response, 401, { error: 'Требуется авторизация.' })
  if (request.method === 'GET' && pathname === '/api/me') return json(response, 200, { user: userProfile(user.id), usage: usageSummary(user) })

  if (request.method === 'POST' && pathname === '/api/onboarding') {
    const { audience, channel, tone } = await readJson(request)
    const cleanAudience = String(audience || '').slice(0, 80)
    const cleanChannel = String(channel || '').slice(0, 40)
    const cleanTone = String(tone || '').slice(0, 60)
    const source = `${cleanAudience} ${cleanChannel}`.toLocaleLowerCase()
    const templateId = /курс|обуч|документ|pdf|знан/.test(source) ? 'knowledge' : /hr|ваканс|собесед|карьер/.test(source) ? 'career' : 'support'
    const payload = JSON.stringify({ audience: cleanAudience, channel: cleanChannel, tone: cleanTone, templateId })
    db.prepare('UPDATE users SET onboarded = 1, onboarding_json = ? WHERE id = ?').run(payload, user.id)
    logEvent(user.id, 'onboarding', 'Персональный сценарий AI настроен')
    return json(response, 200, { user: userProfile(user.id), templateId, tone: cleanTone })
  }

  if (request.method === 'POST' && pathname === '/api/greeting') {
    const { business, templateId = 'support' } = await readJson(request)
    const description = String(business || '').trim().slice(0, 700)
    if (!description) return json(response, 400, { error: 'Опишите бизнес хотя бы одной фразой.' })
    const template = templates.find((item) => item.id === templateId) || templates[0]
    const helper = { name: 'Neurova', tone: 'дружелюбный продуктовый эксперт', template_id: template.id, knowledge_text: description }
    const prompt = `Создай одно короткое приветствие для виджета AI на русском языке для бизнеса: ${description}. Не больше двух предложений, без кавычек, в конце задай мягкий вопрос.`
    const generated = await answerWithGemini(helper, prompt) || await answerWithOpenAI(helper, prompt)
    const greeting = generated?.answer || `Здравствуйте! Я помогу с вопросами о вашем сервисе. Что вы хотите узнать?`
    const replies = template.id === 'career' ? ['Подготовиться к интервью', 'Оценить резюме', 'Найти вакансию'] : template.id === 'knowledge' ? ['Найти документ', 'Уточнить правило', 'Задать вопрос'] : ['Узнать цены', 'Получить консультацию', 'Оставить заявку']
    return json(response, 200, { greeting: greeting.slice(0, 500), tone: helper.tone, replies, source: generated ? 'Gemini' : 'Neurova fallback' })
  }

  if (request.method === 'PATCH' && pathname === '/api/profile') {
    const { displayName } = await readJson(request)
    const cleanName = String(displayName || '').trim().slice(0, 48)
    db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(cleanName, user.id)
    return json(response, 200, { user: userProfile(user.id) })
  }

  if (request.method === 'GET' && pathname === '/api/billing') {
    const events = db.prepare('SELECT from_plan AS fromPlan, to_plan AS toPlan, created_at AS createdAt FROM plan_events WHERE user_id = ? ORDER BY id DESC LIMIT 8').all(user.id)
    return json(response, 200, { currentPlan: user.plan, plans: planConfig, usage: usageSummary(user), events })
  }

  if (request.method === 'POST' && pathname === '/api/plan') {
    const { plan } = await readJson(request)
    if (!planLimits[plan]) return json(response, 400, { error: 'Неизвестный тариф.' })
    db.prepare('UPDATE users SET plan = ? WHERE id = ?').run(plan, user.id)
    db.prepare('INSERT INTO plan_events (user_id, from_plan, to_plan) VALUES (?, ?, ?)').run(user.id, user.plan, plan)
    return json(response, 200, { user: { ...userProfile(user.id), plan }, usage: usageSummary({ ...user, plan }) })
  }

  if (request.method === 'GET' && pathname === '/api/analytics') {
    const usage = db.prepare(`SELECT
      (SELECT COUNT(*) FROM bots WHERE user_id = ?) AS bots,
      (SELECT COUNT(*) FROM messages JOIN bots ON bots.id = messages.bot_id WHERE bots.user_id = ? AND messages.role = 'user') AS dialogs,
      (SELECT COUNT(*) FROM bots WHERE user_id = ? AND length(knowledge_text) > 0) AS knowledgeSources`).get(user.id, user.id, user.id)
    const daily = db.prepare(`SELECT substr(messages.created_at, 1, 10) AS day, COUNT(*) AS total FROM messages JOIN bots ON bots.id = messages.bot_id WHERE bots.user_id = ? AND messages.role = 'user' AND messages.created_at >= datetime('now', '-6 days') GROUP BY day ORDER BY day`).all(user.id)
    const recent = db.prepare(`SELECT bots.name, COUNT(messages.id) AS total FROM bots LEFT JOIN messages ON messages.bot_id = bots.id WHERE bots.user_id = ? GROUP BY bots.id ORDER BY total DESC LIMIT 4`).all(user.id)
    const events = db.prepare('SELECT type, detail, bot_id AS botId, created_at AS createdAt FROM activity_events WHERE user_id = ? ORDER BY id DESC LIMIT 12').all(user.id)
    return json(response, 200, { usage: { ...usage, ...usageSummary(user), limit: planLimits[user.plan] || 1 }, daily, recent, events })
  }

  if (request.method === 'GET' && pathname === '/api/telegram') {
    const links = db.prepare('SELECT telegram_links.id, telegram_links.bot_id AS botId, telegram_links.code, telegram_links.username, telegram_links.connected_at AS connectedAt, bots.name AS botName FROM telegram_links JOIN bots ON bots.id = telegram_links.bot_id WHERE telegram_links.user_id = ? ORDER BY telegram_links.id DESC').all(user.id)
    return json(response, 200, { enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN), username: process.env.TELEGRAM_BOT_USERNAME || '', links })
  }

  if (request.method === 'POST' && pathname === '/api/telegram/link') {
    const { botId } = await readJson(request)
    const bot = db.prepare('SELECT id, name FROM bots WHERE id = ? AND user_id = ?').get(Number(botId), user.id)
    if (!bot) return json(response, 404, { error: 'Выберите AI-ассистента из вашего кабинета.' })
    const code = randomBytes(12).toString('base64url')
    db.prepare('INSERT INTO telegram_links (user_id, bot_id, code) VALUES (?, ?, ?)').run(user.id, bot.id, code)
    logEvent(user.id, 'telegram', `Создана ссылка Telegram для «${bot.name}»`, bot.id)
    const username = String(process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '')
    return json(response, 201, { code, bot, url: username ? `https://t.me/${username}?start=${code}` : '', enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN) })
  }

  if (request.method === 'POST' && pathname === '/api/bots') {
    const { name, templateId, tone, color = 'violet', avatar = 'crystal', greeting = '', scenario = [], knowledge = '', knowledgeUpload } = await readJson(request)
    const cleanName = String(name || '').trim().slice(0, 48)
    const template = templates.find((item) => item.id === templateId)
    if (!cleanName) return json(response, 400, { error: 'Укажите имя AI-ассистента.' })
    if (!template) return json(response, 400, { error: 'Выберите корректный шаблон.' })
    const { total } = db.prepare('SELECT COUNT(*) AS total FROM bots WHERE user_id = ?').get(user.id)
    const limit = planLimits[user.plan] || 1
    if (total >= limit) return json(response, 403, { error: `Лимит тарифа ${user.plan}: ${limit} AI-бота. Выберите другой план, чтобы создать больше.` })
    let knowledgeText = String(knowledge).slice(0, 200_000)
    if (knowledgeUpload?.kind === 'pdf' && knowledgeUpload.data) {
      try {
        knowledgeText = await extractPdfText(knowledgeUpload.data)
      } catch (error) {
        return json(response, 400, { error: error.message || 'Не удалось прочитать PDF.' })
      }
    }
    const safeAvatar = ['crystal', 'orbit', 'mascot', 'neon'].includes(avatar) ? avatar : 'crystal'
    const safeScenario = Array.isArray(scenario) ? scenario.slice(0, 4).map((item) => String(item).slice(0, 120)) : []
    const result = db.prepare('INSERT INTO bots (user_id, name, template_id, tone, color, avatar, greeting, scenario_json, knowledge_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(user.id, cleanName, templateId, String(tone || 'Дружелюбный эксперт'), color, safeAvatar, String(greeting).slice(0, 500), JSON.stringify(safeScenario), knowledgeText)
    const record = db.prepare('SELECT id, name, template_id AS templateId, tone, color, avatar, greeting, scenario_json AS scenarioJson, created_at AS createdAt, CASE WHEN length(knowledge_text) > 0 THEN 1 ELSE 0 END AS hasKnowledge FROM bots WHERE id = ?').get(result.lastInsertRowid)
    logEvent(user.id, 'bot', `Создан AI «${cleanName}»`, record.id)
    return json(response, 201, { bot: record, widget: widgetSnippet(request, record.id) })
  }

  if (request.method === 'GET' && pathname === '/api/bots') {
    const bots = db.prepare('SELECT id, name, template_id AS templateId, tone, color, avatar, greeting, scenario_json AS scenarioJson, created_at AS createdAt, CASE WHEN length(knowledge_text) > 0 THEN 1 ELSE 0 END AS hasKnowledge FROM bots WHERE user_id = ? ORDER BY id DESC').all(user.id)
    return json(response, 200, { bots })
  }

  const deleteBotMatch = pathname.match(/^\/api\/bots\/(\d+)$/)
  if (request.method === 'DELETE' && deleteBotMatch) {
    const bot = db.prepare('SELECT id, name FROM bots WHERE id = ? AND user_id = ?').get(Number(deleteBotMatch[1]), user.id)
    if (!bot) return json(response, 404, { error: 'AI-ассистент не найден.' })
    db.prepare('DELETE FROM activity_events WHERE bot_id = ?').run(bot.id)
    db.prepare('DELETE FROM telegram_links WHERE bot_id = ?').run(bot.id)
    db.prepare('DELETE FROM messages WHERE bot_id = ?').run(bot.id)
    db.prepare('DELETE FROM bots WHERE id = ?').run(bot.id)
    logEvent(user.id, 'delete', `AI «${bot.name}» удалён`)
    return json(response, 200, { deletedId: bot.id })
  }

  const chatMatch = pathname.match(/^\/api\/bots\/(\d+)\/chat$/)
  if (request.method === 'POST' && chatMatch) {
    const { message } = await readJson(request)
    const content = String(message || '').trim().slice(0, 3_000)
    if (!content) return json(response, 400, { error: 'Напишите сообщение для AI-ассистента.' })
    const bot = db.prepare('SELECT * FROM bots WHERE id = ? AND user_id = ?').get(Number(chatMatch[1]), user.id)
    if (!bot) return json(response, 404, { error: 'AI-ассистент не найден.' })
    if (!canUseMessage(user)) return json(response, 429, { error: 'Лимит сообщений текущего тарифа исчерпан. Обновите тариф.' })
    const history = db.prepare('SELECT role, content FROM messages WHERE bot_id = ? ORDER BY id DESC LIMIT 8').all(bot.id).reverse()
    const result = await answerWithGemini(bot, content, history) || await answerWithOpenAI(bot, content, history) || answerFromKnowledge(bot, content)
    db.prepare('INSERT INTO messages (bot_id, role, content) VALUES (?, ?, ?), (?, ?, ?)').run(bot.id, 'user', content, bot.id, 'assistant', result.answer)
    logEvent(user.id, 'dialog', `Новый диалог с «${bot.name}»`, bot.id)
    return json(response, 200, result)
  }

  return json(response, 404, { error: 'Маршрут не найден.' })
}

async function staticFile(response, pathname) {
  const distRoot = join(projectRoot, 'dist')
  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const safePath = normalize(join(distRoot, requestedPath))
  const filePath = safePath.startsWith(distRoot) && existsSync(safePath) ? safePath : join(distRoot, 'index.html')
  try {
    const file = await readFile(filePath)
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' })
    response.end(file)
  } catch {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Соберите приложение командой npm run build, затем запустите npm start.')
  }
}

async function requestHandler(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`)
  try {
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/public/')) {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      })
      return response.end()
    }
    if (url.pathname.startsWith('/api/')) await api(request, response, url.pathname)
    else await staticFile(response, url.pathname)
  } catch (error) {
    console.error(error)
    json(response, 500, { error: 'Внутренняя ошибка сервера.' })
  }
}

// Vercel imports this handler from api/[...path].js.
export default requestHandler

if (!process.env.VERCEL) {
  createServer(requestHandler).listen(port, '127.0.0.1', () => {
    console.log(`Neurova API is listening on http://127.0.0.1:${port}`)
    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log('Telegram polling is enabled.')
      pollTelegram()
      setInterval(pollTelegram, 2200)
    }
  })
}
