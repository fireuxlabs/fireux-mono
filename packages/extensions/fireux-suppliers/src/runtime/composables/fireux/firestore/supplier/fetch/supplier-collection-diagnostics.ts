import { readConsoleTargetAuthority } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import {
  resolveSupplierId,
  supplierRootBelongsToApp,
  type AppSupplierRecord,
  type SupplierRootDoc,
} from './supplier-collection-contract'

export function findDanglingAppSupportError(
  roots: SupplierRootDoc[],
  appSupportRecords: AppSupplierRecord[]
) {
  const rootIds = new Set(roots.map(resolveSupplierId).filter(Boolean))
  const danglingCount = appSupportRecords
    .map(resolveSupplierId)
    .filter(Boolean)
    .filter((id) => !rootIds.has(id)).length

  return danglingCount
    ? new Error(
        `[useSupplierCollection] ${danglingCount} AppSupplier support record(s) have no canonical root Supplier`
      )
    : undefined
}

export function findMalformedAppSupportError(
  appSupportRecords: AppSupplierRecord[]
) {
  const ids = appSupportRecords
    .filter((appSupport) => !readConsoleTargetAuthority(appSupport))
    .map(resolveSupplierId)
    .filter(Boolean)

  return ids.length
    ? new Error(
        `[useSupplierCollection] malformed AppSupplier authority: ${ids.join(', ')}`
      )
    : undefined
}

export function findRequestedTargetPairError(
  requestedIds: Set<string>,
  roots: SupplierRootDoc[],
  appSupportRecords: AppSupplierRecord[]
) {
  const rootIds = new Set(roots.map(resolveSupplierId).filter(Boolean))
  const appSupportIds = new Set(
    appSupportRecords.map(resolveSupplierId).filter(Boolean)
  )
  const missingRoots = [...requestedIds].filter((id) => !rootIds.has(id))
  const missingAppRecords = [...requestedIds].filter(
    (id) => !appSupportIds.has(id)
  )

  return missingRoots.length || missingAppRecords.length
    ? new Error(
        `[useSupplierCollection] incomplete requested Supplier target pair; missing root: ${missingRoots.join(', ') || 'none'}; missing AppSupplier: ${missingAppRecords.join(', ') || 'none'}`
      )
    : undefined
}

export function findRootScopeError(
  roots: SupplierRootDoc[],
  appSupportRecords: AppSupplierRecord[],
  appId: string,
  ecosystem: string
) {
  const appSupportIds = new Set(
    appSupportRecords.map(resolveSupplierId).filter(Boolean)
  )
  const mismatches = roots
    .filter((supplier) => appSupportIds.has(resolveSupplierId(supplier)))
    .filter((supplier) =>
      !supplierRootBelongsToApp(supplier, appId, ecosystem)
    )
    .map(resolveSupplierId)
    .filter(Boolean)

  return mismatches.length
    ? new Error(
        `[useSupplierCollection] Supplier root/AppSupplier scope mismatch: ${mismatches.join(', ')}`
      )
    : undefined
}
