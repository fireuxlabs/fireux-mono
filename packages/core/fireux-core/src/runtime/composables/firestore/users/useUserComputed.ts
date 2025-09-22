import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { role } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const hasCoreProfile = computed(() => !!user.value?.core)
  const hasAppProfile = isTenant ? computed(() => !!user.value?.app) : undefined

  const ctaMessage = computed(() =>
    hasCoreProfile.value ? null : 'Complete your core user profile to continue.'
  )

  // Back-compat and convenience fields used by UI components
  const isSignedIn = computed(() => !!user.value?.id)
  const displayName = computed(
    () =>
      (user.value?.app as any)?.display_name ||
      (user.value?.core as any)?.display_name ||
      ''
  )
  const avatarSrc = computed(
    () =>
      (user.value?.app as any)?.avatar ||
      (user.value?.core as any)?.avatar ||
      ''
  )
  const initials = computed(() => {
    const name = displayName.value || ''
    if (!name) return ''
    const parts = name.trim().split(/\s+/)
    const [a, b] = [parts[0]?.[0], parts[1]?.[0]]
    return (a || '').toUpperCase() + (b || '').toUpperCase()
  })

  return {
    hasCoreProfile,
    ...(isTenant ? { hasAppProfile } : {}),
    ctaMessage,
    // Aliases used by existing components
    hasCoreUserProfile: hasCoreProfile,
    ...(isTenant ? { hasAppUserProfile: hasAppProfile } : {}),
    isSignedIn,
    displayName,
    avatarSrc,
    initials,
  }
}
