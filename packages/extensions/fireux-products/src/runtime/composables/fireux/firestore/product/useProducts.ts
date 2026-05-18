import type {
  FirebaseProduct,
  ProductPrice,
} from '../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useProductCreate } from './mutations/useProductCreate'
import { useProductUpdate } from './mutations/useProductUpdate'
import { useProductDelete } from './mutations/useProductDelete'

/**
 * FireUX stack family: Publishable root entity.
 * Entity: Product.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-products/docs/contract.md
 *
 * This file is the Product family entry seam for root reads, writes, and price reads.
 * Create/edit/publish authoring state belongs to the Product family first, not fireux/app by default.
 */
export function useProducts() {
  const {
    firestoreFetchCollection,
    firestoreFetchDoc,
    getCollectionPath,
    firestoreFetchSubcollection,
  } = useFirestoreManager()

  const collectionPath = getCollectionPath('products', false)
  const productsCollection =
    firestoreFetchCollection<FirebaseProduct>(collectionPath)

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  const fetchProductBySlug = (slug: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, slug)

  const fetchProductPrices = async (productId: string): Promise<ProductPrice[]> => {
    if (!productId) return []
    const collectionName = getCollectionPath('products', false)
    return firestoreFetchSubcollection<ProductPrice>(
      collectionName,
      productId,
      'prices'
    )
  }

  const formatPrice = ({
    unit_amount,
    currency,
  }: {
    unit_amount: number
    currency?: string
  }): string => {
    const amount = Number(unit_amount ?? 0)
    const iso = (currency || 'USD').toUpperCase()
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: iso,
    }).format(amount / 100)
  }

  const productCreate = useProductCreate()
  const productUpdate = useProductUpdate()
  const productDelete = useProductDelete()

  return {
    productsCollection,
    fetchProduct,
    fetchProductBySlug,
    fetchProductPrices,
    formatPrice,
    ...productCreate,
    ...productUpdate,
    ...productDelete,
  }
}
