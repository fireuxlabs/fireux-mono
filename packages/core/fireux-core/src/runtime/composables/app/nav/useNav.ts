// packages/core/fireux-core/src/runtime/composables/app/nav/useNav.ts
// Grouped, tenant-aware navigation derived from definePageMeta on pages.
// Falls back to existing behavior via consumer (Header.vue) if no meta-based items exist.

import { computed } from 'vue'
import { useUser } from '../../firestore/user/useUser'

// Nuxt auto-imports at runtime; declare for type-safety in package build
declare function useRouter(): { getRoutes: () => Array<any> }
declare function useAppConfig(): any

type NavItem = {
  key: string
  label: string
  icon?: string
  group: string
  order: number
  desktop: boolean
  mobile: boolean
  to: string
}

type NavGroup = { label: string; items: NavItem[] }

export function useNav() {
  const router = useRouter()
  const routes = computed(() => router.getRoutes())
  const app: any = typeof useAppConfig === 'function' ? useAppConfig() : {}
  const { isAdmin, hasCoreProfile } = useUser()

  const canSee = (r: any) => {
    const m = r?.meta || {}
    const nav = m?.nav
    if (!nav) return false
    if (m.tenant && m.tenant !== app?.tenant) return false
    if (m.requiresAuth && !hasCoreProfile.value) return false
    if (Array.isArray(m.roles) && m.roles.includes('admin') && !isAdmin.value)
      return false
    return true
  }

  const allNav = computed<NavItem[]>(() =>
    routes.value
      .filter(canSee)
      .map((r: any) => ({
        key: r.meta.nav.key as string,
        label: (r.meta.nav.label as string) ?? r.path,
        icon: r.meta.nav.icon as string | undefined,
        group: (r.meta.nav.group as string) ?? 'Other',
        order: (r.meta.nav.order as number) ?? 999,
        desktop: !!r.meta.nav.desktop,
        mobile: !!r.meta.nav.mobile,
        to: r.path as string,
      }))
  )

  // Basics (hard-pinned in header)
  const BASICS = ['home', 'products', 'blog']
  const basics = (list: NavItem[]) => {
    const byKey = new Map(list.map((i) => [i.key, i]))
    return BASICS.map((k) => byKey.get(k)).filter(Boolean) as NavItem[]
  }

  const groupBy = (list: NavItem[]) => {
    const map = new Map<string, NavItem[]>()
    for (const i of list) {
      if (!map.has(i.group)) map.set(i.group, [])
      map.get(i.group)!.push(i)
    }
    for (const g of map.values()) g.sort((a, b) => a.order - b.order)
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
  }

  // Condense toggle: default condensed in prod, expanded in dev, override via app.config.nav.condensed
  const condensed = computed<boolean>(() => {
    const cfg = app?.nav?.condensed
    if (typeof cfg === 'boolean') return cfg
    // If not specified, prefer expanded in dev
    return process.env.NODE_ENV === 'production'
  })

  const desktop = computed<{ pinned: NavItem[]; groups: NavGroup[] }>(() => {
    const d = allNav.value.filter((i) => i.desktop)
    if (!condensed.value) {
      // Expanded: show everything as basics (flat) and no groups
      const sorted = [...d].sort((a, b) => a.order - b.order)
      return { pinned: sorted, groups: [] }
    }
    const pinned = basics(d)
    const rest = d.filter((i) => !BASICS.includes(i.key))
    return { pinned, groups: groupBy(rest) }
  })

  const mobile = computed<NavItem[]>(() => {
    const m = allNav.value.filter((i) => i.mobile)
    // Flat list sorted by (group, order)
    return m.sort((a, b) => a.group.localeCompare(b.group) || a.order - b.order)
  })

  return { desktop, mobile }
}
