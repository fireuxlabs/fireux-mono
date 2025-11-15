import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { EmployerProfile } from '../../../../../models/profiles/Employer.model.ts'

/**
 * useEmployerComputed
 * - Stubbed for future derived state
 * - Mirrors useProfessionalComputed signature so we can swap implementations
 *   without reworking the public API surface
 */
export function useEmployerComputed(
  profile: ProfileRefs<EmployerProfile>,
  pending?: Ref<boolean>
) {
  return {
    profile,
    pending,
  }
}
