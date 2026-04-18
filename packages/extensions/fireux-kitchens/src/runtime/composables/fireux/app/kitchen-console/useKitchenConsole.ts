import { computed } from 'vue'
import { useState } from '#imports'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'

type KitchenConsoleMode = ConsoleMode

type KitchenConsoleState = {
  selectedId: string
  selectedMode: KitchenConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsole() {
  const { kitchens: liveKitchens } = useKitchenCollection()
  const { uid } = useAuth()
  const { kitchen: testKitchen } = useKitchenFetch(uid, {
    collectionPath: 'test-kitchens',
  })
  const state = useState<KitchenConsoleState>('console:kitchens', () => ({
    selectedId: '',
    selectedMode: 'live',
  }))
  const selectedId = computed(() => normalizeString(state.value.selectedId))
  const selectedMode = computed(() => state.value.selectedMode)

  const selectedKitchen = computed(() => {
    if (!selectedId.value) return null

    if (selectedMode.value === 'test') {
      const kitchen = testKitchen.value
      return normalizeString(kitchen?.id) === selectedId.value ? kitchen : null
    }

    return (
      liveKitchens.value.find((kitchen) => normalizeString(kitchen?.id) === selectedId.value) ??
      null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const kitchen = selectedKitchen.value as Record<string, unknown> | null
    if (!kitchen) return null

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Kitchen',
        subtitle:
          normalizeString(kitchen.short_name) ||
          normalizeString(kitchen.name) ||
          normalizeString(kitchen.id) ||
          undefined,
        imageUrl: normalizeString(kitchen.image_url) || undefined,
      }
    }

    return {
      title:
        normalizeString(kitchen.short_name) ||
        normalizeString(kitchen.name) ||
        normalizeString(kitchen.id),
      subtitle:
        normalizeString(kitchen.short_address) ||
        normalizeString(kitchen.formatted_address) ||
        normalizeString(kitchen.id) ||
        undefined,
      imageUrl: normalizeString(kitchen.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('kitchens', header)

  const clearSelectedKitchen = () => {
    state.value = {
      selectedId: '',
      selectedMode: 'live',
    }
  }

  const selectKitchen = (kitchenId: string, mode: KitchenConsoleMode = 'live') => {
    state.value = {
      selectedId: normalizeString(kitchenId),
      selectedMode: mode,
    }
  }

  return {
    selectedKitchen,
    selectedMode,
    clearSelectedKitchen,
    selectKitchen,
  }
}
