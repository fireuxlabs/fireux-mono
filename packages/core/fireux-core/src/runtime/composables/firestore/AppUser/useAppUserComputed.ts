// ~/composables/firestore/AppUser/useAppUserComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AppUser } from '../../../models/core/appUser.model'

export function useAppUserComputed(appUser: Ref<AppUser | null>) {
  // Computed initials for the app user
  const initials = computed(() => {
    const u = appUser.value
    if (!u) return 'U'
    if (u.first_name || u.last_name) {
      const first = u.first_name?.charAt(0) || ''
      const last = u.last_name?.charAt(0) || ''
      return (first + last).toUpperCase() || 'U'
    }
    const name = u.display_name || u.email || 'User'
    return (
      name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    )
  })
  // Computed properties
  const isAppUser = computed(() => !!appUser.value)

  // Legacy subscription logic - TODO: Remove after migration to CoreUser
  // New apps should use useCoreUser().isPro instead
  const isPro = computed(() => appUser.value?.subscription?.is_pro === true)
  const isAdmin = computed(() => appUser.value?.role === 'admin')

  // Legacy subscription function - TODO: Remove after migration to CoreUser
  function hasSubscription(planType: 'pro' | 'enterprise' = 'pro'): boolean {
    if (planType === 'pro') {
      return isPro.value
    }
    return (
      appUser.value?.subscription?.plan === planType &&
      appUser.value?.subscription?.is_pro === true
    )
  }
  return {
    isAppUser,
    isPro,
    isAdmin,
    initials,
    hasSubscription,
  }
}
