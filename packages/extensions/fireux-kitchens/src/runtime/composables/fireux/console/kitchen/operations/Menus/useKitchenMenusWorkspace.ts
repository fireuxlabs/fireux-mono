import {
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'

export type KitchenMenusWorkspace = ReturnType<
  typeof useKitchenConsoleMenus
>

const kitchenMenusWorkspaceKey: InjectionKey<KitchenMenusWorkspace> =
  Symbol('KitchenMenusWorkspace')

export function provideKitchenMenusWorkspace() {
  const workspace = useKitchenConsoleMenus()
  provide(kitchenMenusWorkspaceKey, workspace)
  return workspace
}

export function useKitchenMenusWorkspace() {
  const workspace = inject(kitchenMenusWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Menus workspace is not available')
  }

  return workspace
}
