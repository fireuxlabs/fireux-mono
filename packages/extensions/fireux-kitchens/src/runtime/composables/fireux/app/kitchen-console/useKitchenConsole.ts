import { computed } from 'vue'
import { getDemoKitchens } from './demo-scenarios'
import { useConsole } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'

type KitchenConsoleMode = 'live' | 'demo' | 'test'

type DemoKitchenListItem = {
  id: string
  name: string
  address_label: string
  image_url: string
  mode: 'demo'
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsole() {
  const { kitchens: liveKitchens } = useKitchenCollection()
  const { uid } = useAuth()
  const { kitchen: testKitchen } = useKitchenFetch(uid, {
    collectionPath: 'test-kitchens',
  })
  const { selectedId, selectedMode, selectEntity, clearSelection } = useConsole('kitchens')

  const kitchens = computed(() => ({
    live: liveKitchens.value,
    demo: getDemoKitchens(),
    test: testKitchen.value,
  }))
  const selectedKitchen = computed(() => {
    const kitchenId = normalizeString(selectedId.value)
    if (!kitchenId) return null

    if (selectedMode.value === 'demo') {
      return (getDemoKitchens() as DemoKitchenListItem[]).find((kitchen) => kitchen.id === kitchenId) ?? null
    }

    if (selectedMode.value === 'test') {
      const kitchen = testKitchen.value
      return normalizeString(kitchen?.id) === kitchenId ? kitchen : null
    }

    return (
      liveKitchens.value.find((kitchen) => normalizeString(kitchen?.id) === kitchenId) ?? null
    )
  })
  const kitchen = computed(() => null)
  const kitchenState = {
    id: selectedId,
    entity: selectedKitchen,
    mode: selectedMode,
    isDemo: computed(() => selectedMode.value === 'demo'),
    scenario: computed(() => null),
  }
  const consoleState = {
    clearSelection,
  }

  const clearSelectedKitchen = () => {
    clearSelection()
  }
  const selectKitchen = (
    kitchenId: string,
    mode: KitchenConsoleMode = 'live'
  ) => {
    selectEntity(kitchenId, mode)
  }

  return {
    kitchens,
    kitchen,
    kitchenState,
    consoleState,
    selectedKitchen,
    selectedMode,
    clearSelectedKitchen,
    selectKitchen,
  }
}
