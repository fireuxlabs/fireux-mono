// ~/composables/app/useAppComputed.ts
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { Ref } from 'vue'
import type { App } from '../../models/core/app.model'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const currentUser = useCurrentUser()

  // Computed properties
  // VueFire useDocument ref states:
  //   undefined => still loading
  //   null      => document does not exist
  //   object    => document data
  const isLoading = computed(() => app.value === undefined)
  const isInitialized = computed(() => {
    if (app.value === undefined) return false // loading phase – treat as not yet initialized but allow separate handling
    if (app.value === null) return false // no doc yet
    return !!app.value.admin_ids?.length
  })

  // Methods
  function hasAdmins(): boolean {
    return !!app.value?.admin_ids?.length
  }

  function isUserAdmin(userId?: string): boolean {
    const targetUserId = userId ?? currentUser.value?.uid
    if (!targetUserId || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(targetUserId)
  }

  return {
    // Computed properties
    isLoading,
    isInitialized,

    // Methods
    hasAdmins,
    isUserAdmin,
  }
}
