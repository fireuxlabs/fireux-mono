import type { App } from '../models/core/app.model'

/**
 * Resolve the best-fit avatar asset for an app record, falling back through
 * known image properties before returning null.
 */
export function resolveAppAvatar(app: Partial<App> | null | undefined) {
  if (!app) return null
  return (
    app.avatar_url ||
    app.logo_url ||
    app.wordmark_light_url ||
    app.wordmark_dark_url ||
    null
  )
}

/**
 * Generate a canonical route path for app-centric links.
 */
export function buildAppLink(id: string | null | undefined) {
  const normalized = typeof id === 'string' ? id.trim() : ''
  return normalized ? `/apps/${normalized}` : null
}
