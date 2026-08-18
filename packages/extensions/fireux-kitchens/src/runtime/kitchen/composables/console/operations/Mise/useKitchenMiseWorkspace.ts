import {
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenConsoleMise } from './useKitchenConsoleMise'

export type KitchenMiseWorkspace = ReturnType<typeof useKitchenConsoleMise>

const kitchenMiseWorkspaceKey: InjectionKey<KitchenMiseWorkspace> =
  Symbol('KitchenMiseWorkspace')

export function provideKitchenMiseWorkspace() {
  const workspace = useKitchenConsoleMise()
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
