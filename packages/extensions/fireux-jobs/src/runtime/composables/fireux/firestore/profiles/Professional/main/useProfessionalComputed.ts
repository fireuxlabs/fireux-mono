import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { computed, unref } from 'vue'
import type { ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'

/**
 * useProfessionalComputed
 * - Stubbed computed helpers for Professional profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useProfessional() return
 */
export function useProfessionalComputed(
  refs: ProfileRefs<ProfessionalCore>,
  pending: unknown
) {
  const profile = computed(() => refs.coreProfile.value ?? null)
  const computedSummary = computed(() => {
    const p = profile.value
    return {
      pending: Boolean(unref(pending as unknown)),
      experienceCount:
        (p?.relevant_experience?.length ?? 0) +
        (p?.other_experience?.length ?? 0),
      healthCertificationsCount: p?.health_certifications?.length ?? 0,
      specialtiesCount: p?.specialties?.length ?? 0,
      locationsCount: p?.locations?.length ?? 0,
      languagesCount: p?.languages?.length ?? 0,
      certificationsCount: p?.certifications?.length ?? 0,
      educationCount: p?.education?.length ?? 0,
      volunteeringCount: p?.volunteering?.length ?? 0,
      projectsCount: p?.projects?.length ?? 0,
      hasBio: Boolean((p?.bio_short ?? '').trim() || (p?.bio_long ?? '').trim()),
    }
  })

  return { computed: computedSummary }
}
