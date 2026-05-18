import { useCreateProductState } from './useCreateProductState'
import { useCreatePricesState } from './useCreatePricesState'
import { useProductCreate } from '../../firestore/product/mutations/useProductCreate'
import type { StripePriceInput } from '../../../../models/product.model'

export function useProductCreateSubmit() {
  const { product, getProductPayload } = useCreateProductState()
  const { pricesPayload } = useCreatePricesState()
  const { createProduct } = useProductCreate()

  const submit = async () => {
    const name = product.value?.name?.trim()
    if (!name) throw new Error('Product name is required')

    const result = await createProduct({
      payload: getProductPayload() as any,
      priceInputs: pricesPayload.value as StripePriceInput[],
    })
    if (!result.success) {
      throw new Error(result.error || 'Failed to create product')
    }

    return result.id || null
  }

  return { submit }
}
