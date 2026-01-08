import type { App } from '../models/core/app.model'

/**
 * Resolve the avatar/thumbnail asset for an app record.
 * Canon: use thumbnail_url only (no cross-field fallbacks).
 */
export function resolveAppAvatar(app: Partial<App> | null | undefined) {
  if (!app) return null
  const value = (app as any).thumbnail_url
  return typeof value === 'string' && value.trim() ? value : null
}

/**
 * Generate a canonical route path for app-centric links.
 */
export function buildAppLink(id: string | null | undefined) {
  const normalized = typeof id === 'string' ? id.trim() : ''
  return normalized ? `/apps/${normalized}` : null
}
