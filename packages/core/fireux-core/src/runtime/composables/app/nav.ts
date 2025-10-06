// packages/core/fireux-core/src/runtime/composables/app/nav.ts
import { computed } from 'vue'
// Note: App-level nav composable. There may be other feature-specific nav helpers in the codebase.

export interface NavMeta {
  key?: string
  label?: string
  icon?: string
  desktop?: boolean
  mobile?: boolean
  group?: string
  /** Optional profile type identifier for profile routes, e.g. 'chef' */
  profileId?: string
  /** Optional ordering hint for nav within a group */
  order?: number | string
  /** Layouts where this nav item should appear */
  layouts?: string[]
}

declare module 'vue-router' {
  interface RouteMeta {
    nav?: NavMeta
  }
}

declare function useRouter(): { getRoutes: () => any[] }

export type NavItem = {
  key?: string
  label: string
  icon?: string
  to: string
  group?: string
  profileId?: string
  order: number
  desktop: boolean
  mobile: boolean
  layouts: string[]
}

function toArray<T>(value: T | T[] | undefined, fallback: T[] = []): T[] {
  if (value === undefined) return fallback
  return Array.isArray(value) ? value : [value]
}

function isNavMeta(value: unknown): value is NavMeta {
  return typeof value === 'object' && value !== null
}

const DEFAULT_LAYOUT = 'default'
const DEFAULT_ORDER = 999

function normaliseOrder(input: unknown): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input
  if (typeof input === 'string') {
    const parsed = Number.parseInt(input, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return DEFAULT_ORDER
}

function normaliseRoutePath(route: any): string {
  const path = route?.path
  if (typeof path === 'string') return path
  return String(path ?? '')
}

function normaliseLabel(
  route: any,
  nav: NavMeta,
  fallbackPath: string
): string {
  if (typeof nav.label === 'string' && nav.label.trim().length > 0) {
    return nav.label
  }
  const fallback = route?.meta?.title ?? route?.name ?? fallbackPath
  return String(fallback)
}

function buildNavItem(
  route: any,
  nav: NavMeta,
  targetLayouts: string[]
): NavItem | null {
  const layouts = toArray(nav.layouts)
  if (
    layouts.length > 0 &&
    !layouts.some((layout) => targetLayouts.includes(layout))
  ) {
    return null
  }

  const to = normaliseRoutePath(route)
  const label = normaliseLabel(route, nav, to)

  return {
    key: typeof nav.key === 'string' ? nav.key : undefined,
    label,
    icon: nav.icon,
    to,
    group: nav.group,
    profileId: nav.profileId,
    order: normaliseOrder(nav.order),
    desktop: nav.desktop !== false,
    mobile: nav.mobile !== false,
    layouts,
  }
}

export function useNav(targetLayouts: string | string[] = [DEFAULT_LAYOUT]) {
  const router = useRouter()
  const wanted = toArray(targetLayouts, [DEFAULT_LAYOUT])

  const items = computed<NavItem[]>(() => {
    const seen = new Set<string>()

    const deduped: NavItem[] = []

    for (const route of router.getRoutes()) {
      if (route?.aliasOf) continue

      const rawNav = route?.meta?.nav
      if (!isNavMeta(rawNav)) continue

      const item = buildNavItem(route, rawNav, wanted)
      if (!item) continue

      const dedupeKey = item.key ?? item.to ?? item.label
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      deduped.push(item)
    }

    return deduped.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.label.localeCompare(b.label)
    })
  })

  const desktop = computed<NavItem[]>(() =>
    items.value.filter((i) => i.desktop)
  )
  const mobile = computed<NavItem[]>(() => items.value.filter((i) => i.mobile))

  return { items, desktop, mobile }
}
