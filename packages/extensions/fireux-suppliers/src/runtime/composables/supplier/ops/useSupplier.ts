// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/useSupplier.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { supplierConfig } from '../supplierConfig'
import type { SupplierCore } from '../../../models/supplier/Supplier.model'
import { useSupplierComputed } from './useSupplierComputed'
import { useSupplierCreate } from '../useSupplierCreate'
import { useSupplierUpdate } from '../useSupplierUpdate'
import type { SupplierCard } from '../../fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface'
import { useSupplierInterface } from '../../fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface'

export type { SupplierCard, SupplierCore as SupplierProfile }

/**
 * useSupplier
 * - Runtime facade for Supplier profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill etc.) that use coreUser
 *   - update helpers
 */
export function useSupplier() {
  const { profile: refs, pending } = useProfile<SupplierCore>(supplierConfig)
  const { coreProfile, appProfile } = refs

  const computed = useSupplierComputed(refs, pending)
  const ui = useSupplierInterface(refs)
  const update = useSupplierUpdate(refs)
  const create = useSupplierCreate()

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,
    ...computed,
    ...ui,
    ...update,
    ...create,
  }
}
