import { useRuntimeConfig } from '#imports'
import {
  defineEventHandler,
  getQuery,
  getRequestHeader,
  getRequestIP,
  setResponseStatus,
} from 'h3'
import { resolvePlacesApiKey } from '../../../place/server/integration/google/places-api-key'

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
  const dev = import.meta.dev
  const reqId = Math.random().toString(36).slice(2, 8)
  const runtimeConfig = useRuntimeConfig(event) as any
  const debug =
    dev &&
    (
      process.env.FIREUX_PLACES_DEBUG === 'true' ||
      Boolean((runtimeConfig?.public as any)?.fireux?.places?.debug)
    )
  const filterMap =
    (runtimeConfig?.public as any)?.fireux?.places
      ?.googleAutocompleteTypeFilters || {}
  const queryParams = getQuery(event)
  const q = queryParams.q as string | undefined
  const contextType = (queryParams.type as string | undefined)?.trim() || null
  const defaults =
    (runtimeConfig?.public as any)?.fireux?.places
      ?.googleAutocompleteDefaults || {}
  const location =
    (queryParams.location as string) ||
    (typeof defaults?.location === 'string' ? defaults.location : '')
  const radius =
    (queryParams.radius as string) ||
    (typeof defaults?.radius === 'string' ? defaults.radius : '')
  const query = String(q || '').trim()
  if (!query) {
    if (debug) {
      console.info('[places][autocomplete]', { reqId, stage: 'empty_query' })
    }
    return { predictions: [] }
  }

  // Basic rate limit
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event) ||
    'anon'
  const rl = rateLimit(ip)
  if (!rl.allowed) {
    if (debug) {
      console.warn('[places][autocomplete]', {
        reqId,
        stage: 'rate_limited',
        ip,
        query,
        retryAfterMs: rl.retryAfter ?? null,
      })
    }
    setResponseStatus(event, 429)
    return {
      predictions: [],
      error: 'rate_limited',
      retryAfterMs: rl.retryAfter ?? null,
    }
  }

  const key = resolvePlacesApiKey(event)
  if (!key) {
    const host =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'host') ||
      null
    const envs = {
      GOOGLE_PLACES_API_KEY: !!process.env.GOOGLE_PLACES_API_KEY,
      NUXT_GOOGLE_PLACES_API_KEY: !!process.env.NUXT_GOOGLE_PLACES_API_KEY,
      NUXT_PUBLIC_GOOGLE_PLACES_API_KEY:
        !!process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    }
    const rcFlags = {
      runtime_googlePlacesApiKey: !!runtimeConfig?.googlePlacesApiKey,
      runtime_fireux_googlePlacesApiKey:
        !!runtimeConfig?.fireux?.googlePlacesApiKey,
      public_googlePlacesApiKey: !!runtimeConfig?.public?.googlePlacesApiKey,
      public_fireux_googlePlacesApiKey:
        !!runtimeConfig?.public?.fireux?.googlePlacesApiKey,
    }
    console.error('[places][autocomplete]', {
      reqId,
      stage: 'missing_api_key',
      ip,
      host,
      query,
      envs,
      runtimeConfig: rcFlags,
    })
    setResponseStatus(event, 500)
    return { predictions: [], error: 'missing_api_key' }
  }

  if (debug) {
    console.info('[places][autocomplete]', {
      reqId,
      stage: 'request',
      ip,
      query,
      type: contextType,
      location: location || null,
      radius: radius || null,
    })
  }

  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/autocomplete/json'
  )
  url.searchParams.set('input', query)
  url.searchParams.set('key', key)
  if (contextType === 'address') url.searchParams.set('types', 'address')
  if (location) url.searchParams.set('location', location)
  if (radius) url.searchParams.set('radius', radius)

  try {
    const safeUrl = new URL(url.toString())
    safeUrl.searchParams.set('key', '[redacted]')

    const start = Date.now()
    const res = await fetch(url.toString())
    const data = await res.json()

    if (debug) {
      console.info('[places][autocomplete]', {
        reqId,
        stage: 'upstream_response',
        httpStatus: res.status,
        upstreamStatus: data?.status ?? null,
        timeMs: Date.now() - start,
        url: safeUrl.toString(),
      })
    }
    const upstreamStatus = String(data?.status || '')
    const isNoResults = upstreamStatus === 'ZERO_RESULTS'

    if (isNoResults) {
      if (debug) {
        console.info('[places][autocomplete]', {
          reqId,
          stage: 'zero_results',
          query,
          type: contextType,
        })
      }
      return { predictions: [] }
    }

    if (upstreamStatus !== 'OK') {
      console.warn('[places][autocomplete]', {
        reqId,
        stage: 'upstream_not_ok',
        upstreamStatus: data?.status ?? null,
        errorMessage: data?.error_message ?? null,
      })
      return {
        predictions: [],
        error: 'upstream_not_ok',
        upstreamStatus: import.meta.dev ? (data.status ?? null) : null,
      }
    }
    const predictions = (data.predictions || []).slice(0, 4).map((p: any) => ({
      place_id: p.place_id,
      description: p.description,
      structured_formatting: p.structured_formatting,
      types: p.types,
      terms: p.terms,
    }))

    // Optional filtering by context type (declared via module options/runtimeConfig)
    const allowedRaw: unknown = contextType ? filterMap?.[contextType] : null
    const allowedList = Array.isArray(allowedRaw)
      ? (allowedRaw as unknown[]).map((v) => String(v))
      : []
    const allowed = new Set(allowedList.filter((v) => v.trim().length > 0))

    const shouldFilter = !!contextType && allowed.size > 0
    const filtered = shouldFilter
      ? predictions.filter((p: any) => {
          const types: unknown = p?.types
          if (!Array.isArray(types)) return false
          return types.some((t) => allowed.has(String(t)))
        })
      : predictions

    if (debug && shouldFilter) {
      console.info('[places][autocomplete]', {
        reqId,
        stage: 'filtered',
        type: contextType,
        allowed: Array.from(allowed),
        before: predictions.length,
        after: filtered.length,
      })
    }

    if (debug) {
      console.info('[places][autocomplete]', {
        reqId,
        stage: 'ok',
        predictionsCount: filtered.length,
      })
    }

    return { predictions: filtered }
  } catch (error) {
    if (debug) {
      console.error('[places][autocomplete]', {
        reqId,
        stage: 'upstream_error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
    setResponseStatus(event, 502)
    return { predictions: [], error: 'upstream_error' }
  }
})
