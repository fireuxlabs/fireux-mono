import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig.ts'
import type { ProfileConfig } from '../../../models/profiles/profile.model.ts'

type ProfileLike = { core?: unknown; app?: unknown }

/**
 * Derived flags for profile state shared across profile consumers.
 */
export function useProfileComputed(
  profile: Ref<ProfileLike | null | undefined>,
  config: ProfileConfig
) {
  const { role } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const hasCoreProfile = computed(() => !!profile.value?.core)
  const hasAppProfile = isTenant
    ? computed(() => !!profile.value?.app)
    : undefined

  const hasProfile = computed(() => {
    if (isTenant) {
      return !!(hasAppProfile?.value || hasCoreProfile.value)
    }
    return hasCoreProfile.value
  })

  const ctaMessage = computed(() =>
    hasCoreProfile.value
      ? null
      : config.cta || `Complete your ${config.profileType} profile to continue.`
  )

  return {
    hasCoreProfile,
    ...(isTenant ? { hasAppProfile } : {}),
    hasProfile,
    ctaMessage,
  }
}
