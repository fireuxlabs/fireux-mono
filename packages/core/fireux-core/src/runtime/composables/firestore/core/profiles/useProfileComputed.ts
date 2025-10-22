// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfileComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { ProfileBase, ProfileConfig } from './useProfile'

type ProfileLike = { core?: unknown; app?: unknown } & ProfileBase

/**
 * Derived booleans + CTA text for profile UIs.
 */
export function useProfileComputed(
  profile: Ref<ProfileLike | null | undefined>,
  config: ProfileConfig
) {
  const { isTenant } = useFireUXConfig()

  const hasCoreProfile = computed(() => !!profile.value?.core)
  const hasAppProfile = isTenant
    ? computed(() => !!profile.value?.app)
    : undefined

  // When tenant, consider profile "present" if either app or core exists.
  const hasProfile = computed(() => {
    if (isTenant) {
      return Boolean(hasAppProfile?.value || hasCoreProfile.value)
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
