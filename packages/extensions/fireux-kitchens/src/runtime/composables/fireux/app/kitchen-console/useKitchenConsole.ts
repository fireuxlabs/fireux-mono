import { computed } from 'vue'
import type { Kitchen } from '../../../../models/kitchen.model'
import { useKitchenSelection } from './useKitchenSelection'
import { useActiveKitchen } from './useActiveKitchen'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useConsoleEntityAdapter } from 'fireux-core/runtime/composables/fireux/console/useConsoleEntityAdapter'

type UseKitchenConsoleOptions = {
  publishHeader?: boolean
}

/**
 * Kitchen console adapter.
 * Keeps only the active pill, header data, and shared console-state wiring.
 */
export function useKitchenConsole(
  options: UseKitchenConsoleOptions = {}
) {
  const kitchenState = useActiveKitchen()
  const kitchenSelection = useKitchenSelection()
  const { pill: toKitchenCard } = useKitchenInterface()

  const kitchen = computed(() =>
    toKitchenCard(kitchenState.entity.value as Kitchen | null)
  )

  const { headerData, consoleState } = useConsoleEntityAdapter({
    family: 'kitchens',
    selectedId: kitchenState.id,
    mode: kitchenState.mode,
    setMode: (mode) => kitchenSelection.setRuntimeKitchen({ mode }),
    clearSelection: kitchenSelection.clearRuntimeKitchen,
    card: kitchen,
    publishHeader: options.publishHeader,
  })

  return {
    kitchenState,
    kitchen,
    headerData,
    consoleState,
  }
}
