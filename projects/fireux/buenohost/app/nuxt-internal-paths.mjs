const readEnv = (key) => {
  const value = process.env[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const ensureLeadingSlash = (value) =>
  String(value || '').startsWith('/') ? String(value || '') : `/${String(value || '')}`

const trimDuplicateSlashes = (value) =>
  String(value || '').replace(/\/{2,}/g, '/')

const trimTrailingSlash = (value) =>
  value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value

const normalizeBasePath = (value, fallback = '/') => {
  const raw = String(value || '').trim()
  if (!raw) return fallback
  if (/^https?:\/\//i.test(raw)) return trimTrailingSlash(raw)

  const normalized = trimTrailingSlash(trimDuplicateSlashes(ensureLeadingSlash(raw)))
  return normalized || fallback
}

const joinPath = (base, ...parts) => {
  const filtered = parts
    .flat()
    .map((part) => String(part || '').trim())
    .filter(Boolean)

  if (!filtered.length) return base

  if (/^https?:\/\//i.test(base)) {
    const url = new URL(base.endsWith('/') ? base : `${base}/`)
    const suffix = filtered
      .map((part) => part.replace(/^\/+|\/+$/g, ''))
      .filter(Boolean)
      .join('/')

    url.pathname = url.pathname.replace(/\/+$/, '') + (suffix ? `/${suffix}` : '')
    return url.toString()
  }

  const basePart = base === '/' ? '' : base.replace(/\/+$/g, '')
  const suffix = filtered
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')

  return suffix ? `${basePart || ''}/${suffix}` || '/' : base || '/'
}

/**
 * Fallback for Nuxt internal import `#internal/nuxt/paths`.
 *
 * This is only used because `app/.nuxt/dist/server/server.mjs` is executed from
 * the app package root and Node resolves package imports through the app's
 * `package.json#imports`. Keep this file small and aligned with the Nuxt helper
 * shape that the generated bundle expects.
 */
export function baseURL(...path) {
  const base = normalizeBasePath(
    readEnv('NUXT_APP_BASE_URL') ||
      readEnv('NITRO_APP_BASE_URL') ||
      readEnv('BASE_URL') ||
      '/'
  )

  return path.length ? joinPath(base, ...path) : base
}

export function buildAssetsDir() {
  return normalizeBasePath(
    readEnv('NUXT_APP_BUILD_ASSETS_DIR') ||
      readEnv('BUILD_ASSETS_DIR') ||
      '/_nuxt/',
    '/_nuxt'
  )
}

export function publicAssetsURL(...path) {
  const publicBase = normalizeBasePath(
    readEnv('NUXT_APP_CDN_URL') ||
      readEnv('CDN_URL') ||
      readEnv('NUXT_APP_BASE_URL') ||
      readEnv('NITRO_APP_BASE_URL') ||
      readEnv('BASE_URL') ||
      '/'
  )

  return path.length ? joinPath(publicBase, ...path) : publicBase
}

export function buildAssetsURL(...path) {
  return joinPath(publicAssetsURL(), buildAssetsDir(), ...path)
}
