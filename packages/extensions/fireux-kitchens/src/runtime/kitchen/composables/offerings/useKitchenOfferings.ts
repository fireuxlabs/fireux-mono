import { computed, type MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspaceIdentity } from '../workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from '../workspace/identity/useKitchenWorkspacePlace'
import { useKitchenMenuCollection } from '../../../menu/composables/useKitchenMenuCollection'
import { useKitchenOfferingCollection } from '../useKitchenOfferingCollection'
import type {
  KitchenOffering,
  KitchenOfferingChanges,
  KitchenOfferingInteraction,
  KitchenOfferingInteractionChanges,
} from '../../models/offering.model'
export function useKitchenOfferings(
  explicitKitchenId?: MaybeRefOrGetter<string>
) {
  const config = useFireUXConfig()
  const identity = useKitchenWorkspaceIdentity(explicitKitchenId)
  const { currentUser } = useAuth()
  const { place, placeOutcome } = useKitchenWorkspacePlace(identity)
  const collection = useKitchenMenuCollection(identity.kitchenId)
  const offeringRead = useKitchenOfferingCollection(
    computed(() =>
      identity.outcome.value === 'ready' ? identity.kitchenId.value : ''
    )
  )
  const offerings = offeringRead.offerings
  const outcome = computed(() =>
    identity.outcome.value !== 'ready'
      ? identity.outcome.value
      : offeringRead.outcome.value
  )
  const canWrite = computed(
    () => identity.canWrite.value && ['ready', 'empty'].includes(outcome.value)
  )
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    identity.kitchenId,
    canWrite,
    () => config.appId,
    () => JSON.stringify(appUser.value),
  ])
  async function command(
    action: 'create' | 'update' | 'interaction' | 'configure',
    body: Record<string, unknown>
  ) {
    if (!canWrite.value) throw new Error('This Kitchen is read-only.')
    const kitchenId = identity.kitchenId.value
    const actor = currentUser.value
    const isCurrent = captureIntent()
    const payload = JSON.parse(JSON.stringify(body)) as Record<string, unknown>
    const assertCurrent = () => {
      if (!isCurrent() || actor !== currentUser.value || !canWrite.value)
        throw new Error('The Kitchen or account changed. Try again.')
    }
    const token = await actor?.getIdToken()
    assertCurrent()
    if (!token) throw new Error('Sign in to configure offerings.')
    if (identity.kitchenId.value !== kitchenId || !canWrite.value)
      throw new Error('The selected Kitchen changed. Try again.')
    const result = await $fetch<{
      ok: true
      kitchen_id: string
      offering: KitchenOffering
    }>('/api/workspace/kitchen/offerings/' + action, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: { ...payload, kitchenId },
    })
    if (
      result?.ok !== true ||
      result.kitchen_id !== kitchenId ||
      !result.offering?.id ||
      (payload.offeringId && result.offering.id !== payload.offeringId)
    )
      throw new Error(
        'Offering response did not match the requested Kitchen and Offering.'
      )
    return result
  }
  return {
    ...identity,
    outcome,
    canWrite,
    error: offeringRead.error,
    captureIntent,
    activeKitchenAppId: computed(() => config.appId),
    offerings,
    timezone: computed(() => place.value?.timezone || ''),
    placeOutcome,
    menus: collection.menus,
    menusPending: collection.pending,
    menusOutcome: collection.outcome,
    configure: (configuration: Record<string, unknown>) =>
      command('configure', configuration),
    create: (name: string) => command('create', { name }),
    update: (offeringId: string, changes: KitchenOfferingChanges) =>
      command('update', { offeringId, changes }),
    updateInteraction: (
      offeringId: string,
      type: KitchenOfferingInteraction['type'],
      changes: KitchenOfferingInteractionChanges
    ) => command('interaction', { offeringId, type, changes }),
  }
}
