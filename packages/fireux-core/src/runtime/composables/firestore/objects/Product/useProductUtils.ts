import { useMediaStorage } from '../../../firebase/useMediaStorage'
import { useFirestoreManager } from '../../useFirestoreManager'

// ~/composables/admin/useProductUtils.ts

export function useProductUtils() {
  // Automatically available globally
  const { uploadImage } = useMediaStorage()
  const { checkUnique } = useFirestoreManager()

  /**
   * Build a tenant-prefixed slug and check if it’s unique in the given collection.
   */
  async function buildSlugIfUnique(
    title: string,
    collectionName: string,
    tenantId?: string
  ): Promise<
    { success: true; slug: string } | { success: false; message: string }
  > {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const slug = tenantId ? `${tenantId}-${base}` : base

    const isTaken = await checkUnique(collectionName, 'slug', slug, true)
    if (isTaken) {
      return {
        success: false,
        message: 'This slug already exists. Please pick another title',
      }
    }

    return { success: true, slug }
  }

  /**
   * Upload the main product image (Data-URL or File) for the given product ID.
   */
  async function uploadMainImage(
    data: File | string,
    collection: string,
    id: string
  ): Promise<string> {
    // Call uploadImage(fileOrUrl, collection, id, type)
    const url = await uploadImage(data, collection, id, 'main')
    return url || ''
  }
  function formatPrice(
    cents: number | null | undefined,
    currency: string
  ): string {
    const amount = cents ?? 0
    return (amount / 100).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    })
  }

  /**
   * Placeholder URL to use when a product has no image.
   */
  const placeholderImage = '/img/placeholder-product.png'

  return {
    formatPrice,
    placeholderImage,
    buildSlugIfUnique,
    uploadMainImage,
    checkUnique,
    uploadImage,
  }
}
