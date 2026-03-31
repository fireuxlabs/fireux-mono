import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { createScopeConsole } from 'fireux-core/runtime/composables/fireux/app/console/createScopeConsole'
import { useRuntimeConsoleBase } from 'fireux-core/runtime/composables/fireux/app/console/useRuntimeConsoleBase'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import type { ConsoleKitchen, Kitchen } from '../../../models/kitchen.model'
import type { KitchenIngredient } from '../../../models/ingredient.model'
import type { Menu } from '../../../models/menu.model'
import type { Dish } from '../../../models/dish.model'
import type { Recipe } from '../../../models/recipe.model'
import type { KitchenMiseTask } from '../../../models/kitchen-mise.model'
import type { KitchenOrder } from '../../../models/order.model'
import { getReadOnlyKitchenScenarios } from './read-only-scenarios'
import { useRuntimeKitchenSelection } from './state'
import { useRuntimeKitchen } from './useRuntimeKitchen'

type OwnedKitchenChildRefs = {
  ingredients: Ref<KitchenIngredient[] | undefined>
  menus: Ref<Menu[] | undefined>
  dishes: Ref<Dish[] | undefined>
  recipes: Ref<Recipe[] | undefined>
  miseTasks: Ref<KitchenMiseTask[] | undefined>
  suppliers: Ref<Record<string, unknown>[] | undefined>
  orders: Ref<KitchenOrder[] | undefined>
}

/**
 * Canon kitchen console shell.
 * Wraps the console seam with nav, stats, and overview surface data.
 */
export function useRuntimeKitchenConsole() {
  const runtime = useRuntimeKitchen()
  const { appId } = useFireUXConfig()
  const { uid } = useConsoleEntryState()
  const { canOwnMultipleConsoles } = useUser()
  const nav = useNav(['console'])
  const { firestoreFetchCollection } = useFirestoreRead()
  const { kitchens } = useKitchenFetch()
  const { interface: kitchenInterface } = useKitchenInterface()
  const { setRuntimeKitchen } = useRuntimeKitchenSelection()
  const kitchenSource = firestoreFetchCollection<Kitchen>('kitchens')
  const kitchenOverlays = appId
    ? firestoreFetchCollection<ConsoleKitchen>(`apps/${appId}/kitchens`)
    : null
  const ownedChildRefs = shallowRef<Record<string, OwnedKitchenChildRefs>>({}) as
    ShallowRef<Record<string, OwnedKitchenChildRefs>>

  const accessibleKitchenIds = computed(() => {
    const currentUid = String(uid.value || '').trim()
    if (!currentUid) return new Set<string>()

    const ids = new Set<string>()

    for (const overlay of kitchenOverlays?.value ?? []) {
      const id = String((overlay as any)?.id || '').trim()
      if (!id) continue
      if ((overlay as any)?.console_enabled === false) continue

      const adminIds = Array.isArray((overlay as any)?.admin_ids)
        ? (overlay as any).admin_ids
            .map((value: unknown) => String(value || '').trim())
            .filter(Boolean)
        : []

      if (adminIds.includes(currentUid)) {
        ids.add(id)
      }
    }

    for (const kitchen of kitchens.value ?? []) {
      const id = String((kitchen as any)?.id || '').trim()
      const claimedBy = String((kitchen as any)?.claimed_by || '').trim()
      if (id && claimedBy === currentUid) {
        ids.add(id)
      }
    }

    return ids
  })

  const ownedKitchens = computed(() =>
    (kitchens.value ?? []).filter((entry) =>
      accessibleKitchenIds.value.has(String((entry as any)?.id || '').trim())
    )
  )

  const ownedKitchenPills = computed(() =>
    ownedKitchens.value
      .map((entry) => kitchenInterface(entry))
      .filter((entry): entry is NonNullable<ReturnType<typeof kitchenInterface>> => Boolean(entry))
  )

  const readOnlyScenarios = computed(() => getReadOnlyKitchenScenarios())
  const readOnlyKitchenPills = computed(() =>
    readOnlyScenarios.value
      .map((entry) =>
        kitchenInterface({
          ...(entry.kitchen ?? {}),
          id: String((entry.kitchen as any)?.id || '').trim() || String((entry as any)?.id || '').trim(),
        } as Kitchen)
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof kitchenInterface>> => Boolean(entry))
  )

  watch(
    ownedKitchens,
    (nextKitchens) => {
      if (!appId) return

      const nextRefs = { ...ownedChildRefs.value }

      for (const entry of nextKitchens) {
        const id = String((entry as any)?.id || '').trim()
        if (!id || nextRefs[id]) continue

        nextRefs[id] = {
          ingredients: firestoreFetchCollection<KitchenIngredient>(`apps/${appId}/kitchens/${id}/ingredients`),
          menus: firestoreFetchCollection<Menu>(`apps/${appId}/kitchens/${id}/menus`),
          dishes: firestoreFetchCollection<Dish>(`apps/${appId}/kitchens/${id}/dishes`),
          recipes: firestoreFetchCollection<Recipe>(`apps/${appId}/kitchens/${id}/recipes`),
          miseTasks: firestoreFetchCollection<KitchenMiseTask>(`apps/${appId}/kitchens/${id}/mise`),
          suppliers: firestoreFetchCollection<Record<string, unknown>>(`apps/${appId}/kitchens/${id}/suppliers`),
          orders: firestoreFetchCollection<KitchenOrder>(`apps/${appId}/kitchens/${id}/orders`),
        }
      }

      ownedChildRefs.value = nextRefs
    },
    { immediate: true }
  )

  const selection = useRuntimeConsoleBase({
    runtime,
    owned: ownedKitchens,
    readOnly: readOnlyScenarios,
    canOwnMultiple: canOwnMultipleConsoles,
    ownedId: (entry) => String((entry as any)?.id || '').trim(),
    readOnlyId: (entry) => String((entry.kitchen as any)?.id || '').trim(),
    ownedItem: (entry) => entry,
    readOnlyItem: (entry) => entry.kitchen ?? null,
  })

  const hasActiveKitchen = selection.hasActiveItem
  const activeKitchen = selection.activeItem

  const activeKitchenPill = computed(() =>
    activeKitchen.value ? kitchenInterface(activeKitchen.value as Kitchen) : null
  )
  const canSelectMultipleLive = selection.canSelectMultipleLive
  const canSelectMultipleReadOnly = selection.canSelectMultipleReadOnly
  const showSelector = selection.showSelector

  const ownershipPending = computed(
    () =>
      kitchenSource.value === undefined ||
      (Boolean(appId) && kitchenOverlays?.value === undefined)
  )

  const operatorPending = computed(() =>
    ownedKitchens.value.some((entry) => {
      const id = String((entry as any)?.id || '').trim()
      const refs = ownedChildRefs.value[id]
      if (!refs) return true
      return (
        refs.ingredients.value === undefined ||
        refs.menus.value === undefined ||
        refs.dishes.value === undefined ||
        refs.recipes.value === undefined ||
        refs.miseTasks.value === undefined ||
        refs.suppliers.value === undefined ||
        refs.orders.value === undefined
      )
    })
  )

  const liveOperatorStats = computed(() => {
    const kitchenIds = ownedKitchens.value.map((entry) => String((entry as any)?.id || '').trim())

    return {
      kitchens: ownedKitchens.value.length,
      ingredients: kitchenIds.reduce(
        (sum, id) => sum + (ownedChildRefs.value[id]?.ingredients.value?.length ?? 0),
        0
      ),
      mise: kitchenIds.reduce(
        (sum, id) => sum + (ownedChildRefs.value[id]?.miseTasks.value?.length ?? 0),
        0
      ),
      recipes: kitchenIds.reduce(
        (sum, id) => sum + (ownedChildRefs.value[id]?.recipes.value?.length ?? 0),
        0
      ),
      dishes: kitchenIds.reduce(
        (sum, id) => sum + (ownedChildRefs.value[id]?.dishes.value?.length ?? 0),
        0
      ),
      menus: kitchenIds.reduce(
        (sum, id) => sum + (ownedChildRefs.value[id]?.menus.value?.length ?? 0),
        0
      ),
      suppliers: kitchenIds.reduce(
        (sum, id) => sum + (ownedChildRefs.value[id]?.suppliers.value?.length ?? 0),
        0
      ),
      orders: kitchenIds.reduce(
        (sum, id) => sum + (ownedChildRefs.value[id]?.orders.value?.length ?? 0),
        0
      ),
    }
  })

  const readOnlyOperatorStats = computed(() => ({
    kitchens: readOnlyScenarios.value.length,
    ingredients: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.kitchenIngredients?.length ?? 0),
      0
    ),
    mise: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.menuStack?.miseTasks?.length ?? 0),
      0
    ),
    recipes: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.menuStack?.recipes?.length ?? 0),
      0
    ),
    dishes: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.menuStack?.dishes?.length ?? 0),
      0
    ),
    menus: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.menuStack?.menus?.length ?? 0),
      0
    ),
    suppliers: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.procurementStack?.suppliers?.length ?? 0),
      0
    ),
    orders: readOnlyScenarios.value.reduce(
      (sum, entry) => sum + (entry.serviceStack?.incomingOrders?.length ?? 0),
      0
    ),
  }))

  const isOperatorOverview = selection.isOperatorOverview

  const overview = computed(() => {
    if (isOperatorOverview.value) {
      const stats = runtime.mode.value === 'read-only'
        ? readOnlyOperatorStats.value
        : liveOperatorStats.value

      return [
        { key: 'kitchens', label: 'Kitchens', count: stats.kitchens },
        { key: 'ingredients', label: 'Kitchen Ingredients', count: stats.ingredients },
        { key: 'mise', label: 'Mise Tasks', count: stats.mise },
        { key: 'recipes', label: 'Recipes', count: stats.recipes },
        { key: 'dishes', label: 'Dishes', count: stats.dishes },
        { key: 'menus', label: 'Menus', count: stats.menus },
        { key: 'suppliers', label: 'Suppliers', count: stats.suppliers },
        { key: 'orders', label: 'Orders', count: stats.orders },
      ]
    }

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
    kitchens: isOperatorOverview.value
      ? runtime.mode.value === 'read-only'
        ? readOnlyOperatorStats.value.kitchens
        : liveOperatorStats.value.kitchens
      : hasActiveKitchen.value
        ? 1
        : 0,
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

  const surfaceLinks = [
    { key: 'menu', label: 'Menu', icon: 'i-lucide-book-open', to: '/console/kitchen/menu' },
    { key: 'team', label: 'Team', icon: 'i-lucide-users', to: '/console/kitchen/team' },
    { key: 'suppliers', label: 'Suppliers', icon: 'i-lucide-truck', to: '/console/kitchen/suppliers' },
  ] as const

  const setActiveOwnedKitchen = (kitchenId: string) => {
    const resolvedId = String(kitchenId || '').trim()
    if (!resolvedId) return
    setRuntimeKitchen({
      kitchenId: resolvedId,
      mode: runtime.mode.value === 'read-only' ? 'read-only' : 'live',
    })
  }

  return createScopeConsole({
    runtime,
    navItems: nav.items,
    stats,
    actions,
    extra: {
      kitchen: runtime,
      overview,
      surfaceLinks,
      ownedKitchens,
      ownedKitchenPills,
      readOnlyScenarios,
      readOnlyKitchenPills,
      activeKitchen,
      activeKitchenPill,
      hasActiveKitchen,
      canOwnMultipleConsoles,
      canSelectMultipleLive,
      canSelectMultipleReadOnly,
      showSelector,
      isOperatorOverview,
      ownershipPending,
      operatorPending,
      setActiveOwnedKitchen,
    },
  })
}
