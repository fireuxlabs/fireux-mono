// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const hasCoreProfile = computed(() => !!user.value?.core)
  const hasAppProfile = isTenant ? computed(() => !!user.value?.app) : undefined

  // 🔹 Admin if: role === 'admin' OR adminOf includes current app (or any app globally)
  const isAdmin = computed(() => {
    const u = user.value
    if (!u) return false

    if (u.app?.role === 'admin') return true

    const adminOf = u.adminOf || u.core?.adminOf || u.app?.adminOf || []
    return isTenant && appId ? adminOf.includes(appId) : adminOf.length > 0
  })

  // 🔹 Display name fallback: app > core > email username
  const displayName = computed(() => {
    const u = user.value
    if (!u) return ''
    return (
      u.app?.display_name ||
      u.core?.display_name ||
      (u.email ? u.email.split('@')[0] : '')
    )
  })

  const initials = computed(() => {
    const parts = (displayName.value || '').trim().split(/\s+/)
    return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '')
  })

  return {
    hasCoreProfile,
    ...(isTenant ? { hasAppProfile } : {}),
    isAdmin,
    displayName,
    initials,
  }
}
