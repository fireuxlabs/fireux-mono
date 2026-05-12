import { computed, unref, type ComputedRef, type Ref } from 'vue'
import type {
  Menu,
  MenuSection,
  MenuServiceMode,
} from '../../../models/menu.model'
import type { Dish } from '../../../models/dish.model'
import {
  resolveMenuItemView,
  type ResolvedMenuItemView,
} from '../console/kitchen/menu/utils/view/resolveMenuItemView'
import { normalizeString } from '../console/kitchen/paths'
import { resolveMenuDesign } from './kitchen-menu-design'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
type KitchenLike = Record<string, unknown> | null | undefined

export type KitchenMenuMode = '' | MenuServiceMode

export type KitchenMenuItemGroup = {
  key: string
  label: string
  items: ResolvedMenuItemView[]
}

export type KitchenMenuSectionView = MenuSection & {
  itemGroups: KitchenMenuItemGroup[]
}

type UseResolvedKitchenMenuViewOptions = {
  menus: MaybeRef<Menu[] | null | undefined>
  dishes?: MaybeRef<Dish[] | null | undefined>
  requestedMenuId: MaybeRef<string | null | undefined>
  requestedMode: MaybeRef<KitchenMenuMode>
  kitchen: MaybeRef<KitchenLike>
  currencyCode?: MaybeRef<string | null | undefined>
  kitchenAddress: MaybeRef<string | null | undefined>
  headerTitleFallback: string
  headerDescriptionFallback: string
  headerDescriptionSuffix?: MaybeRef<string | null | undefined>
  includeHeaderSuffixWithAddress?: boolean
  emptyMenuSubject: string
  emptyMenuFallback: string
}

export const normalizeKitchenMenuMode = (
  value: unknown
): KitchenMenuMode => {
  const raw = normalizeString(value).toLowerCase()
  if (raw === 'dine_in' || raw === 'dine-in') return 'dine_in'
  if (raw === 'collection') return 'collection'
  if (raw === 'delivery') return 'delivery'
  return ''
}

export const normalizeKitchenMenuCurrency = (value: unknown) => {
  const code = normalizeString(value).toUpperCase()
  return code || 'CHF'
}

export function formatKitchenMenuPrice(
  price?: number,
  currencyCode?: string
) {
  const amount = Number(price || 0)
  const code = normalizeKitchenMenuCurrency(currencyCode || 'CHF')

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
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

export const resolveKitchenMenuModes = (menu: Menu): MenuServiceMode[] => {
  const raw = Array.isArray((menu as any)?.service_modes)
    ? (menu as any).service_modes
    : []

  const normalized = raw
    .map((mode: unknown) => normalizeKitchenMenuMode(mode))
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

  if (!labels.length) return dishId

  const prefixParts = labels.map((label) => {
    const [prefix] = label.split('·')
    return normalizeString(prefix)
  })

  const firstPrefix = normalizeString(prefixParts[0])
  const hasCommonPrefix =
    Boolean(firstPrefix) && prefixParts.every((part) => part === firstPrefix)

  if (hasCommonPrefix) return firstPrefix

  return labels[0] || dishId
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
      `item:${normalizeString(item.id)}`

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

export function resolveKitchenMenuVariantLabel(
  groupLabel: string,
  itemLabel: string
) {
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

export function useResolvedKitchenMenuView(
  options: UseResolvedKitchenMenuViewOptions
) {
  const menus = computed<Menu[]>(() => unref(options.menus) ?? [])
  const dishes = computed<Dish[]>(() => unref(options.dishes) ?? [])
  const requestedMenuId = computed(() =>
    normalizeString(unref(options.requestedMenuId))
  )
  const requestedMode = computed<KitchenMenuMode>(() =>
    normalizeKitchenMenuMode(unref(options.requestedMode))
  )
  const kitchen = computed(() => unref(options.kitchen) ?? null)
  const kitchenCurrencyCode = computed(() =>
    normalizeKitchenMenuCurrency(
      unref(options.currencyCode) || kitchen.value?.currency_code || 'CHF'
    )
  )
  const dishesById = computed(() => {
    const lookup = new Map<string, Dish>()

    for (const dish of dishes.value) {
      const id = normalizeString(dish?.id)
      if (id) lookup.set(id, dish)
    }

    return lookup
  })
  const kitchenAddress = computed(() =>
    normalizeString(unref(options.kitchenAddress))
  )
  const headerDescriptionSuffix = computed(() =>
    normalizeString(unref(options.headerDescriptionSuffix))
  )

  const requestedModeLabel = computed(() => {
    if (requestedMode.value === 'dine_in') return 'Dine-in'
    if (requestedMode.value === 'collection') return 'Collection'
    if (requestedMode.value === 'delivery') return 'Delivery'
    return ''
  })

  const sortedMenus = computed(() =>
    [...menus.value].sort(
      (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
    )
  )

  const isMenuAvailableForMode = (menu: Menu, mode: KitchenMenuMode) => {
    if (!mode) return true
    return resolveKitchenMenuModes(menu).includes(mode)
  }

  const isMenuSelectable = (menu: Menu) =>
    Boolean(menu?.active) && isMenuAvailableForMode(menu, requestedMode.value)

  const activeMenus = computed(() =>
    sortedMenus.value.filter((menu) => isMenuSelectable(menu))
  )

  const activeMenu = computed(() => activeMenus.value[0] ?? null)

  const selectedMenu = computed(() => {
    if (requestedMenuId.value) {
      const requested = activeMenus.value.find(
        (menu) => normalizeString(menu?.id) === requestedMenuId.value
      )
      if (requested) return requested
    }

    return activeMenu.value
  })

  const selectedMenuId = computed(() =>
    normalizeString(selectedMenu.value?.id)
  )

  const menuDesign = computed(() => {
    const mainMenu = menus.value.find(
      (menu) => normalizeString(menu?.id).toLowerCase() === 'main'
    )
    return resolveMenuDesign(selectedMenu.value?.design ?? mainMenu?.design)
  })

  const noMenuDescription = computed(() => {
    if (requestedModeLabel.value) {
      return `${options.emptyMenuSubject} has no active menu available for ${requestedModeLabel.value.toLowerCase()} right now.`
    }
    return options.emptyMenuFallback
  })

  const isSelectedMenu = (menu: Menu) =>
    normalizeString(menu?.id) === selectedMenuId.value

  const sortedSections = computed<KitchenMenuSectionView[]>(() => {
    const menu = selectedMenu.value
    if (!menu) return []

    return [...(menu.sections ?? [])]
      .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
      .map((section) => ({
        ...section,
        itemGroups: buildItemGroups(
          [...(section.items ?? [])]
            .map((item) => {
              const dishId = normalizeString(item?.dish_id)
              return resolveMenuItemView(menu, section, item, {
                dish: dishId ? dishesById.value.get(dishId) : null,
              })
            })
            .filter((item) => item.active)
            .sort(
              (a, b) =>
                Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
            )
        ),
      }))
      .filter((section) => section.itemGroups.length > 0)
  })

  const headerTitle = computed(() =>
    selectedMenu.value ? selectedMenu.value.name : options.headerTitleFallback
  )

  const headerDescription = computed(() => {
    const kitchenName = normalizeString(kitchen.value?.name)
    const suffix = headerDescriptionSuffix.value

    if (kitchenName && kitchenAddress.value) {
      return suffix && options.includeHeaderSuffixWithAddress
        ? `${kitchenName} · ${kitchenAddress.value} · ${suffix}`
        : `${kitchenName} · ${kitchenAddress.value}`
    }

    if (kitchenName && suffix) {
      return `${kitchenName} · ${suffix}`
    }

    if (kitchenName) return kitchenName

    return options.headerDescriptionFallback
  })

  return {
    requestedModeLabel,
    sortedMenus,
    activeMenus,
    activeMenu,
    selectedMenu,
    selectedMenuId,
    menuDesign,
    sortedSections,
    noMenuDescription,
    isMenuAvailableForMode,
    isMenuSelectable,
    isSelectedMenu,
    resolveVariantLabel: resolveKitchenMenuVariantLabel,
    formatPrice: (price?: number, currencyCode?: string) =>
      formatKitchenMenuPrice(
        price,
        currencyCode || kitchenCurrencyCode.value
      ),
    currencyCode: kitchenCurrencyCode,
    headerTitle,
    headerDescription,
  }
}

export type ResolvedKitchenMenuView = ReturnType<
  typeof useResolvedKitchenMenuView
>
