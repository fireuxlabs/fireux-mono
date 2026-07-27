import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { KitchenStorage } from '../../../../../../models/kitchen.model'

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

export const ROOT_KITCHEN_COLLECTION_PATH = KitchenStorage.rootCollection

export const resolveKitchenScopeCollectionPath = (
  appId?: string | null | undefined
): string => {
  const resolvedAppId = normalizeString(appId)
  return resolvedAppId
    ? `${AppStorage.collection}/${resolvedAppId}/${KitchenStorage.scopeCollection}`
    : KitchenStorage.rootCollection
}

export const resolveKitchenCollectionBasePath = (
  kitchenCollectionPath?: string | null | undefined,
  appId?: string | null | undefined
): string => {
  const explicitPath = normalizeString(kitchenCollectionPath)
  if (kitchenCollectionPath !== undefined) return explicitPath
  return resolveKitchenScopeCollectionPath(appId)
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
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })

  const resolvedKitchenId = computed(() =>
    normalizeString(typeof kitchenId === 'string' ? kitchenId : kitchenId.value)
  )

  const kitchenCollectionPath = computed(() =>
    resolveKitchenCollectionBasePath(unref(options.kitchenCollectionPath), appId)
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
