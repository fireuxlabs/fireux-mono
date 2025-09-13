// ~/composables/firestore/AppUser/useAppUserComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AppUser } from '../../../models/core/appUser.model'
import { useCoreUser } from '../CoreUser/useCoreUser'

export function useAppUserComputed(appUser: Ref<AppUser | null>) {
  // Pull identity from CoreUser (canonical)
  const core = useCoreUser()
  const coreUserRef = (core as any).coreUser as Ref<{
    display_name?: string
    email?: string
  } | null>

  // Computed initials for the user (from CoreUser)
  const initials = computed(() => {
    const name =
      coreUserRef?.value?.display_name || coreUserRef?.value?.email || 'User'
    return (
      name
        .split(' ')
        .map((word: string) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    )
  })

  // Computed properties
  const isAppUser = computed(() => !!appUser.value)
  const isAdmin = computed(() => appUser.value?.role === 'admin')

  // Back-compat: expose isPro/hasSubscription but default to false (subscription moved elsewhere)
  const isPro = computed(() => false)
  function hasSubscription(_planType: 'pro' | 'enterprise' = 'pro'): boolean {
    return false
  }

  // Profile checking method
  const hasProfile = (profileType: string): boolean => {
    const profiles = appUser.value?.profiles || []
    return profiles.includes(profileType)
  }

  return {
    isAppUser,
    isPro,
    isAdmin,
    initials,
    hasProfile,
    hasSubscription,
  }
}
