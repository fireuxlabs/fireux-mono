import { computed } from 'vue'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'
import { useKitchenConsole } from './useKitchenConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMenus() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()

  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const { menus, pending, collectionPath } = useKitchenMenuCollection(kitchenId)

  return {
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    menus,
    pending,
  }
}
