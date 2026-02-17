import { computed, type Ref } from 'vue'
import { getReadOnlyKitchenScenario } from '../../../../dev/read-only-scenarios'
import { useKitchenIngredientFetch } from '../../firestore/ingredient/fetch/useKitchenIngredientFetch'
import { useKitchenMenuStackFetch } from '../../firestore/kitchen/fetch/useKitchenMenuStackFetch'
import { useKitchenSupplierFetch } from '../../firestore/kitchen/fetch/useKitchenSupplierFetch'

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
          incomingOrders: [],
          trainingModules: [],
          haccpChecks: [],
        }
      }

      const scenario = getReadOnlyKitchenScenario(params.id.value)
      return {
        kitchenIngredients: scenario.kitchenIngredients,
        stations: scenario.stacks.menu.stations,
        menus: scenario.stacks.menu.menus,
        dishes: scenario.stacks.menu.dishes,
        recipes: scenario.stacks.menu.recipes,
        miseTasks: scenario.stacks.menu.miseTasks,
        teamMembers: scenario.teamMembers,
        suppliers: scenario.stacks.procurement.suppliers,
        supplierIngredients: scenario.stacks.procurement.supplierIngredients,
        purchases: scenario.stacks.procurement.purchases,
        incomingOrders: scenario.stacks.service.incomingOrders,
        trainingModules: scenario.stacks.training.modules,
        haccpChecks: scenario.stacks.haccp.checks,
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
}
