import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { SupplierProfile } from '../../../../../models/profiles/Supplier.model.ts'

/**
 * useSupplierComputed
 * - Parity with other profile composables
 * - Accepts refs + pending so we can safely expose them today and layer on
 *   derived helpers later without signature churn
 */
export function useSupplierComputed(
  profile: ProfileRefs<SupplierProfile>,
  pending?: Ref<boolean>
) {
  return {
    profile,
    pending,
  }
}
