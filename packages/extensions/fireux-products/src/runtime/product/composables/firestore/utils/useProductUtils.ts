import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validate-public-slug'
import { ProductStorage } from '../../../utils/product.ts'

export function useProductUtils() {
  const { uploadImage } = useImageStorage()
  const { firestoreGetDoc } = useFirestoreRead()

  async function buildSlugIfUnique(
    title: string,
    collectionName: string,
    _appId?: string
  ): Promise<
    { success: true; slug: string } | { success: false; message: string }
  > {
    const validation = validatePublicSlug(title, {
      label: 'Product slug',
      namespace: ProductStorage.collection,
      reservedScope: 'entity',
    })

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message || 'Product slug is invalid',
      }
    }

    const slug = validation.slug

    const existing = await firestoreGetDoc(collectionName, slug)
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
