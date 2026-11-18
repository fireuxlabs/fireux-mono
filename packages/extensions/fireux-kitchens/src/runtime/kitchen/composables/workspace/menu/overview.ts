import { computed } from 'vue'
import { useMenuList } from '../menus/useMenuList'
import { readKitchenThemePalette } from '../../../utils/kitchen-readers'
import { requireMenuWorkspace } from './state'

export function useKitchenWorkspaceMenuOverview() {
  const { menus, overview } = requireMenuWorkspace()
  const list = useMenuList()
  const canCreateMenu = computed(
    () => menus.derived.value.capability.primitives.create.available
  )
  return {
    ...list,
    palette: computed(() =>
      readKitchenThemePalette(menus.selectedKitchen.value)
    ),
    menusOutcome: overview.menusOutcome,
    canCreateMenu,
    createBlockedMessage: menus.menuCreateBlockedMessage,
    openCreate: menus.actions.openCreate,
  }
}
