import { ref, type Ref } from 'vue'
import type { FirebaseProduct } from '../../../../models/objects/product.model'
import { useFirestoreManager } from '../../operations/useFirestoreManager'
import { useProductCreate } from './useProductCreate'
import { useProductUpdate } from './useProductUpdate'
import { useProductDelete } from './useProductDelete'

export function useProducts() {
  const {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreQueryOneByField,
    getCollectionPath,
  } = useFirestoreManager()

  const collectionPath = getCollectionPath('products')
  const productsCollection =
    (firestoreFetchCollection<FirebaseProduct>(collectionPath) as Ref<
      FirebaseProduct[] | undefined
    >) ?? ref<FirebaseProduct[] | undefined>([])

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  const fetchProductBySlug = (slug: string) =>
    firestoreQueryOneByField<FirebaseProduct>('products', 'slug', slug, true)

  const productCreate = useProductCreate()
  const productUpdate = useProductUpdate()
  const productDelete = useProductDelete()

  return {
    productsCollection,
    fetchProduct,
    fetchProductBySlug,
    ...productCreate,
    ...productUpdate,
    ...productDelete,
  }
}
