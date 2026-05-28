import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  type SupplierCatalogue,
  type SupplierCatalogueUpdateInput,
} from '../../../../../models/supplier/Supplier.model'
import { resolveSupplierCatalogueCollectionPath } from '../fetch/useSupplierCatalogueCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierCatalogueUpdate(options: {
  supplierCollectionPath?: string
} = {}) {
  const { updateDocument } = useFirestoreUpdate()

  async function updateSupplierCatalogue(
    supplierId: string,
    catalogueId: string,
    patch: SupplierCatalogueUpdateInput
  ): Promise<void> {
    const resolvedSupplierId = normalizeString(supplierId)
    const resolvedCatalogueId = normalizeString(catalogueId)
    if (!resolvedSupplierId) {
      throw new Error('[fireux-suppliers] supplier id is required.')
    }
    if (!resolvedCatalogueId) {
      throw new Error('[fireux-suppliers] catalogue id is required.')
    }

    const collectionPath = resolveSupplierCatalogueCollectionPath(
      resolvedSupplierId,
      options.supplierCollectionPath
    )

    await updateDocument<SupplierCatalogue>(
      collectionPath,
      resolvedCatalogueId,
      patch
    )
  }

  return {
    updateSupplierCatalogue,
  }
}
