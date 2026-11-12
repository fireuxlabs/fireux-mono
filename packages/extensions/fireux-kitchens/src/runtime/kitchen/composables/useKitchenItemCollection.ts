import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { ItemStorage, normalizeItem, type Item } from '../utils/item.ts'
import { resolveKitchenChildCollectionBasePath } from '../utils/kitchen-collection-path'

const resolveItemsPath = (kitchenCollectionPath: string, kitchenId: string) =>
  `${kitchenCollectionPath}/${kitchenId}/${ItemStorage.collection}`

type UseKitchenItemCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenItemCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenItemCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

  const resolvedKitchenId = computed(() =>
    String(unref(kitchenId) || '').trim()
  )
  const kitchenCollectionPath = computed(() =>
    resolveKitchenChildCollectionBasePath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      collectionName: ItemStorage.collection,
      appId,
    })
  )
  const collectionPath = computed(() =>
    kitchenCollectionPath.value && resolvedKitchenId.value
      ? resolveItemsPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const collectionRef =
    firestoreFetchCollection<Record<string, unknown>>(collectionPath)
  const dishes = computed<Item[]>(() =>
    (collectionRef.value ?? []).map((entry) => normalizeItem(entry))
  )
  const count = computed(() => dishes.value.length)
  const pending = computed(() => collectionRef.pending.value)
  const error = computed(() => collectionRef.error.value)
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending,
    error,
  })

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    dishes,
    count,
    pending,
    error,
    outcome,
  }
}
