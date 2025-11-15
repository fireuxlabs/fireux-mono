import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  supplierConfig,
  type SupplierProfile,
  type SupplierCoreProfile,
  type SupplierCard,
} from '../../../../models/profiles/Supplier.model.ts'
import { useSupplierComputed } from './main/useSupplierComputed.ts'
import { useSupplierInterface } from './main/useSupplierInterface.ts'
import { useSupplierUpdate } from './main/useSupplierUpdate.ts'

export type { SupplierProfile, SupplierCoreProfile, SupplierCard }

/**
 * useSupplier
 * - Thin facade over generic profile stack
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile
 *   - computed helpers
 *   - UI helpers
 *   - update helpers
 */
export function useSupplier() {
  const { profile: refs, pending } = useProfile<SupplierProfile>(supplierConfig)
  const { coreProfile, appProfile } = refs

  const computed = useSupplierComputed(refs, pending)
  const ui = useSupplierInterface(refs)
  const update = useSupplierUpdate(refs)

  return {
    // raw
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    // helpers
    ...computed,
    ...ui,
    ...update,
  }
}
