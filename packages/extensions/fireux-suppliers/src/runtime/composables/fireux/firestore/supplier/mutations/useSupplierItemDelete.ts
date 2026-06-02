import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { resolveSupplierItemCollectionPath } from '../fetch/useSupplierItemCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierItemDelete(options: {
  supplierCollectionPath?: string
} = {}) {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteSupplierItem(
    supplierId: string,
    supplierItemId: string
  ): Promise<void> {
    const resolvedSupplierId = normalizeString(supplierId)
    const resolvedSupplierItemId = normalizeString(supplierItemId)
    if (!resolvedSupplierId) {
      throw new Error('[fireux-suppliers] supplier id is required.')
    }
    if (!resolvedSupplierItemId) {
      throw new Error('[fireux-suppliers] supplier item id is required.')
    }

    const collectionPath = resolveSupplierItemCollectionPath(
      resolvedSupplierId,
      options.supplierCollectionPath
    )

    await deleteDocument(collectionPath, resolvedSupplierItemId)
  }

  return {
    deleteSupplierItem,
  }
}
