import type { Price } from '#fireux-products/models/objects/product.model.ts'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetch subcollection prices for a given product. */
export function useProductPrices() {
  const { firestoreFetchSubcollection, getCollectionPath } =
    useFirestoreManager()

  const fetchProductPrices = async (productId: string): Promise<Price[]> => {
    if (!productId) return []
    const collectionName = getCollectionPath('products')
    return firestoreFetchSubcollection<Price>(
      collectionName,
      productId,
      'prices'
    )
  }

  return { fetchProductPrices }
}
