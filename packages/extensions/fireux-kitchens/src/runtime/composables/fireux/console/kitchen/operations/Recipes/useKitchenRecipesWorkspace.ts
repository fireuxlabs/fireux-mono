import {
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenConsoleRecipes } from './useKitchenConsoleRecipes'

export type KitchenRecipesWorkspace = ReturnType<
  typeof useKitchenConsoleRecipes
>

const kitchenRecipesWorkspaceKey: InjectionKey<KitchenRecipesWorkspace> =
  Symbol('KitchenRecipesWorkspace')

export function provideKitchenRecipesWorkspace() {
  const workspace = useKitchenConsoleRecipes()
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
