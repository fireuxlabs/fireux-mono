// ~/composables/firestore/objects/Product/useProductCreate.ts

import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../../FireUXConfig'
import { useCreateProductState } from './useCreateProductState'
import { useCreatePricesState } from './Prices/useCreatePricesState'
import { useMediaStorage } from '../../../firebase/useMediaStorage'
import { useProductUpdate } from './useProductUpdate'
import type { Ref } from 'vue'
import type {
  FirebaseProduct,
  DefaultPrice,
} from '../../../../models/product.model'

export async function useProductCreate() {
  const { tenantId } = useFireUXConfig()
  const currentUser = useCurrentUser()

  const {
    product,
    mainImageData,
    resetCreateProductState,
    getProductPayload,
  }: {
    product: Ref<Partial<FirebaseProduct>>
    mainImageData: Ref<string>
    resetCreateProductState: () => void
    getProductPayload: () => Promise<Partial<FirebaseProduct>>
  } = await useCreateProductState()

  const {
    pricesPayload,
    resetCreatePricesState,
  }: {
    pricesPayload: Ref<
      Array<{
        unit_amount: number
        interval?: 'day' | 'week' | 'month' | 'year'
      }>
    >
    resetCreatePricesState: () => void
  } = useCreatePricesState()

  const {
    uploadImage,
  }: {
    uploadImage: (
      file: string,
      folder: string,
      id: string,
      type: string
    ) => Promise<string>
  } = useMediaStorage()
  const {
    updateProduct,
  }: {
    updateProduct: (id: string, data: Partial<FirebaseProduct>) => Promise<void>
  } = useProductUpdate()

  type StripeCreateResponse =
    | { success: true; id: string; message: string }
    | { success: false; error: string }

  const now = new Date().toISOString()

  async function createProduct(): Promise<{
    success: boolean
    id?: string
    error?: string
  }> {
    while (!currentUser.value) await new Promise((r) => setTimeout(r, 50))

    try {
      // Upload and assign image
      const imageUrl = await uploadImage(
        mainImageData.value,
        'products',
        product.value.id || '',
        'main'
      )

      product.value.main_image = imageUrl

      const productPayload = await getProductPayload()
      const stripePayload = {
        ...productPayload,
        images: [imageUrl],
        prices: pricesPayload.value,
      }

      const response: StripeCreateResponse = await $fetch(
        '/api/stripe/create-product',
        {
          method: 'POST',
          body: { product: stripePayload },
        }
      )

      if (!response.success || !response.id) {
        console.error('❌ Stripe product creation failed:', response)
        return { success: false, error: 'Stripe product creation failed' }
      }

      // Set the Stripe price id as the default_price id
      const default_price: DefaultPrice = {
        id: response.id,
        unit_amount: pricesPayload.value[0]?.unit_amount ?? 0,
        interval: pricesPayload.value[0]?.interval,
      }

      await updateProduct(response.id, {
        main_image: product.value.main_image,
        tenant_id: tenantId as string,
        creator_id: currentUser.value?.uid || '',
        slug: product.value.slug,
        content: product.value.content,
        product_type: product.value.product_type,
        stock: product.value.stock,
        track_stock: product.value.track_stock,
        created_at: now,
        updated_at: now,
        default_price,
      })

      resetCreateProductState()
      resetCreatePricesState()

      return { success: true, id: response.id }
    } catch (error) {
      console.error('❌ Product creation error:', error)
      return { success: false, error: 'Unexpected error occurred.' }
    }
  }

  return {
    createProduct,
  }
}
