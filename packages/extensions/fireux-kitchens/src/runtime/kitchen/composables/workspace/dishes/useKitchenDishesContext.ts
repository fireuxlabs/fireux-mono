import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
  watch,
  type InjectionKey,
} from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { useKitchenWorkspaceDishes } from './useKitchenWorkspaceDishes'

export type KitchenDishCatalogueKind = 'food' | 'drink'

const catalogueByKind = {
  food: {
    itemKind: 'food',
    singular: 'dish',
    plural: 'dishes',
    title: 'Dishes',
    path: '/workspace/kitchen/food/dishes',
    icon: 'i-lucide-cooking-pot',
  },
  drink: {
    itemKind: 'drink',
    singular: 'drink',
    plural: 'drinks',
    title: 'Drinks',
    path: '/workspace/kitchen/food/drinks',
    icon: 'i-lucide-glass-water',
  },
} as const

export type KitchenDishesContext = ReturnType<
  typeof createKitchenDishesWorkspace
>

const kitchenDishesWorkspaceKey: InjectionKey<KitchenDishesContext> = Symbol(
  'KitchenDishesContext'
)

function createKitchenDishesWorkspace(itemKind: KitchenDishCatalogueKind) {
  const source = useKitchenWorkspaceDishes()
  const catalogue = catalogueByKind[itemKind]
  const pageState = useWorkspacePageState('kitchen')
  const selectedDishId = ref('')
  const dishes = computed(() =>
    source.dishes.value.filter((dish) => dish.item_kind === itemKind)
  )
  const outcome = computed(() =>
    source.outcome.value === 'ready'
      ? dishes.value.length
        ? 'ready'
        : 'empty'
      : source.outcome.value
  )
  const selectedDish = computed(
    () => dishes.value.find((dish) => dish.id === selectedDishId.value) ?? null
  )
  const state = computed(() => ({
    dishes: dishes.value.map((dish) => ({
      id: dish.id,
      name: dish.name,
      image: dish.image,
    })),
    selectedDishId: selectedDishId.value,
  }))
  const derived = computed(() => {
    const status =
      outcome.value === 'error'
        ? 'error'
        : outcome.value === 'pending'
          ? 'loading'
          : outcome.value === 'ready'
            ? 'ready'
            : 'empty'

    return {
      status: status as 'loading' | 'error' | 'empty' | 'ready',
      capability: defineWorkspaceCapabilityContext({
        id: `kitchen.${catalogue.plural}`,
        subject: catalogue.singular === 'dish' ? 'Dish' : 'Drink',
        primitives: {
          create: {
            available:
              !source.readOnly.value &&
              Boolean(source.storageKitchenId.value) &&
              ['ready', 'empty'].includes(outcome.value),
            limit: null,
          },
          read: {
            available: dishes.value.length > 0,
            count: dishes.value.length,
          },
          update: { available: false },
          delete: { available: false },
        },
        natives: [],
      }),
    }
  })

  function select(dishId: string) {
    selectedDishId.value = dishes.value.some((dish) => dish.id === dishId)
      ? dishId
      : ''
  }

  watch(
    source.kitchenId,
    () => {
      selectedDishId.value = ''
    },
    { flush: 'sync' }
  )
  watchEffect(() => {
    if (!['ready', 'empty'].includes(outcome.value)) return
    if (selectedDish.value) return
    selectedDishId.value = dishes.value[0]?.id || ''
  })

  watchEffect(() => {
    pageState.publish({
      [catalogue.plural]: state.value.dishes,
      selectedDishId: state.value.selectedDishId,
      derived: derived.value,
    })
  })

  return {
    ...source,
    dishes,
    outcome,
    selectedDish,
    selectedDishId,
    state,
    derived,
    actions: { select },
    catalogue: { ...catalogue, createPath: `${catalogue.path}/create` },
  }
}

export function provideKitchenDishesContext(
  itemKind: KitchenDishCatalogueKind = 'food'
) {
  const workspace = createKitchenDishesWorkspace(itemKind)
  provide(kitchenDishesWorkspaceKey, workspace)
  return workspace
}

export function useKitchenDishesContext() {
  const workspace = inject(kitchenDishesWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Dishes workspace is not available')
  }

  return workspace
}
