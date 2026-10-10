import { useKitchenOfferingCollection } from '../../useKitchenOfferingCollection'
import { kitchenMenuOrdering } from '../../../../menu/utils/menu-ordering'
import { kitchenMenuCapacity } from '../../../../menu/utils/menu-capacity'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { computed, watchEffect } from 'vue'
import { useCookie, useState } from '#imports'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../useKitchenWorkspaceIndex'
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
  const storageKitchenId = computed(() =>
    kitchenWorkspace.outcome.value === 'ready' &&
    kitchenWorkspace.data.value?.id === kitchenWorkspace.id.value
      ? kitchenWorkspace.id.value
      : ''
  )
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const fetchKitchenId = storageKitchenId
  const {
    menus: fetchedMenus,
    activeMenus: fetchedActiveMenus,
    outcome: menusOutcome,
    error: menusError,
    collectionPath: fetchedCollectionPath,
  } = useKitchenMenuCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const create = useMenuCreate({
    kitchenId: kitchenWorkspace.id,
  })
  const update = useMenuUpdate()
  const publication = useMenuPublication()
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
  const outcome = computed(() => {
    if (!kitchenWorkspace.id.value) return 'idle'
    if (kitchenWorkspace.outcome.value !== 'ready')
      return kitchenWorkspace.outcome.value
    if (!storageKitchenId.value) return 'pending'
    return menusOutcome.value
  })
  const error = computed(() => {
    if (!kitchenWorkspace.id.value) return undefined
    if (kitchenWorkspace.outcome.value !== 'ready')
      return kitchenWorkspace.outcome.value === 'error'
        ? session.error.value || new Error('Kitchen could not be loaded.')
        : undefined
    return menusError.value
  })
  const pending = computed(() => outcome.value === 'pending')
  const collectionPath = fetchedCollectionPath
  const menuSources = computed(() => sortMenuSources(sourceUploads.items.value))
  const menuSourcesOutcome = computed(() =>
    storageKitchenId.value ? sourceUploads.outcome.value : outcome.value
  )
  const menuSourcesError = computed(() =>
    storageKitchenId.value ? sourceUploads.error.value : error.value
  )
  const menuSourcesPending = computed(
    () => menuSourcesOutcome.value === 'pending'
  )
  const menuPreviewDishes = computed<Record<string, MenuPreviewDish>>(
    () => ({})
  )
  const currencyCode = computed(() =>
    readPlaceCurrencyCode(identity.selectedKitchen.value)
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
      ['ready', 'empty'].includes(outcome.value) &&
      Boolean(currencyCode.value)
  )
  const menuCreateBlockedMessage = computed(() => {
    if (outcome.value === 'error')
      return 'Your Kitchen or Menus could not be loaded. Try again.'
    if (pending.value) return 'Wait for your Kitchen and Menus to load.'
    if (!storageKitchenId.value) return 'Choose a Kitchen you can manage.'
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

  const offerings = useKitchenOfferingCollection(
    computed(() =>
      kitchenWorkspace.outcome.value === 'ready' &&
      kitchenWorkspace.data.value?.id === storageKitchenId.value
        ? storageKitchenId.value
        : ''
    )
  )

  return {
    availableKitchens: kitchenIndex.collection,
    kitchensPending: computed(() => kitchenIndex.outcome.value === 'pending'),
    selectedKitchen: kitchenWorkspace.data,
    offerings: offerings.offerings,
    offeringsOutcome: offerings.outcome,
    offeringsError: offerings.error,
    selectedOrdering: computed(() =>
      kitchenMenuOrdering(offerings.offerings.value, selectedMenuId.value)
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
    outcome,
    error,
    menuSources,
    menuSourcesPending,
    menuSourcesOutcome,
    menuSourcesError,
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
      menuSourcesPending: menuSourcesPending.value,
    })),
  }
}
