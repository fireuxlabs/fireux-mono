import { computed } from 'vue'
import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useKitchenConsoleNav } from '../routing/useKitchenConsoleNav'
import { useRuntimeKitchen } from './useRuntimeKitchen'

export function useRuntimeKitchenConsole() {
  const runtime = useRuntimeKitchen()
  const nav = useKitchenConsoleNav()

  const overview = computed(() => {
    const data = runtime.data.value
    return [
      { key: 'ingredients', label: 'Kitchen Ingredients', count: data.kitchenIngredients?.length ?? 0 },
      { key: 'mise', label: 'Mise Tasks', count: data.miseTasks?.length ?? 0 },
      { key: 'recipes', label: 'Recipes', count: data.recipes?.length ?? 0 },
      { key: 'dishes', label: 'Dishes', count: data.dishes?.length ?? 0 },
      { key: 'menus', label: 'Menus', count: data.menus?.length ?? 0 },
      { key: 'team', label: 'Team Members', count: data.teamMembers?.length ?? 0 },
      { key: 'stations', label: 'Stations', count: data.stations?.length ?? 0 },
      { key: 'suppliers', label: 'Suppliers', count: data.suppliers?.length ?? 0 },
      { key: 'supplierIngredients', label: 'Supplier Ingredients', count: data.supplierIngredients?.length ?? 0 },
      { key: 'purchases', label: 'Orders Out', count: data.purchases?.length ?? 0 },
      { key: 'incomingOrders', label: 'Orders In', count: data.incomingOrders?.length ?? 0 },
      { key: 'trainingModules', label: 'Training Modules', count: data.trainingModules?.length ?? 0 },
      { key: 'haccpChecks', label: 'HACCP Checks', count: data.haccpChecks?.length ?? 0 },
    ]
  })

  const stats = computed(() => ({
    ingredients: overview.value.find((item) => item.key === 'ingredients')?.count ?? 0,
    mise: overview.value.find((item) => item.key === 'mise')?.count ?? 0,
    recipes: overview.value.find((item) => item.key === 'recipes')?.count ?? 0,
    dishes: overview.value.find((item) => item.key === 'dishes')?.count ?? 0,
    menus: overview.value.find((item) => item.key === 'menus')?.count ?? 0,
    team: overview.value.find((item) => item.key === 'team')?.count ?? 0,
    suppliers: overview.value.find((item) => item.key === 'suppliers')?.count ?? 0,
  }))

  const actions = {
    openOverviewTo: '/console/kitchen/overview',
    openMenuTo: '/console/kitchen/menu',
    openTeamTo: '/console/kitchen/team',
    openSuppliersTo: '/console/kitchen/suppliers',
  } as const

  return createScopeConsole({
    runtime,
    navItems: nav.items,
    stats,
    actions,
    extra: {
      kitchen: runtime,
      overview,
    },
  })
}
