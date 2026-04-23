import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleOverview() {
  const { liveKitchens, demoKitchens, testKitchen, selectedKitchen, selectedMode } =
    useKitchenConsole()

  return useConsoleOverview<KitchenSurface, KitchenSurface>({
    selectedEntity: selectedKitchen,
    selectedMode,
    liveItems: liveKitchens,
    demoItems: demoKitchens,
    testItem: testKitchen,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
}
