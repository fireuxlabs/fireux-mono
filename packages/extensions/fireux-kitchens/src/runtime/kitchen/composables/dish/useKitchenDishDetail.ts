import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenAccess } from '../useKitchenAccess'
import { DishStorage, normalizeDish } from '../../utils/dish'

export function useKitchenDishDetail(
  requestedKitchenId: MaybeRefOrGetter<string>,
  requestedDishId: MaybeRefOrGetter<string>
) {
  const access = useKitchenAccess()
  const kitchenId = computed(() =>
    String(toValue(requestedKitchenId) || '').trim()
  )
  const dishId = computed(() => String(toValue(requestedDishId) || '').trim())
  const storageKitchenId = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(kitchenId.value)
      ? kitchenId.value
      : ''
  )
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const collectionPath = computed(() =>
    storageKitchenId.value && dishId.value
      ? `kitchens/${storageKitchenId.value}/${DishStorage.collection}`
      : ''
  )
  const source = useFirestoreRead({ databaseId }).firestoreFetchDoc<
    Record<string, unknown>
  >(collectionPath, dishId)
  const outcome = computed(() => {
    if (!kitchenId.value || !dishId.value) return 'idle'
    if (access.outcome.value === 'pending' || access.outcome.value === 'error')
      return access.outcome.value
    if (!storageKitchenId.value) return 'missing'
    return source.outcome.value
  })
  const dish = computed(() =>
    outcome.value === 'ready' && source.value
      ? normalizeDish(source.value)
      : null
  )
  const canWrite = computed(
    () => outcome.value === 'ready' && Boolean(dish.value)
  )
  const error = computed(() => access.error.value || source.error.value)
  const pending = computed(() => outcome.value === 'pending')
  return {
    kitchenId,
    dishId,
    storageKitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    dish,
    outcome,
    canWrite,
    readOnly: computed(() => !canWrite.value),
    pending,
    error,
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      dishId: dishId.value,
      outcome: outcome.value,
    })),
  }
}
