import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenConsoleListFilter } from './useKitchenConsoleList'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'
import type { Ref } from 'vue'

type UseKitchenConsoleIndexOptions = {
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const { kitchen: testKitchenSource } = useKitchenFetch(userId, { source: 'test' })
  const {
    liveKitchens,
    demoKitchens,
    selectKitchen,
    selectedKitchen,
    selectedMode,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  } = useKitchenConsole({
    filter: options.filter,
  })

  const sourceKitchens = computed(() => ({
    live: liveKitchens.value,
    demo: demoKitchens.value,
    test: testKitchenSource.value,
  }))
  const consoleIndex = useConsoleIndex<KitchenSurface, KitchenSurface, KitchenSurface>({
    entities: sourceKitchens,
    selectEntity: selectKitchen,
    getTestId: (kitchen) => normalizeString(kitchen.id),
    debug: computed(() => ({
      selectedMode: selectedMode.value,
      kitchenId: kitchenId.value,
      activeKitchenAppId: activeKitchenAppId.value,
      rootCollection: rootCollection.value,
      canWrite: canWrite.value,
      selectedKitchen: selectedKitchen.value,
    })),
  })
  const debug = consoleIndex.debug

  return {
    kitchens: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedKitchen,
    selectedMode,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    canWrite,
    debug,
    clearSelectedKitchen,
  }
}
