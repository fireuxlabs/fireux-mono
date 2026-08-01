import type { PlaceDetailsResult } from './place-logo.types'
import {
  applyLogoSearchParams,
  isAbortError,
  logEvent,
  mergeSignals,
  normalizeUrl,
  performanceNow,
  roundDuration,
  sanitizeLogValue,
} from './place-logo-utils'
import type { PlaceCard } from './usePlaceInterface.ts'

const LOGO_ENDPOINT = '/api/places/logo'
const DETAILS_ENDPOINT = '/api/places/details'
const DETAILS_TIMEOUT_MS = 4000

const detailsResultCache = new Map<string, PlaceDetailsResult | null>()
const detailsPromiseCache = new Map<
  string,
  Promise<PlaceDetailsResult | null>
>()
const detailsAbortControllers = new Map<string, AbortController>()
let detailsRequestSeq = 0

export async function fetchLogo(
  place: PlaceCard.Card,
  placeId: string,
  signal?: AbortSignal
): Promise<string | null> {
  const attemptStart = performanceNow()
  logEvent('fetch:attempt', { placeId })

  try {
    return await attemptLogoFetch(place, placeId, signal, attemptStart)
  } catch (error) {
    if (isAbortError(error)) {
      logEvent('fetch:attempt-abort', { placeId })
      return null
    }
    logEvent('fetch:attempt-exception', { placeId, error })
    return null
  }
}

async function resolveWebsite(
  placeId: string,
  signal?: AbortSignal,
  timeoutMs = DETAILS_TIMEOUT_MS
): Promise<PlaceDetailsResult | null> {
  if (detailsResultCache.has(placeId)) {
    logEvent('details:cache-hit', { placeId })
    return detailsResultCache.get(placeId) ?? null
  }
  if (detailsPromiseCache.has(placeId)) {
    logEvent('details:pending-reuse', { placeId })
    return detailsPromiseCache.get(placeId) ?? null
  }

  cancelDetailsRequest(placeId)
  const controller = new AbortController()
  const mergedSignal = mergeSignals(signal, controller.signal)
  const requestId = ++detailsRequestSeq
  logEvent('details:start', { placeId, requestId, hasParentSignal: !!signal })

  const timeoutId =
    timeoutMs > 0
      ? setTimeout(() => {
          if (controller.signal.aborted) return
          logEvent('details:timeout', { placeId, requestId, timeoutMs })
          controller.abort()
        }, timeoutMs)
      : null

  const promise = (async () => {
    try {
      const url = new URL(DETAILS_ENDPOINT, window.location.origin)
      url.searchParams.set('place_id', placeId)
      url.searchParams.set('fields', 'website,url')
      const res = await fetch(url.toString(), {
        headers: { accept: 'application/json' },
        cache: 'no-store',
        signal: mergedSignal,
      })
      if (!res.ok) {
        logEvent('details:response-error', {
          placeId,
          requestId,
          status: res.status,
        })
        return null
      }

      const json = await res.json()
      const result = (json?.result ?? null) as Record<string, any> | null
      if (!result) {
        detailsResultCache.set(placeId, null)
        return null
      }
      const website = normalizeUrl(result.website)
      const mapsUrl = normalizeUrl(result.url)
      logEvent('details:response-success', {
        placeId,
        requestId,
        website: sanitizeLogValue(website),
        url: sanitizeLogValue(mapsUrl),
      })
      const payload = { website, url: mapsUrl }
      detailsResultCache.set(placeId, payload)
      return payload
    } catch (error) {
      if (isAbortError(error)) {
        logEvent('details:request-abort', { placeId, requestId })
        return null
      }
      logEvent('details:request-exception', { placeId, requestId, error })
      return null
    }
  })().finally(() => {
    detailsPromiseCache.delete(placeId)
    if (detailsAbortControllers.get(placeId) === controller) {
      detailsAbortControllers.delete(placeId)
    }
    if (timeoutId) clearTimeout(timeoutId)
    logEvent('details:cleanup', {
      placeId,
      requestId,
      hasPending: detailsPromiseCache.has(placeId),
    })
  })

  detailsAbortControllers.set(placeId, controller)
  detailsPromiseCache.set(placeId, promise)
  return promise
}

function cancelDetailsRequest(placeId: string) {
  logEvent('details:cancel', { placeId })
  const controller = detailsAbortControllers.get(placeId)
  if (controller) {
    controller.abort()
    detailsAbortControllers.delete(placeId)
    detailsPromiseCache.delete(placeId)
  }
}

async function attemptLogoFetch(
  place: PlaceCard.Card,
  placeId: string,
  signal: AbortSignal | undefined,
  attemptStart: number
): Promise<string | null> {
  logEvent('fetch:request-build', {
    placeId,
    formattedAddress: sanitizeLogValue(place.formattedAddress),
    hasSignal: !!signal,
  })
  const hint = await resolveWebsite(placeId, signal, DETAILS_TIMEOUT_MS)
  logEvent('fetch:hint', {
    placeId,
    website: sanitizeLogValue(hint?.website),
    url: sanitizeLogValue(hint?.url),
    waitedMs: roundDuration(performanceNow() - attemptStart),
  })
  if (!hint?.website) {
    logEvent('fetch:no-website', { placeId })
    return null
  }

  const logoUrl = new URL(LOGO_ENDPOINT, window.location.origin)
  applyLogoSearchParams(logoUrl.searchParams, hint)
  try {
    const res = await fetch(logoUrl.toString(), {
      headers: { accept: 'application/json' },
      signal,
    })
    if (!res.ok) {
      logEvent('fetch:response-error', { placeId, status: res.status })
      return null
    }
    const json = await res.json()
    const url = typeof json?.url === 'string' ? json.url : null
    logEvent('fetch:response-success', {
      placeId,
      url: sanitizeLogValue(url),
    })
    return url
  } catch (error) {
    if (isAbortError(error)) {
      logEvent('fetch:request-abort', { placeId })
      throw error
    }
    logEvent('fetch:request-exception', { placeId, error })
    return null
  }
}
