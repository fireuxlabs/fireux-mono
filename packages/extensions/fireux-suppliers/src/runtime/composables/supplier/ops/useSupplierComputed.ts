import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type { SupplierCore } from 'fireux-suppliers/runtime/models/supplier/Supplier.model'

/**
 * useSupplierComputed
 * - Stubbed computed helpers for Supplier profiles
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useSupplier() return
 */
export function useSupplierComputed(
  refs: ProfileRefs<SupplierCore>,
  pending: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
