import { computed } from 'vue'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useMenuCollection } from '../../../../firestore/menu/fetch/useMenuCollection'
import { useMenuCreate } from '../../../../firestore/menu/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../firestore/menu/mutations/useMenuUpdate'
import { useKitchenChildCollection } from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../../../../models/menu/menu-source-upload.model'

const text = (value: unknown) => String(value ?? '').trim()
const timestampSeconds = (value: unknown) => {
  if (!value || typeof value !== 'object') return 0
  const seconds = Number((value as Record<string, unknown>).seconds)
  return Number.isFinite(seconds) ? seconds : 0
}

const sortMenuSources = (sources: MenuSourceUpload[]) =>
  [...sources].sort((a, b) => {
    const left = timestampSeconds(a.created?.at)
    const right = timestampSeconds(b.created?.at)
    if (left || right) return right - left
    return text(a.id).localeCompare(text(b.id))
  })

export function useKitchenConsoleMenus() {
  const kitchenConsole = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    kitchenConsole.runtime.rootCollection.value &&
    kitchenConsole.selection.kitchenId.value
      ? kitchenConsole.selection.kitchenId.value
      : ''
  )
  const {
    menus: rawMenus,
    activeMenus,
    pending: menusPending,
    collectionPath,
  } =
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
  const sourceUploads = useKitchenChildCollection<MenuSourceUpload>(
    MenuSourceUploadStorage.collection,
    kitchenConsole.selection.kitchenId,
    {
      kitchenCollectionPath: kitchenConsole.runtime.rootCollection,
      databaseId: kitchenConsole.runtime.databaseId,
    }
  )
  const menuSources = computed(() =>
    sortMenuSources(sourceUploads.items.value)
  )

  return {
    selectedKitchen: kitchenConsole.selection.kitchen,
    kitchenId: kitchenConsole.selection.kitchenId,
    activeKitchenAppId: kitchenConsole.runtime.appId,
    rootCollection: kitchenConsole.runtime.rootCollection,
    databaseId: kitchenConsole.runtime.databaseId,
    readOnly: kitchenConsole.runtime.readOnly,
    canWrite: kitchenConsole.runtime.canWrite,
    collectionPath,
    menus: activeMenus,
    rawMenus,
    pending: menusPending,
    menuSources,
    menuSourcesPending: sourceUploads.pending,
    menuSourcesCollectionPath: sourceUploads.collectionPath,
    createMenu: create.createMenu,
    updateMenu: update.updateMenu,
    publishMenu: update.publishMenu,
    archiveMenu: update.archiveMenu,
    debug: computed(() => ({
      kitchenId: kitchenConsole.selection.kitchenId.value,
      activeKitchenAppId: kitchenConsole.runtime.appId.value,
      collectionPath: collectionPath.value,
      menusCount: activeMenus.value.length,
      rawMenusCount: rawMenus.value.length,
      menuSourcesCollectionPath: sourceUploads.collectionPath.value,
      menuSourcesCount: menuSources.value.length,
      pending: menusPending.value,
      menuSourcesPending: sourceUploads.pending.value,
      readOnly: kitchenConsole.runtime.readOnly.value,
      canWrite: kitchenConsole.runtime.canWrite.value,
    })),
  }
}
