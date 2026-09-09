import { inject, provide, type InjectionKey } from 'vue'
import { useKitchenWorkspaceIngredients } from './useKitchenWorkspaceIngredients'

export type KitchenIngredientsContext = ReturnType<
  typeof useKitchenWorkspaceIngredients
>

const kitchenIngredientsWorkspaceKey: InjectionKey<KitchenIngredientsContext> =
  Symbol('KitchenIngredientsContext')

export function provideKitchenIngredientsContext() {
  const workspace = useKitchenWorkspaceIngredients()
  provide(kitchenIngredientsWorkspaceKey, workspace)
  return workspace
}

export function useKitchenIngredientsContext() {
  const workspace = inject(kitchenIngredientsWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Ingredients workspace is not available')
  }

  return workspace
}
