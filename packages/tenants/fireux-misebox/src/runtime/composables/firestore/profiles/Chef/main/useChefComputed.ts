import { computed } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ChefProfile } from '../../../../../models/profiles/Chef.model.ts'

/**
 * Derived Chef profile state based on grouped core/app refs.
 */
export function useChefComputed(profile: ProfileRefs<ChefProfile>) {
  const coreProfile = computed<ChefProfile | null>(
    () => profile.coreProfile.value ?? null
  )

  const appProfile = computed<Partial<ChefProfile> | null>(
    () => profile.appProfile.value ?? null
  )

  const activeProfile = computed<ChefProfile | null>(() => {
    const core = coreProfile.value
    const overlay = appProfile.value
    if (!core && !overlay) return null
    const merged = {} as ChefProfile
    if (core) Object.assign(merged, core)
    if (overlay) Object.assign(merged, overlay)
    return merged
  })

  const hasCoreProfile = computed(() => Boolean(coreProfile.value))
  const hasAppProfile = computed(() => Boolean(appProfile.value))

  return {
    coreProfile,
    appProfile,
    activeProfile,
    hasCoreProfile,
    hasAppProfile,
  }
}
