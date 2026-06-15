import { computed } from 'vue'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useMenuCollection } from '../../../../firestore/menu/fetch/useMenuCollection'
import { useMenuCreate } from '../../../../firestore/menu/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../firestore/menu/mutations/useMenuUpdate'

export function useKitchenConsoleMenus() {
  const kitchenConsole = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    kitchenConsole.runtime.rootCollection.value &&
    kitchenConsole.selection.kitchenId.value
      ? kitchenConsole.selection.kitchenId.value
      : ''
  )
  const { menus, pending: menusPending, collectionPath } =
    useMenuCollection(fetchKitchenId, {
      kitchenCollectionPath: kitchenConsole.runtime.rootCollection,
      databaseId: kitchenConsole.runtime.databaseId,
  })
  const create = useMenuCreate({
    kitchenCollectionPath: kitchenConsole.runtime.rootCollection,
    kitchenId: kitchenConsole.selection.kitchenId,
    databaseId: kitchenConsole.runtime.databaseId,
  })
  const update = useMenuUpdate({
    kitchenCollectionPath: kitchenConsole.runtime.rootCollection,
    databaseId: kitchenConsole.runtime.databaseId,
  })

  return {
    selectedKitchen: kitchenConsole.selection.kitchen,
    kitchenId: kitchenConsole.selection.kitchenId,
    activeKitchenAppId: kitchenConsole.runtime.appId,
    rootCollection: kitchenConsole.runtime.rootCollection,
    databaseId: kitchenConsole.runtime.databaseId,
    readOnly: kitchenConsole.runtime.readOnly,
    canWrite: kitchenConsole.runtime.canWrite,
    collectionPath,
    menus,
    pending: menusPending,
    createMenu: create.createMenu,
    updateMenu: update.updateMenu,
    publishMenu: update.publishMenu,
    archiveMenu: update.archiveMenu,
    debug: computed(() => ({
      kitchenId: kitchenConsole.selection.kitchenId.value,
      activeKitchenAppId: kitchenConsole.runtime.appId.value,
      collectionPath: collectionPath.value,
      menusCount: menus.value.length,
      pending: menusPending.value,
      readOnly: kitchenConsole.runtime.readOnly.value,
      canWrite: kitchenConsole.runtime.canWrite.value,
    })),
  }
}
