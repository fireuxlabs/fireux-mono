import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'

type DemoKitchenListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

const getDemoKitchens = () => [] as DemoKitchenListItem[]

export function useKitchenConsoleIndex() {
  const { kitchens: liveKitchenSource } = useKitchenCollection()
  const { uid } = useAuth()
  const { kitchen: testKitchenSource } = useKitchenFetch(uid, {
    collectionPath: 'test-kitchens',
  })
  const { selectKitchen } = useKitchenConsole()

  const sourceKitchens = computed(() => ({
    live: Array.isArray(liveKitchenSource.value) ? liveKitchenSource.value : [],
    demo: getDemoKitchens(),
    test: testKitchenSource.value,
  }))
  const consoleIndex = useConsoleIndex<KitchenSurface, DemoKitchenListItem, KitchenSurface>({
    entities: sourceKitchens,
    selectEntity: selectKitchen,
    getTestId: (kitchen) => String(kitchen.id ?? '').trim(),
  })

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    kitchens: consoleIndex.entities,
    actions: consoleIndex.actions,
  }
}
