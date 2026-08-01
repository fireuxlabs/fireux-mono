import type { PlaceDetailsResult } from './place-logo.types'

const LOG_PREFIX = '[places][logos]'

export function applyLogoSearchParams(
  params: URLSearchParams,
  hint: PlaceDetailsResult | null
) {
  if (hint?.website) {
    params.set('website', hint.website)
  }
}

export function mergeSignals(
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

export function normalizeUrl(value?: string | null): string | null {
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

export function isAbortError(error: unknown): error is DOMException {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: string }).name === 'AbortError'
  )
}

export function logEvent(event: string, payload?: Record<string, unknown>) {
  const ts = new Date().toISOString()
  if (payload) {
    console.log(`${LOG_PREFIX} ${event}`, { ...payload, ts })
  } else {
    console.log(`${LOG_PREFIX} ${event}`, { ts })
  }
}

export function sanitizeLogValue(value: unknown) {
  if (typeof value !== 'string') return value ?? null
  if (value.length > 120) {
    return `${value.slice(0, 117)}...`
  }
  return value
}

export function performanceNow() {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }
  return Date.now()
}

export function roundDuration(value: number) {
  return Math.round(value * 10) / 10
}
