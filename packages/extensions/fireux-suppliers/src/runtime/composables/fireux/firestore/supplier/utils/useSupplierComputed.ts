import type { SupplierRefs } from '../fetch/useSupplierRecord'

/**
 * useSupplierComputed
 * - Stubbed computed helpers for Supplier records and workspace state
 * - Accepts refs + pending but does not use them yet
 * - Safe to spread into useSupplier() return
 */
export function useSupplierComputed(
  refs: SupplierRefs,
  pending: unknown
) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void refs
  void pending

  return {}
}
