import { inject, provide, type InjectionKey } from 'vue'
import { useKitchenWorkspaceMiseTask } from './useKitchenWorkspaceMiseTask'

export type KitchenMiseTaskWorkspace = ReturnType<
  typeof useKitchenWorkspaceMiseTask
>

const kitchenMiseTaskWorkspaceKey: InjectionKey<KitchenMiseTaskWorkspace> =
  Symbol('KitchenMiseTaskWorkspace')

export function provideKitchenMiseTaskWorkspace() {
  const workspace = useKitchenWorkspaceMiseTask()
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
