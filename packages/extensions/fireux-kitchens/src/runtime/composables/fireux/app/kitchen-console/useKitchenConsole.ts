import { computed } from 'vue'
import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { getDemoKitchens } from '../utils/kitchen-demo-scenarios'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type KitchenConsoleMode = ConsoleMode
type DemoKitchenListItem = ReturnType<typeof getDemoKitchens>[number]
type KitchenConsoleEntity = KitchenSurface | DemoKitchenListItem

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsole() {
  const { kitchens: liveKitchens } = useKitchenCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { kitchen: testKitchen } = useKitchenFetch(uid, {
    collectionPath: 'test-kitchens',
  })
  const demoKitchens = computed<DemoKitchenListItem[]>(() => getDemoKitchens())
  const { selectedEntity, selectedMode, selectEntity, clearSelection } = useConsole<
    KitchenSurface,
    DemoKitchenListItem,
    KitchenSurface
  >('kitchens', {
    liveItems: liveKitchens,
    demoItems: demoKitchens,
    testItem: testKitchen,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(() => selectedEntity.value)

  const header = computed<ConsoleHeaderData>(() => {
    const kitchen = selectedKitchen.value
    if (!kitchen) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(kitchen.name),
        subtitle: normalizeString('label' in kitchen ? kitchen.label : '') || undefined,
        imageUrl: normalizeString(kitchen.image_url) || undefined,
      }
    }

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Kitchen',
        subtitle: normalizeString(kitchen.name) || undefined,
        imageUrl: normalizeString(kitchen.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(kitchen.name),
      subtitle:
        normalizeString('formatted_address' in kitchen ? kitchen.formatted_address : '') ||
        undefined,
      imageUrl: normalizeString(kitchen.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('kitchens', header)

  const clearSelectedKitchen = () => {
    clearSelection()
  }

  const selectKitchen = (kitchenId: string, mode: KitchenConsoleMode = 'live') => {
    selectEntity(kitchenId, mode)
  }

  return {
    selectedKitchen,
    selectedMode,
    clearSelectedKitchen,
    selectKitchen,
  }
}
