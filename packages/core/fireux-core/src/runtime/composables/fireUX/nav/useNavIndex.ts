import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { NormalizedNavItem } from '../../../types/nav'
import { useUser } from '../../firestore/core/user/useUser'
import { useFireUXConfig } from '../../FireUXConfig'

const DEFAULT_GROUP = 'Other'
const DEFAULT_AREA = 'default'

export function useNavIndex() {
  const router = useRouter()
  const { appId: tenantId } = useFireUXConfig()
  const { user, isAdmin, hasCoreProfile } = useUser()

  const userRoles = computed<string[]>(() => {
    const roles =
      (user.value?.app as any)?.roles ?? (user.value?.core as any)?.roles ?? []
    return Array.isArray(roles) ? roles : []
  })

  const routes = computed(() => router.getRoutes())

  const canSee = (r: any) => {
    const m = r.meta || {}
    if (!m.nav?.key) return false
    if (m.tenant && m.tenant !== tenantId) {
      return false
    }
    if (m.requiresAuth && !hasCoreProfile.value) {
      return false
    }

    const required: string[] | undefined = m.roles
    if (required?.length) {
      const ok = required.some(
        (role) =>
          userRoles.value.includes(role) || (role === 'admin' && isAdmin.value)
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
