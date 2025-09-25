// packages/tenants/fireux-fireux/src/runtime/composables/app/routes/useFireuxRoutes.ts
// Flat tenant-only links for FireUX (global). Keep empty for now; core default adds system links.
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'
import { computed } from 'vue'

export function useFireuxRoutes() {
  const links = computed<RouteLink[]>(() => [])
  return { links }
}
