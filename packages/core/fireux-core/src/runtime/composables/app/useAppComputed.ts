// ~/composables/app/useAppComputed.ts
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useRuntimeConfig } from 'nuxt/app'
import type { Ref } from 'vue'
import type { App } from '../../models/core/app.model'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const currentUser = useCurrentUser()
  const rc = useRuntimeConfig()

  // Role is canonical: 'global' | 'tenant'
  const role =
    (rc.public?.role as string | undefined)?.toLowerCase() || 'tenant'

  // Back-compat: expose appTenancy string mirroring role
  const appTenancy = computed(() => role)

  // Human-readable tenancy display
  const tenancyDisplay = computed(() => {
    const eco = (rc.public as any)?.ecosystem || 'ecosystem'
    if (role === 'global') return `Global of ${eco}`
    if (role === 'tenant') return `Tenant of ${eco}`
    return `${role} of ${eco}`
  })

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
    tenancyDisplay,

    // Existing
    isLoading,
    isInitialized,
    hasAdmins,
    isUserAdmin,
  }
}
