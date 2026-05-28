import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { resolveSupplierProductCollectionPath } from '../fetch/useSupplierProductCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierProductDelete(options: {
  supplierCollectionPath?: string
} = {}) {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteSupplierProduct(
    supplierId: string,
    supplierProductId: string
  ): Promise<void> {
    const resolvedSupplierId = normalizeString(supplierId)
    const resolvedSupplierProductId = normalizeString(supplierProductId)
    if (!resolvedSupplierId) {
      throw new Error('[fireux-suppliers] supplier id is required.')
    }
    if (!resolvedSupplierProductId) {
      throw new Error('[fireux-suppliers] supplier product id is required.')
    }

    const collectionPath = resolveSupplierProductCollectionPath(
      resolvedSupplierId,
      options.supplierCollectionPath
    )

    await deleteDocument(collectionPath, resolvedSupplierProductId)
  }

  return {
    deleteSupplierProduct,
  }
}
