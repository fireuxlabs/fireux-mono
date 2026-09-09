import { inject, provide, type InjectionKey } from 'vue'
import { useKitchenWorkspaceRecipes } from './useKitchenWorkspaceRecipes'

export type KitchenRecipesContext = ReturnType<
  typeof useKitchenWorkspaceRecipes
>

const kitchenRecipesWorkspaceKey: InjectionKey<KitchenRecipesContext> =
  Symbol('KitchenRecipesContext')

export function provideKitchenRecipesContext() {
  const workspace = useKitchenWorkspaceRecipes()
  provide(kitchenRecipesWorkspaceKey, workspace)
  return workspace
}

export function useKitchenRecipesContext() {
  const workspace = inject(kitchenRecipesWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Recipes workspace is not available')
  }

  return workspace
}
