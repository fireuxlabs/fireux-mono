import { useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useKitchenCollection } from '../firestore/kitchen/fetch/useKitchenCollection'
import type { Menu } from '../../../models/menu.model'
import {
  normalizeString,
  resolveKitchenRuntimeChildCollectionPath,
} from './kitchen-console/shared'
import {
  normalizeKitchenMenuMode,
  useResolvedKitchenMenuView,
} from './kitchen-menu-view'

export type {
  KitchenMenuItemGroup,
  KitchenMenuSectionView,
} from './kitchen-menu-view'

export function useKitchenMenu() {
  const route = useRoute()

  const routeKitchenSlug = computed(() => {
    const raw = route.params.kitchenSlug
    return Array.isArray(raw)
      ? normalizeString(raw[0])
      : normalizeString(raw)
  })

  const routeMenuId = computed(() => {
    const rawParam = route.params.menuId
    const menuIdFromParam = Array.isArray(rawParam)
      ? normalizeString(rawParam[0])
      : normalizeString(rawParam)

    if (menuIdFromParam) return menuIdFromParam

    const raw = route.query.menuId
    return Array.isArray(raw)
      ? normalizeString(raw[0])
      : normalizeString(raw)
  })

  const requestedMode = computed(() =>
    normalizeKitchenMenuMode(route.query.mode)
  )
  const requestedTable = computed(() => {
    const raw = route.query.table
    return Array.isArray(raw)
      ? normalizeString(raw[0])
      : normalizeString(raw)
  })
  const requestedCover = computed(() => {
    const raw = route.query.cover
    return Array.isArray(raw)
      ? normalizeString(raw[0])
      : normalizeString(raw)
  })

  const { kitchens, pending: kitchensPending } = useKitchenCollection()
  const resolvedKitchen = computed(() => {
    const key = routeKitchenSlug.value
    if (!key) return null

    const keyLower = key.toLowerCase()
    const list = kitchens.value ?? []

    const found = list.find((entry) => {
      const id = normalizeString(entry?.id)
      const slug = normalizeString((entry as any)?.slug).toLowerCase()
      return id === key || (slug.length > 0 && slug === keyLower)
    })

    return found ?? null
  })

  const kitchenId = computed(() => normalizeString(resolvedKitchen.value?.id))
  const kitchenAddress = computed(() =>
    normalizeString(
      (resolvedKitchen.value as any)?.short_address ||
        (resolvedKitchen.value as any)?.formatted_address
    )
  )

  const loading = computed(
    () => Boolean(routeKitchenSlug.value) && kitchensPending.value
  )

  const { firestoreFetchCollection } = useFirestoreRead()
  const menusRef = shallowRef(null) as ShallowRef<
    Ref<Menu[] | undefined> | null
  >

  watch(
    kitchenId,
    (nextKitchenId) => {
      const path = resolveKitchenRuntimeChildCollectionPath({
        kitchenId: nextKitchenId,
        collectionName: 'menus',
      })

      menusRef.value = path ? firestoreFetchCollection<Menu>(path) : null
    },
    { immediate: true }
  )

  const menus = computed(() => menusRef.value?.value ?? [])

  const menuView = useResolvedKitchenMenuView({
    menus,
    requestedMenuId: routeMenuId,
    requestedMode,
    kitchen: resolvedKitchen,
    kitchenAddress,
    headerTitleFallback: 'Menu',
    headerDescriptionFallback: 'Public menu',
    headerDescriptionSuffix: 'Public menu',
    includeHeaderSuffixWithAddress: false,
    emptyMenuSubject: 'This kitchen',
    emptyMenuFallback: 'This kitchen has no active public menu right now.',
  })

  const resolveMenuTo = (menu: Menu) => {
    const menuId = normalizeString(menu?.id)
    const key = normalizeString(routeKitchenSlug.value || kitchenId.value)
    if (!menuId || !key) return undefined

    return {
      path: `/kitchens/${encodeURIComponent(key)}/menu/${encodeURIComponent(
        menuId
      )}`,
      query: {
        mode: requestedMode.value || undefined,
        table: requestedTable.value || undefined,
        cover: requestedCover.value || undefined,
        postcode: Array.isArray(route.query.postcode)
          ? normalizeString(route.query.postcode[0]) || undefined
          : normalizeString(route.query.postcode) || undefined,
        slot: Array.isArray(route.query.slot)
          ? normalizeString(route.query.slot[0]) || undefined
          : normalizeString(route.query.slot) || undefined,
      },
    }
  }

  const backToKitchen = computed(() => {
    const key = routeKitchenSlug.value || kitchenId.value
    return key ? `/kitchens/${encodeURIComponent(key)}` : '/kitchens'
  })

  return {
    requestedMode,
    requestedModeLabel: menuView.requestedModeLabel,
    requestedTable,
    requestedCover,
    routeKitchenSlug,
    routeKitchenId: routeKitchenSlug,
    routeMenuId,
    loading,
    resolvedKitchen,
    kitchenId,
    kitchenAddress,
    menus,
    sortedMenus: menuView.sortedMenus,
    activeMenus: menuView.activeMenus,
    activeMenu: menuView.activeMenu,
    selectedMenu: menuView.selectedMenu,
    selectedMenuId: menuView.selectedMenuId,
    menuDesign: menuView.menuDesign,
    sortedSections: menuView.sortedSections,
    noMenuDescription: menuView.noMenuDescription,
    isMenuAvailableForMode: menuView.isMenuAvailableForMode,
    isMenuSelectable: menuView.isMenuSelectable,
    isSelectedMenu: menuView.isSelectedMenu,
    resolveMenuTo,
    resolveVariantLabel: menuView.resolveVariantLabel,
    formatPrice: menuView.formatPrice,
    headerTitle: menuView.headerTitle,
    headerDescription: menuView.headerDescription,
    backToKitchen,
  }
}

export type KitchenMenuState = ReturnType<typeof useKitchenMenu>
