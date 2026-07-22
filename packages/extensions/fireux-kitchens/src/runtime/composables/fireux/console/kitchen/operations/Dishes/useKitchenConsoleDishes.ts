// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: project Demo Dishes and their Menu usage without opening a Firestore path.
import { computed } from 'vue'
import { useKitchenDishCollection } from '../../../../firestore/dish/useDish'
import { DishStorage, type Dish } from '../../../../../../models/kitchen/dish.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
}

export type KitchenDishMenuUsage = {
  dishId: string
  menuId: string
  sectionId: string
  itemId: string
  menuName?: string
  sectionLabel?: string
  active?: boolean
}

export function useKitchenConsoleDishes(_options: { resolveMenuSections?: boolean } = {}) {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const demoData = useKitchenConsoleDemoData(
    computed(() => runtime.source.value === 'demo')
  )
  const demoScenario = computed(() => findKitchenConsoleDemoScenario(
    demoData.data.value,
    kitchenId.value
  ))
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    dishes: fetchedDishes,
    pending: dishesPending,
    collectionPath: fetchedCollectionPath,
  } =
    useKitchenDishCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const consoleDishes = computed(() =>
    runtime.source.value === 'demo'
      ? demoScenario.value?.dishes ?? []
      : fetchedDishes.value
  )
  const pending = computed(() =>
    runtime.source.value === 'demo'
      ? demoData.pending.value
      : dishesPending.value
  )
  const collectionPath = computed(() =>
    runtime.source.value === 'demo'
      ? `demo/kitchens/${kitchenId.value}/dishes`
      : fetchedCollectionPath.value
  )
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: DishStorage.collection,
    selectedKitchen,
    kitchenId,
    items: consoleDishes,
    pending,
    collectionPath,
  })
  const sections = computed<KitchenDishSection[]>(() => {
    if (runtime.source.value !== 'demo') return []

    return (demoScenario.value?.menuSections ?? []).map(({ section, items }) => ({
      id: section.id,
      label: section.label,
      dishIds: items.map(item => clean(item.dish_id)).filter(Boolean),
      count: items.length,
    }))
  })
  const menuUsageByDishId = computed<Record<string, KitchenDishMenuUsage[]>>(
    () => {
      if (runtime.source.value !== 'demo') return {}

      const usage: Record<string, KitchenDishMenuUsage[]> = {}
      const scenario = demoScenario.value
      if (!scenario) return usage

      scenario.menuSections.forEach(({ section, items }) => {
        items.forEach((item) => {
          const dishId = clean(item.dish_id)
          if (!dishId) return
          const entries = usage[dishId] ||= []
          entries.push({
            dishId,
            menuId: scenario.kitchenMenu.id,
            sectionId: section.id,
            itemId: item.id,
            menuName: scenario.kitchenMenu.name,
            sectionLabel: section.label,
            active: item.status === 'active' && section.status === 'active',
          })
        })
      })

      return usage
    }
  )

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    dishes: consoleDishes,
    pending,
    sections,
    menuFilters: sections,
    sectionFilters: sections,
    menuUsageByDishId,
    getMenuUsageForDish: (dishId: string) =>
      menuUsageByDishId.value[clean(dishId)] || [],
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      collectionPath: collectionPath.value,
      count: consoleDishes.value.length,
      pending: pending.value,
      readOnly: readOnly.value,
      canWrite: canWrite.value,
    })),
  }
}
