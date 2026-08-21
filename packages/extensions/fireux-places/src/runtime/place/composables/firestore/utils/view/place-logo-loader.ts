import type { BasePlace } from '../../fetch/search/types'
import type { LoadLogoOptions } from './place-logo.types.ts'
import { toLogoCard } from './place-logo-card'
import { fetchLogo } from './place-logo-network'
import {
  isAbortError,
  logEvent,
  performanceNow,
  roundDuration,
  sanitizeLogValue,
} from './place-logo-utils'
import type { PlaceCard } from './usePlaceInterface.ts'

const logoResultCache = new Map<string, string | null>()
const logoPromiseCache = new Map<string, Promise<string | null>>()
const logoAbortControllers = new Map<string, AbortController>()
let logoRequestSeq = 0

export const canonicalPlaceId = (id?: string | null) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

export async function loadLogoForPlace(
  place: PlaceCard.Card | BasePlace,
  options: LoadLogoOptions = {}
): Promise<string | null> {
  const logoCard = toLogoCard(place)
  if (typeof window === 'undefined') return logoCard.imageUrl ?? null
  const placeId = canonicalPlaceId(
    (logoCard as any).id ?? (logoCard as any).place_id
  )
  if (!placeId) return logoCard.imageUrl ?? null

  const start = performanceNow()
  logEvent('load:start', {
    placeId,
    priority: !!options.priority,
    forceReload: !!options.forceReload,
    existingImage: sanitizeLogValue(logoCard.imageUrl),
  })

  if (options.forceReload) {
    logEvent('load:force-reload', { placeId })
    logoResultCache.delete(placeId)
    cancelLogoRequest(placeId, 'force-reload')
  }

  if (logoResultCache.has(placeId)) {
    const cached = logoResultCache.get(placeId) ?? null
    logEvent(cached ? 'load:cache-hit' : 'load:cache-empty', { placeId })
    return cached
  }

  if (logoPromiseCache.has(placeId)) {
    logEvent('load:pending-reuse', { placeId })
    return logoPromiseCache.get(placeId) ?? null
  }

  if (!options.priority) {
    logEvent('load:cancel-before-refresh', { placeId })
    cancelLogoRequest(placeId)
  }

  const controller = new AbortController()
  logoAbortControllers.set(placeId, controller)
  const requestId = ++logoRequestSeq
  logEvent('fetch:start', { placeId, requestId })

  const promise = fetchLogo(logoCard, placeId, controller.signal)
    .then((url) => {
      logEvent('fetch:resolve', {
        placeId,
        requestId,
        result: sanitizeLogValue(url),
      })
      logoResultCache.set(placeId, url)
      return url
    })
    .catch((error) => {
      if (isAbortError(error)) {
        logEvent('fetch:aborted', { placeId, requestId })
        return null
      }
      logEvent('fetch:error', { placeId, requestId, error })
      throw error
    })
    .finally(() => {
      if (logoAbortControllers.get(placeId) === controller) {
        logoAbortControllers.delete(placeId)
      }
      logEvent('fetch:cleanup', {
        placeId,
        requestId,
        hasPending: logoPromiseCache.has(placeId),
        durationMs: roundDuration(performanceNow() - start),
      })
      logoPromiseCache.delete(placeId)
    })

  const timeoutMs = options.timeoutMs ?? null
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const shouldApplyTimeout =
    typeof window !== 'undefined' &&
    typeof timeoutMs === 'number' &&
    timeoutMs > 0
  const timedPromise = shouldApplyTimeout
    ? Promise.race([
        promise,
        new Promise<string | null>((resolve) => {
          timeoutId = setTimeout(() => {
            if (logoAbortControllers.get(placeId) === controller) {
              logEvent('fetch:timeout', { placeId, requestId, timeoutMs })
              cancelLogoRequest(placeId, 'timeout')
              logoResultCache.delete(placeId)
            }
            resolve(null)
          }, timeoutMs)
        }),
      ])
    : promise

  logoPromiseCache.set(placeId, timedPromise)

  if (shouldApplyTimeout && timeoutId) {
    timedPromise.finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    })
  }

  return timedPromise
}

export function cancelLogoRequests(except?: Set<string>) {
  if (typeof window === 'undefined') return
  logEvent('cancel:bulk', {
    keep: except ? Array.from(except) : [],
    totalActive: logoAbortControllers.size,
  })
  for (const placeId of Array.from(logoAbortControllers.keys())) {
    if (except?.has(placeId)) continue
    cancelLogoRequest(placeId, 'bulk')
  }
}

function cancelLogoRequest(
  placeId: string,
  mode: 'direct' | 'bulk' | 'force-reload' | 'timeout' = 'direct'
) {
  logEvent('cancel:single', { placeId, mode })
  const controller = logoAbortControllers.get(placeId)
  if (controller) {
    controller.abort()
    logoAbortControllers.delete(placeId)
    logoPromiseCache.delete(placeId)
  }
}
