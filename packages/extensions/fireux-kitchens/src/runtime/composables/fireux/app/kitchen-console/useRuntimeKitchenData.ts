import { computed, type Ref } from 'vue'
import { useConsoleXData } from 'fireux-core/runtime/composables/fireux/console/useConsoleXData'
import type { Dish } from '../../../../models/dish.model'
import type { KitchenIngredient } from '../../../../models/ingredient.model'
import type { KitchenMiseTask } from '../../../../models/kitchen-mise.model'
import type { Menu } from '../../../../models/menu.model'
import type { Recipe } from '../../../../models/recipe.model'
import { useKitchenDishCollection } from '../../firestore/runtime-kitchen/dish/fetch/useKitchenDishCollection'
import { useKitchenIngredientFetch } from '../../firestore/runtime-kitchen/ingredients/fetch/useKitchenIngredientFetch'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'
import { useKitchenMiseCollection } from '../../firestore/runtime-kitchen/mise/fetch/useKitchenMiseCollection'
import { useKitchenOrderFetch } from '../../firestore/runtime-kitchen/orders/fetch/useKitchenOrderFetch'
import { useKitchenRecipeCollection } from '../../firestore/runtime-kitchen/recipe/fetch/useKitchenRecipeCollection'
import { useKitchenSupplierFetch } from '../../firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch'
import { getDemoKitchen } from './demo-scenarios'

type RuntimeKitchenDataShape = {
  kitchenIngredients: KitchenIngredient[]
  stations: unknown[]
  menus: Menu[]
  dishes: Dish[]
  recipes: Recipe[] | Record<string, unknown>[]
  miseTasks: KitchenMiseTask[]
  teamMembers: unknown[]
  suppliers: Record<string, unknown>[]
  supplierIngredients: unknown[]
  purchases: unknown[]
  kitchenOrders: Record<string, unknown>[]
  incomingOrders: Record<string, unknown>[]
  trainingModules: unknown[]
  haccpChecks: unknown[]
}

const emptyKitchenData = (): RuntimeKitchenDataShape => ({
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
})

export function useRuntimeKitchenData(params: {
  id: Ref<string>
  isDemo: Ref<boolean>
  kitchenCollectionPath: Ref<string>
}) {
  // Prevent Firestore queries in demo mode.
  const firestoreKitchenId = computed(() => (params.isDemo.value ? '' : params.id.value))
  const enabled = computed(() => !params.isDemo.value)

  const {
    ingredients: firestoreKitchenIngredients,
    pending: ingredientsPending,
  } = useKitchenIngredientFetch(firestoreKitchenId, {
    kitchenCollectionPath: params.kitchenCollectionPath,
  })

  const { menus: firestoreMenus, pending: menusPending } = useKitchenMenuCollection(
    firestoreKitchenId,
    {
      kitchenCollectionPath: params.kitchenCollectionPath,
    }
  )

  const { dishes: firestoreDishes, pending: dishesPending } =
    useKitchenDishCollection(firestoreKitchenId, {
      kitchenCollectionPath: params.kitchenCollectionPath,
    })

  const { recipes: firestoreRecipes, pending: recipesPending } =
    useKitchenRecipeCollection(firestoreKitchenId, {
      kitchenCollectionPath: params.kitchenCollectionPath,
    })

  const { miseTasks: firestoreMiseTasks, pending: misePending } =
    useKitchenMiseCollection(firestoreKitchenId, {
      kitchenCollectionPath: params.kitchenCollectionPath,
    })

  const { suppliers: firestoreSuppliers, pending: suppliersPending } =
    useKitchenSupplierFetch(firestoreKitchenId, {
      kitchenCollectionPath: params.kitchenCollectionPath,
      enabled,
    })

  const { orders: firestoreKitchenOrders, pending: ordersPending } =
    useKitchenOrderFetch(firestoreKitchenId, {
      kitchenCollectionPath: params.kitchenCollectionPath,
    })

  const liveData = computed<RuntimeKitchenDataShape>(() => ({
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
  }))

  const pendingCollections = computed(
    () =>
      ingredientsPending.value ||
      menusPending.value ||
      dishesPending.value ||
      recipesPending.value ||
      misePending.value ||
      suppliersPending.value ||
      ordersPending.value
  )

  const demoData = computed<RuntimeKitchenDataShape>(() => {
    if (!params.id.value) return emptyKitchenData()

    const scenario = getDemoKitchen(params.id.value)
    if (!scenario) return emptyKitchenData()

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
  })

  return useConsoleXData<RuntimeKitchenDataShape>({
    id: params.id,
    isDemo: params.isDemo,
    live: () => ({
      pendingCollections,
      data: liveData,
    }),
    demo: () => ({
      data: demoData,
    }),
  })
}
