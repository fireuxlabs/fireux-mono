import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import { type KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from '../core/useKitchenConsole'

export function useKitchenConsoleOverview() {
  const {
    selection,
    runtime,
    actions,
  } =
    useKitchenConsole()
  const selectedKitchenList = computed(() =>
    selection.kitchen.value ? [selection.kitchen.value] : []
  )

  const overview = useConsoleOverview<KitchenSurface>({
    selectedEntity: selection.kitchen,
    targetItems: selectedKitchenList,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
  const debug = computed(() => ({
    kitchenId: selection.kitchenId.value,
    activeKitchenAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedKitchen: selection.kitchen,
    kitchenId: selection.kitchenId,
    activeKitchenAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedKitchen: actions.clearSelectedKitchen,
    debug,
  }
}
