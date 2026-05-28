import {
  ProductPriceStorage,
  ProductStorage,
  type ProductPrice,
} from '../../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetch subcollection prices for a given product. */
export function useProductPrices() {
  const { firestoreFetchSubcollection } = useFirestoreManager()

  const fetchProductPrices = async (productId: string): Promise<ProductPrice[]> => {
    if (!productId) return []
    return firestoreFetchSubcollection<ProductPrice>(
      ProductStorage.collection,
      productId,
      ProductPriceStorage.collection
    )
  }

  return { fetchProductPrices }
}
