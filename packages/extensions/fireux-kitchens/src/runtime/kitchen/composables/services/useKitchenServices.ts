import { computed, watch, onScopeDispose, type MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspaceIdentity } from '../workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from '../workspace/identity/useKitchenWorkspacePlace'
import { useKitchenMenuCollection } from '../../../menu/composables/useKitchenMenuCollection'
import { readKitchenServices } from '../../utils/kitchen-services'
import type {
  KitchenService,
  KitchenServiceChanges,
  KitchenServiceInteraction,
  KitchenServiceInteractionChanges,
} from '../../models/service.model'
export function useKitchenServices(
  explicitKitchenId?: MaybeRefOrGetter<string>
) {
  const config = useFireUXConfig()
  const identity = useKitchenWorkspaceIdentity(explicitKitchenId)
  const { currentUser } = useAuth()
  const { place, placeOutcome } = useKitchenWorkspacePlace(identity)
  const collection = useKitchenMenuCollection(identity.kitchenId)
  const services = computed(() =>
    readKitchenServices(identity.selectedKitchen.value?.services)
  )
  let epoch = 0
  let active = true
  watch(
    [currentUser, identity.kitchenId, identity.canWrite, () => config.appId],
    () => {
      epoch++
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    active = false
    epoch++
  })
  async function command(
    action: 'create' | 'update' | 'interaction' | 'configure',
    body: Record<string, unknown>
  ) {
    if (!identity.canWrite.value) throw new Error('This Kitchen is read-only.')
    const kitchenId = identity.kitchenId.value
    const actor = currentUser.value
    const started = epoch
    const payload = JSON.parse(JSON.stringify(body)) as Record<string, unknown>
    const assertCurrent = () => {
      if (
        !active ||
        started !== epoch ||
        actor !== currentUser.value ||
        !identity.canWrite.value
      )
        throw new Error('The Kitchen or account changed. Try again.')
    }
    const token = await actor?.getIdToken()
    assertCurrent()
    if (!token) throw new Error('Sign in to configure services.')
    if (identity.kitchenId.value !== kitchenId || !identity.canWrite.value)
      throw new Error('The selected Kitchen changed. Try again.')
    const result = await $fetch<{ ok: true; service: KitchenService }>(
      '/api/workspace/kitchen/services/' + action,
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: { ...payload, kitchenId },
      }
    )
    assertCurrent()
    return result
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
