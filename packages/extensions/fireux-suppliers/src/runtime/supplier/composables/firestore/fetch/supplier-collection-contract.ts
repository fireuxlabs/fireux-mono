import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import type { Ref } from 'vue'
import {
  SupplierStorage,
  type AppSupplier,
  type Supplier,
} from '../../../models/Supplier.model.ts'
import type { SupplierSurface } from '../utils/view/useSupplierInterface'

export type SupplierRootDoc = Partial<Supplier> & {
  id?: string
}

export type SupplierCollectionDoc = SupplierRootDoc & SupplierSurface

export type AppSupplierRecord = Partial<AppSupplier> & {
  id?: string
}

export const DEFAULT_COLLECTION_PATH = SupplierStorage.collection

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
  appId: string,
  ecosystem: string
) {
  const management = readFireuxEntityManagement(supplier.management)
  return Boolean(
    management &&
    management.mode !== 'root' &&
    resolveFireuxEntityManagementAppId(management, ecosystem) === appId
  )
}
