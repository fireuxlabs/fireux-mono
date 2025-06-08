import { useFirestoreManager } from '../../useFirestoreManager'
import type { FirebaseProduct } from '../../../../models/product.model'

// ~/composables/admin/useProductUpdate.ts
export function useProductUpdate() {
  const { updateDocument } = useFirestoreManager()

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<void> {
    if (!id) {
      throw new Error('Product ID is required for update.')
    }

    await updateDocument('products', id, updates)
  }

  return { updateProduct }
}
