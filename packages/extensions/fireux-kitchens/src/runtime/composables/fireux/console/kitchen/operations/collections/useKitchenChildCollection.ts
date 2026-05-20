import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import {
  useCollection,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { collection, query as fsq, type Query, type QueryDocumentSnapshot } from 'firebase/firestore'
import type { Ref } from 'vue'
import { computed, ref, unref } from 'vue'

export const normalizeString = (value: unknown): string =>
  String(value ?? '').trim()

type ResolveKitchenChildCollectionBasePathOptions = {
  kitchenCollectionPath?: string | null | undefined
  collectionName?: string
  appId?: string | null | undefined
}

type ResolveKitchenChildCollectionPathOptions = {
  kitchenCollectionPath?: string | null | undefined
  kitchenId?: string | null | undefined
  collectionName?: string | null | undefined
  appId?: string | null | undefined
}

export const ROOT_KITCHEN_COLLECTION_PATH = 'kitchens'

export const resolveKitchenConsoleCollectionPath = (
  appId?: string | null | undefined
): string => {
  const resolvedAppId = normalizeString(appId)
  return resolvedAppId ? `apps/${resolvedAppId}/kitchens` : 'kitchens'
}

export const resolveKitchenCollectionBasePath = (
  kitchenCollectionPath?: string | null | undefined,
  appId?: string | null | undefined
): string => {
  const explicitPath = normalizeString(kitchenCollectionPath)
  if (explicitPath) return explicitPath
  return resolveKitchenConsoleCollectionPath(appId)
}

export const resolveKitchenChildCollectionBasePath = (
  options: ResolveKitchenChildCollectionBasePathOptions = {}
): string => {
  return resolveKitchenCollectionBasePath(
    options.kitchenCollectionPath,
    options.appId
  )
}

export const resolveKitchenChildCollectionPath = (
  options: ResolveKitchenChildCollectionPathOptions = {}
): string => {
  const basePath = resolveKitchenCollectionBasePath(
    options.kitchenCollectionPath,
    options.appId
  )
  const kitchenId = normalizeString(options.kitchenId)
  const collectionName = normalizeString(options.collectionName)

  if (!basePath || !kitchenId || !collectionName) return ''

  return `${basePath}/${kitchenId}/${collectionName}`
}

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
  const resolveDb = useFirestoreResolver(options.databaseId)

  const resolvedKitchenId = computed(() =>
    normalizeString(typeof kitchenId === 'string' ? kitchenId : kitchenId.value)
  )

  const kitchenCollectionPath = computed(() =>
    resolveKitchenCollectionBasePath(unref(options.kitchenCollectionPath), appId)
  )

  const resolvedCollectionName = computed(() => normalizeString(unref(collectionName)))

  const collectionPath = computed(() =>
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: kitchenCollectionPath.value,
      kitchenId: resolvedKitchenId.value,
      collectionName: resolvedCollectionName.value,
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
        ssrKey: computed(() => collectionPath.value || `${resolvedCollectionName.value}-empty`),
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
