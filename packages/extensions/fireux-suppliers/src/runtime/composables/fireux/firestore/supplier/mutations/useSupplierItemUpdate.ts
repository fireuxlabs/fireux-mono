import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  type SupplierItem,
  type SupplierItemUpdateInput,
} from '../../../../../models/supplier/Supplier.model'
import { resolveSupplierItemCollectionPath } from '../fetch/useSupplierItemCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierItemUpdate(options: {
  supplierCollectionPath?: string
} = {}) {
  const { updateDocument } = useFirestoreUpdate()

  async function updateSupplierItem(
    supplierId: string,
    supplierItemId: string,
    patch: SupplierItemUpdateInput
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

    await updateDocument<SupplierItem>(
      collectionPath,
      resolvedSupplierItemId,
      patch
    )
  }

  return {
    updateSupplierItem,
  }
}
