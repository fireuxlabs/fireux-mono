import { useImageStorage } from '../../../core/firebase/useImageStorage'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

export function useProductUtils() {
  const { uploadImage } = useImageStorage()
  const { checkUnique } = useFirestoreManager()

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

    const slugAvailable = await checkUnique(collectionName, 'slug', slug, true)
    if (!slugAvailable) {
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
