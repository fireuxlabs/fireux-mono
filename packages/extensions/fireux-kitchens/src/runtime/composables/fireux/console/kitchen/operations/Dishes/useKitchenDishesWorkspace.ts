import {
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'

export type KitchenDishesWorkspace = ReturnType<
  typeof useKitchenConsoleDishes
>

const kitchenDishesWorkspaceKey: InjectionKey<KitchenDishesWorkspace> =
  Symbol('KitchenDishesWorkspace')

export function provideKitchenDishesWorkspace() {
  const workspace = useKitchenConsoleDishes()
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
