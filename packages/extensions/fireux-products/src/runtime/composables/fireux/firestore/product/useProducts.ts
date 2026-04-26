import type {
  FirebaseProduct,
  ProductPrice,
} from '../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useProductCreate } from './useProductCreate.ts'
import { useProductUpdate } from './useProductUpdate.ts'
import { useProductDelete } from './useProductDelete.ts'

export function useProducts() {
  const {
    firestoreFetchCollection,
    firestoreFetchDoc,
    getCollectionPath,
    firestoreFetchSubcollection,
  } = useFirestoreManager()

  const collectionPath = getCollectionPath('products')
  const productsCollection =
    firestoreFetchCollection<FirebaseProduct>(collectionPath)

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  const fetchProductBySlug = (slug: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, slug)

  const fetchProductPrices = async (productId: string): Promise<ProductPrice[]> => {
    if (!productId) return []
    const collectionName = getCollectionPath('products')
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
