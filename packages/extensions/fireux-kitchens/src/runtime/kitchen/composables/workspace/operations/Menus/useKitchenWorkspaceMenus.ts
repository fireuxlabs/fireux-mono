// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: gate Menu creation on the selected Kitchen's linked Place currency.
// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: expose the typed Demo Menu without opening live collection paths.
import { computed } from 'vue'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { useKitchenWorkspace } from '../../core/useKitchenWorkspace'
import { useKitchenWorkspaceIdentity } from '../../identity/useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from '../../identity/useKitchenWorkspacePlace'
import { useKitchenMenuCollection } from '../../../../../menu/composables/firestore/fetch/useKitchenMenuCollection'
import { useMenuCreate } from '../../../../../menu/composables/firestore/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../../menu/composables/firestore/mutations/useMenuUpdate'
import { useKitchenChildCollection } from '../../../firestore/utils/paths/useKitchenChildCollection'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../../../menu/models/menu-source-upload.model.ts'
import {
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../core/useKitchenWorkspaceDemoData'
import { useKitchenWorkspaceDemoMenuService } from '../../core/useKitchenWorkspaceDemoMenuService'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
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
  const identity = useKitchenWorkspaceIdentity(kitchenWorkspace)
  const { place } = useKitchenWorkspacePlace(identity)
  const storageKitchenId = kitchenWorkspace.runtime.storageKitchenId
  const demoData = useKitchenWorkspaceDemoData(
    kitchenWorkspace.runtime.isDemo
  )
  const demoScenario = computed(() => findKitchenWorkspaceDemoScenario(
    demoData.data.value,
    kitchenWorkspace.selection.kitchenId.value
  ))
  const demoMenuService = useKitchenWorkspaceDemoMenuService(demoScenario)
  const fetchKitchenId = computed(() =>
    kitchenWorkspace.runtime.rootCollection.value &&
    storageKitchenId.value
      ? storageKitchenId.value
      : ''
  )
  const {
    menus: fetchedMenus,
    activeMenus: fetchedActiveMenus,
    pending: menusPending,
    collectionPath: fetchedCollectionPath,
  } =
    useKitchenMenuCollection(fetchKitchenId, {
      kitchenCollectionPath: kitchenWorkspace.runtime.rootCollection,
      databaseId: kitchenWorkspace.runtime.databaseId,
  })
  const create = useMenuCreate({
    kitchenCollectionPath: kitchenWorkspace.runtime.rootCollection,
    kitchenId: kitchenWorkspace.selection.kitchenId,
    databaseId: kitchenWorkspace.runtime.databaseId,
  })
  const update = useMenuUpdate({
    kitchenCollectionPath: kitchenWorkspace.runtime.rootCollection,
    databaseId: kitchenWorkspace.runtime.databaseId,
  })
  const sourceUploads = useKitchenChildCollection<MenuSourceUpload>(
    MenuSourceUploadStorage.collection,
    storageKitchenId,
    {
      kitchenCollectionPath: kitchenWorkspace.runtime.rootCollection,
      databaseId: kitchenWorkspace.runtime.databaseId,
    }
  )
  const rawMenus = computed(() =>
    kitchenWorkspace.runtime.isDemo.value
      ? demoScenario.value?.menus.map(menu => menu.kitchenMenu) ?? []
      : fetchedMenus.value
  )
  const activeMenus = computed(() =>
    kitchenWorkspace.runtime.isDemo.value
      ? (rawMenus.value ?? []).filter(menu => menu.status !== 'archived')
      : fetchedActiveMenus.value
  )
  const pending = computed(() =>
    kitchenWorkspace.runtime.isDemo.value
      ? demoData.pending.value
      : menusPending.value
  )
  const collectionPath = computed(() =>
    kitchenWorkspace.runtime.isDemo.value
      ? `demo/kitchens/${kitchenWorkspace.selection.kitchenId.value}/menus`
      : fetchedCollectionPath.value
  )
  const menuSources = computed(() =>
    kitchenWorkspace.runtime.isDemo.value
      ? []
      : sortMenuSources(sourceUploads.items.value)
  )
  const menuPreviewDishes = computed(() => {
    if (!kitchenWorkspace.runtime.isDemo.value) return {}

    const previews: Record<string, MenuPreviewDish> = {}
    const usedDishIds = new Set<string>()

    for (const menu of demoScenario.value?.menus ?? []) {
      const linkedDishIds = menu.menuSections
          .filter(({ section }) => section.status === 'active')
          .sort((left, right) =>
            left.section.sort_order - right.section.sort_order
          )
          .flatMap(({ items }) =>
            [...items]
              .filter(item => item.status === 'active')
              .sort((left, right) => left.sort_order - right.sort_order)
          )
          .map(item => text(item.dish_id))
          .filter(Boolean)
      const linkedDishes = linkedDishIds
        .map(dishId => menu.dishes.find(dish => dish.id === dishId))
        .filter(dish => Boolean(dish && text(dish.image)))
      const dish =
        linkedDishes.find(item => item && !usedDishIds.has(item.id)) ??
        linkedDishes[0]

      if (!dish) continue

      usedDishIds.add(dish.id)
      previews[menu.kitchenMenu.id] = {
        name: text(dish.name) || 'Menu dish',
        imageUrl: text(dish.image),
      }
    }

    return previews
  })
  const currencyCode = computed(() =>
    readPlaceCurrencyCode(place.value)
  )
  const canCreateMenu = computed(() =>
    kitchenWorkspace.runtime.canWrite.value && Boolean(currencyCode.value)
  )
  const menuCreateBlockedMessage = computed(() => {
    if (!kitchenWorkspace.runtime.canWrite.value) {
      return 'This kitchen is read-only.'
    }

    return currencyCode.value
      ? ''
      : 'Set the linked Place currency before creating menus.'
  })
  const canManageMenuService = computed(() =>
    kitchenWorkspace.runtime.isDemo.value
  )
  const menuConfig = computed(() => {
    const kitchen = kitchenWorkspace.selection.kitchen.value
    const menus = kitchen?.menus
    const liveMenus = record(record(kitchen?.workspace).menus)
    return {
      context: text(liveMenus.context) || text(menus?.context),
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
    const kitchenId = text(kitchenWorkspace.selection.kitchenId.value)
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
    await kitchenWorkspace.targets.refresh()
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
    if (!kitchenWorkspace.runtime.canWrite.value) {
      throw new Error('This kitchen is read-only.')
    }
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
    selectedKitchen: kitchenWorkspace.selection.kitchen,
    kitchenId: kitchenWorkspace.selection.kitchenId,
    storageKitchenId,
    activeKitchenAppId: kitchenWorkspace.runtime.appId,
    dataType: kitchenWorkspace.runtime.dataType,
    isDemo: kitchenWorkspace.runtime.isDemo,
    rootCollection: kitchenWorkspace.runtime.rootCollection,
    databaseId: kitchenWorkspace.runtime.databaseId,
    readOnly: kitchenWorkspace.runtime.readOnly,
    canWrite: kitchenWorkspace.runtime.canWrite,
    canCreateMenu,
    currencyCode,
    collectionPath,
    menus: activeMenus,
    rawMenus,
    pending,
    menuSources,
    menuSourcesPending: sourceUploads.pending,
    menuPreviewDishes,
    canManageMenuService,
    menuConfig,
    updateMenuConfig,
    createSpecialsMenu,
    getMenuPreviewDish: (menuId: string) =>
      menuPreviewDishes.value[text(menuId)] ?? null,
    isMenuInService: (menuId: string) =>
      !kitchenWorkspace.runtime.isDemo.value
      || demoMenuService.isMenuInService(menuId),
    menuServiceMode: demoMenuService.menuMode,
    setMenuInService: demoMenuService.setMenuInService,
    menuSourcesCollectionPath: sourceUploads.collectionPath,
    createMenu,
    menuCreateBlockedMessage,
    updateMenu,
    renameMenu,
    publishMenu,
    archiveMenu,
    refresh: kitchenWorkspace.targets.refresh,
    debug: computed(() => ({
      kitchenId: kitchenWorkspace.selection.kitchenId.value,
      activeKitchenAppId: kitchenWorkspace.runtime.appId.value,
      collectionPath: collectionPath.value,
      menusCount: activeMenus.value.length,
      rawMenusCount: (rawMenus.value ?? []).length,
      menuSourcesCollectionPath: sourceUploads.collectionPath.value,
      menuSourcesCount: menuSources.value.length,
      pending: pending.value,
      menuSourcesPending: sourceUploads.pending.value,
      readOnly: kitchenWorkspace.runtime.readOnly.value,
      canWrite: kitchenWorkspace.runtime.canWrite.value,
      demoMenuAvailability:
        demoMenuService.cascade.value?.menus.map(menu => ({
          ...menu,
          inService: demoMenuService.isMenuInService(menu.id),
        })) ?? [],
    })),
  }
}
