import { useCreateProductState } from './useCreateProductState'
import { useProductCreate } from '../../../objects/Product/useProductCreate'

export function useProductCreateSubmit() {
  const { product } = useCreateProductState()
  const { createProduct } = useProductCreate()

  const submit = async () => {
    const name = product.value?.name?.trim()
    if (!name) throw new Error('Product name is required')

    const result = await createProduct()
    if (!result.success) {
      throw new Error(result.error || 'Failed to create product')
    }

    return result.id || null
  }

  return { submit }
}
