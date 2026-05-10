import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import {
  useCollection,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { collection, query as fsq, type Query, type QueryDocumentSnapshot } from 'firebase/firestore'
import type { Ref } from 'vue'
import { computed, ref, unref } from 'vue'
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
  const resolveDb = useFirestoreResolver(options.databaseId)

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
  const collectionQuery = computed<Query<T> | null>(() => {
    const path = collectionPath.value
    if (!path) return null
    return fsq(collection(resolveDb(), path)) as Query<T>
  })
  const collectionBinding = import.meta.server
    ? null
    : useCollection<T>(collectionQuery, {
        ssrKey: computed(() => collectionPath.value || `${collectionName}-empty`),
        transform: (docSnap: QueryDocumentSnapshot<T>) => {
          const value = {
            ...(docSnap.data() as T),
            id: docSnap.id,
          } as T & Record<string, unknown>
          return collectionPath.value
            ? attachDevCollectionMeta(value, collectionPath.value, docSnap.id) as T
            : value as T
        },
      } as any)
  const collectionItems = import.meta.server
    ? ref(undefined) as Ref<T[] | undefined>
    : (collectionBinding as any).data as Ref<T[] | undefined>

  const items = computed<T[]>(() => collectionItems.value ?? [])
  const pending = computed(
    () => Boolean(collectionPath.value) && collectionItems.value === undefined
  )

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    items,
    pending,
  }
}
