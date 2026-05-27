import { computed } from 'vue'
import type { Menu } from '../../../../../models/menu.model'
import { useKitchenConsole } from '../useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'
import { useMenuCollection } from '../../../firestore/menu/fetch/useMenuCollection'
import { useMenuCreate } from '../../../firestore/menu/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../firestore/menu/mutations/useMenuUpdate'

export function useKitchenConsoleMenus() {
  const consoleState = useKitchenConsole()
  const { selectedKitchen, selectedMode, kitchenId, rootCollection, databaseId, canWrite } =
    consoleState
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { menus: liveMenus, pending: livePending, collectionPath } =
    useMenuCollection(fetchKitchenId, {
      scope: 'kitchen',
      kitchenCollectionPath: rootCollection,
      databaseId,
    })
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
  const create = useMenuCreate({
    scope: 'kitchen',
    kitchenCollectionPath: rootCollection,
    kitchenId,
    databaseId,
  })
  const update = useMenuUpdate({
    scope: 'kitchen',
    kitchenCollectionPath: rootCollection,
    databaseId,
  })

  return {
    ...page,
    ...create,
    ...update,
    ...consoleState,
    collectionPath,
    canWrite,
    menus,
    pending,
    debug: computed(() => ({
      mode: selectedMode.value,
      kitchenId: kitchenId.value,
      collectionPath: collectionPath.value,
      menusCount: menus.value.length,
      pending: pending.value,
      canWrite: canWrite.value,
    })),
  }
}
