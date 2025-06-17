import { useFirestoreManager } from '../../useFirestoreManager'
import type { FirebaseProduct, Price } from '../../../../models/product.model'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useProductCreate } from './useProductCreate'
import { useProductUpdate } from './useProductUpdate'
import { useProductDelete } from './useProductDelete'
import { useProductUtils } from './useProductUtils'
import { useCreateProductState } from './useCreateProductState'
import { useCreatePricesState } from './Prices/useCreatePricesState'

export async function useProducts() {
  const {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreQueryOneByField,
    firestoreFetchSubcollection,
  } = useFirestoreManager()

  // Fetch all products (scoped by appId automatically)
  const productsCollection =
    (await firestoreFetchCollection<FirebaseProduct>('products')) || ref([])

  // After fetching products, load their prices and assign directly to product.prices
  if (productsCollection.value) {
    for (const product of productsCollection.value) {
      const prices = await fetchProductPrices(product.slug || '')
      product.prices = prices
    }
  }

  // Fetch by document ID
  async function fetchProduct(
    id: string
  ): Promise<Ref<FirebaseProduct | null | undefined>> {
    return (await firestoreFetchDoc('products', id)) as Ref<
      FirebaseProduct | null | undefined
    >
  }

  // Fetch by slug (scoped by app_id automatically)
  function fetchProductBySlug(slug: string): Promise<FirebaseProduct | null> {
    return firestoreQueryOneByField(
      'products',
      'slug',
      slug
    ) as Promise<FirebaseProduct | null>
  }

  const defaultCurrency = 'EUR'

  async function fetchProductPrices(productId: string): Promise<Price[] | []> {
    if (!productId) return []
    try {
      return (await firestoreFetchSubcollection(
        'products',
        productId,
        'prices'
      )) as Price[]
    } catch (error) {
      console.error('Error fetching prices:', error)
      return []
    }
  }

  // Await all the async composables
  const productCreate = await useProductCreate()
  const productUpdate = useProductUpdate()
  const productDelete = useProductDelete()
  const productUtils = useProductUtils()

  return {
    defaultCurrency,
    productsCollection,
    fetchProduct,
    fetchProductBySlug,
    fetchProductPrices,
    useCreateProductState,
    useCreatePricesState,
    ...productCreate,
    ...productUpdate,
    ...productDelete,
    ...productUtils,
  }
}
