import { computed } from 'vue'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Kitchen } from '../../../models/kitchen.model'
import { useKitchenSelection } from './useKitchenSelection'
import { useActiveKitchen } from './useActiveKitchen'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type UseRuntimeKitchenConsoleOptions = {
  publishHeader?: boolean
}

/**
 * Root kitchen console inputs.
 */
export function useKitchenConsole(
  options: UseRuntimeKitchenConsoleOptions = {}
) {
  const runtime = useActiveKitchen()
  const kitchenSelection = useKitchenSelection()
  const { interface: toKitchenCard } = useKitchenInterface()

  const activeKitchenPill = computed(() => {
    return toKitchenCard(runtime.kitchen.value as Kitchen | null)
  })

  const headerData = computed(() =>
    activeKitchenPill.value
      ? {
          imageUrl: activeKitchenPill.value.imageUrl,
          title: activeKitchenPill.value.title,
          subtitle: activeKitchenPill.value.subtitle,
        }
      : null
  )

  const consoleState = useConsoleState({
    family: 'kitchen',
    selectedId: runtime.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: kitchenSelection.clearRuntimeKitchen,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  return {
    runtime,
    activeKitchenPill,
    headerData,
    consoleState,
  }
}
