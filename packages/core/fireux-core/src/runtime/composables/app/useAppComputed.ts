// ~/composables/app/useAppComputed.ts
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useRuntimeConfig } from 'nuxt/app'
import type { Ref } from 'vue'
import type { App } from '../../models/core/app.model'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const currentUser = useCurrentUser()
  const rc = useRuntimeConfig()

  // Simple tenancy detection (now canonical via runtimeConfig.public.role)
  // Backwards compatibility: fall back to legacy appRole / tenantId if present
  const roleInput = (rc.public?.role || (rc.public as any)?.appRole) as
    | string
    | undefined
  const legacyTenantId = (rc.public as any)?.tenantId as string | undefined
  const isTenant = roleInput === 'tenant' || (!!legacyTenantId && !roleInput)

  const appTenancy = computed(() => (isTenant ? 'is tenant' : 'is not tenant'))

  // Existing computed: loading/initialized
  const isLoading = computed(() => app.value === undefined)

  const isInitialized = computed(() => {
    if (app.value === undefined) return false // loading
    if (app.value === null) return false // no doc yet
    return !!app.value.admin_ids?.length
  })

  // Existing helpers
  function hasAdmins(): boolean {
    return !!app.value?.admin_ids?.length
  }

  function isUserAdmin(userId?: string): boolean {
    const targetUserId = userId ?? currentUser.value?.uid
    if (!targetUserId || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(targetUserId)
  }

  return {
    // New readout
    appTenancy,

    // Existing
    isLoading,
    isInitialized,
    hasAdmins,
    isUserAdmin,
  }
}
