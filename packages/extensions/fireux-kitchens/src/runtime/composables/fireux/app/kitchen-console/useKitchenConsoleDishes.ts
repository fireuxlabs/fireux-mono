import { computed } from 'vue'
import { useDishCollection } from '../../firestore/dish/fetch/useDishCollection'
import { useIngredientFetch } from '../../firestore/ingredient/fetch/useIngredientFetch'
import type { Dish } from '../../../../models/dish.model'
import type { Ingredient } from '../../../../models/ingredient.model'
import type { KitchenMiseTask } from '../../../../models/kitchen-mise.model'
import type { Menu } from '../../../../models/menu.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'
import { useKitchenMiseCollection } from '../../firestore/runtime-kitchen/mise/fetch/useKitchenMiseCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
}

export type KitchenDishMenuUsage = {
  dishId: string
  menuId: string
  menuName: string
  menuSort: number
  sectionId: string
  sectionLabel: string
  sectionSort: number
  itemId: string
  itemLabel: string
  itemSort: number
  price: number
  currencyCode: string
  active: boolean
}

export type KitchenDishSemanticPreview = {
  dishId: string
  semanticLine: string
  miseCount: number
  ingredientCount: number
  missingMiseIds: string[]
  missingIngredientIds: string[]
  hasSemanticComponents: boolean
}

type UseKitchenConsoleDishesOptions = {
  resolveMenuSections?: boolean
}

export function useKitchenConsoleDishes(
  options: UseKitchenConsoleDishesOptions = {}
) {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { dishes: liveDishes, pending: livePending, collectionPath } =
    useDishCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
    })
  const { miseTasks } = useKitchenMiseCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const { ingredients } = useIngredientFetch()
  const sectionFetchKitchenId = computed(() =>
    options.resolveMenuSections === false ? '' : fetchKitchenId.value
  )
  const {
    menus: liveSectionMenus,
    pending: liveSectionMenusPending,
    collectionPath: sectionMenusCollectionPath,
  } = useKitchenMenuCollection(sectionFetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: 'dishes',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveDishes,
    livePending,
    collectionPath,
  })
  const sectionMenusPage = useKitchenConsoleReadPage<Menu>({
    collectionName: 'menus',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveSectionMenus,
    livePending: liveSectionMenusPending,
    collectionPath: sectionMenusCollectionPath,
  })
  const dishes = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const miseById = computed(() => {
    const map = new Map<string, KitchenMiseTask>()
    ;(miseTasks.value || []).forEach((item) => {
      const id = normalizeString(item?.id)
      if (id) map.set(id, item)
    })
    return map
  })
  const ingredientsById = computed(() => {
    const map = new Map<string, Ingredient>()
    ;(ingredients.value || []).forEach((ingredient) => {
      const id = normalizeString(ingredient?.id)
      if (id) map.set(id, ingredient)
    })
    return map
  })
  const sectionMenus = computed(() =>
    options.resolveMenuSections === false
      ? []
      : sectionMenusPage.collection.value.items
  )
  const kitchenCurrencyCode = computed(
    () =>
      normalizeString(
        (selectedKitchen.value as Record<string, unknown> | null)?.currency_code
      ) || 'CHF'
  )

  const sections = computed<KitchenDishSection[]>(() => {
    const dishIdsInScope = new Set(
      dishes.value
        .map((dish) => normalizeString(dish?.id))
        .filter(Boolean)
    )

    return sectionMenus.value
      .map((menu) => {
        const menuId = normalizeString(menu?.id)
        const menuName = normalizeString(menu?.name)
        const menuSort = Number(menu?.sort_order ?? 0)
        const sections = Array.isArray(menu?.sections) ? menu.sections : []
        const dishIds = Array.from(
          new Set(
            sections.flatMap((section) => {
              const items = Array.isArray(section?.items) ? section.items : []

              return items
                .map((item) => normalizeString(item?.dish_id))
                .filter((dishId) => dishIdsInScope.has(dishId))
            })
          )
        )

        return {
          id: menuId,
          label: menuName,
          menuId,
          menuName,
          menuSort,
          dishIds,
          count: dishIds.length,
        }
      })
      .filter((menu) => menu.id && menu.dishIds.length > 0)
      .sort((a, b) => {
        if (a.menuSort !== b.menuSort) return a.menuSort - b.menuSort
        return a.menuName.localeCompare(b.menuName)
      })
      .map(({ id, label, dishIds, count }) => ({
        id,
        label,
        dishIds,
        count,
      }))
  })
  const menuUsageByDishId = computed<Record<string, KitchenDishMenuUsage[]>>(() => {
    const dishIdsInScope = new Set(
      dishes.value
        .map((dish) => normalizeString(dish?.id))
        .filter(Boolean)
    )

    const usage = sectionMenus.value.reduce<Record<string, KitchenDishMenuUsage[]>>(
      (acc, menu) => {
        const menuId = normalizeString(menu?.id)
        const menuName = normalizeString(menu?.name) || menuId
        const menuSort = Number(menu?.sort_order ?? 0)
        const menuActive = menu?.active !== false
        const sections = Array.isArray(menu?.sections) ? menu.sections : []

        sections.forEach((section) => {
          const sectionId = normalizeString(section?.id)
          const sectionLabel = normalizeString(section?.label) || sectionId
          const sectionSort = Number(section?.sort_order ?? 0)
          const items = Array.isArray(section?.items) ? section.items : []

          items.forEach((item) => {
            const dishId = normalizeString(item?.dish_id)
            if (!dishId || !dishIdsInScope.has(dishId)) return

            const entry: KitchenDishMenuUsage = {
              dishId,
              menuId,
              menuName,
              menuSort,
              sectionId,
              sectionLabel,
              sectionSort,
              itemId: normalizeString(item?.id),
              itemLabel: normalizeString(item?.label),
              itemSort: Number(item?.sort_order ?? 0),
              price: Number(item?.price || 0),
              currencyCode: kitchenCurrencyCode.value,
              active: menuActive && item?.active !== false,
            }

            acc[dishId] = [...(acc[dishId] || []), entry]
          })
        })

        return acc
      },
      {}
    )

    Object.values(usage).forEach((entries) => {
      entries.sort((a, b) => {
        if (a.menuSort !== b.menuSort) return a.menuSort - b.menuSort
        if (a.menuName !== b.menuName) return a.menuName.localeCompare(b.menuName)
        if (a.sectionSort !== b.sectionSort) return a.sectionSort - b.sectionSort
        if (a.sectionLabel !== b.sectionLabel) {
          return a.sectionLabel.localeCompare(b.sectionLabel)
        }
        if (a.itemSort !== b.itemSort) return a.itemSort - b.itemSort
        return a.itemLabel.localeCompare(b.itemLabel)
      })
    })

    return usage
  })
  const getMenuUsageForDish = (dishId: string) =>
    menuUsageByDishId.value[normalizeString(dishId)] || []
  const sourceName = (source: Record<string, unknown> | undefined) => {
    if (!source) return ''
    const names =
      source.names && typeof source.names === 'object' && !Array.isArray(source.names)
        ? (source.names as Record<string, unknown>)
        : {}

    return (
      normalizeString(names.en) ||
      normalizeString(source.name) ||
      normalizeString(source.title) ||
      normalizeString(source.id)
    )
  }
  const resolvePreviewGroup = (
    ids: string[],
    sourcesById: Map<string, Record<string, unknown>>
  ) => {
    const names: string[] = []
    const missing: string[] = []

    ids.forEach((id) => {
      const source = sourcesById.get(id)
      if (!source) {
        missing.push(id)
        return
      }

      const name = sourceName(source)
      if (name) names.push(name)
    })

    return { names, missing }
  }
  const semanticPreviewByDishId = computed<Record<string, KitchenDishSemanticPreview>>(() => {
    const previews: Record<string, KitchenDishSemanticPreview> = {}
    const miseSources = miseById.value as Map<string, Record<string, unknown>>
    const ingredientSources = ingredientsById.value as Map<string, Record<string, unknown>>

    dishes.value.forEach((dish) => {
      const dishId = normalizeString(dish?.id)
      if (!dishId) return

      const miseIds = Array.isArray(dish?.mise_ids)
        ? dish.mise_ids.map((id) => normalizeString(id)).filter(Boolean)
        : []
      const ingredientIds = Array.isArray(dish?.ingredient_ids)
        ? dish.ingredient_ids.map((id) => normalizeString(id)).filter(Boolean)
        : []
      const resolvedMise = resolvePreviewGroup(miseIds, miseSources)
      const resolvedIngredients = resolvePreviewGroup(ingredientIds, ingredientSources)
      const names = [...resolvedMise.names, ...resolvedIngredients.names]

      previews[dishId] = {
        dishId,
        semanticLine: names.join(', '),
        miseCount: miseIds.length,
        ingredientCount: ingredientIds.length,
        missingMiseIds: resolvedMise.missing,
        missingIngredientIds: resolvedIngredients.missing,
        hasSemanticComponents: Boolean(miseIds.length || ingredientIds.length),
      }
    })

    return previews
  })
  const semanticPreviewStats = computed(() => {
    const previews = Object.values(semanticPreviewByDishId.value)
    return {
      dishCount: dishes.value.length,
      withSemanticPreview: previews.filter((preview) => preview.semanticLine).length,
      withoutSemanticPreview: previews.filter((preview) => !preview.semanticLine).length,
      missingMiseIds: Array.from(
        new Set(previews.flatMap((preview) => preview.missingMiseIds))
      ),
      missingIngredientIds: Array.from(
        new Set(previews.flatMap((preview) => preview.missingIngredientIds))
      ),
    }
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: dishes.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
    sectionsCount: sections.value.length,
    semanticPreview: semanticPreviewStats.value,
    menuFilterCount: sections.value.length,
    menuUsageDishCount: Object.keys(menuUsageByDishId.value).length,
    menuUsageCount: Object.values(menuUsageByDishId.value).reduce(
      (total, entries) => total + entries.length,
      0
    ),
  }))

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    dishes,
    pending,
    sections,
    menuUsageByDishId,
    getMenuUsageForDish,
    semanticPreviewByDishId,
    semanticPreviewStats,
    debug,
  }
}
