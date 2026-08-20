import {
  computed,
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenWorkspaceDishes } from './useKitchenWorkspaceDishes'

export type KitchenDishCatalogueKind = 'food' | 'drink'

const catalogueByKind = {
  food: { itemKind: 'food', singular: 'dish', plural: 'dishes', title: 'Dishes', path: '/workspace/kitchen/dishes', icon: 'i-lucide-cooking-pot' },
  drink: { itemKind: 'drink', singular: 'drink', plural: 'drinks', title: 'Drinks', path: '/workspace/kitchen/drinks', icon: 'i-lucide-glass-water' },
} as const

export type KitchenDishesWorkspace = ReturnType<typeof createKitchenDishesWorkspace>

const kitchenDishesWorkspaceKey: InjectionKey<KitchenDishesWorkspace> =
  Symbol('KitchenDishesWorkspace')

function createKitchenDishesWorkspace(itemKind: KitchenDishCatalogueKind) {
  const source = useKitchenWorkspaceDishes()
  const catalogue = catalogueByKind[itemKind]

  return {
    ...source,
    dishes: computed(() =>
      source.dishes.value.filter(dish => dish.item_kind === itemKind)
    ),
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
