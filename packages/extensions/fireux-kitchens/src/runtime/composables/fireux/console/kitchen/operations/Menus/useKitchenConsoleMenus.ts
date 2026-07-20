// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: gate Menu creation on the selected Kitchen's linked Place currency.
import { computed } from 'vue'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/utils/place-spine'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsolePlace } from '../../identity/useKitchenConsolePlace'
import { useKitchenMenuCollection } from '../../../../firestore/menu/fetch/useKitchenMenuCollection'
import { useMenuCreate } from '../../../../firestore/menu/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../firestore/menu/mutations/useMenuUpdate'
import { useKitchenChildCollection } from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../../../../models/kitchen/menu/menu-source-upload.model'

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
  const { place } = useKitchenConsolePlace()
  const storageKitchenId = kitchenConsole.runtime.storageKitchenId
  const fetchKitchenId = computed(() =>
    kitchenConsole.runtime.rootCollection.value &&
    storageKitchenId.value
      ? storageKitchenId.value
      : ''
  )
  const {
    menus: rawMenus,
    activeMenus,
    pending: menusPending,
    collectionPath,
  } =
    useKitchenMenuCollection(fetchKitchenId, {
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
    storageKitchenId,
    {
      kitchenCollectionPath: kitchenConsole.runtime.rootCollection,
      databaseId: kitchenConsole.runtime.databaseId,
    }
  )
  const menuSources = computed(() =>
    sortMenuSources(sourceUploads.items.value)
  )
  const currencyCode = computed(() =>
    readPlaceCurrencyCode(place.value)
  )
  const canCreateMenu = computed(() =>
    kitchenConsole.runtime.canWrite.value && Boolean(currencyCode.value)
  )
  const menuCreateBlockedMessage = computed(() => {
    if (!kitchenConsole.runtime.canWrite.value) {
      return 'This kitchen is read-only.'
    }

    return currencyCode.value
      ? ''
      : 'Set the linked Place currency before creating menus.'
  })

  async function createMenu(input: Parameters<typeof create.createMenu>[0]) {
    if (!canCreateMenu.value) {
      throw new Error(menuCreateBlockedMessage.value)
    }

    return create.createMenu(input)
  }

  return {
    selectedKitchen: kitchenConsole.selection.kitchen,
    kitchenId: kitchenConsole.selection.kitchenId,
    storageKitchenId,
    activeKitchenAppId: kitchenConsole.runtime.appId,
    rootCollection: kitchenConsole.runtime.rootCollection,
    databaseId: kitchenConsole.runtime.databaseId,
    readOnly: kitchenConsole.runtime.readOnly,
    canWrite: kitchenConsole.runtime.canWrite,
    canCreateMenu,
    currencyCode,
    collectionPath,
    menus: activeMenus,
    rawMenus,
    pending: menusPending,
    menuSources,
    menuSourcesPending: sourceUploads.pending,
    menuSourcesCollectionPath: sourceUploads.collectionPath,
    createMenu,
    menuCreateBlockedMessage,
    updateMenu: update.updateMenu,
    renameMenu: update.renameMenu,
    publishMenu: update.publishMenu,
    archiveMenu: update.archiveMenu,
    debug: computed(() => ({
      kitchenId: kitchenConsole.selection.kitchenId.value,
      activeKitchenAppId: kitchenConsole.runtime.appId.value,
      collectionPath: collectionPath.value,
      menusCount: activeMenus.value.length,
      rawMenusCount: (rawMenus.value ?? []).length,
      menuSourcesCollectionPath: sourceUploads.collectionPath.value,
      menuSourcesCount: menuSources.value.length,
      pending: menusPending.value,
      menuSourcesPending: sourceUploads.pending.value,
      readOnly: kitchenConsole.runtime.readOnly.value,
      canWrite: kitchenConsole.runtime.canWrite.value,
    })),
  }
}
