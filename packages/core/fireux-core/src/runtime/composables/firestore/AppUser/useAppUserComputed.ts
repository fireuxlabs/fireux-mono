// ~/composables/firestore/AppUser/useAppUserComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AppUser } from '../../../models/core/appUser.model'
import type { CoreUser } from '../../../models/core/coreUser.model'

export function useAppUserComputed(
  appUser: Ref<AppUser | null>,
  coreUser: Ref<CoreUser | null | undefined>
) {
  // Never expose email; also never derive display names from email
  function looksLikeEmail(v?: string) {
    return !!v && v.includes('@')
  }
  function safeDisplay(vs: Array<string | undefined>, fallback: string) {
    for (const v of vs) {
      if (!v) continue
      if (looksLikeEmail(v)) continue
      return v
    }
    return fallback
  }

  const displayName = computed(() =>
    safeDisplay(
      [
        appUser.value?.display_name,
        // fall back to core name/handle if appUser missing
        coreUser.value?.display_name,
        coreUser.value?.handle,
        appUser.value?.handle,
        appUser.value?.id,
        coreUser.value?.id,
      ],
      'User'
    )
  )

  const avatarSrc = computed(
    () => appUser.value?.avatar || coreUser.value?.avatar || undefined
  )

  const initials = computed(() => {
    const name = displayName.value.trim()
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    )
  })

  const isAppUser = computed(() => !!appUser.value)
  const isAdmin = computed(() => appUser.value?.role === 'admin')
  const isSignedIn = computed(() => !!(appUser.value || coreUser.value))

  const hasProfile = (profileType: string): boolean => {
    const list = appUser.value?.profiles || []
    return list.includes(profileType)
  }

  // Back-compat placeholders
  const isPro = computed(() => false)
  function hasSubscription(_planType: 'pro' | 'enterprise' = 'pro'): boolean {
    return false
  }

  return {
    displayName,
    avatarSrc,
    initials,
    isAppUser,
    isAdmin,
    isSignedIn,
    hasProfile,
    isPro,
    hasSubscription,
  }
}
