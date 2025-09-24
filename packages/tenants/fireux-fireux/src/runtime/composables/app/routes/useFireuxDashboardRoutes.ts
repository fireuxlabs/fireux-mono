// Reuse the local RouteLink from the default routes file to avoid duplicate type exports
import type { RouteLink } from './useFireuxDefaultRoutes'

/**
 * Dashboard-only additions for this tenant.
 * Keep it empty for now—the core dashboard already injects user/admin groups.
 * (We can add tenant dashboard pages later if needed.)
 */
export function getFireuxDashboardRoutes() {
  const menuBarLinks: RouteLink[] = []
  const mobileLinks: RouteLink[] = []
  return { menuBarLinks, mobileLinks }
}
