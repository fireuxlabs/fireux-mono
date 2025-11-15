import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { ChefProfile } from '../../../../../models/profiles/Chef.model.ts'

/**
 * useChefComputed
 * - Stubbed for parity with other profile composables
 * - Accepts the live profile refs + pending flag so we can expose them
 *   consistently today and expand later without API churn
 */
export function useChefComputed(
  profile: ProfileRefs<ChefProfile>,
  pending?: Ref<boolean>
) {
  return {
    profile,
    pending,
  }
}
