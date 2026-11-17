import { computed, inject, provide } from 'vue'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { createKitchenMenus } from './useKitchenMenus'
import { createMenuGroupIndex } from '../menu-group/useMenuGroupIndex'
import { kitchenMenusWorkspaceKey } from './kitchen-menus-workspace-state'

function createKitchenMenusWorkspace() {
  const { kitchenName } = useKitchenWorkspace()
  // The combined overview owns page publication; the capability only owns its workflow.
  const menus = createKitchenMenus(false)
  const overview = createMenuGroupIndex(menus.menuCollection)
  const description = computed(
    () =>
      `Manage ${kitchenName.value ? `${kitchenName.value}'s` : "your Kitchen's"} menus, items, promotions and services`
  )

  return { description, menus, overview }
}

/** Mount one shared state owner; the entrance only consumes its description. */
export function useKitchenMenusWorkspace() {
  const workspace = createKitchenMenusWorkspace()
  provide(kitchenMenusWorkspaceKey, workspace)
  return { description: workspace.description }
}

/** Children consume the mounted owner without constructing readers or commands. */
export function useKitchenMenusWorkspaceState() {
  const workspace = inject(kitchenMenusWorkspaceKey, null)
  if (!workspace)
    throw new Error('Menu children require their workspace owner.')
  return workspace
}
