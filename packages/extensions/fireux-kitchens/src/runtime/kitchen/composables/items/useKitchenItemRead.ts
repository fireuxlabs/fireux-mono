import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenAccess } from '../useKitchenAccess'
import { ItemStorage } from '../../models/item.model'
import { readItemIdentity } from '../../utils/item-identity'
import { readItemSellingTerms } from '../../utils/item-pricing'

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
  const document = computed(() =>
    outcome.value === 'ready' ? (source.value ?? null) : null
  )
  const selling = computed(() => {
    if (!document.value) return { terms: null, error: null }
    try {
      return { terms: readItemSellingTerms(document.value), error: null }
    } catch (error) {
      return { terms: null, error }
    }
  })
  const item = computed(() =>
    document.value
      ? {
          ...readItemIdentity(itemId.value, document.value),
          ...selling.value.terms,
        }
      : null
  )
  const pricingError = computed(() => selling.value.error)
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
    document,
    item,
    pricingError,
    outcome,
    canWrite,
    readOnly: computed(() => !canWrite.value),
    pending,
    error,
  }
}
