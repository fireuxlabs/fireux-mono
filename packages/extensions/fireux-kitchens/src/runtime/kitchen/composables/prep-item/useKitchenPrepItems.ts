import { computed, unref, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import {
  normalizeKitchenPrepItem,
  type KitchenPrepItem,
} from '../../utils/prep-item'

export function useKitchenPrepItems(
  kitchenId: Ref<string>,
  options: {
    databaseId: Ref<string>
    kitchenCollectionPath: Ref<string>
  }
) {
  const collectionPath = computed(() => {
    const basePath = String(unref(options.kitchenCollectionPath) || '').trim()
    const id = String(kitchenId.value || '').trim()
    return basePath && id ? `${basePath}/${id}/prep-items` : ''
  })
  const source = useFirestoreRead({
    databaseId: options.databaseId,
  }).firestoreFetchCollection<Record<string, unknown>>(collectionPath)
  const prepItems = computed<KitchenPrepItem[]>(() =>
    (source.value ?? []).map(normalizeKitchenPrepItem)
  )
  const count = computed(() => prepItems.value.length)
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending: source.pending,
    error: source.error,
  })
  return { prepItems, pending: source.pending, error: source.error, outcome }
}
