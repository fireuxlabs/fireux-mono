// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: gate Menu creation on the selected Kitchen's linked Place currency.
import { computed, ref, watchEffect } from 'vue'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceIdentity } from '../identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from '../identity/useKitchenWorkspacePlace'
import { useKitchenMenuCollection } from '../../../../menu/composables/firestore/fetch/useKitchenMenuCollection'
import { useMenuCreate } from '../../../../menu/composables/firestore/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../menu/composables/firestore/mutations/useMenuUpdate'
import { useKitchenChildCollection } from '../../firestore/utils/paths/useKitchenChildCollection'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../../menu/utils/menu-source-upload.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

const text = (value: unknown) => String(value ?? '').trim()
type MenuPreviewDish = {
  name: string
  imageUrl: string
}

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

export function useKitchenWorkspaceMenus() {
  const kitchenWorkspace = useKitchenWorkspace()
  const kitchenIndex = useKitchenWorkspaceIndex()
  const identity = useKitchenWorkspaceIdentity()
  const { place } = useKitchenWorkspacePlace(identity)
  const fireux = useFireUXConfig()
  const storageKitchenId = kitchenWorkspace.id
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const fetchKitchenId = storageKitchenId
  const {
    menus: fetchedMenus,
    activeMenus: fetchedActiveMenus,
    pending: menusPending,
    outcome: menusOutcome,
    error: menusError,
    collectionPath: fetchedCollectionPath,
  } = useKitchenMenuCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const create = useMenuCreate({
    kitchenCollectionPath: rootCollection,
    kitchenId: kitchenWorkspace.id,
    databaseId,
  })
  const update = useMenuUpdate({
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const sourceUploads = useKitchenChildCollection<MenuSourceUpload>(
    MenuSourceUploadStorage.collection,
    storageKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const rawMenus = fetchedMenus
  const activeMenus = fetchedActiveMenus
  const selectedMenuId = ref('')
  const selectedMenu = computed(
    () =>
      activeMenus.value.find((menu) => text(menu.id) === selectedMenuId.value) ??
      null
  )
  watchEffect(() => {
    if (selectedMenu.value) return
    selectedMenuId.value = text(activeMenus.value[0]?.id)
  })
  const pending = menusPending
  const collectionPath = fetchedCollectionPath
  const menuSources = computed(() => sortMenuSources(sourceUploads.items.value))
  const menuPreviewDishes = computed<Record<string, MenuPreviewDish>>(
    () => ({})
  )
  const currencyCode = computed(() => readPlaceCurrencyCode(place.value))
  const canCreateMenu = computed(() => Boolean(currencyCode.value))
  const menuCreateBlockedMessage = computed(() => {
    return currencyCode.value
      ? ''
      : 'Set the linked Place currency before creating menus.'
  })
  const menuConfig = computed(() => {
    const kitchen = kitchenWorkspace.data.value
    const menus = kitchen?.menus
    return {
      context: text(menus?.context),
      primaryMenuId: text(menus?.primary_menu_id),
      specialsEnabled: menus?.specials_enabled === true,
      specialsMenuId: text(menus?.specials_menu_id),
    }
  })

  async function updateMenuConfig(input: {
    primaryMenuId: string
    specialsEnabled: boolean
    specialsMenuId: string
  }) {
    assertCanWrite()
    const kitchenId = text(kitchenWorkspace.id.value)
    const user = await useRequireUser()
    const token = await user.getIdToken()
    await $fetch('/api/workspace/kitchen/menus/config', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        kitchen_id: kitchenId,
        primary_menu_id: text(input.primaryMenuId),
        specials_enabled: input.specialsEnabled,
        specials_menu_id: text(input.specialsMenuId),
      },
    })
  }

  async function createSpecialsMenu() {
    const result = await createMenu({
      id: 'specials',
      name: 'Daily Specials',
      description: 'Today’s specials.',
    })
    await updateMenuConfig({
      primaryMenuId: menuConfig.value.primaryMenuId,
      specialsEnabled: true,
      specialsMenuId: result.id,
    })
    return result
  }

  async function createMenu(input: Parameters<typeof create.createMenu>[0]) {
    if (!canCreateMenu.value) {
      throw new Error(menuCreateBlockedMessage.value)
    }

    return create.createMenu(input)
  }

  function assertCanWrite() {
    if (!kitchenWorkspace.id.value) throw new Error('Select a kitchen.')
  }

  async function updateMenu(...args: Parameters<typeof update.updateMenu>) {
    assertCanWrite()
    return update.updateMenu(...args)
  }

  async function renameMenu(...args: Parameters<typeof update.renameMenu>) {
    assertCanWrite()
    return update.renameMenu(...args)
  }

  async function publishMenu(...args: Parameters<typeof update.publishMenu>) {
    assertCanWrite()
    return update.publishMenu(...args)
  }

  async function archiveMenu(...args: Parameters<typeof update.archiveMenu>) {
    assertCanWrite()
    return update.archiveMenu(...args)
  }

  return {
    availableKitchens: kitchenIndex.collection,
    kitchensPending: computed(() => kitchenIndex.outcome.value === 'pending'),
    selectedKitchen: kitchenWorkspace.data,
    kitchenId: kitchenWorkspace.id,
    storageKitchenId,
    activeKitchenAppId: computed(() => fireux.appId),
    rootCollection,
    databaseId,
    canCreateMenu,
    currencyCode,
    collectionPath,
    menus: activeMenus,
    selectedMenu,
    selectedMenuId,
    rawMenus,
    pending,
    outcome: menusOutcome,
    error: menusError,
    menuSources,
    menuSourcesPending: sourceUploads.pending,
    menuPreviewDishes,
    menuConfig,
    updateMenuConfig,
    createSpecialsMenu,
    getMenuPreviewDish: (menuId: string) =>
      menuPreviewDishes.value[text(menuId)] ?? null,
    menuSourcesCollectionPath: sourceUploads.collectionPath,
    selectKitchen: kitchenIndex.select,
    createMenu,
    menuCreateBlockedMessage,
    updateMenu,
    renameMenu,
    publishMenu,
    archiveMenu,
    debug: computed(() => ({
      kitchenId: kitchenWorkspace.id.value,
      activeKitchenAppId: fireux.appId,
      collectionPath: collectionPath.value,
      menusCount: activeMenus.value.length,
      rawMenusCount: (rawMenus.value ?? []).length,
      menuSourcesCollectionPath: sourceUploads.collectionPath.value,
      menuSourcesCount: menuSources.value.length,
      pending: pending.value,
      menuSourcesPending: sourceUploads.pending.value,
    })),
  }
}
