import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, unref, type Ref } from 'vue'
import { MenuStorage, type Menu } from '../../../../../models/menu.model'
import { resolveKitchenChildCollectionPath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

const ROOT_COLLECTION_PATH = MenuStorage.rootCollection

export type MenuCollectionShape = 'root' | 'scoped'

type UseMenuCollectionOptions = {
  shape?: MenuCollectionShape
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

const sortMenus = (menus: Menu[]) =>
  [...menus].sort(
    (a, b) =>
      String(a.name).localeCompare(String(b.name))
  )

export function useMenuCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseMenuCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const resolvedKitchenId = computed(() => clean(unref(kitchenId)))
  const shape = computed<MenuCollectionShape>(() =>
    options.shape || (resolvedKitchenId.value ? 'scoped' : 'root')
  )
  const collectionPath = computed(() =>
    shape.value === 'scoped'
      ? resolveKitchenChildCollectionPath({
          kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
          kitchenId: resolvedKitchenId.value,
          collectionName: MenuStorage.collection,
          appId,
        })
      : ROOT_COLLECTION_PATH
  )
  const menus = firestoreFetchCollection<Menu>(collectionPath)
  const activeMenus = computed(() =>
    sortMenus(menus.value ?? []).filter((menu) => menu.status !== 'archived')
  )
  const publishedMenus = computed(() =>
    activeMenus.value.filter((menu) => menu.status === 'published')
  )
  const count = computed(() => menus.value?.length ?? 0)
  const pending = computed(
    () => Boolean(collectionPath.value) && menus.value === undefined
  )

  return {
    kitchenId: resolvedKitchenId,
    shape,
    collectionPath,
    menus,
    activeMenus,
    publishedMenus,
    count,
    pending,
  }
}
