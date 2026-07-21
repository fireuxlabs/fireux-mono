// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: fail closed for bounded public text projection.
function safeString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : ''
}

export function normalizePublicPath(input: string): string {
  const raw = safeString(input)
  if (!raw) return '/'

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      return normalizePublicPath(url.pathname || '/')
    } catch {
      return '/'
    }
  }

  let path = raw
  const queryIdx = path.indexOf('?')
  if (queryIdx >= 0) path = path.slice(0, queryIdx)
  const hashIdx = path.indexOf('#')
  if (hashIdx >= 0) path = path.slice(0, hashIdx)

  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/+$/, '')
  return path || '/'
}

export function buildPublicPath(basePath: string, segment?: unknown): string {
  const base = normalizePublicPath(basePath)
  const rawSegment = safeString(segment)
  if (!rawSegment) return base

  const encoded = encodeURIComponent(rawSegment)
  if (base === '/') return `/${encoded}`
  return `${base}/${encoded}`
}

export function asTrimmedString(input: unknown): string {
  return safeString(input)
}

export function asBoundedTrimmedString(
  input: unknown,
  maxLength: number
): string {
  const value = safeString(input)
  return value.length <= maxLength ? value : ''
}

export function asStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry) => safeString(entry))
    .filter(Boolean)
}

export function resolvePublicDescription(
  primary: unknown,
  displayDefault: string
): string {
  const base = safeString(primary)
  if (base) return base
  const defaultDescription = safeString(displayDefault)
  return defaultDescription || 'Public page'
}

export function toIsoUpdatedAt(input: unknown): string {
  if (!input) return new Date(0).toISOString()

  if (typeof input === 'string') {
    const date = new Date(input)
    if (Number.isFinite(date.getTime())) return date.toISOString()
  }

  if (typeof input === 'number') {
    const date = new Date(input)
    if (Number.isFinite(date.getTime())) return date.toISOString()
  }

  if (typeof (input as any)?.toDate === 'function') {
    const date = (input as any).toDate()
    if (date instanceof Date && Number.isFinite(date.getTime())) {
      return date.toISOString()
    }
  }

  return new Date(0).toISOString()
}
