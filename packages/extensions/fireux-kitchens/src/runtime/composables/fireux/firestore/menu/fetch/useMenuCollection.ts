import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, unref, type Ref } from 'vue'
import type { Menu } from '../../../../../models/menu.model'
import { resolveKitchenChildCollectionPath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

const GLOBAL_COLLECTION_PATH = 'menus'

export type MenuCollectionScope = 'root' | 'kitchen'

type UseMenuCollectionOptions = {
  scope?: MenuCollectionScope
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

const sortMenus = (menus: Menu[]) =>
  [...menus].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
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
  const collectionPath = computed(() =>
    options.scope === 'kitchen' || resolvedKitchenId.value
      ? resolveKitchenChildCollectionPath({
          kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
          kitchenId: resolvedKitchenId.value,
          collectionName: 'menus',
          appId,
        })
      : GLOBAL_COLLECTION_PATH
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
    collectionPath,
    menus,
    activeMenus,
    publishedMenus,
    count,
    pending,
  }
}
