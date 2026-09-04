import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type { KitchenUpdateInput } from '../../../models/kitchen-input.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()

/** Kitchen roots are server-owned; every edit crosses the fixed trusted seam. */
export function useKitchenUpdate() {
  async function updateKitchen(input: {
    kitchenId: string
    changes: KitchenUpdateInput
  }) {
    const id = clean(input.kitchenId)
    if (!id) throw new Error('Kitchen id is required.')
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{ ok: true; kitchen_id: string }>(
      '/api/workspace/kitchen/update',
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchen_id: id, patch: input.changes },
      }
    )
    if (result.ok !== true || result.kitchen_id !== id) {
      throw new Error('Kitchen update response was invalid.')
    }
  }

  async function publishKitchen(input: { kitchenId: string; slug: string }) {
    const slug = validatePublicSlug(input.slug, {
      label: 'Kitchen slug',
      reservedScope: 'root',
    })
    if (!slug.isValid) {
      throw new Error(slug.message || 'Kitchen slug is not valid.')
    }

    await updateKitchen({
      kitchenId: input.kitchenId,
      changes: { slug: slug.slug, visibility: true },
    })
  }

  async function unpublishKitchen(kitchenId: string) {
    await updateKitchen({ kitchenId, changes: { visibility: false } })
  }

  return { updateKitchen, publishKitchen, unpublishKitchen }
}
