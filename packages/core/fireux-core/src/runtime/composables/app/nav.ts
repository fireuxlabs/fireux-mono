// packages/core/fireux-core/src/runtime/composables/app/nav.ts
import { computed } from 'vue'
// Note: App-level nav composable. There may be other feature-specific nav helpers in the codebase.
export interface NavMeta {
  key: string
  label?: string
  icon?: string
  desktop?: boolean
  mobile?: boolean
  group?: string
  /** Optional profile type identifier for profile routes, e.g. 'chef' */
  profileId?: string
  /** Optional ordering hint for nav within a group */
  order?: number
  layouts: string[] // explicit; no implicit fallback
}

declare module 'vue-router' {
  interface RouteMeta {
    nav?: NavMeta
  }
}

declare function useRouter(): { getRoutes: () => any[] }

export type NavItem = {
  key: string
  label: string
  icon?: string
  to: string
  group?: string
  profileId?: string
  order?: number
}

export function useNav(targetLayouts: string | string[]) {
  const router = useRouter()
  const wanted = Array.isArray(targetLayouts) ? targetLayouts : [targetLayouts]

  // Prefer canonical routes: drop alias records that mirror the same page
  const routes = computed(() =>
    router.getRoutes().filter((r: any) => !r.aliasOf)
  )

  const matches = (r: any) => {
    const nav = r.meta?.nav as NavMeta | undefined
    return (
      Array.isArray(nav?.layouts) && nav.layouts.some((l) => wanted.includes(l))
    )
  }

  const toItem = (r: any): NavItem => ({
    key: r.meta.nav.key,
    label: r.meta.nav.label ?? r.path,
    icon: r.meta.nav.icon,
    to: r.path as string,
    group: r.meta.nav.group,
    profileId: r.meta.nav.profileId,
    order: r.meta.nav.order,
  })

  const scoped = computed(() => routes.value.filter(matches))

  // Dedupe by nav.key to avoid duplicates when multiple records point to same page
  const uniqueByKey = (records: any[]) => {
    const seen = new Set<string>()
    return records.filter((r: any) => {
      const key = r.meta.nav?.key as string | undefined
      if (!key) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const desktop = computed<NavItem[]>(() =>
    uniqueByKey(scoped.value.filter((r) => r.meta.nav.desktop)).map(toItem)
  )
  const mobile = computed<NavItem[]>(() =>
    uniqueByKey(scoped.value.filter((r) => r.meta.nav.mobile)).map(toItem)
  )

  return { desktop, mobile }
}
