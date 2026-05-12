import { useRoute, useState } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import type { OrderLine } from 'fireux-orders/runtime/models/order.model'
import type { Menu } from '../../../models/menu.model'
import type {
  ResolvedMenuItemView,
} from '../console/kitchen/menu/utils/view/resolveMenuItemView'
import { useKitchenConsoleMenus } from './kitchen-console/useKitchenConsoleMenus'
import { useKitchenConsole } from './kitchen-console/useKitchenConsole'
import {
  normalizeKitchenMenuCurrency,
  normalizeKitchenMenuMode,
  type KitchenMenuItemGroup,
  useResolvedKitchenMenuView,
} from './kitchen-menu-view'
import type { KitchenMenuSurfacePresentation } from './useKitchenMenuSurface'

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

const normalizeSurface = (value: unknown): KitchenMenuSurfacePresentation => {
  const raw = normalizeString(value).toLowerCase()
  return raw === 'kiosk' ? 'kiosk' : 'qr'
}

const normalizeCurrency = normalizeKitchenMenuCurrency

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
  const { menus, dishes, pending } = useKitchenConsoleMenus()

  const routeMenuId = computed(() => {
    const rawParam = route.query.menuId
    return Array.isArray(rawParam)
      ? normalizeString(rawParam[0])
      : normalizeString(rawParam)
  })

  const surface = computed<KitchenMenuSurfacePresentation>(() =>
    normalizeSurface(route.query.surface)
  )

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

  const resolvedKitchen = computed(() => selectedKitchen.value ?? null)
  const kitchenId = computed(() => normalizeString(resolvedKitchen.value?.id))
  const kitchenCurrencyCode = computed(() =>
    normalizeCurrency((resolvedKitchen.value as any)?.currency_code || 'CHF')
  )
  const kitchenAddress = computed(() =>
    normalizeString(
      (resolvedKitchen.value as any)?.short_address ||
        (resolvedKitchen.value as any)?.formatted_address
    )
  )
  const loading = computed(
    () => Boolean(kitchenId.value) && Boolean(pending.value)
  )

  const headerDescriptionSuffix = computed(() =>
    selectedMode.value === 'demo'
      ? 'Demo preview'
      : selectedMode.value === 'test'
        ? 'Test preview'
        : 'Console preview'
  )

  const menuView = useResolvedKitchenMenuView({
    menus,
    dishes,
    requestedMenuId: routeMenuId,
    requestedMode,
    kitchen: resolvedKitchen,
    currencyCode: kitchenCurrencyCode,
    kitchenAddress,
    headerTitleFallback: 'Menu Preview',
    headerDescriptionFallback: 'Console menu preview',
    headerDescriptionSuffix,
    includeHeaderSuffixWithAddress: true,
    emptyMenuSubject: 'This kitchen',
    emptyMenuFallback: 'This kitchen has no active menu open for preview right now.',
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
        ? menuView.resolveVariantLabel(group.label, item.label)
        : normalizeString(item?.label) || 'Menu item'

    try {
      const result = addLine({
        scope_type: 'kitchen',
        scope_id: kitchenId.value,
        kitchen_id: kitchenId.value,
        dish_id: normalizeString(item?.dish_id),
        label,
        price_minor: Math.round(Number(item?.price || 0) * 100),
        currency_code: kitchenCurrencyCode.value,
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
      menuId: menuView.selectedMenuId.value || undefined,
      surface: surface.value || undefined,
      mode: requestedMode.value || undefined,
      table: requestedTable.value || undefined,
      cover: requestedCover.value || undefined,
    },
  }))

  const backToKitchen = computed(() => '/console/kitchen/menus')

  return {
    surface,
    requestedMode,
    requestedModeLabel: menuView.requestedModeLabel,
    requestedTable,
    requestedCover,
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
    basketKitchenMismatch,
    basketItems,
    itemCount,
    subtotalMinor,
    currencyCode,
    incrementAt,
    decrementAt,
    removeAt,
    lineKey,
    isMenuAvailableForMode: menuView.isMenuAvailableForMode,
    isMenuSelectable: menuView.isMenuSelectable,
    isSelectedMenu: menuView.isSelectedMenu,
    resolveMenuTo,
    resolveVariantLabel: menuView.resolveVariantLabel,
    handleAddToBasket,
    canCheckout,
    checkoutRoute,
    formatPrice: menuView.formatPrice,
    headerTitle: menuView.headerTitle,
    headerDescription: menuView.headerDescription,
    backToKitchen,
  }
}

export type KitchenConsoleMenuSurfaceState = ReturnType<
  typeof useKitchenConsoleMenuSurface
>
