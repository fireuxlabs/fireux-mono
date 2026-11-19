import { computed, provide } from 'vue'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { createKitchenMenus } from './menus/useKitchenMenus'
import { createKitchenMenuOverview } from './source'
import { kitchenMenusWorkspaceKey } from './state'

function createMenuWorkspace() {
  const { data } = useKitchenWorkspace()
  // The combined overview owns page publication; the capability only owns its workflow.
  const menus = createKitchenMenus(false)
  const overview = createKitchenMenuOverview(menus.menuCollection)
  const description = computed(() => {
    const name = data.value?.name
    return `Manage ${name ? `${name}'s` : "your Kitchen's"} menus, items, promotions and services`
  })

  return { description, menus, overview }
}

/** Mount one shared state owner; the entrance only consumes its description. */
export function useKitchenWorkspaceMenu() {
  const workspace = createMenuWorkspace()
  provide(kitchenMenusWorkspaceKey, workspace)
  return { description: workspace.description }
}
