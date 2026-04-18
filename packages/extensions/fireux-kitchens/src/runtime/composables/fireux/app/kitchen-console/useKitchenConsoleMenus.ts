import { computed } from 'vue'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'
import { getDemoKitchen } from './demo-scenarios'

export function useKitchenConsoleMenus() {
  const { kitchenState } = useKitchenConsole()
  const liveKitchenId = computed(() =>
    kitchenState.isDemo.value ? '' : kitchenState.id.value
  )
  const { menus: liveMenus, pending: livePending } =
    useKitchenMenuCollection(liveKitchenId)
  const menus = computed(() => {
    if (!kitchenState.isDemo.value) return liveMenus.value
    if (!kitchenState.id.value) return []
    return getDemoKitchen(kitchenState.id.value)?.menuStack.menus ?? []
  })
  const pending = computed(() =>
    kitchenState.isDemo.value ? false : livePending.value
  )

  return {
    menus,
    pending,
  }
}
