import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

/**
 * useProfessionalComputed
 * - Stubbed computed layer for Professional profiles
 * - Takes `profile` refs and optional `pending` to keep the API aligned
 * - For now, just returns them as-is so we can safely spread this
 *   in `useProfessional()` without over-engineering.
 */
export function useProfessionalComputed(
  profile: ProfileRefs<ProfessionalProfile>,
  pending?: Ref<boolean>
) {
  return {
    profile,
    pending,
  }
}
