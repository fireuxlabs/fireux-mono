# Legacy fireUX/nav catalog

## FILE: fireUX/nav/defineNav.ts

```ts
// packages/core/fireux-core/src/runtime/composables/fireUX/nav/defineNav.ts
import type { NavMeta } from '../../../types/nav'

// Nuxt macro shim for package typechecking (apps provide the real macro)
declare function definePageMeta(meta: any): void

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

## FILE: fireUX/nav/useDashboardNav.ts

```ts
// packages/core/fireux-core/src/runtime/composables/fireUX/nav/useDashboardNav.ts
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

## FILE: fireUX/nav/useNavDefault.ts

```ts
// packages/core/fireux-core/src/runtime/composables/fireUX/nav/useNavDefault.ts
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

## FILE: fireUX/nav/useNavIndex.ts

```ts
// packages/core/fireux-core/src/runtime/composables/fireUX/nav/useNavIndex.ts
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
