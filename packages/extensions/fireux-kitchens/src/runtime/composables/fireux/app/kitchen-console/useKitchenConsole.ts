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
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'

type KitchenConsoleMode = ConsoleMode
type DemoKitchenListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsole() {
  const { kitchens: liveKitchens } = useKitchenCollection()
  const { uid } = useAuth()
  const { kitchen: testKitchen } = useKitchenFetch(uid, {
    collectionPath: 'test-kitchens',
  })
  const { selectedId, selectedMode, selectEntity, clearSelection } = useConsole('kitchens')
  const demoKitchens = computed<DemoKitchenListItem[]>(() => [])

  const selectedKitchen = computed(() => {
    const kitchenId = normalizeString(selectedId.value)
    if (!kitchenId) return null

    if (selectedMode.value === 'demo') {
      return (
        demoKitchens.value.find((kitchen) => normalizeString(kitchen?.id) === kitchenId) ?? null
      )
    }

    if (selectedMode.value === 'test') {
      const kitchen = testKitchen.value
      return normalizeString(kitchen?.id) === kitchenId ? kitchen : null
    }

    return (
      liveKitchens.value.find((kitchen) => normalizeString(kitchen?.id) === kitchenId) ?? null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const kitchen = selectedKitchen.value as Record<string, unknown> | null
    if (!kitchen) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(kitchen.name),
        subtitle: normalizeString(kitchen.label) || undefined,
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
      subtitle: normalizeString(kitchen.formatted_address) || undefined,
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
