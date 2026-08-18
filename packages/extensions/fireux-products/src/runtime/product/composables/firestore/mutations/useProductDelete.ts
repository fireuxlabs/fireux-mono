import { useCurrentUser } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { ProductStorage } from '../../../models/product.model.ts'

export function useProductDelete() {
  const { deleteDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()

  async function deleteProduct(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('Product slug is required')
    }

    if (!currentUser.value) {
      throw new Error('User must be authenticated to delete products')
    }

    console.log('🧩 [Stub] deleteProduct', { slug })
    await deleteDocument(ProductStorage.collection, slug)
    return true
  }

  return { deleteProduct }
}
