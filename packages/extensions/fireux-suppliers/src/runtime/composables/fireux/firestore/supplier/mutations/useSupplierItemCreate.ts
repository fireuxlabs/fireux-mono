import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  SupplierItemStorage,
  type SupplierItem,
  type SupplierItemCreateInput,
} from '../../../../../models/supplier/Supplier.model'
import { resolveSupplierItemCollectionPath } from '../fetch/useSupplierItemCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierItemCreate(options: {
  supplierCollectionPath?: string
} = {}) {
  const { createDocument } = useFirestoreCreate()

  async function createSupplierItem(
    supplierId: string,
    input: SupplierItemCreateInput
  ): Promise<string> {
    const resolvedSupplierId = normalizeString(supplierId)
    if (!resolvedSupplierId) {
      throw new Error('[fireux-suppliers] supplier id is required.')
    }

    const productId = normalizeString(input.product_id)
    if (!productId) {
      throw new Error('[fireux-suppliers] product_id is required.')
    }

    const collectionPath = resolveSupplierItemCollectionPath(
      resolvedSupplierId,
      options.supplierCollectionPath
    )
    const payload: Partial<SupplierItem> = {
      ...input,
      supplier_id: resolvedSupplierId,
      product_id: productId,
    }

    return createDocument<Partial<SupplierItem>>(collectionPath, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createSupplierItem,
    collectionName: SupplierItemStorage.collection,
  }
}
