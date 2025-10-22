// ~/composables/app/useAppComputed.ts
import { computed, shallowRef, watchEffect, type Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const { role, ecosystem, appId } = useFireUXConfig()

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

  if (import.meta.dev && import.meta.client) {
    let lastSignature = ''
    watchEffect(() => {
      const payload = {
        source: 'useAppComputed',
        appId,
        role,
        ecosystem,
        hasAppDoc: !!app.value,
        adminIds: app.value?.admin_ids ?? null,
        adminCount: app.value?.admin_ids?.length ?? 0,
        isInitialized: isInitialized.value,
        isLoading: isLoading.value,
        currentUid: currentUser.value?.uid ?? null,
      }
      const signature = JSON.stringify(payload)
      if (signature !== lastSignature) {
        lastSignature = signature
        console.info('[fireux][app-init-debug]', payload)
      }
    })
  }

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
