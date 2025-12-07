// packages/ecosystem/fireux-fireux/src/runtime/composables/fireux/app/routes/useFireuxRoutes.ts
// Flat tenant-only links for FireUX (global). Keep empty for now; core default adds system links.
import type { RouteLink } from './useFireuxDefaultRoutes'
import { computed } from 'vue'

export function useFireuxRoutes() {
  const links = computed<RouteLink[]>(() => [])
  return { links }
}
