import type { ComputedRef, InjectionKey } from 'vue'
import type { createKitchenMenus } from './useKitchenMenus'
import type { createMenuGroupIndex } from '../menu-group/useMenuGroupIndex'

export type KitchenMenusWorkspace = {
  description: ComputedRef<string>
  menus: ReturnType<typeof createKitchenMenus>
  overview: ReturnType<typeof createMenuGroupIndex>
}

export const kitchenMenusWorkspaceKey: InjectionKey<KitchenMenusWorkspace> =
  Symbol('KitchenMenusWorkspace')
