// ~/composables/app/useAppComputed.ts
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { Ref } from 'vue'
import type { App } from '../../models/core/app.model'

export function useAppComputed(app: Ref<App | null | undefined>) {
  const currentUser = useCurrentUser()

  // Computed properties
  const isInitialized = computed(() => {
    if (!app.value) return false // Return false by default if app is undefined or null
    return !!app.value.admin_ids?.length // Check if admin_ids exists and has a length
  })

  const hasDescription = computed(() => !!app.value?.description)

  const hasSocialLinks = computed(
    () =>
      !!app.value?.social_links &&
      Object.keys(app.value.social_links).length > 0
  )

  // Methods
  function hasAdmins(): boolean {
    return !!app.value?.admin_ids?.length
  }

  function isUserAdmin(userId?: string): boolean {
    const targetUserId = userId ?? currentUser.value?.uid
    if (!targetUserId || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(targetUserId)
  }

  function hasConfiguration(): boolean {
    return isInitialized.value && (hasDescription.value || hasSocialLinks.value)
  }

  return {
    // Computed properties
    isInitialized,
    hasDescription,
    hasSocialLinks,

    // Methods
    hasAdmins,
    isUserAdmin,
    hasConfiguration,
  }
}
