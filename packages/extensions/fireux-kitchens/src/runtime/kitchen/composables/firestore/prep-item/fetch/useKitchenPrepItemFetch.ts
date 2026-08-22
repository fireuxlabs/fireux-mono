import { doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  useDocument,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, unref, type Ref } from 'vue'
import {
  KitchenPrepItemStorage,
  normalizeKitchenPrepItem,
  type KitchenPrepItem,
} from '../../../../utils/prep-item.ts'
import { useKitchenWorkspaceSelection } from '../../../workspace/core/useKitchenWorkspaceSelection'
import { resolveKitchenScopeCollectionPath } from '../../utils/paths/useKitchenChildCollection'

type UseKitchenPrepItemFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  kitchenId?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenPrepItemFetch(
  prepItemId?: string | Ref<string | null | undefined>,
  options: UseKitchenPrepItemFetchOptions = {}
) {
  const db = useFirestore(options.databaseId)
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()
  const resolvedPrepItemId = computed(() =>
    String(unref(prepItemId) || '').trim()
  )
  const resolvedKitchenId = computed(() =>
    String(unref(options.kitchenId) || selectedId.value || '').trim()
  )
  const kitchenCollectionPath = computed(
    () =>
      String(unref(options.kitchenCollectionPath) || '').trim() ||
      resolveKitchenScopeCollectionPath(appId)
  )
  const collectionPath = computed(() =>
    resolvedKitchenId.value
      ? `${kitchenCollectionPath.value}/${resolvedKitchenId.value}/${KitchenPrepItemStorage.collection}`
      : ''
  )
  const prepItemRef = computed(() => {
    if (!collectionPath.value || !resolvedPrepItemId.value) return null
    return doc(db, collectionPath.value, resolvedPrepItemId.value)
  })
  const { data, pending, error } = useDocument(prepItemRef, {
    ssrKey: computed(() =>
      prepItemRef.value
        ? `${collectionPath.value}-${resolvedPrepItemId.value}`
        : undefined
    ),
    transform: (docSnap: any) =>
      docSnap?.exists?.()
        ? normalizeKitchenPrepItem({
            id: docSnap.id,
            ...(docSnap.data() ?? {}),
          })
        : undefined,
  } as any)

  return {
    kitchenId: resolvedKitchenId,
    collectionPath,
    prepItem: data as Ref<KitchenPrepItem | undefined>,
    pending,
    error,
  }
}
