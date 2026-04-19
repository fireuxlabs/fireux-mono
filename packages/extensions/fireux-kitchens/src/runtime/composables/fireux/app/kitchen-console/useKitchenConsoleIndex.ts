import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenConsole } from './useKitchenConsole'

type DemoKitchenListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

export function useKitchenConsoleIndex() {
  const { kitchens: liveKitchenSource } = useKitchenCollection()
  const { uid } = useAuth()
  const { kitchen: testKitchenSource } = useKitchenFetch(uid, {
    collectionPath: 'test-kitchens',
  })
  const { selectKitchen } = useKitchenConsole()
  type KitchenSurface =
    | NonNullable<(typeof liveKitchenSource.value)[number]>
    | NonNullable<typeof testKitchenSource.value>

  const sourceKitchens = computed(() => ({
    live: Array.isArray(liveKitchenSource.value) ? liveKitchenSource.value : [],
    demo: [] as DemoKitchenListItem[],
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
