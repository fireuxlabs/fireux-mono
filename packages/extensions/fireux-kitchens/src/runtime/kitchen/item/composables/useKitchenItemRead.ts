import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenAccess } from '../../composables/useKitchenAccess'
import { ItemStorage } from '../storage'
import type { Item } from '../models/model'

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
      ? normalizeItem(itemId.value, source.value)
      : null
  )
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

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

function normalizeStamp(
  value: unknown
): NonNullable<Item['created']> | undefined {
  const source = record(value)
  const at = record(source.at)
  if (
    typeof at.seconds !== 'number' ||
    !Number.isInteger(at.seconds) ||
    typeof at.nanoseconds !== 'number' ||
    !Number.isInteger(at.nanoseconds) ||
    at.nanoseconds < 0 ||
    at.nanoseconds >= 1_000_000_000
  )
    return undefined
  return {
    at: { seconds: at.seconds, nanoseconds: at.nanoseconds },
    ...(text(source.by) ? { by: text(source.by) } : {}),
    ...(text(source.app_id) ? { app_id: text(source.app_id) } : {}),
  }
}

/** Read only Item-owned identity from an existing document; path identity wins. */
function normalizeItem(id: string, value: unknown): Item {
  const source = record(value)
  const description = text(source.description)
  const image = text(source.image)
  const created = normalizeStamp(source.created)
  const updated = normalizeStamp(source.updated)
  return {
    id,
    name: text(source.name),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(created ? { created } : {}),
    ...(updated
      ? {
          updated: {
            at: updated.at,
            ...(updated.by ? { by: updated.by } : {}),
          },
        }
      : {}),
  }
}
