import { computed } from 'vue'
import { useMenuList } from '../menus/useMenuList'
import { requireMenuWorkspace } from './state'

export function useKitchenWorkspaceMenuOverview() {
  const { menus, overview } = requireMenuWorkspace()
  const list = useMenuList()
  const canCreateMenu = computed(
    () => menus.derived.value.capability.primitives.create.available
  )
  return {
    ...list,
    menusOutcome: overview.menusOutcome,
    canCreateMenu,
    createBlockedMessage: menus.menuCreateBlockedMessage,
    openCreate: menus.actions.openCreate,
  }
}
