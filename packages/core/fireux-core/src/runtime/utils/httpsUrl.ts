// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: centralize HTTPS-only persisted URL mechanics.
// Concurrent edit — 2026-07-21 15:14 CEST — Werkbox Rules migration: reject credential-bearing HTTPS URLs at the shared normalization boundary.

const DEFAULT_MAX_URL_LENGTH = 2_048

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function readHttpsUrl(
  value: unknown,
  maxLength = DEFAULT_MAX_URL_LENGTH
): string {
  const raw = text(value)
  if (!raw || raw.length > maxLength) return ''

  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.username || url.password) return ''
    const normalized = url.toString()
    return normalized.length <= maxLength ? normalized : ''
  } catch {
    return ''
  }
}

export function normalizeHttpsUrlInput(
  value: unknown,
  options: { label?: string; maxLength?: number } = {}
): string {
  const raw = text(value)
  if (!raw) return ''

  const maxLength = options.maxLength ?? DEFAULT_MAX_URL_LENGTH
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`
  const normalized = readHttpsUrl(candidate, maxLength)
  if (normalized) return normalized

  throw new Error(`${options.label ?? 'URL'} must be a valid HTTPS URL.`)
}
