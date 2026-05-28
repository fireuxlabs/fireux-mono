import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  type SupplierProduct,
  type SupplierProductUpdateInput,
} from '../../../../../models/supplier/Supplier.model'
import { resolveSupplierProductCollectionPath } from '../fetch/useSupplierProductCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierProductUpdate(options: {
  supplierCollectionPath?: string
} = {}) {
  const { updateDocument } = useFirestoreUpdate()

  async function updateSupplierProduct(
    supplierId: string,
    supplierProductId: string,
    patch: SupplierProductUpdateInput
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

    await updateDocument<SupplierProduct>(
      collectionPath,
      resolvedSupplierProductId,
      patch
    )
  }

  return {
    updateSupplierProduct,
  }
}
