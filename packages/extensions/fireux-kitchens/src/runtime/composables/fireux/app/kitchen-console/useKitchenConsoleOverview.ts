import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'
import { getDemoKitchens } from '../utils/kitchen-demo-scenarios'

type DemoKitchenListItem = ReturnType<typeof getDemoKitchens>[number]

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleOverview() {
  const { kitchens: liveKitchens } = useKitchenCollection({ scope: 'mine' })
  const { selectedKitchen, selectedMode } = useKitchenConsole()

  return useConsoleOverview<KitchenSurface | DemoKitchenListItem, KitchenSurface>({
    selectedEntity: selectedKitchen,
    selectedMode,
    liveItems: liveKitchens,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
}
