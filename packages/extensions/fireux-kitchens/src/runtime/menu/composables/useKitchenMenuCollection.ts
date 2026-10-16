import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, unref, type Ref } from 'vue'
import {
  MenuStorage,
  type Menu,
} from '../models/menu-storage.model.ts'
import { resolveKitchenChildCollectionPath } from '../../kitchen/utils/kitchen-collection-path'

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
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId.value,
      collectionName: MenuStorage.scopeCollection,
      appId,
    })
  )
  const source = firestoreFetchCollection<Menu>(collectionPath)
  const menus = computed(() => source.value ?? [])
  const activeMenus = computed(() =>
    sortMenus(menus.value ?? []).filter((menu) => menu.status !== 'archived')
  )
  const publishedMenus = computed(() =>
    activeMenus.value.filter((menu) => menu.status === 'published')
  )
  const count = computed(() => menus.value?.length ?? 0)
  const pending = source.pending

  return {
    kitchenId: resolvedKitchenId,
    collectionPath,
    menus,
    activeMenus,
    publishedMenus,
    count,
    pending,
    outcome: source.outcome,
    error: source.error,
  }
}
