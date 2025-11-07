import { computed } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalComputed(
  profile: ProfileRefs<ProfessionalProfile>
) {
  const coreProfile = computed<ProfessionalProfile | null>(
    () =>
      (profile.coreProfile.value as ProfessionalProfile | null | undefined) ??
      null
  )

  const appProfile = computed<ProfessionalProfile | null>(
    () =>
      (profile.appProfile.value as ProfessionalProfile | null | undefined) ??
      null
  )

  const activeProfile = computed<ProfessionalProfile | null>(() => {
    const core = coreProfile.value
    const overlay = appProfile.value
    if (!core && !overlay) return null
    const merged = {} as ProfessionalProfile
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
