import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/workspace/composables/useWorkspaceWriteGuard'
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

  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const { selectedId } = useWorkspace('kitchen')
  const captureIntent = useCommandScope([selectedId, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value)])
  async function updateKitchenFulfilment(input: {
    kitchenId: string
    changes: KitchenFulfilmentChanges
  }) {
    requireWritableData()
    const isCurrent = captureIntent()
    const uid = currentUser.value?.uid
    const changes = JSON.parse(JSON.stringify(input.changes))
    const kitchenId = String(input.kitchenId || '').trim()
    if (!kitchenId || kitchenId !== selectedId.value) throw new Error('Kitchen id is required.')
    const user = await useRequireUser()
    if (!isCurrent() || user.uid !== uid) throw new Error('The account or Kitchen changed. Reopen fulfilment.')
    const token = await user.getIdToken()
    if (!isCurrent()) throw new Error('The account or Kitchen changed. Reopen fulfilment.')
    requireWritableData()
    const result = await $fetch<{
      ok: true
      kitchen_id: string
      fulfilment: KitchenFulfilment
    }>('/api/workspace/kitchen/fulfilment', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchen_id: kitchenId, changes },
    })
    if (result.ok !== true || result.kitchen_id !== kitchenId) {
      throw new Error('Kitchen fulfilment update response was invalid.')
    }
    return result.fulfilment
  }

  return { updateKitchenFulfilment, captureIntent }
}
