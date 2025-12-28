import { useCreateProductState } from './state/useCreateProductState'

type CreateProductResult = {
  success: boolean
  id?: string
  error?: string
}

export function useProductCreate() {
  const { getProductPayload } = useCreateProductState()

  async function createProduct(): Promise<CreateProductResult> {
    try {
      const payload = getProductPayload()
      console.log('🧩 [Stub] createProduct payload', payload)
      return {
        success: true,
        id: payload.slug ? `${payload.slug}-stub` : 'product-stub-id',
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create product'
      return { success: false, error: message }
    }
  }

  return { createProduct }
}
