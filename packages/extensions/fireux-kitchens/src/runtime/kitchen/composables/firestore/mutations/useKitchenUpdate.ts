import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
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

  return { updateKitchen }
}
