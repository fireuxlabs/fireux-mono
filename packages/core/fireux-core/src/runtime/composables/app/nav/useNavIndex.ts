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
