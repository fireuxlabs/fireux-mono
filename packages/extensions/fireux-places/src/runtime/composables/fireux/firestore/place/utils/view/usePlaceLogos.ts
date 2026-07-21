// Concurrent edit — 2026-07-21 16:06 CEST — Misebox dev stability pass: dedupe and negatively cache bounded logo discovery.
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { BasePlace } from 'fireux-places/runtime/models/place.model.ts'
import type { PlaceCard } from './usePlaceInterface.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'

const LOGO_ENDPOINT = '/api/places/logo'
const DETAILS_ENDPOINT = '/api/places/details'

const LOG_PREFIX = '[places][logos]'
const DETAILS_TIMEOUT_MS = 4000

const logoResultCache = new Map<string, string | null>()
const logoPromiseCache = new Map<string, Promise<string | null>>()
const logoAbortControllers = new Map<string, AbortController>()
const detailsResultCache = new Map<string, PlaceDetailsResult | null>()
const detailsPromiseCache = new Map<
  string,
  Promise<PlaceDetailsResult | null>
>()
const detailsAbortControllers = new Map<string, AbortController>()
let logoRequestSeq = 0
let detailsRequestSeq = 0

export const DEFAULT_LOGO_TIMEOUT_MS = 9000

export function sanitizeLogoAvatar(value?: string | null): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return value
}

type PlaceLogoTarget = PlaceCard.Card | BasePlace
type SanitizedAvatar = string | null

export interface UsePlaceLogoStateOptions {
  timeoutMs?: number
  autoHydrate?: boolean
  priority?: boolean
  shouldHydrate?: (
    place: PlaceLogoTarget,
    currentAvatar: SanitizedAvatar
  ) => boolean
  emptyMessage?: string | null
}

export interface HydrateLogoOptions {
  timeoutMs?: number
  priority?: boolean
  forceReload?: boolean
  emptyMessage?: string | null
}

export interface PlaceLogoState {
  avatar: Ref<string | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  hasAttempted: Ref<boolean>
  canHydrate: ComputedRef<boolean>
  hydrate: (overrides?: HydrateLogoOptions) => Promise<string | null>
  retry: (overrides?: HydrateLogoOptions) => Promise<string | null>
  cancel: () => void
}

export function usePlaceLogoState(
  place: Ref<PlaceLogoTarget | null>,
  options: UsePlaceLogoStateOptions = {}
): PlaceLogoState {
  const timeoutMs = options.timeoutMs ?? DEFAULT_LOGO_TIMEOUT_MS
  const autoHydrate = options.autoHydrate ?? true
  const basePriority = options.priority ?? false
  const emptyMessage = options.emptyMessage ?? null
  const shouldHydrate = options.shouldHydrate ?? defaultShouldHydrate

  const avatar = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasAttempted = ref(false)
  let requestToken = 0

  const canHydrate = computed(() => {
    const target = place.value
    if (!target) return false
    return shouldHydrate(target, avatar.value)
  })

  watch(
    place,
    (next: PlaceLogoTarget | null) => {
      requestToken += 1
      isLoading.value = false
      error.value = null
      const logoCandidate =
        (next as any)?.image_url ??
        (next as any)?.place_image ??
        (next as any)?.imageUrl ??
        null
      const sanitized = sanitizeLogoAvatar(logoCandidate)
      avatar.value = sanitized
      hasAttempted.value = !!sanitized
      if (!next) return
      if (
        autoHydrate &&
        typeof window !== 'undefined' &&
        shouldHydrate(next, sanitized)
      ) {
        Promise.resolve().then(() => {
          const current = place.value
          if (!current) return
          if (shouldHydrate(current, avatar.value)) {
            void hydrate()
          }
        })
      }
    },
    { immediate: true, deep: true }
  )

  async function hydrate(
    overrides: HydrateLogoOptions = {}
  ): Promise<string | null> {
    const target = place.value
    if (!target) return avatar.value

    if (!overrides.forceReload && !shouldHydrate(target, avatar.value)) {
      hasAttempted.value = !!avatar.value
      return avatar.value
    }

    const token = ++requestToken
    isLoading.value = true
    error.value = null

    const baseOptions: LoadLogoOptions = {
      timeoutMs: overrides.timeoutMs ?? timeoutMs,
      priority: overrides.priority ?? basePriority,
    }
    if (overrides.forceReload) {
      baseOptions.forceReload = true
    }

    try {
      const logo = await loadLogoForPlace(toLogoCard(target), baseOptions)
      if (token !== requestToken) return avatar.value
      const sanitized = sanitizeLogoAvatar(logo)

      avatar.value = sanitized
      hasAttempted.value = true
      error.value = sanitized
        ? null
        : overrides.emptyMessage ?? emptyMessage ?? null

      return avatar.value
    } catch (err) {
      if (token === requestToken) {
        hasAttempted.value = true
        error.value = formatLogoError(err)
      }
      return avatar.value
    } finally {
      if (token === requestToken) {
        isLoading.value = false
      }
    }
  }

  async function retry(
    overrides: HydrateLogoOptions = {}
  ): Promise<string | null> {
    return hydrate({
      ...overrides,
      forceReload: true,
      priority: overrides.priority ?? true,
    })
  }

  function cancel() {
    requestToken += 1
    isLoading.value = false
  }

  return {
    avatar,
    isLoading,
    error,
    hasAttempted,
    canHydrate,
    hydrate,
    retry,
    cancel,
  }
}


function defaultShouldHydrate(
  place: PlaceLogoTarget,
  currentAvatar: SanitizedAvatar
) {
  return place.source === 'google' && !currentAvatar
}

function toLogoCard(place: PlaceLogoTarget): PlaceCard.Card {
  const id = (place as any).id ?? (place as any).place_id ?? ''
  const name = (place as any).name ?? ''
  const shortName = (place as any).shortName ?? (place as any).short_name ?? ''
  const formattedAddress =
    (place as any).formattedAddress ?? (place as any).formatted_address ?? ''
  const shortAddress =
    (place as any).shortAddress ?? (place as any).short_address ?? ''
  const imageUrl =
    (place as any).imageUrl ??
    (place as any).image_url ??
    (place as any).place_image ??
    ''

  return {
    id,
    to: `/${PlaceStorage.collection}/${encodeURIComponent(id)}`,

    title: (place as any).title ?? name,
    subtitle: (place as any).subtitle ?? formattedAddress,
    badges: (place as any).badges ?? [],

    name,
    shortName,
    formattedAddress,
    shortAddress,

    imageUrl,
    source: (place as any).source,
  }
}

function formatLogoError(error: unknown): string {
  if (!error) return 'Logo fetch failed.'
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Logo fetch failed.'
  }
}

interface PlaceDetailsResult {
  website?: string | null
  url?: string | null
}

const canonicalPlaceId = (id?: string | null) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

interface LoadLogoOptions {
  priority?: boolean
  forceReload?: boolean
  timeoutMs?: number
}

export async function loadLogoForPlace(
  place: PlaceCard.Card | BasePlace,
  options: LoadLogoOptions = {}
): Promise<string | null> {
  const logoCard = toLogoCard(place)
  if (typeof window === 'undefined') return logoCard.imageUrl ?? null
  const placeId = canonicalPlaceId((logoCard as any).id ?? (logoCard as any).place_id)
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
              logEvent('fetch:timeout', {
                placeId,
                requestId,
                timeoutMs,
              })
              cancelLogoRequest(placeId, 'timeout')
              logoResultCache.delete(placeId)
              resolve(null)
            } else {
              resolve(null)
            }
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

async function fetchLogo(
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
  logEvent('details:start', {
    placeId,
    requestId,
    hasParentSignal: !!signal,
  })

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
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
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
      logEvent('fetch:response-error', {
        placeId,
        status: res.status,
      })
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

function applyLogoSearchParams(
  params: URLSearchParams,
  hint: PlaceDetailsResult | null
) {
  if (hint?.website) {
    params.set('website', hint.website)
  }
}

function mergeSignals(
  ...signals: (AbortSignal | undefined)[]
): AbortSignal | undefined {
  const valid = signals.filter(Boolean) as AbortSignal[]
  if (!valid.length) return undefined
  if (valid.length === 1) return valid[0]

  const controller = new AbortController()
  const onAbort = () => controller.abort()
  for (const signal of valid) {
    if (signal.aborted) {
      controller.abort()
      break
    }
    signal.addEventListener('abort', onAbort, { once: true })
  }
  return controller.signal
}

function normalizeUrl(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (!url.protocol) {
      url.protocol = 'https:'
    }
    return url.toString()
  } catch {
    if (/^https?:\/\//i.test(value)) return value
    return `https://${value}`
  }
}

function isAbortError(error: unknown): error is DOMException {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: string }).name === 'AbortError'
  )
}

function logEvent(event: string, payload?: Record<string, unknown>) {
  const ts = new Date().toISOString()
  if (payload) {
    console.log(`${LOG_PREFIX} ${event}`, { ...payload, ts })
  } else {
    console.log(`${LOG_PREFIX} ${event}`, { ts })
  }
}

function sanitizeLogValue(value: unknown) {
  if (typeof value !== 'string') return value ?? null
  if (value.length > 120) {
    return `${value.slice(0, 117)}...`
  }
  return value
}

function performanceNow() {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }
  return Date.now()
}

function roundDuration(value: number) {
  return Math.round(value * 10) / 10
}
