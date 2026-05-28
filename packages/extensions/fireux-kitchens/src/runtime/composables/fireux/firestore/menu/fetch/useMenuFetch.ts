import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed, unref, type Ref } from 'vue'
import { MenuStorage, type Menu } from '../../../../../models/menu.model'
import { resolveKitchenChildCollectionPath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

export function useMenuFetch(
  menuId: string,
  options: {
    shape?: 'root' | 'scoped'
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    kitchenId?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const clean = (value: unknown) => String(value ?? '').trim()
  const kitchenId = clean(unref(options.kitchenId))
  const shape = options.shape || (kitchenId ? 'scoped' : 'root')
  const collectionPath =
    shape === 'scoped'
      ? resolveKitchenChildCollectionPath({
          kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
          kitchenId,
          collectionName: MenuStorage.collection,
          appId,
        })
      : MenuStorage.rootCollection
  const menu = collectionPath && menuId
    ? firestoreFetchDoc<Menu>(collectionPath, menuId)
    : computed<Menu | undefined>(() => undefined)
  const exists = computed(() => Boolean(menu.value))

  return {
    shape,
    collectionPath,
    menu,
    exists,
  }
}

export type MenuFetchRefs = ReturnType<typeof useMenuFetch>
