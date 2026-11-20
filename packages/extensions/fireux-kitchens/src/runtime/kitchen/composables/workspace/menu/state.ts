import { inject, type ComputedRef, type InjectionKey } from 'vue'
import type { createKitchenMenus } from './menus/useKitchenWorkspaceMenus'
import type { createKitchenMenuOverview } from './source'

type MenuWorkspace = {
  description: ComputedRef<string>
  menus: ReturnType<typeof createKitchenMenus>
  overview: ReturnType<typeof createKitchenMenuOverview>
}

export const kitchenMenusWorkspaceKey: InjectionKey<MenuWorkspace> = Symbol(
  'KitchenWorkspaceMenu'
)

/** Internal lookup; children never acquire a second group owner. */
export function requireMenuWorkspace() {
  const workspace = inject(kitchenMenusWorkspaceKey, null)
  if (!workspace)
    throw new Error('Menu children require their workspace owner.')
  return workspace
}
