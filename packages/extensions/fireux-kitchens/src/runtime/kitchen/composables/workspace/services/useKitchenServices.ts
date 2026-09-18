import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspaceIdentity } from '../identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from '../identity/useKitchenWorkspacePlace'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { readKitchenServices } from '../../../utils/kitchen-services'
import type {
  KitchenService,
  KitchenServiceChanges,
  KitchenServiceInteraction,
  KitchenServiceInteractionChanges,
} from '../../../models/service.model'
export function useKitchenServices() {
  const config = useFireUXConfig()
  const identity = useKitchenWorkspaceIdentity()
  const { currentUser } = useAuth()
  const { place, placeOutcome } = useKitchenWorkspacePlace(identity)
  const collection = useKitchenMenuCollection(identity.kitchenId)
  const services = computed(() =>
    readKitchenServices(identity.selectedKitchen.value?.services)
  )
  async function command(
    action: 'create' | 'update' | 'interaction' | 'configure',
    body: Record<string, unknown>
  ) {
    if (!identity.canWrite.value) throw new Error('This Kitchen is read-only.')
    const kitchenId = identity.kitchenId.value
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in to configure services.')
    if (identity.kitchenId.value !== kitchenId || !identity.canWrite.value)
      throw new Error('The selected Kitchen changed. Try again.')
    return $fetch<{ ok: true; service: KitchenService }>(
      '/api/workspace/kitchen/services/' + action,
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: { ...body, kitchenId },
      }
    )
  }
  return {
    ...identity,
    activeKitchenAppId: computed(() => config.appId),
    services,
    timezone: computed(() => place.value?.timezone || ''),
    placeOutcome,
    menus: collection.menus,
    menusPending: collection.pending,
    menusOutcome: collection.outcome,
    configure: (configuration: Record<string, unknown>) =>
      command('configure', configuration),
    create: (name: string) => command('create', { name }),
    update: (serviceId: string, changes: KitchenServiceChanges) =>
      command('update', { serviceId, changes }),
    updateInteraction: (
      serviceId: string,
      type: KitchenServiceInteraction['type'],
      changes: KitchenServiceInteractionChanges
    ) => command('interaction', { serviceId, type, changes }),
  }
}
