// packages/core/fireux-core/src/runtime/composables/app/nav.ts
import { computed } from 'vue'

export interface NavMeta {
  key: string
  label?: string
  icon?: string
  desktop?: boolean
  mobile?: boolean
  group?: string
  /** Optional profile type identifier for profile routes, e.g. 'chef' */
  profileId?: string
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
}

export function useNav(targetLayouts: string | string[]) {
  const router = useRouter()
  const wanted = Array.isArray(targetLayouts) ? targetLayouts : [targetLayouts]

  const routes = computed(() => router.getRoutes())

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
  })

  const scoped = computed(() => routes.value.filter(matches))

  const desktop = computed<NavItem[]>(() =>
    scoped.value.filter((r) => r.meta.nav.desktop).map(toItem)
  )
  const mobile = computed<NavItem[]>(() =>
    scoped.value.filter((r) => r.meta.nav.mobile).map(toItem)
  )

  return { desktop, mobile }
}
