# Navigation System Overview

This document captures the current navigation architecture in the core package, including the full source of nav composables and relevant types. Files are shown verbatim for clarity.

## Composables: `packages/core/fireux-core/src/runtime/composables/app/nav`

### defineNav.ts

```ts
// packages/core/fireux-core/src/runtime/composables/app/nav/defineNav.ts
import type { NavMeta } from '../../../types/nav'

/** Sugar to enforce `NavMeta` shape + common defaults */
export function defineNav(
  meta: NavMeta & {
    requiresAuth?: boolean
    roles?: string[]
    tenant?: string
  }
) {
  definePageMeta({
    nav: {
      group: 'Other',
      order: 999,
      area: 'default',
      desktop: false,
      mobile: false,
      ...meta,
    },
    requiresAuth: meta.requiresAuth ?? false,
    roles: meta.roles ?? [],
    tenant: meta.tenant,
  })
}
```

### useNavIndex.ts

```ts
// packages/core/fireux-core/src/runtime/composables/app/nav/useNavIndex.ts
import { computed } from 'vue'
import type { NormalizedNavItem } from '../../../types/nav'
import { useUser } from '../../firestore/user/useUser'

declare function useRouter(): { getRoutes: () => any[] }

declare function useAppConfig(): any

const DEFAULT_GROUP: string = 'Other'
const DEFAULT_AREA: string = 'default'

export function useNavIndex() {
  const router = useRouter()
  const app = typeof useAppConfig === 'function' ? useAppConfig() : {}
  const {
    isAdmin,
    hasCoreProfile,
    roles: rolesRef,
  } = (useUser?.() ?? {}) as any

  const userRoles = computed<string[]>(() =>
    Array.isArray(rolesRef?.value) ? rolesRef.value : []
  )

  const routes = computed(() => router.getRoutes())

  const canSee = (r: any) => {
    const m = r.meta || {}
    if (!m.nav?.key) return false
    if (m.tenant && m.tenant !== app?.tenant) return false
    if (m.requiresAuth && !hasCoreProfile?.value) return false

    // Role gating: if roles specified, require ANY match with user's roles or admin
    const required: string[] | undefined = m.roles
    if (required?.length) {
      const ok = required.some(
        (role: string) =>
          userRoles.value.includes(role) || (role === 'admin' && isAdmin?.value)
      )
      if (!ok) return false
    }
    return true
  }

  const all = computed<NormalizedNavItem[]>(() =>
    routes.value.filter(canSee).map((r: any) => {
      const n = r.meta.nav
      return {
        key: n.key,
        label: n.label ?? r.path,
        icon: n.icon,
        to: r.path as string,
        group: (n.group ?? DEFAULT_GROUP) as string,
        order: (n.order ?? 999) as number,
        area: (n.area ?? DEFAULT_AREA) as string,
        desktop: !!n.desktop,
        mobile: !!n.mobile,
        requiresAuth: !!r.meta.requiresAuth,
        roles: (r.meta.roles ?? []) as string[],
      }
    })
  )

  const byKey = computed(() => new Map(all.value.map((i) => [i.key, i])))
  const filter = (fn: (i: NormalizedNavItem) => boolean) => all.value.filter(fn)
  const sorted = (items: NormalizedNavItem[]) =>
    [...items].sort((a, b) => a.order - b.order)

  return { all, byKey, filter, sorted }
}
```

### useNavDefault.ts

```ts
// packages/core/fireux-core/src/runtime/composables/app/nav/useNavDefault.ts
import { computed } from 'vue'
import { useNavIndex } from './useNavIndex'
import type { NormalizedNavItem } from '../../../types/nav'

type Item = { label: string; icon?: string; to: string }

export function useNavDefault() {
  const { byKey, filter, sorted } = useNavIndex()
  const BASICS = ['home', 'products', 'blog'] as const

  const asItem = (i: NormalizedNavItem): Item => ({
    label: i.label,
    icon: i.icon,
    to: i.to,
  })

  const desktop = computed<Item[]>(() =>
    BASICS.map((k) => byKey.value.get(k))
      .filter((i): i is NormalizedNavItem => !!i)
      .map(asItem)
  )

  const mobile = computed<Item[]>(() => {
    const extras = sorted(
      filter((i) => i.mobile && !BASICS.includes(i.key as any))
    ).map(asItem)
    return [...desktop.value, ...extras]
  })

  return { desktop, mobile }
}
```

### useDashboardNav.ts

```ts
// packages/core/fireux-core/src/runtime/composables/app/nav/useDashboardNav.ts
import { computed } from 'vue'
import { useNavIndex } from './useNavIndex'
import type { NormalizedNavItem } from '../../../types/nav'

type DashboardItem = {
  label: string
  icon?: string
  to: string
  group: string
  order: number
}

export function useDashboardNav() {
  const { filter, sorted } = useNavIndex()
  const items = computed<DashboardItem[]>(() =>
    sorted(
      filter(
        (i: NormalizedNavItem) =>
          i.area === 'dashboard' || i.to.startsWith('/dashboard')
      )
    ).map((i) => ({
      label: i.label,
      icon: i.icon,
      to: i.to,
      group: i.group,
      order: i.order,
    }))
  )

  // Optional split
  const user = computed(() => items.value.filter((i) => i.group !== 'Admin'))
  const admin = computed(() => items.value.filter((i) => i.group === 'Admin'))

  return { items, user, admin }
}
```

## Types: `packages/core/fireux-core/src/runtime/types`

### nav.ts

```ts
// packages/core/fireux-core/src/runtime/types/nav.ts
// Types are intentionally open-ended (plain string) so tenants/extensions can define their own
// Suggested convenience constants are provided below.

export interface NavMeta {
  /** Unique key within site (prefer kebab-case) */
  key: string
  /** Shown label; if missing, falls back to route path */
  label?: string
  /** Icon name (e.g. i-lucide-*) */
  icon?: string
  /** Visual grouping in menus */
  group?: string
  /** Ordering within group/area */
  order?: number
  /** Where this item is intended to appear */
  area?: string
  /** Show in desktop default header */
  desktop?: boolean
  /** Show in mobile menu */
  mobile?: boolean
}

export interface NormalizedNavItem {
  key: string
  label: string
  icon?: string
  to: string
  group: string
  order: number
  area: string
  desktop: boolean
  mobile: boolean
  // access constraints (normalized from RouteMeta)
  requiresAuth: boolean
  roles: string[]
}

// Optional convenience constants (non-limiting)
export const NAV_GROUP = {
  Core: 'Core',
  User: 'User',
  Admin: 'Admin',
} as const
```

### route-meta.d.ts

```ts
// packages/core/fireux-core/src/runtime/types/route-meta.d.ts
import type { NavMeta } from './nav'

declare module 'vue-router' {
  interface RouteMeta {
    /** Opt-in navigation metadata */
    nav?: NavMeta
    /** Access control (consumed by useNavIndex) */
    requiresAuth?: boolean
    roles?: string[]
    /** Optional tenant scoping */
    tenant?: string
  }
}
export {}
```

### layouts.ts

```ts
export interface LayoutRoutes {
  menuBarLinks?: any[]
  mobileLinks?: any[]
}

export interface DevRoutes {
  // Allow flexible dev route groups without enforcing a schema yet
  [key: string]: any
}
```

> Note: The legacy `RouteLink` type and route helpers were removed in favor of meta-driven navigation.

### firebase.ts

```ts
/**
 * Firebase Types
 *
 * Reusable type definitions for Firebase integrations
 */

/**
 * Firebase Timestamp type for compatibility
 */
export interface FirebaseTimestamp {
  seconds: number
  nanoseconds: number
}
```
