import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'

import { normalizeString, resolveKitchenCollectionBasePath, resolveKitchenChildCollectionPath } from '../utils/kitchen-collection-path'

type UseKitchenChildCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenChildCollection<T>(
  collectionName: string | Ref<string | null | undefined>,
  kitchenId: Ref<string> | string,
  options: UseKitchenChildCollectionOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })

  const resolvedKitchenId = computed(() =>
    normalizeString(typeof kitchenId === 'string' ? kitchenId : kitchenId.value)
  )

  const kitchenCollectionPath = computed(() =>
    resolveKitchenCollectionBasePath(
      unref(options.kitchenCollectionPath),
      appId
    )
  )

  const resolvedCollectionName = computed(() =>
    normalizeString(unref(collectionName))
  )

  const collectionPath = computed(() =>
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: kitchenCollectionPath.value,
      kitchenId: resolvedKitchenId.value,
      collectionName: resolvedCollectionName.value,
      appId,
    })
  )
  const collectionItems = firestoreFetchCollection<T>(collectionPath)

  const items = computed<T[]>(() => collectionItems.value ?? [])

  const count = computed(() => items.value.length)
  const pending = collectionItems.pending
  const error = collectionItems.error
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending,
    error,
  })

  return {
    count,
    pending,
    error,
    outcome,
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    items,
  }
}
