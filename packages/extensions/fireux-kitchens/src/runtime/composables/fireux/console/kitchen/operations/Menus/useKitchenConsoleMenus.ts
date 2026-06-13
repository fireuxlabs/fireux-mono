import { computed } from 'vue'
import { MenuStorage, type Menu } from '../../../../../../models/menu.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import { useMenuCollection } from '../../../../firestore/menu/fetch/useMenuCollection'
import { useMenuCreate } from '../../../../firestore/menu/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../firestore/menu/mutations/useMenuUpdate'

export function useKitchenConsoleMenus() {
  const { selection, runtime, actions } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const activeKitchenAppId = runtime.appId
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
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
    selectedKitchen,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    clearSelectedKitchen: actions.clearSelectedKitchen,
    selectKitchen: actions.selectKitchen,
    collectionPath,
    menus: consoleMenus,
    pending,
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      activeKitchenAppId: activeKitchenAppId.value,
      collectionPath: collectionPath.value,
      menusCount: consoleMenus.value.length,
      pending: pending.value,
      readOnly: readOnly.value,
      canWrite: canWrite.value,
    })),
  }
}
