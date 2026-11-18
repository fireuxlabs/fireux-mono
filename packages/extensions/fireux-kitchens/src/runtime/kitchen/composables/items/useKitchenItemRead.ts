import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenAccess } from '../useKitchenAccess'
import { ItemStorage } from '../../records/menus/items/item'
import { readItemIdentity } from '../../utils/item-identity'
import { readItemOffer } from '../../utils/item-pricing'

/** Acquire one live Item in an accessible Kitchen; the caller owns its lifetime. */
export function useKitchenItemRead(
  requestedKitchenId: MaybeRefOrGetter<string>,
  requestedItemId: MaybeRefOrGetter<string>
) {
  const access = useKitchenAccess()
  const kitchenId = computed(() =>
    String(toValue(requestedKitchenId) || '').trim()
  )
  const itemId = computed(() => String(toValue(requestedItemId) || '').trim())
  const storageKitchenId = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(kitchenId.value)
      ? kitchenId.value
      : ''
  )
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const collectionPath = computed(() =>
    storageKitchenId.value && itemId.value
      ? `kitchens/${storageKitchenId.value}/${ItemStorage.collection}`
      : ''
  )
  const source = useFirestoreRead({ databaseId }).firestoreFetchDoc<
    Record<string, unknown>
  >(collectionPath, itemId)
  const outcome = computed(() => {
    if (!kitchenId.value || !itemId.value) return 'idle'
    if (access.outcome.value === 'pending' || access.outcome.value === 'error')
      return access.outcome.value
    if (!storageKitchenId.value) return 'empty'
    return source.outcome.value
  })
  const item = computed(() =>
    outcome.value === 'ready' && source.value
      ? readItemIdentity(itemId.value, source.value)
      : null
  )
  const selling = computed(() => {
    if (outcome.value !== 'ready' || !source.value)
      return { offer: null, error: null }
    try {
      return { offer: readItemOffer(source.value), error: null }
    } catch (error) {
      return { offer: null, error }
    }
  })
  const offer = computed(() => selling.value.offer)
  const offerError = computed(() => selling.value.error)
  const canWrite = computed(
    () => outcome.value === 'ready' && Boolean(item.value)
  )
  const error = computed(() => access.error.value || source.error.value)
  const pending = computed(() => outcome.value === 'pending')
  return {
    kitchenId,
    itemId,
    storageKitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    item,
    offer,
    offerError,
    outcome,
    canWrite,
    readOnly: computed(() => !canWrite.value),
    pending,
    error,
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      itemId: itemId.value,
      outcome: outcome.value,
    })),
  }
}
