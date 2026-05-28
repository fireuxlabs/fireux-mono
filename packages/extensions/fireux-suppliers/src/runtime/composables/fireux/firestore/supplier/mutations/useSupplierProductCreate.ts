import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  SupplierProductStorage,
  type SupplierProduct,
  type SupplierProductCreateInput,
} from '../../../../../models/supplier/Supplier.model'
import { resolveSupplierProductCollectionPath } from '../fetch/useSupplierProductCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierProductCreate(options: {
  supplierCollectionPath?: string
} = {}) {
  const { createDocument } = useFirestoreCreate()

  async function createSupplierProduct(
    supplierId: string,
    input: SupplierProductCreateInput
  ): Promise<string> {
    const resolvedSupplierId = normalizeString(supplierId)
    if (!resolvedSupplierId) {
      throw new Error('[fireux-suppliers] supplier id is required.')
    }

    const productId = normalizeString(input.product_id)
    if (!productId) {
      throw new Error('[fireux-suppliers] product_id is required.')
    }

    const collectionPath = resolveSupplierProductCollectionPath(
      resolvedSupplierId,
      options.supplierCollectionPath
    )
    const payload: Partial<SupplierProduct> = {
      ...input,
      supplier_id: resolvedSupplierId,
      product_id: productId,
    }

    return createDocument<Partial<SupplierProduct>>(collectionPath, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createSupplierProduct,
    collectionName: SupplierProductStorage.collection,
  }
}
