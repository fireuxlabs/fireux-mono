import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import type { FirebaseProduct } from '../../../../models/product.model'

export function useProductUpdate() {
  const base = useDocumentUpdateBase<FirebaseProduct>('products', {
    resolvePath: true,
    appScoped: false,
  })
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<boolean> {
    await base.updateById(id, updates)
    const nextPathSegment = String(updates?.slug || id || '').trim()
    if (nextPathSegment) {
      await upsertSeoIndexDoc('seo_index_products', id, {
        path: `/products/${nextPathSegment}`,
        isPublic:
          typeof updates?.active === 'boolean' ? updates.active : undefined,
      })
    }
    console.log('🧩 [Stub] updateProduct', { id, updates })
    return true
  }

  return { updateProduct }
}
