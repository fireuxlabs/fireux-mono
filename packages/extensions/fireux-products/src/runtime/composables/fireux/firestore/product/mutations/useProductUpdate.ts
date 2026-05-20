import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type { FirebaseProduct } from '../../../../../models/product.model'

export function useProductUpdate() {
  const base = useDocumentUpdateBase<FirebaseProduct>('products', {
    resolvePath: true,
    appScoped: false,
  })

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<boolean> {
    const productId = String(id || '').trim()
    if (!productId) {
      throw new Error('Product id is required')
    }

    const requestedSlug =
      updates.slug === undefined ? productId : String(updates.slug || '').trim()
    const slugValidation = validatePublicSlug(requestedSlug, {
      label: 'Product slug',
      namespace: 'products',
      reservedScope: 'entity',
    })

    if (!slugValidation.isValid) {
      throw new Error(slugValidation.message || 'Product slug is invalid')
    }

    if (slugValidation.slug !== productId) {
      throw new Error('Product slug must match product id.')
    }

    const nextUpdates =
      updates.slug === undefined ? updates : { ...updates, slug: productId }

    await base.updateById(productId, nextUpdates)
    console.log('🧩 [Stub] updateProduct', { id: productId, updates: nextUpdates })
    return true
  }

  return { updateProduct }
}
