import { useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useKitchenCollection } from '../firestore/kitchen/fetch/useKitchenCollection'
import type { Menu } from '../../../models/menu.model'
import type { Dish } from '../../../models/dish.model'
import type { Ingredient } from '../../../models/ingredient.model'
import type { KitchenMiseTask } from '../../../models/kitchen-mise.model'
import { resolveDishSemanticLine } from '../firestore/dish/utils/view/resolveDishSemanticLine'
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

export type KitchenSemanticMenuEntry = {
  id: string
  dishId: string
  name: string
  description: string
  semanticLine: string
  integrityNote: string
}

export type KitchenSemanticMenuSection = {
  id: string
  label: string
  description: string
  entries: KitchenSemanticMenuEntry[]
}

type SemanticMenuJsonSource = {
  id: string
  name?: string
  title?: string
  names?: Partial<Record<string, string>>
}

const normalizeList = (value: unknown) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => normalizeString(entry)).filter(Boolean)))
    : []

const sortBySortOrder = <T extends { sort_order?: number }>(items: T[]) =>
  [...items].sort(
    (a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0)
  )

const localizedName = (
  source: { name?: string; names?: Partial<Record<string, string>> },
  languageCode: string
) => {
  const localized = source.names?.[languageCode]
  return normalizeString(localized) || normalizeString(source.name)
}

const localizedDescription = (
  source: { description?: string; descriptions?: Partial<Record<string, string>> },
  languageCode: string
) => {
  const localized = source.descriptions?.[languageCode]
  return normalizeString(localized) || normalizeString(source.description)
}

export function useKitchenMenu() {
  const route = useRoute()

  const routeKitchenSlug = computed(() => {
    const raw = route.params.kitchenSlug || route.params.slug
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
  const requestedLanguageParam = computed(() => {
    const raw = route.query.lang || route.query.language
    const code = Array.isArray(raw)
      ? normalizeString(raw[0])
      : normalizeString(raw)
    return code.replace(/_/g, '-')
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
      const slugAliases = Array.isArray((entry as any)?.slug_aliases)
        ? (entry as any).slug_aliases.map((alias: unknown) =>
            normalizeString(alias).toLowerCase()
          )
        : []

      return (
        id === key ||
        (slug.length > 0 && slug === keyLower) ||
        slugAliases.includes(keyLower) ||
        (id === 'ChIJ93_ggY-jj0cRTCyLcfBuK2w' &&
          ['luna-picante', 'luna-piccante'].includes(keyLower))
      )
    })

    return found ?? null
  })

  const requestedLanguageCode = computed(() => {
    const explicit = requestedLanguageParam.value
    if (explicit) return explicit

    return (
      normalizeString((resolvedKitchen.value as any)?.language_settings?.default_language) ||
      'de'
    )
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
  const dishesRef = shallowRef(null) as ShallowRef<
    Ref<Dish[] | undefined> | null
  >
  const miseRef = shallowRef(null) as ShallowRef<
    Ref<KitchenMiseTask[] | undefined> | null
  >
  const ingredientsRef = firestoreFetchCollection<Ingredient>('ingredients')

  watch(
    kitchenId,
    (nextKitchenId) => {
      const menusPath = resolveKitchenRuntimeChildCollectionPath({
        kitchenId: nextKitchenId,
        collectionName: 'menus',
      })
      const dishesPath = resolveKitchenRuntimeChildCollectionPath({
        kitchenId: nextKitchenId,
        collectionName: 'dishes',
      })
      const misePath = resolveKitchenRuntimeChildCollectionPath({
        kitchenId: nextKitchenId,
        collectionName: 'mise',
      })

      menusRef.value = menusPath ? firestoreFetchCollection<Menu>(menusPath) : null
      dishesRef.value = dishesPath
        ? firestoreFetchCollection<Dish>(dishesPath)
        : null
      miseRef.value = misePath
        ? firestoreFetchCollection<KitchenMiseTask>(misePath)
        : null
    },
    { immediate: true }
  )

  const menus = computed(() => menusRef.value?.value ?? [])
  const dishes = computed(() => dishesRef.value?.value ?? [])
  const mise = computed(() => miseRef.value?.value ?? [])
  const ingredients = computed(() => ingredientsRef.value ?? [])
  const currencyCode = computed(() =>
    normalizeString((resolvedKitchen.value as any)?.currency_code) || 'CHF'
  )
  const dishesById = computed(() => {
    const map = new Map<string, Dish>()
    dishes.value.forEach((dish) => {
      if (dish.id) map.set(dish.id, dish)
    })
    return map
  })
  const miseById = computed(() => {
    const map = new Map<string, KitchenMiseTask>()
    mise.value.forEach((item) => {
      if (item.id) map.set(item.id, item)
    })
    return map
  })
  const ingredientsById = computed(() => {
    const map = new Map<string, Ingredient>()
    ingredients.value.forEach((ingredient) => {
      if (ingredient.id) map.set(ingredient.id, ingredient)
    })
    return map
  })

  const menuView = useResolvedKitchenMenuView({
    menus,
    dishes,
    requestedMenuId: routeMenuId,
    requestedMode,
    kitchen: resolvedKitchen,
    currencyCode,
    kitchenAddress,
    headerTitleFallback: 'Menu',
    headerDescriptionFallback: 'Public menu',
    headerDescriptionSuffix: 'Public menu',
    includeHeaderSuffixWithAddress: false,
    emptyMenuSubject: 'This kitchen',
    emptyMenuFallback: 'This kitchen has no active public menu right now.',
  })
  const headerTitle = computed(() =>
    menuView.selectedMenu.value
      ? localizedName(menuView.selectedMenu.value, requestedLanguageCode.value)
      : menuView.headerTitle.value
  )

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
  const semanticSections = computed<KitchenSemanticMenuSection[]>(() => {
    const menu = menuView.selectedMenu.value
    if (!menu || !Array.isArray(menu.sections)) return []

    const languageCode = requestedLanguageCode.value

    return sortBySortOrder(menu.sections)
      .map((section) => {
        const excludedIds = normalizeList(section.render_excluded_ids)
        const excludedTerms = normalizeList(section.render_excluded_terms)
        const entries = sortBySortOrder(section.items || [])
          .map((item) => {
            const dishId = normalizeString(item.dish_id)
            if (!dishId) return null

            const dish = dishesById.value.get(dishId)
            if (!dish) return null

            const name = localizedName(dish, languageCode)
            const itemDescription = localizedDescription(item, languageCode)
            const dishDescription = localizedDescription(dish, languageCode)
            const semanticLine = resolveDishSemanticLine({
              dish,
              mise: mise.value,
              ingredients: ingredients.value,
              languageCode,
              excludedIds,
              excludedTerms,
            })
            const integrityNote = normalizeString(
              (item as Record<string, unknown>).integrity_note ||
                (dish as Record<string, unknown>).integrity_note
            )

            return {
              id: item.id,
              dishId,
              name,
              description: itemDescription || dishDescription,
              semanticLine,
              integrityNote,
            }
          })
          .filter((entry): entry is KitchenSemanticMenuEntry => Boolean(entry))

        return {
          id: section.id,
          label: section.label,
          description: section.description,
          entries,
        }
      })
      .filter((section) => section.entries.length > 0)
  })
  const usedDishIds = computed(() =>
    Array.from(
      new Set(
        semanticSections.value.flatMap((section) =>
          section.entries.map((entry) => entry.dishId)
        )
      )
    )
  )
  const usedDishes = computed(() =>
    usedDishIds.value
      .map((id) => dishesById.value.get(id))
      .filter((dish): dish is Dish => Boolean(dish))
  )
  const usedMiseIds = computed(() =>
    Array.from(
      new Set(
        usedDishes.value.flatMap((dish) => normalizeList(dish.mise_ids))
      )
    )
  )
  const usedIngredientIds = computed(() =>
    Array.from(
      new Set(
        usedDishes.value.flatMap((dish) => normalizeList(dish.ingredient_ids))
      )
    )
  )
  const minimalSource = (source: SemanticMenuJsonSource) => ({
    id: source.id,
    name: source.name || source.title || '',
    names: source.names || {},
  })
  const prototypeMenuJson = computed(() => ({
    route: {
      slug: routeKitchenSlug.value,
      menu_id: routeMenuId.value || null,
      language: requestedLanguageCode.value,
    },
    firestore_paths: {
      kitchen: kitchenId.value ? `kitchens/${kitchenId.value}` : '',
      menus: kitchenId.value ? `kitchens/${kitchenId.value}/menus` : '',
      dishes: kitchenId.value ? `kitchens/${kitchenId.value}/dishes` : '',
      mise: kitchenId.value ? `kitchens/${kitchenId.value}/mise` : '',
      ingredients: 'ingredients',
    },
    kitchen: resolvedKitchen.value
      ? {
          id: resolvedKitchen.value.id,
          name: (resolvedKitchen.value as any).name || '',
          slug: (resolvedKitchen.value as any).slug || '',
          address:
            (resolvedKitchen.value as any).short_address ||
            (resolvedKitchen.value as any).formatted_address ||
            '',
        }
      : null,
    menu: menuView.selectedMenu.value || null,
    sections: semanticSections.value,
    dishes: usedDishes.value.map((dish) => ({
      id: dish.id,
      name: dish.name,
      names: dish.names || {},
      description: dish.description || '',
      descriptions: dish.descriptions || {},
      mise_ids: dish.mise_ids,
      ingredient_ids: dish.ingredient_ids,
    })),
    mise: usedMiseIds.value
      .map((id) => miseById.value.get(id))
      .filter((item): item is KitchenMiseTask => Boolean(item))
      .map(minimalSource),
    ingredients: usedIngredientIds.value
      .map((id) => ingredientsById.value.get(id))
      .filter((ingredient): ingredient is Ingredient => Boolean(ingredient))
      .map(minimalSource),
  }))

  return {
    requestedMode,
    requestedModeLabel: menuView.requestedModeLabel,
    requestedTable,
    requestedCover,
    requestedLanguageCode,
    routeKitchenSlug,
    routeKitchenId: routeKitchenSlug,
    routeMenuId,
    loading,
    resolvedKitchen,
    kitchenId,
    kitchenAddress,
    menus,
    dishes,
    mise,
    ingredients,
    currencyCode: menuView.currencyCode,
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
    semanticSections,
    prototypeMenuJson,
    headerTitle,
    headerDescription: menuView.headerDescription,
    backToKitchen,
  }
}

export type KitchenMenuState = ReturnType<typeof useKitchenMenu>
