import {
  defineEventHandler,
  getQuery,
  getRequestHeader,
  getRequestIP,
  setResponseStatus,
} from 'h3'
import { resolvePlacesApiKey } from '../utils/places-api-key'

// Lightweight in-memory rate limiter (per IP). Not production-grade; replace with durable store if needed.
const rlWindowMs = 60_000 // 1 minute window
const rlMax = 120 // max requests per window per IP
const rlStore: Map<string, { count: number; windowStart: number }> = new Map()

function rateLimit(ip: string): {
  allowed: boolean
  retryAfter?: number
  diagnostics?: {
    count: number
    windowStart: number
    now: number
    windowMs: number
    max: number
  }
} {
  const now = Date.now()
  let entry = rlStore.get(ip)
  if (!entry) {
    entry = { count: 1, windowStart: now }
    rlStore.set(ip, entry)
    return {
      allowed: true,
      diagnostics: {
        count: entry.count,
        windowStart: entry.windowStart,
        now,
        windowMs: rlWindowMs,
        max: rlMax,
      },
    }
  }
  if (now - entry.windowStart > rlWindowMs) {
    entry.count = 1
    entry.windowStart = now
    return {
      allowed: true,
      diagnostics: {
        count: entry.count,
        windowStart: entry.windowStart,
        now,
        windowMs: rlWindowMs,
        max: rlMax,
      },
    }
  }
  entry.count++
  if (entry.count > rlMax) {
    return {
      allowed: false,
      retryAfter: rlWindowMs - (now - entry.windowStart),
      diagnostics: {
        count: entry.count,
        windowStart: entry.windowStart,
        now,
        windowMs: rlWindowMs,
        max: rlMax,
      },
    }
  }
  return {
    allowed: true,
    diagnostics: {
      count: entry.count,
      windowStart: entry.windowStart,
      now,
      windowMs: rlWindowMs,
      max: rlMax,
    },
  }
}

export default defineEventHandler(async (event: any) => {
  const queryParams = getQuery(event)
  const q = queryParams.q as string | undefined
  const DEFAULT_FALLBACK = '46.9480,7.4474'
  const location = (queryParams.location as string) || DEFAULT_FALLBACK
  const radius = (queryParams.radius as string) || '30000'
  const query = String(q || '')
  if (!query) return { predictions: [] }

  // Basic rate limit
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event) ||
    'anon'
  const rl = rateLimit(ip)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    return { predictions: [] }
  }

  const key = resolvePlacesApiKey(event)
  if (!key) {
    setResponseStatus(event, 500)
    return { predictions: [] }
  }

  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/autocomplete/json'
  )
  url.searchParams.set('input', query)
  url.searchParams.set('key', key)
  url.searchParams.set('location', location)
  url.searchParams.set('radius', radius)

  try {
    const res = await fetch(url.toString())
    const data = await res.json()
    if (data.status !== 'OK') return { predictions: [] }
    return {
      predictions: (data.predictions || []).slice(0, 4).map((p: any) => ({
        place_id: p.place_id,
        description: p.description,
        structured_formatting: p.structured_formatting,
        types: p.types,
      })),
    }
  } catch {
    setResponseStatus(event, 502)
    return { predictions: [] }
  }
})
