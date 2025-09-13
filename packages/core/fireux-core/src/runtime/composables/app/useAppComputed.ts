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
  let roleInput = (rc.public?.role || (rc.public as any)?.appRole) as
    | string
    | undefined
  if (roleInput === 'tenant') roleInput = 'tennant' // normalize legacy spelling
  const legacyTenantId = (rc.public as any)?.tenantId as string | undefined
  const isTennant = roleInput === 'tennant' || (!!legacyTenantId && !roleInput)

  // Canonical tenancy string: prefer explicit role; fallback to inferred tenant/global
  const appTenancy = computed(() => {
    if (roleInput) return roleInput
    return isTennant ? 'tennant' : 'king'
  })

  // Human-readable tenancy display (e.g., "King of ecosystem")
  const tenancyDisplay = computed(() => {
    const eco = (rc.public as any)?.ecosystem || 'ecosystem'
    const role = (appTenancy.value || '').toString()
    if (!role) return `Unknown of ${eco}`
    if (role.toLowerCase() === 'king') return `King of ${eco}`
    if (role === 'tennant') return `Tennant of ${eco}`
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
