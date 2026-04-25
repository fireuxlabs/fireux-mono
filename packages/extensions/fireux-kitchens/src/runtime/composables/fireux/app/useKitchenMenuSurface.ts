import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useBasket } from 'fireux-orders/runtime/composables/useBasket'
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { resolveMenuItemView, type ResolvedMenuItemView } from '../firestore/runtime-kitchen/menu/utils/view/resolveMenuItemView'
import { useKitchenCollection } from '../firestore/kitchen/fetch/useKitchenCollection'
import type { Menu, MenuSection, MenuServiceMode } from '../../../models/menu.model'
import {
  normalizeString,
  resolveKitchenRuntimeChildCollectionPath,
} from './kitchen-console/shared'

export type KitchenMenuSurfacePresentation = 'qr' | 'kiosk'

export type KitchenMenuItemGroup = {
  key: string
  label: string
  items: ResolvedMenuItemView[]
}

export type KitchenMenuSectionView = MenuSection & {
  itemGroups: KitchenMenuItemGroup[]
}

const normalizeMode = (
  value: unknown
): '' | 'dine_in' | 'collection' | 'delivery' => {
  const raw = normalizeString(value).toLowerCase()
  if (raw === 'dine_in' || raw === 'dine-in') return 'dine_in'
  if (raw === 'collection') return 'collection'
  if (raw === 'delivery') return 'delivery'
  return ''
}

const normalizeSurface = (value: unknown): KitchenMenuSurfacePresentation => {
  const raw = normalizeString(value).toLowerCase()
  return raw === 'kiosk' ? 'kiosk' : 'qr'
}

const inferLegacyModes = (menu: Menu): MenuServiceMode[] => {
  const id = normalizeString(menu?.id).toLowerCase()
  const name = normalizeString(menu?.name).toLowerCase()
  const joined = `${id} ${name}`
  const inferred: MenuServiceMode[] = []

  if (joined.includes('dine') || joined.includes('eat in')) {
    inferred.push('dine_in')
  }

  if (
    joined.includes('collection') ||
    joined.includes('pickup') ||
    joined.includes('pick up')
  ) {
    inferred.push('collection')
  }

  if (joined.includes('delivery')) {
    inferred.push('delivery')
  }

  return inferred
}

const resolveMenuModes = (menu: Menu): MenuServiceMode[] => {
  const raw = Array.isArray((menu as any)?.service_modes)
    ? (menu as any).service_modes
    : []

  const normalized = raw
    .map((mode: unknown) => normalizeMode(mode))
    .filter(Boolean) as MenuServiceMode[]

  if (normalized.length) return normalized

  const inferred = inferLegacyModes(menu)
  if (inferred.length) return inferred

  return ['dine_in']
}

const resolveGroupLabel = (
  dishId: string,
  items: ResolvedMenuItemView[]
): string => {
  const labels = items
    .map((item) => normalizeString(item.label))
    .filter(Boolean)

  if (!labels.length) return dishId || 'Menu item'

  const prefixParts = labels.map((label) => {
    const [prefix] = label.split('·')
    return normalizeString(prefix)
  })

  const firstPrefix = normalizeString(prefixParts[0])
  const hasCommonPrefix =
    Boolean(firstPrefix) && prefixParts.every((part) => part === firstPrefix)

  if (hasCommonPrefix) return firstPrefix

  return labels[0] || dishId || 'Menu item'
}

const buildItemGroups = (
  items: ResolvedMenuItemView[]
): KitchenMenuItemGroup[] => {
  const groups: KitchenMenuItemGroup[] = []
  const groupsByKey = new Map<string, KitchenMenuItemGroup>()

  for (const item of items) {
    const dishId = normalizeString(item.dish_id)
    const key =
      dishId ||
      `item:${normalizeString(item.id) || normalizeString(item.label)}`

    let group = groupsByKey.get(key)

    if (!group) {
      group = {
        key,
        label: '',
        items: [],
      }
      groupsByKey.set(key, group)
      groups.push(group)
    }

    group.items.push(item)
  }

  for (const group of groups) {
    const dishId = normalizeString(group.items[0]?.dish_id)
    group.label = resolveGroupLabel(dishId, group.items)
  }

  return groups
}

export function useKitchenMenuSurface() {
  const route = useRoute()
  const toast = useToastify()

  const routeKitchenId = computed(() => {
    const raw = route.params.kitchenId
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

  const surface = computed<KitchenMenuSurfacePresentation>(() =>
    normalizeSurface(route.query.surface)
  )

  const requestedMode = computed(() => normalizeMode(route.query.mode))
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

  const requestedModeLabel = computed(() => {
    if (requestedMode.value === 'dine_in') return 'Dine-in'
    if (requestedMode.value === 'collection') return 'Collection'
    if (requestedMode.value === 'delivery') return 'Delivery'
    return ''
  })

  const { kitchens, pending: kitchensPending } = useKitchenCollection()
  const resolvedKitchen = computed(() => {
    const key = routeKitchenId.value
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
    () => Boolean(routeKitchenId.value) && kitchensPending.value
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

  const sortedMenus = computed(() =>
    [...menus.value].sort(
      (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
    )
  )

  const isMenuAvailableForMode = (
    menu: Menu,
    mode: '' | MenuServiceMode
  ) => {
    if (!mode) return true
    return resolveMenuModes(menu).includes(mode)
  }

  const isMenuSelectable = (menu: Menu) =>
    Boolean(menu?.active) && isMenuAvailableForMode(menu, requestedMode.value)

  const activeMenus = computed(() =>
    sortedMenus.value.filter((menu) => isMenuSelectable(menu))
  )

  const activeMenu = computed(() => activeMenus.value[0] ?? null)

  const selectedMenu = computed(() => {
    const requestedId = routeMenuId.value
    if (requestedId) {
      const requested = activeMenus.value.find(
        (menu) => normalizeString(menu?.id) === requestedId
      )
      if (requested) return requested
    }

    return activeMenu.value
  })

  const selectedMenuId = computed(() =>
    normalizeString(selectedMenu.value?.id)
  )

  const noMenuDescription = computed(() => {
    if (requestedModeLabel.value) {
      return `This kitchen has no active menu available for ${requestedModeLabel.value.toLowerCase()} right now.`
    }
    return 'This kitchen has no active menu open for ordering right now.'
  })

  const resolveMenuTo = (menu: Menu) => {
    const menuId = normalizeString(menu?.id)
    const key = normalizeString(routeKitchenId.value || kitchenId.value)
    if (!menuId || !key) return undefined

    return {
      path: `/kitchens/${encodeURIComponent(key)}/menu/${encodeURIComponent(
        menuId
      )}`,
      query: {
        mode: requestedMode.value || undefined,
        table: requestedTable.value || undefined,
        cover: requestedCover.value || undefined,
        surface: surface.value || undefined,
        postcode: Array.isArray(route.query.postcode)
          ? normalizeString(route.query.postcode[0]) || undefined
          : normalizeString(route.query.postcode) || undefined,
        slot: Array.isArray(route.query.slot)
          ? normalizeString(route.query.slot[0]) || undefined
          : normalizeString(route.query.slot) || undefined,
      },
    }
  }

  const isSelectedMenu = (menu: Menu) =>
    normalizeString(menu?.id) === selectedMenuId.value

  const resolveVariantLabel = (groupLabel: string, itemLabel: string) => {
    const label = normalizeString(itemLabel)
    const prefix = normalizeString(groupLabel)
    if (!label) return 'Option'
    if (!prefix) return label

    const normalizedPrefix = `${prefix} · `
    if (label.startsWith(normalizedPrefix)) {
      const variant = normalizeString(label.slice(normalizedPrefix.length))
      return variant || label
    }

    return label
  }

  const sortedSections = computed<KitchenMenuSectionView[]>(() => {
    const menu = selectedMenu.value
    if (!menu) return []

    return [...(menu.sections ?? [])]
      .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
      .map((section) => ({
        ...section,
        itemGroups: buildItemGroups(
          [...(section.items ?? [])]
            .map((item) => resolveMenuItemView(menu, section, item))
            .filter((item) => item.active)
            .sort(
              (a, b) =>
                Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
            )
        ),
      }))
      .filter((section) => section.itemGroups.length > 0)
  })

  const {
    kitchenId: basketKitchenId,
    items: basketItems,
    addLine,
    itemCount,
    subtotalMinor,
    currencyCode,
    incrementAt,
    decrementAt,
    removeAt,
  } = useBasket()

  const lineKey = (
    line: {
      dish_id: string
      label: string
      price_minor: number
      currency_code: string
    },
    index: number
  ) =>
    `${line.dish_id}:${line.label}:${line.price_minor}:${line.currency_code}:${index}`

  const basketKitchenMismatch = computed(() => {
    const basketId = normalizeString(basketKitchenId.value)
    const currentKitchenId = kitchenId.value
    if (!basketId || !currentKitchenId) return false
    return basketId !== currentKitchenId
  })

  const handleAddToBasket = (
    group: KitchenMenuItemGroup,
    item: ResolvedMenuItemView
  ) => {
    if (!kitchenId.value) return

    const label =
      group.items.length > 1
        ? resolveVariantLabel(group.label, item.label)
        : normalizeString(item?.label) || 'Menu item'

    try {
      const result = addLine({
        scope_type: 'kitchen',
        scope_id: kitchenId.value,
        kitchen_id: kitchenId.value,
        dish_id: normalizeString(item?.dish_id),
        label,
        price_minor: Number(item?.price_minor || 0),
        currency_code: normalizeString(item?.currency_code || 'CHF'),
        qty: 1,
      })

      if (result.replacedKitchen) {
        toast.warn('Started a new basket for this kitchen')
      } else {
        toast.success('Added to basket')
      }
    } catch (error: any) {
      toast.error(normalizeString(error?.message) || 'Failed to add item')
    }
  }

  const checkoutRoute = computed(() => ({
    path: '/orders/checkout',
    query: {
      scopeType: 'kitchen',
      scopeId: kitchenId.value || undefined,
      kitchen: kitchenId.value || undefined,
      kitchenName: normalizeString(resolvedKitchen.value?.name) || undefined,
      mode: requestedMode.value || undefined,
      table: requestedTable.value || undefined,
      cover: requestedCover.value || undefined,
      returnTo: route.fullPath || undefined,
    },
  }))

  const formatPrice = (priceMinor?: number, currencyCode?: string) => {
    const amount = Number(priceMinor || 0) / 100
    const code = normalizeString(currencyCode || 'CHF').toUpperCase() || 'CHF'

    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const headerTitle = computed(() => selectedMenu.value?.name || 'Menu')
  const headerDescription = computed(() => {
    const kitchenName = normalizeString(resolvedKitchen.value?.name)
    if (kitchenName && kitchenAddress.value) {
      return `${kitchenName} · ${kitchenAddress.value}`
    }
    if (kitchenName) {
      return `${kitchenName} · Public menu`
    }
    return 'Public menu'
  })

  const backToKitchen = computed(() =>
    kitchenId.value
      ? `/kitchens/${encodeURIComponent(kitchenId.value)}`
      : '/kitchens'
  )

  return {
    surface,
    requestedMode,
    requestedModeLabel,
    requestedTable,
    requestedCover,
    routeKitchenId,
    routeMenuId,
    loading,
    resolvedKitchen,
    kitchenId,
    kitchenAddress,
    menus,
    sortedMenus,
    selectedMenu,
    selectedMenuId,
    sortedSections,
    noMenuDescription,
    basketKitchenMismatch,
    basketItems,
    itemCount,
    subtotalMinor,
    currencyCode,
    incrementAt,
    decrementAt,
    removeAt,
    lineKey,
    isMenuSelectable,
    isSelectedMenu,
    resolveMenuTo,
    resolveVariantLabel,
    handleAddToBasket,
    canCheckout: computed(() => true),
    checkoutRoute,
    formatPrice,
    headerTitle,
    headerDescription,
    backToKitchen,
  }
}

export type KitchenMenuSurfaceState = ReturnType<typeof useKitchenMenuSurface>
