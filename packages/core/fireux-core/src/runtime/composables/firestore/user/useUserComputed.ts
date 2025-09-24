// packages/core/fireux-core/src/runtime/composables/firestore/users/useUserComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { role } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const hasCoreProfile = computed(() => !!user.value?.core)
  const hasAppProfile = isTenant ? computed(() => !!user.value?.app) : undefined

  // 🔹 new: admin check (only relevant in tenant apps)
  const isAdmin = computed(() => user.value?.app?.role === 'admin')

  const displayName = computed(
    () => user.value?.app?.display_name || user.value?.core?.display_name || ''
  )

  const initials = computed(() => {
    const name = displayName.value || ''
    if (!name) return ''
    const parts = name.trim().split(/\s+/)
    const [a, b] = [parts[0]?.[0], parts[1]?.[0]]
    return (a || '').toUpperCase() + (b || '').toUpperCase()
  })

  return {
    hasCoreProfile,
    ...(isTenant ? { hasAppProfile } : {}),
    isAdmin,
    displayName,
    initials,
  }
}
