import { computed } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { EmployerProfile } from '../../../../../models/profiles/Employer.model.ts'

/**
 * Domain-level derived state for Employer profiles.
 * Keeps all logic in terms of the grouped refs returned by useProfile().
 */
export function useEmployerComputed(profile: ProfileRefs<EmployerProfile>) {
  const coreProfile = computed<EmployerProfile | null>(
    () => profile.coreProfile.value ?? null
  )

  const appProfile = computed<EmployerProfile | null>(
    () =>
      (profile.appProfile.value as EmployerProfile | null | undefined) ?? null
  )

  const activeProfile = computed<EmployerProfile | null>(() => {
    const core = coreProfile.value
    const overlay = appProfile.value
    if (!core && !overlay) return null
    const merged = {} as EmployerProfile
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
