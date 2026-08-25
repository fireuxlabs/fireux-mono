import { inject, provide, type InjectionKey } from 'vue'
import { useKitchenWorkspaceMenus } from './useKitchenWorkspaceMenus'

export type KitchenMenusWorkspace = ReturnType<typeof useKitchenWorkspaceMenus>

const kitchenMenusWorkspaceKey: InjectionKey<KitchenMenusWorkspace> = Symbol(
  'KitchenMenusWorkspace'
)

export function provideKitchenMenusWorkspace() {
  const workspace = useKitchenWorkspaceMenus()
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
