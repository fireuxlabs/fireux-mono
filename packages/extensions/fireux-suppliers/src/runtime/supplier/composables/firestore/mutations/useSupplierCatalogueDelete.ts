import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { resolveSupplierCatalogueCollectionPath } from '../fetch/useSupplierCatalogueCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierCatalogueDelete(
  options: {
    supplierCollectionPath?: string
  } = {}
) {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteSupplierCatalogue(
    supplierId: string,
    catalogueId: string
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

    await deleteDocument(collectionPath, resolvedCatalogueId)
  }

  return {
    deleteSupplierCatalogue,
  }
}
