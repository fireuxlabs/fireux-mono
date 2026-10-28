import {
  ProductPriceStorage,
  ProductStorage,
  type ProductPrice,
} from '../../../../utils/product.ts'
import { normalizeProductPrice } from '../../../../utils/normalize-product.ts'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/fireux/firestore/utils/useFirestoreUtils'

/** Fetch subcollection prices for a given product. */
export function useProductPrices() {
  const { firestoreFetchSubcollection } = useFirestoreUtils()

  const fetchProductPrices = async (
    productId: string
  ): Promise<ProductPrice[]> => {
    if (!productId) return []
    const raw = await firestoreFetchSubcollection<Record<string, unknown>>(
      ProductStorage.collection,
      productId,
      ProductPriceStorage.collection
    )
    return raw
      .map((price) => normalizeProductPrice(productId, price.id, price))
      .filter((price): price is ProductPrice => Boolean(price))
  }

  return { fetchProductPrices }
}
