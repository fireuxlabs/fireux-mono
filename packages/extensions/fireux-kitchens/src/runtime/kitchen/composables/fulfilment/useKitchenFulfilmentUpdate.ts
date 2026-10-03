import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import type {
  KitchenFulfilment,
  KitchenFulfilmentPaymentPolicy,
  KitchenDeliveryZone,
} from '../../models/fulfilment.model.ts'

type KitchenFulfilmentChanges =
  | { delivery_zones: KitchenDeliveryZone[] }
  | { payment_methods: KitchenFulfilmentPaymentPolicy[] }

export function useKitchenFulfilmentUpdate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')

  async function updateKitchenFulfilment(input: {
    kitchenId: string
    changes: KitchenFulfilmentChanges
  }) {
    requireWritableData()
    const kitchenId = String(input.kitchenId || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required.')
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{
      ok: true
      kitchen_id: string
      fulfilment: KitchenFulfilment
    }>('/api/workspace/kitchen/fulfilment', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchen_id: kitchenId, changes: input.changes },
    })
    if (result.ok !== true || result.kitchen_id !== kitchenId) {
      throw new Error('Kitchen fulfilment update response was invalid.')
    }
    return result.fulfilment
  }

  return { updateKitchenFulfilment }
}
