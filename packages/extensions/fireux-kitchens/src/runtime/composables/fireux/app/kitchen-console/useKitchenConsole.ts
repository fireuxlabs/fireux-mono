import { computed } from 'vue'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Kitchen } from '../../../../models/kitchen.model'
import { useKitchenSelection } from './useKitchenSelection'
import { useActiveKitchen } from './useActiveKitchen'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type UseKitchenConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()

/**
 * Kitchen console adapter.
 * Keeps only the active pill, header data, and shared console-state wiring.
 */
export function useKitchenConsole(
  options: UseKitchenConsoleOptions = {}
) {
  const kitchenState = useActiveKitchen()
  const kitchenSelection = useKitchenSelection()
  const { interface: toKitchenCard } = useKitchenInterface()

  const kitchen = computed(() =>
    toKitchenCard(kitchenState.kitchen.value as Kitchen | null)
  )

  const headerData = computed(() =>
    kitchen.value
      ? {
          imageUrl: kitchen.value.imageUrl,
          title: kitchen.value.title,
          subtitle:
            normalizeString(kitchen.value.subtitle) ||
            normalizeString(kitchenState.kitchen.value?.id),
        }
      : null
  )

  const consoleState = useConsoleState({
    family: 'kitchen',
    selectedId: kitchenState.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: kitchenSelection.clearRuntimeKitchen,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  return {
    kitchenState,
    kitchen,
    headerData,
    consoleState,
  }
}
