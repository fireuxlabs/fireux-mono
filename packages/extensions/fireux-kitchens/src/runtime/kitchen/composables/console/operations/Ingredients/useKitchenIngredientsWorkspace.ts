import { inject, provide, type InjectionKey } from 'vue'
import { useKitchenConsoleIngredients } from './useKitchenConsoleIngredients'

export type KitchenIngredientsWorkspace = ReturnType<
  typeof useKitchenConsoleIngredients
>

const kitchenIngredientsWorkspaceKey: InjectionKey<KitchenIngredientsWorkspace> =
  Symbol('KitchenIngredientsWorkspace')

export function provideKitchenIngredientsWorkspace() {
  const workspace = useKitchenConsoleIngredients()
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
