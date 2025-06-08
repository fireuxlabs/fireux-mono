import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from '../../useFirestoreManager'

interface DeleteProductResponse {
  success?: boolean
  error?: string
}

export function useProductDelete() {
  const { deleteDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()

  async function deleteProduct(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('No product slug provided.')
    }

    if (!currentUser.value) {
      throw new Error('No authenticated user found.')
    }

    try {
      const response = await $fetch<DeleteProductResponse>(
        '/api/stripe/delete-product',
        {
          method: 'POST',
          body: {
            slug,
            userId: currentUser.value.uid,
          },
        }
      )

      if (response.success) {
        console.log('✅ Product Deleted Successfully')
        await deleteDocument('products', slug)
        return true
      } else {
        console.error(
          '❌ Error Deleting Product:',
          response.error || 'Unknown error'
        )
        throw new Error(response.error || 'Unknown error')
      }
    } catch (error) {
      console.error('❌ Error Deleting Product:', error)
      throw error
    }
  }

  return { deleteProduct }
}
