// packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts
import { computed } from 'vue'
import type { RouteLink } from '../../../types/routeLink'

// Build a flat list of core links from route meta.nav.
// Keeps older layouts working while we migrate to useNav/useDashboardNav.
declare function useRouter(): { getRoutes: () => any[] }

export function useCoreRoutes() {
  const router = useRouter()
  const routes = computed(() => router.getRoutes())

  const links = computed<RouteLink[]>(() =>
    routes.value
      .filter((r: any) => r?.meta?.nav?.key)
      .map((r: any) => ({
        id: r.meta.nav.key,
        label: r.meta.nav.label ?? r.path,
        icon: r.meta.nav.icon,
        to: r.path,
      }))
  )

  return { links }
}
