import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { useKitchenAccess } from '../useKitchenAccess'
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
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const access = useKitchenAccess()
  const disposed = ref(false)
  const ownerSources = [
    currentUser,
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    appPending,
    appError,
    appOutcome,
    () => JSON.stringify(access.ids.value),
    access.pending,
    access.error,
    access.outcome,
    () => toValue(explicitKitchenId),
    identity.kitchenId,
    identity.outcome,
    identity.canWrite,
    () => identity.selectedKitchen.value?.id,
  ]
  const ownerEpoch = ref(0)
  watch(
    ownerSources,
    () => {
      ownerEpoch.value++
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed.value = true
    ownerEpoch.value++
  })
  const ownerScope = computed(() => ownerEpoch.value)
  const captureIntent = useCommandScope(ownerSources)
  const ownerOutcome = computed(() => {
    if (disposed.value || !currentUser.value) return 'idle'
    if (appError.value || appOutcome.value === 'error') return 'error'
    if (appPending.value || ['idle', 'pending'].includes(appOutcome.value))
      return 'pending'
    if (
      !config.appId ||
      !appUser.value ||
      appUser.value.id !== currentUser.value.uid ||
      appOutcome.value !== 'ready'
    )
      return 'idle'
    if (access.error.value || access.outcome.value === 'error') return 'error'
    if (
      access.pending.value ||
      ['idle', 'pending'].includes(access.outcome.value)
    )
      return 'pending'
    if (identity.outcome.value !== 'ready') return identity.outcome.value
    const id = identity.kitchenId.value
    if (
      !isFirestoreDocumentId(id) ||
      access.outcome.value !== 'ready' ||
      !access.ids.value.includes(id)
    )
      return 'idle'
    return identity.selectedKitchen.value?.id === id ? 'ready' : 'pending'
  })
  const storageKitchenId = computed(() =>
    ownerOutcome.value === 'ready' ? identity.kitchenId.value : ''
  )
  const { place, placeOutcome } = useKitchenWorkspacePlace(identity)
  const collection = useKitchenMenuCollection(storageKitchenId)
  const offeringRead = useKitchenOfferingCollection(storageKitchenId)
  const outcome = computed(() =>
    ownerOutcome.value === 'ready'
      ? offeringRead.outcome.value
      : ownerOutcome.value
  )
  const canWrite = computed(
    () =>
      Boolean(storageKitchenId.value) &&
      identity.canWrite.value &&
      ['ready', 'empty'].includes(outcome.value)
  )
  const menusOutcome = computed(() =>
    ownerOutcome.value === 'ready'
      ? collection.outcome.value
      : ownerOutcome.value
  )
  const captureCommand = useCommandScope([
    ...ownerSources,
    offeringRead.outcome,
  ])

  async function command(
    action: 'create' | 'update' | 'interaction' | 'configure',
    body: Record<string, unknown>,
    isSurfaceCurrent: () => boolean = () => true
  ) {
    if (!canWrite.value || !isSurfaceCurrent())
      throw new Error('This Kitchen is read-only.')
    const kitchenId = storageKitchenId.value
    const actor = currentUser.value
    const ownerCurrent = captureCommand()
    const payload = JSON.parse(JSON.stringify(body)) as Record<string, unknown>
    const assertCurrent = () => {
      if (
        !ownerCurrent() ||
        !isSurfaceCurrent() ||
        actor !== currentUser.value ||
        storageKitchenId.value !== kitchenId ||
        !canWrite.value
      )
        throw new Error('The Kitchen or account changed. Try again.')
    }
    const token = await actor?.getIdToken()
    assertCurrent()
    if (!token) throw new Error('Sign in to configure services.')
    const result = await $fetch<{
      ok: true
      kitchen_id: string
      offering: KitchenOffering
    }>('/api/workspace/kitchen/services/' + action, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: { ...payload, kitchenId },
      retry: 0,
    })
    const id = result?.offering?.id
    if (
      result?.ok !== true ||
      result.kitchen_id !== kitchenId ||
      typeof id !== 'string' ||
      id !== id.trim() ||
      !isFirestoreDocumentId(id) ||
      (payload.offeringId !== undefined && id !== payload.offeringId)
    )
      throw new Error(
        'The service response did not match the selected Kitchen and service.'
      )
    return result
  }

  return {
    ...identity,
    ownerScope,
    storageKitchenId,
    outcome,
    canWrite,
    error: computed(
      () =>
        appError.value ||
        access.error.value ||
        (ownerOutcome.value === 'error'
          ? new Error('Kitchen could not be loaded.')
          : storageKitchenId.value
            ? offeringRead.error.value
            : null)
    ),
    captureIntent,
    activeKitchenAppId: computed(() => config.appId),
    offerings: computed(() =>
      ['ready', 'empty'].includes(outcome.value)
        ? offeringRead.offerings.value
        : []
    ),
    timezone: computed(() =>
      storageKitchenId.value ? place.value?.timezone || '' : ''
    ),
    placeOutcome,
    venueHours: computed(() =>
      storageKitchenId.value && place.value
        ? {
            ...place.value.business_hours,
            timezone: place.value.timezone,
            source: 'custom' as const,
          }
        : null
    ),
    menus: computed(() =>
      ['ready', 'empty'].includes(menusOutcome.value)
        ? collection.menus.value
        : []
    ),
    menusPending: computed(() => menusOutcome.value === 'pending'),
    menusOutcome,
    configure: (
      configuration: Record<string, unknown>,
      isSurfaceCurrent?: () => boolean
    ) => command('configure', configuration, isSurfaceCurrent),
    create: (name: string, isSurfaceCurrent?: () => boolean) =>
      command('create', { name }, isSurfaceCurrent),
    update: (
      offeringId: string,
      changes: KitchenOfferingChanges,
      isSurfaceCurrent?: () => boolean
    ) => command('update', { offeringId, changes }, isSurfaceCurrent),
    updateInteraction: (
      offeringId: string,
      type: KitchenOfferingInteraction['type'],
      changes: KitchenOfferingInteractionChanges,
      isSurfaceCurrent?: () => boolean
    ) =>
      command('interaction', { offeringId, type, changes }, isSurfaceCurrent),
  }
}
