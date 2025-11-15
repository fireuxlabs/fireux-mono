import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { SupplierProfile } from '../../../../../models/profiles/Supplier.model.ts'

/**
 * useSupplierComputed
 * - Stubbed computed helpers for Supplier profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useSupplier() return
 */
export function useSupplierComputed(
  refs: ProfileRefs<SupplierProfile>,
  pending: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
