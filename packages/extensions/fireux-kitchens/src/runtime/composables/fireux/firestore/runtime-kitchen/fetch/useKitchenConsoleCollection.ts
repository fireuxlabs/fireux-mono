import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import {
  normalizeString,
  resolveKitchenRuntimeChildCollectionPath,
  resolveKitchenRuntimeCollectionBasePath,
} from '../../../app/kitchen-console/shared'

type UseKitchenConsoleCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenConsoleCollection<T>(
  collectionName: string,
  kitchenId: Ref<string> | string,
  options: UseKitchenConsoleCollectionOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })

  const resolvedKitchenId = computed(() =>
    normalizeString(typeof kitchenId === 'string' ? kitchenId : kitchenId.value)
  )

  const kitchenCollectionPath = computed(() =>
    resolveKitchenRuntimeCollectionBasePath(unref(options.kitchenCollectionPath), appId)
  )

  const collectionPath = computed(() =>
    resolveKitchenRuntimeChildCollectionPath({
      kitchenCollectionPath: kitchenCollectionPath.value,
      kitchenId: resolvedKitchenId.value,
      collectionName,
      appId,
    })
  )
  const databaseIdKey = computed(() => normalizeString(unref(options.databaseId)))

  const collectionRef = shallowRef(null) as ShallowRef<Ref<T[] | undefined> | null>

  watch(
    [collectionPath, databaseIdKey],
    ([nextPath]) => {
      collectionRef.value = nextPath ? firestoreFetchCollection<T>(nextPath) : null
    },
    { immediate: true }
  )

  const items = computed<T[]>(() => collectionRef.value?.value ?? [])
  const pending = computed(
    () => Boolean(collectionPath.value) && collectionRef.value?.value === undefined
  )

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    items,
    pending,
  }
}
