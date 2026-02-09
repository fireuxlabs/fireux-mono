import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import type { FirebaseProduct } from '../../../../../models/product.model'

export function useProductUpdate() {
  const base = useDocumentUpdateBase<FirebaseProduct>('products', { resolvePath: true })

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<boolean> {
    await base.updateById(id, updates)
    console.log('🧩 [Stub] updateProduct', { id, updates })
    return true
  }

  return { updateProduct }
}
