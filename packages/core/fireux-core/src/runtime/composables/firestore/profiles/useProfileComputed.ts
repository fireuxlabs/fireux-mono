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

  const ctaMessage = computed(() =>
    hasCoreProfile.value
      ? null
      : config.cta || `Complete your ${config.profileType} profile to continue.`
  )

  return {
    hasCoreProfile,
    ...(isTenant ? { hasAppProfile } : {}),
    ctaMessage,
  }
}
