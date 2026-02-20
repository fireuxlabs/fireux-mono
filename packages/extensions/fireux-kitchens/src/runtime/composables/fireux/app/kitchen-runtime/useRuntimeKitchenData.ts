import { computed, type Ref } from 'vue'
import { useKitchenIngredientFetch } from '../../firestore/runtime-kitchen/ingredients/fetch/useKitchenIngredientFetch'
import { useKitchenOrderFetch } from '../../firestore/runtime-kitchen/orders/fetch/useKitchenOrderFetch'
import { useKitchenMenuStackFetch } from '../../firestore/runtime-kitchen/stack/fetch/useKitchenMenuStackFetch'
import { useKitchenSupplierFetch } from '../../firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch'
import { getReadOnlyKitchenScenario } from './read-only-scenarios'

export function useRuntimeKitchenData(params: {
  id: Ref<string>
  isReadOnly: Ref<boolean>
  kitchenCollectionPath: Ref<string>
}) {
  // Prevent Firestore queries in read-only mode.
  const firestoreKitchenId = computed(() => (params.isReadOnly.value ? '' : params.id.value))
  const enabled = computed(() => !params.isReadOnly.value)

  const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(
    firestoreKitchenId,
    { kitchenCollectionPath: params.kitchenCollectionPath }
  )

  const {
    menus: firestoreMenus,
    dishes: firestoreDishes,
    recipes: firestoreRecipes,
    miseTasks: firestoreMiseTasks,
  } = useKitchenMenuStackFetch(firestoreKitchenId, {
    kitchenCollectionPath: params.kitchenCollectionPath,
  })

  const { suppliers: firestoreSuppliers } = useKitchenSupplierFetch(firestoreKitchenId, {
    kitchenCollectionPath: params.kitchenCollectionPath,
    enabled,
  })

  const { orders: firestoreKitchenOrders } = useKitchenOrderFetch(firestoreKitchenId, {
    kitchenCollectionPath: params.kitchenCollectionPath,
  })

  return computed(() => {
    if (params.isReadOnly.value) {
      if (!params.id.value) {
        return {
          kitchenIngredients: [],
          stations: [],
          menus: [],
          dishes: [],
          recipes: [],
          miseTasks: [],
          teamMembers: [],
          suppliers: [],
          supplierIngredients: [],
          purchases: [],
          kitchenOrders: [],
          incomingOrders: [],
          trainingModules: [],
          haccpChecks: [],
        }
      }

      const scenario = getReadOnlyKitchenScenario(params.id.value)
      return {
        kitchenIngredients: scenario.kitchenIngredients,
        stations: scenario.menuStack.stations,
        menus: scenario.menuStack.menus,
        dishes: scenario.menuStack.dishes,
        recipes: scenario.menuStack.recipes,
        miseTasks: scenario.menuStack.miseTasks,
        teamMembers: scenario.teamMembers,
        suppliers: scenario.procurementStack.suppliers,
        supplierIngredients: scenario.procurementStack.supplierIngredients,
        purchases: scenario.procurementStack.purchases,
        kitchenOrders: scenario.serviceStack.incomingOrders,
        incomingOrders: scenario.serviceStack.incomingOrders,
        trainingModules: scenario.trainingStack.modules,
        haccpChecks: scenario.haccpStack.checks,
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
      kitchenOrders: firestoreKitchenOrders.value ?? [],
      incomingOrders: firestoreKitchenOrders.value ?? [],
      trainingModules: [],
      haccpChecks: [],
    }
  })
}
