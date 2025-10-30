import { computed, type Ref } from 'vue'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

import type { ProfileFetchResult } from './useProfileFetch.ts'

type ProfileRef<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = Ref<ProfileFetchResult<TCore, TApp> | null>

/**
 * Derived booleans + CTA text for profile UIs.
 */
export function useProfileComputed<
  TCore extends ProfileBase,
  TApp extends ProfileBase = TCore
>(profile: ProfileRef<TCore, TApp>, config: ProfileConfig) {
  const { isTenant } = useFireUXConfig()

  const hasCoreProfile = computed(() => Boolean(profile.value?.core))
  const hasAppProfile = isTenant
    ? computed(() => Boolean(profile.value?.app))
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
