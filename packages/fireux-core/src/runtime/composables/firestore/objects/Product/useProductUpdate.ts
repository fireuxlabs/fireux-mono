import { useFirestoreManager } from '../../useFirestoreManager'
import { serverTimestamp } from 'firebase/firestore'
import type { FirebaseProduct } from '../../../../models/objects/product.model'

// ~/composables/admin/useProductUpdate.ts
export function useProductUpdate() {
  const { updateDocument } = useFirestoreManager()

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('Product ID is required for update.')
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update payload. Must be an object.')
      }

      // Add server timestamp for updated_at
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      }

      await updateDocument('products', id, updateData)
      console.log(`✅ Product updated successfully: ${id}`)
      return true
    } catch (error) {
      console.error('❌ Error updating product:', error)
      throw error
    }
  }

  return { updateProduct }
}
