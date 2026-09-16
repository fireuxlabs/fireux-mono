import { kitchenMenuOrdering } from '../../../../menu/utils/menu-ordering'
import { kitchenMenuCapacity } from '../../../../menu/utils/menu-capacity'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: gate Menu creation on the selected Kitchen's linked Place currency.
import { computed, watchEffect } from 'vue'
import { useCookie, useState } from '#imports'
import { readKitchenCurrency } from '../../../utils/kitchen-readers'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceIdentity } from '../identity/useKitchenWorkspaceIdentity'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { useMenuCreate } from '../../../../menu/composables/firestore/mutations/useMenuCreate'
import { useMenuUpdate } from '../../../../menu/composables/firestore/mutations/useMenuUpdate'
import { useMenuPublication } from '../../../../menu/composables/publication/useMenuPublication'
import { useKitchenChildCollection } from '../../useKitchenChildCollection'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../../menu/utils/menu-source-upload.ts'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
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
  const session = useAppSession()
  const kitchenWorkspace = useKitchenWorkspace()
  const kitchenIndex = useKitchenWorkspaceIndex()
  const identity = useKitchenWorkspaceIdentity()
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
  const publication = useMenuPublication({
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
  const selectionKey = `kitchen-menu-selection-${fireux.appId}`
  const selectionCookie = useCookie<{ scope: string; id: string }>(
    selectionKey,
    {
      default: () => ({ scope: '', id: '' }),
      sameSite: 'lax',
    }
  )
  const selections = useState<Record<string, string>>(selectionKey, () =>
    selectionCookie.value?.scope
      ? { [selectionCookie.value.scope]: text(selectionCookie.value.id) }
      : {}
  )
  const selectionScope = computed(() =>
    session.uid.value && storageKitchenId.value
      ? `${session.uid.value}/${storageKitchenId.value}`
      : ''
  )
  const selectedMenuId = computed({
    get: () => text(selections.value[selectionScope.value]),
    set: (value: string) => {
      if (!selectionScope.value) return
      const next = { ...selections.value, [selectionScope.value]: text(value) }
      selections.value = next
      selectionCookie.value = { scope: selectionScope.value, id: text(value) }
    },
  })
  const selectedMenu = computed(
    () =>
      activeMenus.value.find(
        (menu) => text(menu.id) === selectedMenuId.value
      ) ?? null
  )
  watchEffect(() => {
    if (!['ready', 'empty'].includes(menusOutcome.value)) return
    if (selectedMenu.value) return
    selectedMenuId.value = text(activeMenus.value[0]?.id)
  })
  const pending = menusPending
  const collectionPath = fetchedCollectionPath
  const menuSources = computed(() => sortMenuSources(sourceUploads.items.value))
  const menuPreviewDishes = computed<Record<string, MenuPreviewDish>>(
    () => ({})
  )
  const currencyCode = computed(() =>
    readKitchenCurrency(kitchenWorkspace.data.value)
  )
  const canWrite = computed(
    () =>
      identity.canWrite.value &&
      ['user', 'admin', 'dev'].includes(String(session.appUser.value?.role))
  )
  const subscription = computed(
    () => session.appUser.value?.subscription || 'free'
  )
  const menuCount = computed(() => (rawMenus.value ?? []).length)
  const menuLimit = computed(() =>
    appSubscriptionCapacity(
      kitchenMenuCapacity,
      'kitchen.menus',
      subscription.value
    )
  )
  const hasMenuCapacity = computed(() =>
    hasAppSubscriptionCapacity(
      kitchenMenuCapacity,
      'kitchen.menus',
      subscription.value,
      menuCount.value
    )
  )
  const canCreateMenu = computed(
    () =>
      canWrite.value &&
      hasMenuCapacity.value &&
      !menusPending.value &&
      Boolean(currencyCode.value)
  )
  const menuCreateBlockedMessage = computed(() => {
    if (!canWrite.value)
      return 'Sign in with access to this kitchen to create a menu.'
    if (!hasMenuCapacity.value)
      return 'Menu creation allowance reached. Your existing menus remain available.'
    return currencyCode.value
      ? ''
      : 'Set the Kitchen currency before creating menus.'
  })
  async function createMenu(input: Parameters<typeof create.createMenu>[0]) {
    if (!canCreateMenu.value) {
      throw new Error(menuCreateBlockedMessage.value)
    }

    return create.createMenu(input)
  }

  function assertCanWrite() {
    if (!canWrite.value)
      throw new Error(
        'You do not have permission to edit this kitchen’s menus.'
      )
  }

  async function updateMenu(...args: Parameters<typeof update.updateMenu>) {
    assertCanWrite()
    return update.updateMenu(...args)
  }

  async function renameMenu(...args: Parameters<typeof update.renameMenu>) {
    assertCanWrite()
    return update.renameMenu(...args)
  }

  async function publishMenu(
    ...args: Parameters<typeof publication.publishMenu>
  ) {
    assertCanWrite()
    return publication.publishMenu(...args)
  }

  async function archiveMenu(
    ...args: Parameters<typeof publication.archiveMenu>
  ) {
    assertCanWrite()
    return publication.archiveMenu(...args)
  }

  return {
    availableKitchens: kitchenIndex.collection,
    kitchensPending: computed(() => kitchenIndex.outcome.value === 'pending'),
    selectedKitchen: kitchenWorkspace.data,
    selectedOrdering: computed(() =>
      kitchenMenuOrdering(
        kitchenWorkspace.data.value?.ordering,
        selectedMenuId.value
      )
    ),
    kitchenId: kitchenWorkspace.id,
    storageKitchenId,
    activeKitchenAppId: computed(() => fireux.appId),
    rootCollection,
    databaseId,
    canWrite,
    menuCount,
    menuLimit,
    subscription,
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
    getMenuPreviewDish: (menuId: string) =>
      menuPreviewDishes.value[text(menuId)] ?? null,
    menuSourcesCollectionPath: sourceUploads.collectionPath,
    selectKitchen: kitchenIndex.select,
    createMenu,
    menuCreateBlockedMessage,
    updateMenu,
    renameMenu,
    publishMenu,
    unpublishMenu: publication.unpublishMenu,
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
