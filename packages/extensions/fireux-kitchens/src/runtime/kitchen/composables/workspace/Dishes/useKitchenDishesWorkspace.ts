import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
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
    path: '/workspace/kitchen/dishes',
    icon: 'i-lucide-cooking-pot',
  },
  drink: {
    itemKind: 'drink',
    singular: 'drink',
    plural: 'drinks',
    title: 'Drinks',
    path: '/workspace/kitchen/drinks',
    icon: 'i-lucide-glass-water',
  },
} as const

export type KitchenDishesWorkspace = ReturnType<
  typeof createKitchenDishesWorkspace
>

const kitchenDishesWorkspaceKey: InjectionKey<KitchenDishesWorkspace> = Symbol(
  'KitchenDishesWorkspace'
)

function createKitchenDishesWorkspace(itemKind: KitchenDishCatalogueKind) {
  const source = useKitchenWorkspaceDishes()
  const catalogue = catalogueByKind[itemKind]
  const pageState = useWorkspacePageState('kitchen')
  const selectedDishId = ref('')
  const dishes = computed(() =>
    source.dishes.value.filter((dish) => dish.item_kind === itemKind)
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
    const status = !source.kitchenId.value
      ? 'empty'
      : source.pending.value
        ? 'loading'
        : source.error.value
          ? 'error'
          : dishes.value.length
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
              Boolean(source.kitchenId.value) &&
              !source.error.value,
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

  watchEffect(() => {
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
    selectedDish,
    selectedDishId,
    state,
    derived,
    actions: { select },
    catalogue: { ...catalogue, createPath: `${catalogue.path}/create` },
  }
}

export function provideKitchenDishesWorkspace(
  itemKind: KitchenDishCatalogueKind = 'food'
) {
  const workspace = createKitchenDishesWorkspace(itemKind)
  provide(kitchenDishesWorkspaceKey, workspace)
  return workspace
}

export function useKitchenDishesWorkspace() {
  const workspace = inject(kitchenDishesWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Dishes workspace is not available')
  }

  return workspace
}
