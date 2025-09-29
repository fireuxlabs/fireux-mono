import { computed } from 'vue'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

// Flat tenant-only links (currently none)
export function useCleanboxRoutes() {
  // For default layout, we only need a flat list to filter; leave empty until tenant adds public links.
  const links = computed<RouteLink[]>(() => [])
  return { links }
}
