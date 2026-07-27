import {
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenConsoleMiseTask } from './useKitchenConsoleMiseTask'

export type KitchenMiseTaskWorkspace = ReturnType<
  typeof useKitchenConsoleMiseTask
>

const kitchenMiseTaskWorkspaceKey: InjectionKey<KitchenMiseTaskWorkspace> =
  Symbol('KitchenMiseTaskWorkspace')

export function provideKitchenMiseTaskWorkspace() {
  const workspace = useKitchenConsoleMiseTask()
  provide(kitchenMiseTaskWorkspaceKey, workspace)
  return workspace
}

export function useKitchenMiseTaskWorkspace() {
  const workspace = inject(kitchenMiseTaskWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Mise task workspace is not available')
  }

  return workspace
}
