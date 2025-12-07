import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

export function useProductDelete() {
  const { deleteDocument, getCollectionPath } = useFirestoreManager()
  const currentUser = useCurrentUser()
  const collectionPath = getCollectionPath('products')

  async function deleteProduct(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('Product slug is required')
    }

    if (!currentUser.value) {
      throw new Error('User must be authenticated to delete products')
    }

    console.log('🧩 [Stub] deleteProduct', { slug })
    await deleteDocument(collectionPath, slug)
    return true
  }

  return { deleteProduct }
}
