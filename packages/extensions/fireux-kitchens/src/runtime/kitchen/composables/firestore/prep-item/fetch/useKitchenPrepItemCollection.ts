import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, unref, type Ref } from 'vue'
import {
  KitchenPrepItemStorage,
  normalizeKitchenPrepItem,
  type KitchenPrepItem,
} from '../../../../utils/prep-item.ts'
import { resolveKitchenChildCollectionBasePath } from '../../utils/paths/useKitchenChildCollection'

type UseKitchenPrepItemCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenPrepItemCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenPrepItemCollectionOptions = {}
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
      collectionName: KitchenPrepItemStorage.collection,
      appId,
    })
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? `${kitchenCollectionPath.value}/${resolvedKitchenId.value}/${KitchenPrepItemStorage.collection}`
      : ''
  )
  const collectionRef =
    firestoreFetchCollection<Record<string, unknown>>(collectionPath)
  const prepItems = computed<KitchenPrepItem[]>(() =>
    (collectionRef.value ?? []).map(normalizeKitchenPrepItem)
  )
  const count = computed(() => prepItems.value.length)
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
    prepItems,
    count,
    pending,
    error,
    outcome,
  }
}
