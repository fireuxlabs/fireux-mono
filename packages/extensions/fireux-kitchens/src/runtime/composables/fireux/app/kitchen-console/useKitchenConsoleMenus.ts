import { computed } from 'vue'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'
import { useMenuInterface } from '../../firestore/runtime-kitchen/menu/utils/view/useMenuInterface'

export function useKitchenConsoleMenus() {
  const { kitchenState } = useKitchenConsole()
  const { menus } = useKitchenMenuCollection(kitchenState.id)
  const { pill, cell } = useMenuInterface()

  const pending = computed(() => false)

  const menuPills = computed(() =>
    (menus.value ?? [])
      .map((menu) => pill(menu))
      .filter(Boolean)
  )

  const menuCells = computed(() =>
    (menus.value ?? [])
      .map((menu) => cell(menu))
      .filter(Boolean)
  )

  return {
    menus,
    menuPills,
    menuCells,
    pending,
  }
}