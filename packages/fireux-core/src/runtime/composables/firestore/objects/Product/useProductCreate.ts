// ~/composables/firestore/objects/Product/useProductCreate.ts

import { useCreateProductState } from './useCreateProductState'

export async function useProductCreate() {
  const { getProductPayload } = await useCreateProductState()

  async function createProduct() {
    try {
      const productPayload = await getProductPayload()

      // Extract image data for separate transmission
      const imageData = productPayload.main_image

      // Create clean product data without image for server processing
      const productData = {
        ...productPayload,
        main_image: '', // Will be set by server after upload
      }

      console.log('📦 [createProduct] Sending payload:', {
        product: productData,
        imageDataLength: imageData?.length || 0,
      })

      const response = await $fetch<{
        success: boolean
        id?: string
        error?: string
      }>('/api/stripe/create-product', {
        method: 'POST',
        body: {
          product: productData,
          imageData: imageData,
        },
      })

      if (!response.success) {
        throw new Error(response.error || 'Server-side product creation failed')
      }

      return { success: true, id: response.id }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unexpected error occurred.',
      }
    }
  }

  return { createProduct }
}
