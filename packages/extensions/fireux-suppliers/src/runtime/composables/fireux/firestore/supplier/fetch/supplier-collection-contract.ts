import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { normalizeFireuxAppScopeState } from 'fireux-core/runtime/models/core/meta.model'
import type { Ref } from 'vue'
import {
  SupplierStorage,
  type AppSupplier,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import type { SupplierSurface } from '../utils/view/useSupplierInterface'

export type SupplierRootDoc = Partial<Supplier> & {
  id?: string
}

export type SupplierCollectionDoc = SupplierRootDoc & SupplierSurface

export type AppSupplierRecord = Partial<AppSupplier> & {
  id?: string
}

export const DEFAULT_COLLECTION_PATH = SupplierStorage.rootCollection

export const UNSUPPORTED_TEST_SOURCE_MESSAGE =
  '[fireux-suppliers] Supplier Test source is unsupported: no canonical simulation producer exists.'

export type SupplierCollectionFilterValue = string | number | null | undefined

export type SupplierCollectionFilter = {
  ids?: SupplierCollectionFilterValue[] | null | undefined
  operatorId?: SupplierCollectionFilterValue
  teamId?: SupplierCollectionFilterValue
}

export type SupplierCollectionSource = ConsoleSource

export type UseSupplierCollectionOptions = {
  source?:
    | SupplierCollectionSource
    | Ref<SupplierCollectionSource | null | undefined>
    | null
  filter?:
    | SupplierCollectionFilter
    | Ref<SupplierCollectionFilter | null | undefined>
    | null
}

export const normalizeString = (value: unknown) => String(value ?? '').trim()

export function resolveSupplierId(
  supplier: { id?: unknown } | null | undefined
) {
  return normalizeString(supplier?.id)
}

export function supplierRootBelongsToApp(
  supplier: SupplierRootDoc,
  appId: string
) {
  const state = normalizeFireuxAppScopeState(supplier.app_scope_state)
  return (
    (state === 'parent_app' || state === 'tenant_app') &&
    normalizeString(supplier.app_scope_app_id) === appId
  )
}
