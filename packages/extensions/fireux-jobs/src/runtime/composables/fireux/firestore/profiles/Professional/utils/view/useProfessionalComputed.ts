import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { computed, unref } from 'vue'
import type { Professional } from '../../../../../../../utils/profiles/Professional/professional'

/**
 * useProfessionalComputed
 * - Stubbed computed helpers for Professional profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useProfessional() return
 */
export function useProfessionalComputed(
  refs: ProfileRefs<Professional>,
  pending: unknown
) {
  const profile = computed(() => refs.profile.value ?? null)
  const computedSummary = computed(() => {
    const p = profile.value
    return {
      pending: Boolean(unref(pending as unknown)),
      experienceCount:
        (p?.relevant_experience?.length ?? 0) +
        (p?.other_experience?.length ?? 0),
      languagesCount: p?.languages?.length ?? 0,
      certificationsCount: p?.certifications?.length ?? 0,
      educationCount: p?.education?.length ?? 0,
      volunteeringCount: p?.volunteering?.length ?? 0,
      projectsCount: p?.projects?.length ?? 0,
      hasBio: Boolean(((p?.summary || p?.bio) ?? '').trim()),
    }
  })

  return { computed: computedSummary }
}
