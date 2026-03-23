// FILE: packages/extensions/fireux-suppliers/src/runtime/composables/supplier/ops/useSupplier.ts

import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { SupplierCore } from '../../../models/supplier/Supplier.model'
import type { SupplierApp } from '../../../models/supplier/Supplier.model'
import type { SupplierCard } from '../useSupplierInterface'
import { useSupplierInterface } from '../useSupplierInterface'
import { useSupplierCreate } from '../useSupplierCreate'
import { useSupplierRecord } from '../useSupplierRecord'
import { useSupplierUpdate } from '../useSupplierUpdate'
import { useSupplierComputed } from './useSupplierComputed'

export type {
  SupplierCard,
  SupplierCore as SupplierRecord,
  SupplierApp as SupplierWorkspace,
}

/**
 * useSupplier
 * - Runtime facade for Supplier records and supplier workspace state
 * - Exposes:
 *   - raw refs: supplier, coreSupplier, appSupplier, pending
 *   - computed helpers
 *   - UI helpers (pill etc.) that use coreUser
 *   - update helpers
 */
export function useSupplier() {
  const { uid } = useAuth()
  const { supplier, coreSupplier, appSupplier, pending } = useSupplierRecord(uid)
  const refs = { coreSupplier, appSupplier }

  const computed = useSupplierComputed(refs, pending)
  const ui = useSupplierInterface(refs)
  const update = useSupplierUpdate(refs)
  const create = useSupplierCreate()

  return {
    supplier,
    coreSupplier,
    appSupplier,
    pending,
    ...computed,
    ...ui,
    ...update,
    ...create,
  }
}
