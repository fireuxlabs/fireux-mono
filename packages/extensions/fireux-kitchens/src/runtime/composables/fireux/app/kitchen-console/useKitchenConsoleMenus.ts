import { computed } from 'vue'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'
import type { Menu } from '../../../../models/menu.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

export function useKitchenConsoleMenus(options: { includeDishes?: boolean } = {}) {
  const includeDishes = options.includeDishes !== false
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    menus: liveMenus,
    pending: livePending,
    collectionPath,
  } = useKitchenMenuCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const dishState = includeDishes
    ? useKitchenConsoleDishes({ resolveMenuSections: false })
    : {
        dishes: computed(() => []),
        pending: computed(() => false),
        collectionPath: computed(() => ''),
      }
  const page = useKitchenConsoleReadPage<Menu>({
    collectionName: 'menus',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveMenus,
    livePending,
    collectionPath,
  })
  const menus = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    menusCount: menus.value.length,
    pending: pending.value,
    ...(includeDishes
      ? {
          dishesCollectionPath: dishState.collectionPath.value,
          dishesCount: dishState.dishes.value.length,
          dishesPending: dishState.pending.value,
        }
      : {}),
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    menus,
    dishes: dishState.dishes,
    pending,
    debug,
  }
}
