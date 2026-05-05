import { collection, getDocs, query, where } from 'firebase/firestore'
import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type { Kitchen, KitchenUpdateInput } from '../../../../../models/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenUpdate() {
  const base = useDocumentUpdateBase<Kitchen>(COLLECTION_PATH, { resolvePath: false })
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const db = useFirestore()

  const resolveSlugUpdate = async (kitchenId: string, value: unknown) => {
    const validation = validatePublicSlug(value, {
      label: 'Kitchen slug',
      namespace: 'kitchens',
      reservedScope: 'root',
      maxLength: 80,
    })

    if (!validation.isValid) {
      throw new Error(validation.message || 'Kitchen slug is invalid.')
    }

    const slug = validation.slug
    const slugQuery = query(
      collection(db, COLLECTION_PATH),
      where('slug', '==', slug)
    )
    const snapshot = await getDocs(slugQuery)
    const conflict = snapshot.docs.find((docSnap) => docSnap.id !== kitchenId)

    if (conflict) {
      throw new Error(`Kitchen slug "${slug}" is already taken.`)
    }

    return slug
  }

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    const nextPatch = { ...patch }
    const hasSlugPatch = Object.prototype.hasOwnProperty.call(patch, 'slug')

    if (hasSlugPatch) {
      nextPatch.slug = await resolveSlugUpdate(kitchenId, patch.slug)
    }

    await base.updateById(kitchenId, nextPatch, { prune: true })
    await upsertSeoIndexDoc('seo_index_kitchens', kitchenId, {
      path: `/kitchens/${kitchenId}`,
      isPublic: true,
    })
  }

  return { updateKitchen }
}
