import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, unref, type Ref } from 'vue'
import { KitchenMenuStorage as MenuStorage, type KitchenMenu as Menu } from '../../../../../models/kitchen/menu/kitchen-menu.model'
import { resolveKitchenChildCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'

type UseKitchenMenuCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

const sortMenus = (menus: Menu[]) =>
  [...menus].sort(
    (a, b) =>
      Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) ||
      String(a.name).localeCompare(String(b.name))
  )

export function useKitchenMenuCollection(
  kitchenId?: string | Ref<string | null | undefined>,
  options: UseKitchenMenuCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const resolvedKitchenId = computed(() => clean(unref(kitchenId)))
  const collectionPath = computed(() =>
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: clean(unref(options.kitchenCollectionPath)),
      kitchenId: resolvedKitchenId.value,
      collectionName: MenuStorage.scopeCollection,
      appId,
    })
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
