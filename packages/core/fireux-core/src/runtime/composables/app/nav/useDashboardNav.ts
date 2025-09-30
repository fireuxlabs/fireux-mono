// packages/core/fireux-core/src/runtime/composables/app/nav/useDashboardNav.ts
import { computed } from 'vue'
// Nuxt auto-imports in runtime, declare minimal shape for type hints
declare function useRouter(): { getRoutes: () => any[] }

export type DashboardItem = { label: string; icon?: string; to: string }

export function useDashboardNav() {
  const router = useRouter()
  const routes = computed(() => router.getRoutes())

  const items = computed<DashboardItem[]>(() =>
    routes.value
      .filter(
        (r: any) =>
          typeof r.path === 'string' && r.path.startsWith('/dashboard')
      )
      .filter((r: any) => r.meta?.nav)
      .sort(
        (a: any, b: any) =>
          (a.meta.nav.order ?? 999) - (b.meta.nav.order ?? 999)
      )
      .map((r: any) => ({
        label: r.meta.nav.label ?? r.path,
        icon: r.meta.nav.icon,
        to: r.path,
      }))
  )

  // Optional split; keep flat for now
  const primary = computed(() => items.value)
  const secondary = computed<DashboardItem[]>(() => [])

  return { primary, secondary }
}
