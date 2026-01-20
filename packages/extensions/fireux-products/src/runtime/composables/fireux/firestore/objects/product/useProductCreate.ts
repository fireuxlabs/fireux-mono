import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useFirestore } from 'vuefire'
import type { FirebaseProduct } from '../../../../../models/objects/product.model'
import { useCreateProductState } from './state/useCreateProductState'

export const ProductPayload = {
  id: '',
  name: '',
  description: '',
  content: '',
  slug: '',
  active: false,
  main_image: '',
  images: [] as Array<Record<string, any>>,
  features: [] as Array<Record<string, any>>,
  prices: [] as Array<Record<string, any>>,
  default_price: {
    id: '',
    unit_amount: 0,
    interval: '',
  },
  product_type: '',
  track_stock: false,
  stock: 0 as number | null,
  appId: '',
  metadata: {} as Record<string, any>,
}

export const ProductStampOptions = {
  creator: true,
} as const

export function useProductCreate() {
  const db = useFirestore()
  const { setDocument, getCollectionPath } = useFirestoreManager()
  const { getProductPayload } = useCreateProductState()

  async function createProduct(): Promise<{
    success: boolean
    id?: string
    error?: string
  }> {
    try {
      const fireux = useFireUXConfig()
      const payload = getProductPayload()
      const slug = payload.slug || payload.id

      if (!slug) {
        throw new Error('Product slug is required')
      }

      const collectionPath = getCollectionPath('products')
      const ref = doc(db, collectionPath, slug)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        return { success: false, id: slug, error: 'Product already exists' }
      }

      const data = {
        ...payload,
        id: slug,
        appId: payload.appId || fireux.appId,
      } as Omit<FirebaseProduct, 'created_at' | 'updated_at' | 'creator_id'>

      await setDocument<FirebaseProduct>(collectionPath, slug, data as FirebaseProduct, {
        creator: true,
      })

      return { success: true, id: slug }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (import.meta.dev) {
        console.error('[fireux-products] createProduct failed', error)
      }
      return { success: false, error: message }
    }
  }

  return { createProduct }
}
