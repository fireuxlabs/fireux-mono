// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'

type ProfileLike = { core?: unknown; app?: unknown }

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

  // Unified: treat profile as present if either core or app exists (tenants prefer app but include core)
  const hasProfile = computed(() => {
    if (isTenant) {
      // When tenant, count either app overlay or core baseline
      return !!(hasAppProfile?.value || hasCoreProfile.value)
    }
    // Non-tenant only has core
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
