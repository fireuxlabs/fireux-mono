import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'

export function useProductUtils() {
  const { uploadImage } = useImageStorage()
  const { firestoreFetchDoc } = useFirestoreManager()

  async function buildSlugIfUnique(
    title: string,
    collectionName: string,
    _tenantId?: string
  ): Promise<
    { success: true; slug: string } | { success: false; message: string }
  > {
    const validation = validatePublicSlug(title, {
      label: 'Product slug',
      namespace: 'products',
      reservedScope: 'entity',
    })

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message || 'Product slug is invalid',
      }
    }

    const slug = validation.slug

    const existing = await firestoreFetchDoc(collectionName, slug)
    if (existing) {
      return { success: false, message: 'Slug taken' }
    }

    return { success: true, slug }
  }

  async function uploadMainImage(
    data: File | string,
    collectionName: string,
    id: string
  ): Promise<string> {
    const path = `${collectionName}/${id}/main.jpg`
    const url = await uploadImage(path, data)
    return url || ''
  }

  return {
    buildSlugIfUnique,
    uploadMainImage,
  }
}
