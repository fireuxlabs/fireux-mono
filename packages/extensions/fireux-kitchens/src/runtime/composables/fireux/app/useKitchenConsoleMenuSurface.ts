import { useRoute, useState } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import type { OrderLine } from 'fireux-orders/runtime/models/order.model'
import type { Menu, MenuServiceMode } from '../../../models/menu.model'
import { resolveMenuItemView, type ResolvedMenuItemView } from '../firestore/runtime-kitchen/menu/utils/view/resolveMenuItemView'
import {
  useKitchenConsoleMenus,
} from './kitchen-console/useKitchenConsoleMenus'
import { useKitchenConsole } from './kitchen-console/useKitchenConsole'
import type {
  KitchenMenuItemGroup,
  KitchenMenuSectionView,
  KitchenMenuSurfacePresentation,
} from './useKitchenMenuSurface'

type PreviewBasketState = {
  scope_type: string
  scope_id: string
  kitchen_id: string
  items: OrderLine[]
}

type PreviewBasketLineInput = {
  scope_type?: string
  scope_id?: string
  kitchen_id?: string
  dish_id: string
  label: string
  price_minor: number
  currency_code?: string
  qty?: number
}

const PREVIEW_BASKET_STATE_KEY = 'fireux-kitchens:menu-preview-basket:state'

const normalizeString = (value: unknown) => String(value ?? '').trim()

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

  if (joined.includes('dine') || joined.includes('eat in')) inferred.push('dine_in')
  if (
    joined.includes('collection') ||
    joined.includes('pickup') ||
    joined.includes('pick up')
  ) {
    inferred.push('collection')
  }
  if (joined.includes('delivery')) inferred.push('delivery')

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

const normalizeCurrency = (value: unknown) => {
  const code = normalizeString(value).toUpperCase()
  return code || 'CHF'
}

const createEmptyPreviewBasket = (): PreviewBasketState => ({
  scope_type: '',
  scope_id: '',
  kitchen_id: '',
  items: [],
})

const lineIdentity = (
  line: Pick<OrderLine, 'dish_id' | 'label' | 'price_minor' | 'currency_code'>
) => `${line.dish_id}::${line.label}::${line.price_minor}::${line.currency_code}`

const formatLineFromInput = (input: PreviewBasketLineInput): OrderLine => ({
  dish_id: normalizeString(input.dish_id),
  label: normalizeString(input.label),
  price_minor: Math.max(0, Math.round(Number(input.price_minor || 0))),
  currency_code: normalizeCurrency(input.currency_code),
  qty: Math.max(1, Math.floor(Number(input.qty || 1))),
})

function usePreviewBasket() {
  const basket = useState<PreviewBasketState>(
    PREVIEW_BASKET_STATE_KEY,
    createEmptyPreviewBasket
  )

  const kitchenId = computed(() => normalizeString(basket.value.kitchen_id))
  const items = computed(() => basket.value.items)
  const itemCount = computed(() =>
    items.value.reduce(
      (sum: number, line: OrderLine) => sum + Math.max(0, Number(line.qty || 0)),
      0
    )
  )
  const subtotalMinor = computed(() =>
    items.value.reduce(
      (sum: number, line: OrderLine) =>
        sum +
        Math.max(0, Number(line.price_minor || 0)) *
          Math.max(0, Number(line.qty || 0)),
      0
    )
  )
  const currencyCode = computed(() =>
    normalizeCurrency(items.value[0]?.currency_code || 'CHF')
  )

  const removeAt = (index: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    basket.value.items.splice(index, 1)
    if (!basket.value.items.length) {
      basket.value.scope_type = ''
      basket.value.scope_id = ''
      basket.value.kitchen_id = ''
    }
  }

  const setQtyAt = (index: number, qty: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    const nextQty = Math.floor(Number(qty || 0))
    if (nextQty <= 0) {
      removeAt(index)
      return
    }

    basket.value.items[index] = {
      ...basket.value.items[index],
      qty: nextQty,
    }
  }

  const incrementAt = (index: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    setQtyAt(index, Number(basket.value.items[index]?.qty || 0) + 1)
  }

  const decrementAt = (index: number) => {
    if (index < 0 || index >= basket.value.items.length) return
    setQtyAt(index, Number(basket.value.items[index]?.qty || 0) - 1)
  }

  const addLine = (input: PreviewBasketLineInput) => {
    const nextScopeType = normalizeString(input.scope_type)
    const nextScopeId = normalizeString(input.scope_id)
    const nextKitchenId = normalizeString(input.kitchen_id)
    const resolvedScopeType = nextScopeType || (nextKitchenId ? 'kitchen' : '')
    const resolvedScopeId = nextScopeId || nextKitchenId

    if (!resolvedScopeType || !resolvedScopeId) {
      throw new Error('Preview basket line requires scope_type and scope_id')
    }

    const line = formatLineFromInput(input)
    if (!line.dish_id || !line.label) {
      throw new Error('Preview basket line requires dish_id and label')
    }

    let replacedKitchen = false

    if (
      basket.value.scope_type &&
      basket.value.scope_id &&
      (basket.value.scope_type !== resolvedScopeType ||
        basket.value.scope_id !== resolvedScopeId) &&
      basket.value.items.length
    ) {
      basket.value = createEmptyPreviewBasket()
      replacedKitchen = true
    }

    basket.value.scope_type = resolvedScopeType
    basket.value.scope_id = resolvedScopeId
    basket.value.kitchen_id = resolvedScopeType === 'kitchen' ? resolvedScopeId : ''

    const targetIdentity = lineIdentity(line)
    const lineIndex = basket.value.items.findIndex(
      (existing: OrderLine) => lineIdentity(existing) === targetIdentity
    )

    if (lineIndex >= 0) {
      const current = basket.value.items[lineIndex]
      basket.value.items[lineIndex] = {
        ...current,
        qty:
          Math.max(1, Number(current.qty || 0)) +
          Math.max(1, Number(line.qty || 1)),
      }
    } else {
      basket.value.items.push(line)
    }

    return {
      replacedKitchen,
      itemCount: itemCount.value,
    }
  }

  return {
    kitchenId,
    items,
    itemCount,
    subtotalMinor,
    currencyCode,
    addLine,
    incrementAt,
    decrementAt,
    removeAt,
  }
}

export function useKitchenConsoleMenuSurface() {
  const route = useRoute()
  const toast = useToastify()
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const { menus, pending } = useKitchenConsoleMenus()

  const routeMenuId = computed(() => {
    const rawParam = route.query.menuId
    return Array.isArray(rawParam)
      ? normalizeString(rawParam[0])
      : normalizeString(rawParam)
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

  const resolvedKitchen = computed(() => selectedKitchen.value ?? null)
  const kitchenId = computed(() => normalizeString(resolvedKitchen.value?.id))
  const kitchenAddress = computed(() =>
    normalizeString(
      (resolvedKitchen.value as any)?.short_address ||
        (resolvedKitchen.value as any)?.formatted_address
    )
  )
  const loading = computed(
    () => Boolean(kitchenId.value) && Boolean(pending.value)
  )

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
    return 'This kitchen has no active menu open for preview right now.'
  })

  const resolveMenuTo = (menu: Menu) => {
    const menuId = normalizeString(menu?.id)
    if (!menuId) return undefined

    return {
      path: '/console/kitchen/preview',
      query: {
        menuId,
        surface: surface.value || undefined,
        mode: requestedMode.value || undefined,
        table: requestedTable.value || undefined,
        cover: requestedCover.value || undefined,
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
  } = usePreviewBasket()

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
        currency_code: normalizeCurrency(item?.currency_code || 'CHF'),
        qty: 1,
      })

      if (result.replacedKitchen) {
        toast.warn('Started a new preview basket for this kitchen')
      } else {
        toast.success('Added to preview basket')
      }
    } catch (error: any) {
      toast.error(normalizeString(error?.message) || 'Failed to add item')
    }
  }

  const canCheckout = computed(() => false)
  const checkoutRoute = computed(() => ({
    path: '/console/kitchen/preview',
    query: {
      menuId: selectedMenuId.value || undefined,
      surface: surface.value || undefined,
      mode: requestedMode.value || undefined,
      table: requestedTable.value || undefined,
      cover: requestedCover.value || undefined,
    },
  }))

  const formatPrice = (priceMinor?: number, currencyCode?: string) => {
    const amount = Number(priceMinor || 0) / 100
    const code = normalizeCurrency(currencyCode || 'CHF')

    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const headerTitle = computed(() => selectedMenu.value?.name || 'Menu Preview')
  const headerDescription = computed(() => {
    const kitchenName = normalizeString(resolvedKitchen.value?.name)
    const modeLabel =
      selectedMode.value === 'demo'
        ? 'Demo preview'
        : selectedMode.value === 'test'
          ? 'Test preview'
          : 'Console preview'

    if (kitchenName && kitchenAddress.value) {
      return `${kitchenName} · ${kitchenAddress.value} · ${modeLabel}`
    }
    if (kitchenName) {
      return `${kitchenName} · ${modeLabel}`
    }
    return 'Console menu preview'
  })

  const backToKitchen = computed(() => '/console/kitchen/menus')

  return {
    surface,
    requestedMode,
    requestedModeLabel,
    requestedTable,
    requestedCover,
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
    canCheckout,
    checkoutRoute,
    formatPrice,
    headerTitle,
    headerDescription,
    backToKitchen,
  }
}

export type KitchenConsoleMenuSurfaceState = ReturnType<
  typeof useKitchenConsoleMenuSurface
>
