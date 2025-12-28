import type { FirebaseProduct } from '../../../../../models/objects/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

export function useProductUpdate() {
  const { updateDocument, getCollectionPath } = useFirestoreManager()
  const collectionPath = getCollectionPath('products')

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<boolean> {
    if (!id) {
      throw new Error('Product ID required for update')
    }

    await updateDocument<FirebaseProduct>(collectionPath, id, updates)
    console.log('🧩 [Stub] updateProduct', { id, updates })
    return true
  }

  return { updateProduct }
}
