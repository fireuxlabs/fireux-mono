import { useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, ref, watch } from 'vue'
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
  price: number
  priceLabel: string
  semanticLine: string
  integrityNote: string
}

export type KitchenPublicMenuEntry = {
  id: string
  dishId: string
  name: string
  description: string
  price: number
  priceLabel: string
}

export type KitchenPublicMenuSection = {
  id: string
  label: string
  description: string
  entries: KitchenPublicMenuEntry[]
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

type PublicTranslationRequest = {
  id: string
  sourceLanguage: string
  targetLanguage: string
  sourceText: string
}

const RESTAURANT_MENU_GLOSSARY_VERSION = 'restaurant_menu_v1'

const normalizeList = (value: unknown) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => normalizeString(entry)).filter(Boolean)))
    : []
const legacyDishField = (dish: Dish | null | undefined, key: string) =>
  dish ? (dish as unknown as Record<string, unknown>)[key] : undefined
const legacyDishString = (dish: Dish | null | undefined, key: string) =>
  normalizeString(legacyDishField(dish, key))
const legacyDishList = (dish: Dish | null | undefined, key: string) =>
  normalizeList(legacyDishField(dish, key))

const sortBySortOrder = <T extends { sort_order?: number }>(items: T[]) =>
  [...items].sort(
    (a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0)
  )

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

  const { firestoreFetchCollection } = useFirestoreRead()
  const menusPath = computed(() =>
    resolveKitchenRuntimeChildCollectionPath({
      kitchenId: kitchenId.value,
      collectionName: 'menus',
    })
  )
  const dishesPath = computed(() =>
    resolveKitchenRuntimeChildCollectionPath({
      kitchenId: kitchenId.value,
      collectionName: 'dishes',
    })
  )
  const misePath = computed(() =>
    resolveKitchenRuntimeChildCollectionPath({
      kitchenId: kitchenId.value,
      collectionName: 'mise',
    })
  )
  const menusRef = firestoreFetchCollection<Menu>(menusPath)
  const dishesRef = firestoreFetchCollection<Dish>(dishesPath)
  const miseRef = firestoreFetchCollection<KitchenMiseTask>(misePath)
  const ingredientsRef = firestoreFetchCollection<Ingredient>('ingredients')

  const menus = computed(() => menusRef.value ?? [])
  const dishes = computed(() => dishesRef.value ?? [])
  const mise = computed(() => miseRef.value ?? [])
  const ingredients = computed(() => ingredientsRef.value ?? [])
  const loading = computed(
    () =>
      Boolean(routeKitchenSlug.value) &&
      (kitchensPending.value || Boolean(kitchenId.value && menusRef.value === undefined))
  )
  const translationCache = ref<Record<string, string>>({})
  const translationPendingKeys = new Set<string>()
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
  const defaultLanguageCode = computed(() =>
    normalizeString((resolvedKitchen.value as any)?.language_settings?.default_language) || 'de'
  )

  const normalizeTextMap = (value: unknown): Record<string, string> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

    const map: Record<string, string> = {}
    for (const [language, entry] of Object.entries(value as Record<string, unknown>)) {
      const code = normalizeString(language).replace(/_/g, '-')
      const text = normalizeString(entry)
      if (code && text) map[code] = text
    }
    return map
  }

  const localTranslationKey = (input: PublicTranslationRequest) =>
    [
      input.id,
      RESTAURANT_MENU_GLOSSARY_VERSION,
      input.sourceLanguage,
      input.targetLanguage,
      input.sourceText,
    ].join('\n')

  const resolveTranslationSource = (input: {
    id: string
    textMap?: unknown
    fallbackText?: unknown
    sourceLanguage?: unknown
  }): {
    text: string
    request: PublicTranslationRequest | null
  } => {
    const targetLanguage = requestedLanguageCode.value
    const sourceLanguage =
      normalizeString(input.sourceLanguage).replace(/_/g, '-') ||
      defaultLanguageCode.value
    const textMap = normalizeTextMap(input.textMap)
    const rawSourceText = normalizeString(input.fallbackText)

    if (targetLanguage === sourceLanguage || targetLanguage === defaultLanguageCode.value) {
      return {
        text: rawSourceText || normalizeString(textMap[targetLanguage]) || normalizeString(textMap[sourceLanguage]),
        request: null,
      }
    }

    const inlineTarget = normalizeString(textMap[targetLanguage])
    if (inlineTarget) return { text: inlineTarget, request: null }

    const sourceText =
      (targetLanguage !== 'en' ? normalizeString(textMap.en) : '') ||
      normalizeString(textMap[sourceLanguage]) ||
      rawSourceText
    const requestSourceLanguage =
      (targetLanguage !== 'en' && normalizeString(textMap.en) ? 'en' : sourceLanguage)

    if (!sourceText) return { text: '', request: null }
    if (targetLanguage === requestSourceLanguage || targetLanguage === 'en') {
      return { text: sourceText, request: null }
    }

    const request = {
      id: input.id,
      sourceLanguage: requestSourceLanguage,
      targetLanguage,
      sourceText,
    }
    const cached = translationCache.value[localTranslationKey(request)]
    return {
      text: cached || sourceText,
      request,
    }
  }

  const localizedCachedText = (input: {
    id: string
    textMap?: unknown
    fallbackText?: unknown
    sourceLanguage?: unknown
  }) => resolveTranslationSource(input).text

  const localizedMenuName = (menu: Menu) =>
    localizedCachedText({
      id: `menu:${menu.id}:name`,
      textMap: (menu as any).names,
      fallbackText: menu.name || menu.id,
      sourceLanguage: (menu as any).source_language || defaultLanguageCode.value,
    })

  const localizedMenuDescription = (menu: Menu) =>
    localizedCachedText({
      id: `menu:${menu.id}:description`,
      textMap: (menu as any).descriptions,
      fallbackText: menu.description,
      sourceLanguage: (menu as any).source_language || defaultLanguageCode.value,
    })

  const localizedMenuSectionLabel = (menu: Menu, section: { id: string; label?: string; labels?: Partial<Record<string, string>> }) =>
    localizedCachedText({
      id: `menu:${menu.id}:section:${section.id}:label`,
      textMap: (section as any).labels,
      fallbackText: section.label || section.id,
      sourceLanguage: (menu as any).source_language || defaultLanguageCode.value,
    })

  const localizedMenuItemName = (dish: Dish) =>
    localizedCachedText({
      id: `dish:${dish.id}:name`,
      textMap: dish.names,
      fallbackText: dish.name || dish.id,
      sourceLanguage: legacyDishString(dish, 'source_language') || defaultLanguageCode.value,
    })

  const localizedMenuItemDescription = (
    item: { id: string; description?: string; descriptions?: Partial<Record<string, string>> },
    dish: Dish | null
  ) => {
    const itemText = localizedCachedText({
      id: `menu-item:${item.id}:description`,
      textMap: (item as any).descriptions,
      fallbackText: item.description,
      sourceLanguage: legacyDishString(dish, 'source_language') || defaultLanguageCode.value,
    })
    if (itemText) return itemText
    if (!dish) return ''

    return localizedCachedText({
      id: `dish:${dish.id}:description`,
      textMap: dish.descriptions,
      fallbackText: dish.description,
      sourceLanguage: legacyDishString(dish, 'source_language') || defaultLanguageCode.value,
    })
  }

  const headerTitle = computed(() =>
    menuView.selectedMenu.value
      ? localizedMenuName(menuView.selectedMenu.value)
      : menuView.headerTitle.value
  )

  const resolveMenuTo = (menu: Menu) => {
    const menuId = normalizeString(menu?.id)
    const key = normalizeString(routeKitchenSlug.value || kitchenId.value)
    if (!menuId || !key) return undefined
    const language = requestedLanguageCode.value
    const languageQuery = language && language !== defaultLanguageCode.value
      ? language
      : undefined

    return {
      path: `/kitchens/${encodeURIComponent(key)}/menus/${encodeURIComponent(
        menuId
      )}`,
      query: {
        lang: languageQuery,
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

  const publicSections = computed<KitchenPublicMenuSection[]>(() => {
    const menu = menuView.selectedMenu.value
    if (!menu || !Array.isArray(menu.sections)) return []

    return sortBySortOrder(menu.sections)
      .map((section) => {
        const entries = sortBySortOrder(section.items || [])
          .filter((item) => item?.active !== false)
          .map((item) => {
            const dishId = normalizeString(item.dish_id)
            const dish = dishId ? dishesById.value.get(dishId) ?? null : null
            const fallbackName =
              normalizeString((item as Record<string, unknown>).label) ||
              normalizeString(dishId) ||
              normalizeString(item.id)
            const name = dish ? localizedMenuItemName(dish) : fallbackName
            const description = localizedMenuItemDescription(item, dish)

            return {
              id: item.id,
              dishId,
              name,
              description,
              price: Number(item.price || 0),
              priceLabel: Number(item.price || 0) > 0
                ? menuView.formatPrice(item.price)
                : '',
            }
          })
          .filter((entry) => entry.name || entry.description)

        return {
          id: section.id,
          label: localizedMenuSectionLabel(menu, section),
          description: section.description,
          entries,
        }
      })
      .filter((section) => section.entries.length > 0)
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

            const name = localizedMenuItemName(dish)
            const description = localizedMenuItemDescription(item, dish)
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
              description,
              price: Number(item.price || 0),
              priceLabel: Number(item.price || 0) > 0
                ? menuView.formatPrice(item.price)
                : '',
              semanticLine,
              integrityNote,
            }
          })
          .filter((entry): entry is KitchenSemanticMenuEntry => Boolean(entry))

        return {
          id: section.id,
          label: localizedMenuSectionLabel(menu, section),
          description: section.description,
          entries,
        }
      })
      .filter((section) => section.entries.length > 0)
  })

  const publicTranslationRequests = computed<PublicTranslationRequest[]>(() => {
    const menu = menuView.selectedMenu.value
    const targetLanguage = requestedLanguageCode.value
    if (!menu || targetLanguage === defaultLanguageCode.value || targetLanguage === 'en') {
      return []
    }

    const requests = new Map<string, PublicTranslationRequest>()
    const add = (request: PublicTranslationRequest | null) => {
      if (!request) return
      if (!request.sourceText || request.sourceLanguage === request.targetLanguage) return
      const key = localTranslationKey(request)
      if (translationCache.value[key] || translationPendingKeys.has(key)) return
      requests.set(key, request)
    }

    add(resolveTranslationSource({
      id: `menu:${menu.id}:name`,
      textMap: (menu as any).names,
      fallbackText: menu.name || menu.id,
      sourceLanguage: (menu as any).source_language || defaultLanguageCode.value,
    }).request)
    add(resolveTranslationSource({
      id: `menu:${menu.id}:description`,
      textMap: (menu as any).descriptions,
      fallbackText: menu.description,
      sourceLanguage: (menu as any).source_language || defaultLanguageCode.value,
    }).request)

    for (const section of menu.sections || []) {
      add(resolveTranslationSource({
        id: `menu:${menu.id}:section:${section.id}:label`,
        textMap: (section as any).labels,
        fallbackText: section.label || section.id,
        sourceLanguage: (menu as any).source_language || defaultLanguageCode.value,
      }).request)

      for (const item of section.items || []) {
        const dishId = normalizeString(item.dish_id)
        const dish = dishId ? dishesById.value.get(dishId) : null

        add(resolveTranslationSource({
          id: `menu-item:${item.id}:description`,
          textMap: (item as any).descriptions,
          fallbackText: item.description,
          sourceLanguage:
            legacyDishString(dish, 'source_language') ||
            (menu as any).source_language ||
            defaultLanguageCode.value,
        }).request)

        if (dish) {
          add(resolveTranslationSource({
            id: `dish:${dish.id}:description`,
            textMap: dish.descriptions,
            fallbackText: dish.description,
            sourceLanguage:
              legacyDishString(dish, 'source_language') ||
              defaultLanguageCode.value,
          }).request)
        }
      }
    }

    return Array.from(requests.values())
  })

  watch(
    publicTranslationRequests,
    async (requests) => {
      if (import.meta.server || !requests.length) return

      const targetLanguage = requestedLanguageCode.value
      const activeKitchenId = kitchenId.value
      const activeMenuId = normalizeString(menuView.selectedMenu.value?.id)
      if (!activeKitchenId || !activeMenuId) return

      const pendingKeys = requests.map(localTranslationKey)
      pendingKeys.forEach((key) => translationPendingKeys.add(key))

      try {
        const response = await fetch('/api/translation-cache', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            domain: 'restaurant_menu',
            glossaryVersion: RESTAURANT_MENU_GLOSSARY_VERSION,
            kitchenId: activeKitchenId,
            menuId: activeMenuId,
            targetLanguage,
            items: requests.map((request) => ({
              id: request.id,
              sourceLanguage: request.sourceLanguage,
              sourceText: request.sourceText,
            })),
          }),
        })

        if (!response.ok) throw new Error(`Translation cache failed with status ${response.status}`)
        const data = await response.json().catch(() => null) as {
          items?: Array<{
            id?: string
            source_language?: string
            target_language?: string
            source_text?: string
            translated_text?: string
          }>
          failures?: unknown[]
        } | null
        const nextCache = { ...translationCache.value }

        for (const item of data?.items || []) {
          const translated = normalizeString(item.translated_text)
          if (!translated) continue
          const key = localTranslationKey({
            id: normalizeString(item.id),
            sourceLanguage: normalizeString(item.source_language),
            targetLanguage: normalizeString(item.target_language),
            sourceText: normalizeString(item.source_text),
          })
          if (key) nextCache[key] = translated
        }

        translationCache.value = nextCache

        if (data?.failures?.length && import.meta.dev) {
          console.warn('[useKitchenMenu] translation cache failures', data.failures)
        }
      } catch (error) {
        if (import.meta.dev) console.warn('[useKitchenMenu] translation cache request failed', error)
      } finally {
        pendingKeys.forEach((key) => translationPendingKeys.delete(key))
      }
    },
    { immediate: true }
  )
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
        usedDishes.value.flatMap((dish) => legacyDishList(dish, 'mise_ids'))
      )
    )
  )
  const usedIngredientIds = computed(() =>
    Array.from(
      new Set(
        usedDishes.value.flatMap((dish) =>
          legacyDishList(dish, 'ingredient_ids')
        )
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
      mise_ids: legacyDishList(dish, 'mise_ids'),
      ingredient_ids: legacyDishList(dish, 'ingredient_ids'),
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
    defaultLanguageCode,
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
    localizedMenuName,
    localizedMenuDescription,
    resolveVariantLabel: menuView.resolveVariantLabel,
    formatPrice: menuView.formatPrice,
    publicSections,
    semanticSections,
    prototypeMenuJson,
    headerTitle,
    headerDescription: menuView.headerDescription,
    backToKitchen,
  }
}

export type KitchenMenuState = ReturnType<typeof useKitchenMenu>
