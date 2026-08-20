import {
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenWorkspaceMise } from './useKitchenWorkspaceMise'

export type KitchenMiseWorkspace = ReturnType<typeof useKitchenWorkspaceMise>

const kitchenMiseWorkspaceKey: InjectionKey<KitchenMiseWorkspace> =
  Symbol('KitchenMiseWorkspace')

export function provideKitchenMiseWorkspace() {
  const workspace = useKitchenWorkspaceMise()
  provide(kitchenMiseWorkspaceKey, workspace)
  return workspace
}

export function useKitchenMiseWorkspace() {
  const workspace = inject(kitchenMiseWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Mise workspace is not available')
  }

  return workspace
}
