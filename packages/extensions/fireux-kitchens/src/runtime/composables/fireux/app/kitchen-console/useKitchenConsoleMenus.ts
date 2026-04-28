import { computed } from 'vue'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'
import type { Menu } from '../../../../models/menu.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMenus() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()

  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() =>
    selectedMode.value === 'demo' ? '' : kitchenId.value
  )
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const {
    menus: liveMenus,
    pending: livePending,
    collectionPath,
  } = useKitchenMenuCollection(fetchKitchenId, { kitchenCollectionPath })
  const page = useKitchenConsoleReadPage<Menu>({
    collectionName: 'menus',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveMenus,
    livePending,
    collectionPath,
  })
  const menus = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    menus,
    pending,
  }
}
