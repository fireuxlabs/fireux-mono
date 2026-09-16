import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspaceIdentity } from '../identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from '../identity/useKitchenWorkspacePlace'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { readKitchenOrdering } from '../../../utils/kitchen-ordering'
import { resolveKitchenOperationHours } from '../../../utils/kitchen-readers'
import type { KitchenOrderingServiceChanges } from '../../../models/ordering.model'
import type { KitchenOrderType } from '../../../models/order-lifecycle.model'

export function useKitchenOrdering() {
  const config = useFireUXConfig()
  const identity = useKitchenWorkspaceIdentity()
  const { currentUser } = useAuth()
  const { place } = useKitchenWorkspacePlace(identity)
  const collection = useKitchenMenuCollection(identity.kitchenId)
  const services = computed(
    () => readKitchenOrdering(identity.selectedKitchen.value?.ordering).services
  )
  const hours = computed(() =>
    resolveKitchenOperationHours(
      identity.selectedKitchen.value as Record<string, unknown>,
      place.value
    )
  )
  async function update(
    type: KitchenOrderType,
    changes: KitchenOrderingServiceChanges
  ) {
    if (!identity.canWrite.value) throw new Error('This Kitchen is read-only.')
    const kitchenId = identity.kitchenId.value
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in to configure ordering.')
    if (identity.kitchenId.value !== kitchenId || !identity.canWrite.value)
      throw new Error('The selected Kitchen changed. Try again.')
    return $fetch('/api/workspace/kitchen/ordering/service', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, type, changes },
    })
  }
  return {
    ...identity,
    activeKitchenAppId: computed(() => config.appId),
    services,
    hours,
    menus: collection.menus,
    menusPending: collection.pending,
    menusOutcome: collection.outcome,
    update,
  }
}
