import { computed, type MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
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
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid, identity.kitchenId, identity.canWrite,
    () => config.appId, () => JSON.stringify(appUser.value),
  ])
  async function command(
    action: 'create' | 'update' | 'interaction' | 'configure',
    body: Record<string, unknown>
  ) {
    if (!identity.canWrite.value) throw new Error('This Kitchen is read-only.')
    const kitchenId = identity.kitchenId.value
    const actor = currentUser.value
    const isCurrent = captureIntent()
    const payload = JSON.parse(JSON.stringify(body)) as Record<string, unknown>
    const assertCurrent = () => {
      if (
        !isCurrent() ||
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
    const result = await $fetch<{ ok: true; kitchen_id: string; service: KitchenService }>(
      '/api/workspace/kitchen/services/' + action,
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: { ...payload, kitchenId },
      }
    )
    if (result?.ok !== true || result.kitchen_id !== kitchenId || !result.service?.id || (payload.serviceId && result.service.id !== payload.serviceId)) throw new Error('Service response did not match the requested Kitchen and Service.')
    return result
  }
  return {
    ...identity,
    captureIntent,
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
