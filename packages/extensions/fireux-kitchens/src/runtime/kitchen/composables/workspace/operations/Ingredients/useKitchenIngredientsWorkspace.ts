import { inject, provide, type InjectionKey } from 'vue'
import { useKitchenWorkspaceIngredients } from './useKitchenWorkspaceIngredients'

export type KitchenIngredientsWorkspace = ReturnType<
  typeof useKitchenWorkspaceIngredients
>

const kitchenIngredientsWorkspaceKey: InjectionKey<KitchenIngredientsWorkspace> =
  Symbol('KitchenIngredientsWorkspace')

export function provideKitchenIngredientsWorkspace() {
  const workspace = useKitchenWorkspaceIngredients()
  provide(kitchenIngredientsWorkspaceKey, workspace)
  return workspace
}

export function useKitchenIngredientsWorkspace() {
  const workspace = inject(kitchenIngredientsWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Ingredients workspace is not available')
  }

  return workspace
}
