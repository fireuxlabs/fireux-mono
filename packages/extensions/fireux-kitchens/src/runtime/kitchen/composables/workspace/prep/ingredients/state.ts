import { inject, provide, type InjectionKey } from 'vue'
import { useKitchenWorkspacePrepIngredients } from './useKitchenWorkspacePrepIngredients'

export type KitchenPrepIngredients = ReturnType<
  typeof useKitchenWorkspacePrepIngredients
>

const kitchenIngredientsWorkspaceKey: InjectionKey<KitchenPrepIngredients> =
  Symbol('KitchenPrepIngredients')

export function provideKitchenWorkspacePrepIngredients() {
  const workspace = useKitchenWorkspacePrepIngredients()
  provide(kitchenIngredientsWorkspaceKey, workspace)
  return workspace
}

export function requireKitchenWorkspacePrepIngredients() {
  const workspace = inject(kitchenIngredientsWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Ingredients workspace is not available')
  }

  return workspace
}
