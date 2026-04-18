import { computed } from 'vue'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { getDemoKitchens } from './demo-scenarios'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenSelection } from './useKitchenSelection'

type UseKitchenConsoleIndexOptions = {
  publishHeader?: boolean
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const { kitchen, consoleState } = useKitchenConsole({
    publishHeader: options.publishHeader,
  })
  const { setRuntimeKitchen } = useKitchenSelection()
  const { kitchens } = useKitchenCollection()

  const liveKitchens = computed(() => kitchens.value ?? [])
  const demoKitchens = computed(() => getDemoKitchens())

  const selectKitchen = (kitchenId: string) => {
    setRuntimeKitchen({ kitchenId, mode: 'live' })
  }

  const selectDemoKitchen = (kitchenId: string) => {
    setRuntimeKitchen({ kitchenId, mode: 'demo' })
  }

  return {
    kitchen,
    liveKitchens,
    demoKitchens,
    clearSelection: consoleState.clearSelection,
    selectKitchen,
    selectDemoKitchen,
  }
}
