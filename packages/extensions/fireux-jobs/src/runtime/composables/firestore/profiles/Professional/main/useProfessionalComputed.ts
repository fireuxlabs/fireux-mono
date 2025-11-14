import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalComputed(
  profile: ProfileRefs<ProfessionalProfile>,
  pending?: Ref<boolean>
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

  const runtimeProfile = computed<ProfessionalProfile | null>(
    () => coreProfile.value
  )

  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(
    () =>
      isPending.value ||
      profile.coreProfile.value === undefined ||
      profile.appProfile.value === undefined
  )

  return {
    profile: activeProfile,
    activeProfile,
    runtimeProfile,
    hasCoreProfile,
    hasAppProfile,
    isPending,
    isLoading,
  }
}
