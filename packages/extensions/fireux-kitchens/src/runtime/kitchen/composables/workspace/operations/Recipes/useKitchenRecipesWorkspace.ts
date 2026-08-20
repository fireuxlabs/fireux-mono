import {
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenWorkspaceRecipes } from './useKitchenWorkspaceRecipes'

export type KitchenRecipesWorkspace = ReturnType<
  typeof useKitchenWorkspaceRecipes
>

const kitchenRecipesWorkspaceKey: InjectionKey<KitchenRecipesWorkspace> =
  Symbol('KitchenRecipesWorkspace')

export function provideKitchenRecipesWorkspace() {
  const workspace = useKitchenWorkspaceRecipes()
  provide(kitchenRecipesWorkspaceKey, workspace)
  return workspace
}

export function useKitchenRecipesWorkspace() {
  const workspace = inject(kitchenRecipesWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Recipes workspace is not available')
  }

  return workspace
}
