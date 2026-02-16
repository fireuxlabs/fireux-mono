import { computed, unref, type Ref } from 'vue'
import { getReadOnlyKitchenScenario } from '../../../../dev/read-only-scenarios'
import { useKitchenIngredientFetch } from '../../firestore/ingredient/fetch/useKitchenIngredientFetch'
import { useKitchenMenuStackFetch } from '../../firestore/kitchen/fetch/useKitchenMenuStackFetch'
import { useKitchenSupplierFetch } from '../../firestore/kitchen/fetch/useKitchenSupplierFetch'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import {
  normalizeMode,
  normalizeString,
  resolveRuntimeKitchenCollectionPath,
  type RuntimeKitchenMode,
} from './shared'
import { useRuntimeKitchenSelection } from './state'

export { useRuntimeKitchenSelection } from './state'
export type { RuntimeKitchenMode } from './shared'

type UseRuntimeKitchenParams = {
  kitchenId: string | Ref<string | null | undefined>
  mode: RuntimeKitchenMode | Ref<RuntimeKitchenMode | null | undefined>
}

/**
 * Runtime kitchen resolver
 *
 * Supports:
 * 1) useRuntimeKitchen()                      -> reads from global selection state
 * 2) useRuntimeKitchen({ kitchenId, mode })  -> explicit override
 */
export function useRuntimeKitchen(params?: UseRuntimeKitchenParams) {
  const selection = useRuntimeKitchenSelection()

  const kitchenIdSource = computed(() =>
    params?.kitchenId !== undefined ? unref(params.kitchenId) : selection.runtimeKitchenId.value
  )

  const modeSource = computed(() =>
    params?.mode !== undefined ? unref(params.mode) : selection.runtimeKitchenMode.value
  )

  const id = computed(() => normalizeString(kitchenIdSource.value) || '')
  const mode = computed<RuntimeKitchenMode>(() => normalizeMode(modeSource.value) ?? 'read-only')
  const isReadOnly = computed(() => mode.value === 'read-only')
  const kitchenCollectionPath = computed(() => resolveRuntimeKitchenCollectionPath(mode.value))

  const readOnlyScenario = computed(() => getReadOnlyKitchenScenario(id.value))
  const { kitchen: fetchKitchen } = useKitchenFetch()

  const kitchen = computed(() => {
    if (isReadOnly.value) return readOnlyScenario.value.kitchen
    if (!id.value) return null

    return (
      fetchKitchen(id.value, kitchenCollectionPath.value, {
        hydrate: mode.value !== 'test',
      }).value ?? null
    )
  })

  // Prevent Firestore kitchen-ingredient queries in read-only mode.
  const firestoreKitchenId = computed(() => (isReadOnly.value ? '' : id.value))
  const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(
    firestoreKitchenId,
    {
      kitchenCollectionPath,
    }
  )
  const {
    menus: firestoreMenus,
    dishes: firestoreDishes,
    recipes: firestoreRecipes,
    miseTasks: firestoreMiseTasks,
  } = useKitchenMenuStackFetch(firestoreKitchenId, {
    kitchenCollectionPath,
  })
  const { suppliers: firestoreSuppliers } = useKitchenSupplierFetch(firestoreKitchenId, {
    kitchenCollectionPath,
    enabled: computed(() => !isReadOnly.value),
  })

  const data = computed(() => {
    if (isReadOnly.value) {
      const scenario = readOnlyScenario.value
      return {
        kitchenIngredients: scenario.kitchenIngredients ?? [],
        stations: scenario.menuStack.stations ?? [],
        menus: scenario.menuStack.menus ?? [],
        dishes: scenario.menuStack.dishes ?? [],
        recipes: scenario.menuStack.recipes ?? [],
        miseTasks: scenario.menuStack.miseTasks ?? [],
        teamMembers: scenario.teamMembers ?? [],
        suppliers: scenario.procurementStack?.suppliers ?? [],
        supplierIngredients: scenario.procurementStack?.supplierIngredients ?? [],
        purchases: scenario.procurementStack?.purchases ?? [],
        incomingOrders: scenario.serviceStack?.incomingOrders ?? [],
        trainingModules: scenario.trainingStack?.modules ?? [],
        haccpChecks: scenario.haccpStack?.checks ?? [],
      }
    }

    return {
      kitchenIngredients: firestoreKitchenIngredients.value ?? [],
      stations: [],
      menus: firestoreMenus.value ?? [],
      dishes: firestoreDishes.value ?? [],
      recipes: firestoreRecipes.value ?? [],
      miseTasks: firestoreMiseTasks.value ?? [],
      teamMembers: [],
      suppliers: firestoreSuppliers.value ?? [],
      supplierIngredients: [],
      purchases: [],
      incomingOrders: [],
      trainingModules: [],
      haccpChecks: [],
    }
  })

  return {
    id,
    mode,
    kitchen,
    kitchenCollectionPath,
    data,
  }
}
