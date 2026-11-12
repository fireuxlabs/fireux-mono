import { createHash, randomBytes } from 'node:crypto'
import { createError, getRequestIP, setHeader, type H3Event } from 'h3'

const CHAT_START_WINDOW_MS = 10 * 60 * 1000
const MAX_CHAT_STARTS_PER_WINDOW = 6
const MAX_RATE_LIMIT_KEYS = 2_000
const rateLimitSalt = randomBytes(32)
const chatStartWindows = new Map<string, { count: number; resetAt: number }>()

export function requireChatStartBudget(event: H3Event, appId: string) {
  const now = Date.now()
  const ip = getRequestIP(event) || 'unknown'
  const key = createHash('sha256')
    .update(rateLimitSalt)
    .update(appId)
    .update('\0')
    .update(ip)
    .digest('hex')
  const current = chatStartWindows.get(key)
  if (!current || current.resetAt <= now) {
    if (chatStartWindows.size >= MAX_RATE_LIMIT_KEYS) {
      const oldestKey = chatStartWindows.keys().next().value
      if (typeof oldestKey === 'string') chatStartWindows.delete(oldestKey)
    }
    chatStartWindows.set(key, {
      count: 1,
      resetAt: now + CHAT_START_WINDOW_MS,
    })
    return
  }
  if (current.count >= MAX_CHAT_STARTS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    setHeader(event, 'Retry-After', retryAfter)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many new chats. Please try again later.',
    })
  }
  current.count += 1
}
