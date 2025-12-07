import { computed } from 'vue'
import { useRouter, type RouteRecordNormalized } from 'vue-router'
import type { NavItem, NavMeta } from '../../../../types/nav'

const DEFAULT_LAYOUT = 'default'
const DEFAULT_ORDER = 999

type TargetLayouts = string | string[]

type RouteMetaLike = {
  nav?: NavMeta
  requiresAuth?: boolean
  roles?: unknown
  tenant?: unknown
  title?: unknown
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function isNavMeta(value: unknown): value is NavMeta {
  return typeof value === 'object' && value !== null
}

function normaliseOrder(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return DEFAULT_ORDER
}

function resolveLayouts(nav: NavMeta): string[] {
  const declared = toArray(nav.layouts)
  if (declared.length === 0) return [DEFAULT_LAYOUT]
  return declared
}

function resolvePath(route: RouteRecordNormalized): string {
  if (typeof route.path === 'string' && route.path.length > 0) {
    return route.path
  }
  return String(route.name ?? '')
}

function resolveLabel(
  route: RouteRecordNormalized,
  nav: NavMeta,
  fallback: string
): string {
  if (typeof nav.label === 'string' && nav.label.trim().length > 0) {
    return nav.label
  }
  const metaTitle = (route.meta as RouteMetaLike)?.title
  if (typeof metaTitle === 'string' && metaTitle.trim().length > 0) {
    return metaTitle
  }
  if (typeof route.name === 'string' && route.name.trim().length > 0) {
    return route.name
  }
  return fallback
}

function normaliseRoles(value: unknown): string[] | undefined {
  if (value === undefined) return undefined
  const roles = toArray(value as string | string[] | undefined).filter(
    (role): role is string => typeof role === 'string' && role.length > 0
  )
  return roles
}

function buildNavItem(
  route: RouteRecordNormalized,
  nav: NavMeta,
  targetLayouts: string[]
): NavItem | null {
  const layouts = resolveLayouts(nav)
  if (!layouts.some((layout) => targetLayouts.includes(layout))) {
    return null
  }

  const to = resolvePath(route)
  const label = resolveLabel(route, nav, to)

  return {
    key:
      typeof nav.key === 'string' && nav.key.length > 0 ? nav.key : undefined,
    label,
    icon: typeof nav.icon === 'string' ? nav.icon : undefined,
    to,
    group: typeof nav.group === 'string' ? nav.group : undefined,
    profileId: typeof nav.profileId === 'string' ? nav.profileId : undefined,
    order: normaliseOrder(nav.order),
    desktop: nav.desktop !== false,
    mobile: nav.mobile !== false,
    layouts,
    requiresAuth: Boolean((route.meta as RouteMetaLike).requiresAuth),
    roles: normaliseRoles((route.meta as RouteMetaLike).roles),
    tenant:
      typeof (route.meta as RouteMetaLike).tenant === 'string'
        ? ((route.meta as RouteMetaLike).tenant as string)
        : undefined,
  }
}

function ensureLayouts(targetLayouts: TargetLayouts): string[] {
  const arr = toArray(targetLayouts)
  if (arr.length === 0) return [DEFAULT_LAYOUT]
  return arr
}

export function useNav(targetLayouts: TargetLayouts = [DEFAULT_LAYOUT]) {
  const router = useRouter()
  const wanted = ensureLayouts(targetLayouts)

  const items = computed<NavItem[]>(() => {
    const seen = new Set<string>()
    const result: NavItem[] = []

    for (const route of router.getRoutes()) {
      if ((route as any)?.aliasOf) continue

      const meta = route.meta as RouteMetaLike
      if (!isNavMeta(meta.nav)) continue

      const item = buildNavItem(route, meta.nav, wanted)
      if (!item) continue

      const dedupeKey = item.key ?? item.to ?? item.label
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      result.push(item)
    }

    return result.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.label.localeCompare(b.label)
    })
  })

  const desktop = computed(() => items.value.filter((item) => item.desktop))
  const mobile = computed(() => items.value.filter((item) => item.mobile))

  return { items, desktop, mobile }
}
