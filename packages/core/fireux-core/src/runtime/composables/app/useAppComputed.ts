// ~/composables/app/useAppComputed.ts
import { computed, shallowRef, type Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import type { AppDoc } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'

export function useAppComputed(app: Ref<AppDoc | null | undefined>) {
  const { role, ecosystem } = useFireUXConfig()

  const currentUser = import.meta.client
    ? useCurrentUser()
    : (shallowRef<User | null>(null) as ReturnType<typeof useCurrentUser>)

  // Mirror role in older UI fields
  const appTenancy = computed(() => role)
  const tenancyDisplay = computed(() => {
    if (role === 'global') return `Global of ${ecosystem}`
    if (role === 'tenant') return `Tenant of ${ecosystem}`
    return role
  })

  const isLoading = computed(() => app.value === undefined)
  const isInitialized = computed(() => {
    if (!app.value) return false
    return Array.isArray(app.value.admin_ids) && app.value.admin_ids.length > 0
  })

  function hasAdmins(): boolean {
    return !!app.value?.admin_ids?.length
  }

  function isUserAdmin(userId?: string): boolean {
    const targetUserId = userId ?? currentUser.value?.uid
    if (!targetUserId || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(targetUserId)
  }

  return {
    appTenancy,
    tenancyDisplay,
    isLoading,
    isInitialized,
    hasAdmins,
    isUserAdmin,
  }
}
