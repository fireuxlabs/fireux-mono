const trimSlashes = (value) =>
  String(value || '')
    .trim()
    .replace(/\/{2,}/g, '/')

/**
 * Fallback for Nuxt internal import `#internal/nuxt/paths`.
 * This keeps direct execution of app/.nuxt/dist/server/server.mjs from crashing
 * when Node resolves package imports from the app package root.
 */
export function baseURL() {
  const fromEnv =
    process.env.NUXT_APP_BASE_URL ||
    process.env.NITRO_APP_BASE_URL ||
    process.env.BASE_URL ||
    '/'

  const normalized = trimSlashes(fromEnv)
  if (!normalized) return '/'
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}
