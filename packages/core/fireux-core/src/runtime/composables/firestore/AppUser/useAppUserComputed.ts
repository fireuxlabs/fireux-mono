// ~/composables/firestore/AppUser/useAppUserComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AppUser } from '../../../models/core/appUser.model'

export function useAppUserComputed(appUser: Ref<AppUser | null | undefined>) {
  // Computed properties
  const isAppUser = computed(() => !!appUser.value)
  const isPro = computed(() => appUser.value?.subscription?.is_pro === true)
  const isAdmin = computed(() => appUser.value?.role === 'admin')

  // Profile checking method
  function hasProfile(profileType: string): boolean {
    const profiles = appUser.value?.profiles || []
    return profiles.some((p) => p.type === profileType)
  }

  // Methods
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
    // Computed properties
    isAppUser,
    isPro,
    isAdmin,

    // Profile checking method
    hasProfile,

    // Methods
    hasSubscription,
  }
}
