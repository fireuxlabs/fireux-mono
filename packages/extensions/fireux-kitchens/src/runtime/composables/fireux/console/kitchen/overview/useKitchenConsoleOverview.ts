import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import { type KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from '../core/useKitchenConsole'

export function useKitchenConsoleOverview() {
  const {
    targetKitchens,
    selectedKitchen,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  } =
    useKitchenConsole()

  const overview = useConsoleOverview<KitchenSurface>({
    selectedEntity: selectedKitchen,
    targetItems: targetKitchens,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    activeKitchenAppId: activeKitchenAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedKitchen,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
    debug,
  }
}
