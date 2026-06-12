import { computed } from 'vue'
import { MenuStorage, type Menu } from '../../../../../../models/menu.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import { useMenuCollection } from '../../../../firestore/menu/fetch/useMenuCollection'
import { useMenuCreate } from '../../../../firestore/menu/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../firestore/menu/mutations/useMenuUpdate'

export function useKitchenConsoleMenus() {
  const consoleState = useKitchenConsole()
  const { selectedKitchen, kitchenId, rootCollection, databaseId, canWrite } =
    consoleState
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { menus, pending: menusPending, collectionPath } =
    useMenuCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<Menu>({
    collectionName: MenuStorage.collection,
    selectedKitchen,
    kitchenId,
    items: menus,
    pending: menusPending,
    collectionPath,
  })
  const consoleMenus = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const create = useMenuCreate({
    kitchenCollectionPath: rootCollection,
    kitchenId,
    databaseId,
  })
  const update = useMenuUpdate({
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
    menus: consoleMenus,
    pending,
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      collectionPath: collectionPath.value,
      menusCount: consoleMenus.value.length,
      pending: pending.value,
      canWrite: canWrite.value,
    })),
  }
}
