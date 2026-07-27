// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: project Demo Dishes and their Menu usage without opening a Firestore path.
import { computed } from 'vue'
import { useKitchenDishCollection } from '../../../../firestore/dish/useDish'
import { DishStorage, type Dish } from '../../../../../../models/kitchen/dish.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import {
  findKitchenConsoleDemoDishRecords,
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'
import type {
  KitchenDemoDishMenuUsage,
  KitchenDemoDishesOperation,
  KitchenDemoDishSection,
} from '../../../../../../utils/kitchen/demo-dishes'
import {
  buildKitchenDemoDishesOperation,
} from '../../../../../../utils/kitchen/demo-dishes'
import { useKitchenConsoleSupplyWorkspace } from '../Suppliers/useKitchenConsoleSupplyWorkspace'
import { useKitchenConsoleDemoMenuService } from '../../core/useKitchenConsoleDemoMenuService'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenDishSection = KitchenDemoDishSection
export type KitchenDishMenuUsage = KitchenDemoDishMenuUsage

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
    runtime.isDemo
  )
  const demoScenario = computed(() => findKitchenConsoleDemoScenario(
    demoData.data.value,
    kitchenId.value
  ))
  const demoMenuService = useKitchenConsoleDemoMenuService(demoScenario)
  const supply = useKitchenConsoleSupplyWorkspace()
  const demoDishOperationState = computed<{
    operation: KitchenDemoDishesOperation | null
    error?: unknown
  }>(() => {
    if (
      !runtime.isDemo.value ||
      demoData.pending.value ||
      supply.pending.value ||
      demoData.error.value ||
      supply.supplierDemoError.value ||
      supply.ingredientRootError.value
    ) {
      return { operation: null }
    }

    const scenario = demoScenario.value
    if (!scenario) return { operation: null }

    try {
      return {
        operation: buildKitchenDemoDishesOperation({
          scenario,
          supplierScenarios: supply.supplierScenarios.value,
          ingredientRoots: supply.ingredientRoots.value,
        }),
      }
    } catch (error) {
      return { operation: null, error }
    }
  })
  const demoDishOperation = computed(
    () => demoDishOperationState.value.operation
  )
  const demoPending = computed(
    () => demoData.pending.value || supply.pending.value
  )
  const demoError = computed(
    () =>
      demoData.error.value ??
      supply.supplierDemoError.value ??
      supply.ingredientRootError.value ??
      demoDishOperationState.value.error
  )
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const demoDishRecords = computed(() =>
    findKitchenConsoleDemoDishRecords(demoData.data.value, kitchenId.value)
  )
  const {
    dishes: consoleDishes,
    pending,
    error,
    outcome,
    collectionPath,
  } =
    useKitchenDishCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
      recordProvider: {
        active: runtime.isDemo,
        records: demoDishRecords,
        pending: demoPending,
        error: demoError,
        collectionPath: computed(
          () => `demo/kitchens/${kitchenId.value}/dishes`
        ),
      },
  })
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: DishStorage.collection,
    selectedKitchen,
    kitchenId,
    items: consoleDishes,
    pending,
    collectionPath,
  })
  const sections = computed<KitchenDishSection[]>(() => {
    if (!runtime.isDemo.value) return []

    return demoDishOperation.value?.sections ?? []
  })
  const menuUsageByDishId = computed<Record<string, KitchenDishMenuUsage[]>>(
    () => {
      if (!runtime.isDemo.value) return {}

      return Object.fromEntries(
        (demoDishOperation.value?.items ?? []).map(item => [
          clean(item.dish.id),
          item.menuUsage,
        ])
      )
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
    demoScenario,
    demoDishOperation,
    dishes: consoleDishes,
    pending,
    error,
    outcome,
    sections,
    menuFilters: sections,
    sectionFilters: sections,
    menuUsageByDishId,
    getMenuUsageForDish: (dishId: string) =>
      menuUsageByDishId.value[clean(dishId)] || [],
    isDishInService: (dishId: string) =>
      !runtime.isDemo.value
      || demoMenuService.isEntityInService('dishes', dishId),
    getPriceLabelForDish: (dishId: string) => {
      const entries = menuUsageByDishId.value[clean(dishId)] ?? []
      const prices = entries
        .map(entry => Number(entry.price))
        .filter(price => Number.isFinite(price) && price > 0)
      if (!prices.length) return ''

      const currencyCode =
        entries.find(entry => clean(entry.currencyCode))?.currencyCode || 'CHF'
      const price = Math.min(...prices)
      const label = new Intl.NumberFormat('en-CH', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(price)

      return entries.length > 1 ? `From ${label}` : label
    },
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      collectionPath: collectionPath.value,
      count: consoleDishes.value.length,
      pending: pending.value,
      outcome: outcome.value,
      hasError: Boolean(error.value),
      readOnly: readOnly.value,
      canWrite: canWrite.value,
      inServiceCount:
        runtime.isDemo.value
          ? consoleDishes.value.filter(dish =>
              demoMenuService.isEntityInService('dishes', dish.id)
            ).length
          : consoleDishes.value.length,
    })),
  }
}
