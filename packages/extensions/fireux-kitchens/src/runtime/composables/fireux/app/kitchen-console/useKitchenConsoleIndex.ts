import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenCreate } from '../../firestore/kitchen/mutations/useKitchenCreate'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenCollectionFilter } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'
import type { Ref } from 'vue'

type UseKitchenConsoleIndexOptions = {
  filter?: KitchenCollectionFilter | Ref<KitchenCollectionFilter | null | undefined> | null
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const { kitchen: testKitchenSource, pending: testKitchenPending } = useKitchenFetch(userId, { source: 'test' })
  const { createTestKitchen } = useKitchenCreate()
  const {
    liveKitchens,
    demoKitchens,
    selectKitchen,
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  } = useKitchenConsole({
    filter: options.filter,
  })

  const sourceKitchens = computed(() => ({
    live: liveKitchens.value,
    demo: demoKitchens.value,
    test: testKitchenSource.value,
  }))
  const consoleIndex = useConsoleIndex<KitchenSurface, KitchenSurface, KitchenSurface>({
    entities: sourceKitchens,
    selectEntity: selectKitchen,
    getTestId: (kitchen) => normalizeString(kitchen.id),
    autoCreateTest: true,
    testPending: testKitchenPending,
    testCreateKey: userId,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = userId.value
      if (!testId) return null

      const userLabel = normalizeString(displayName) || `User ${testId.slice(0, 6)}`
      const result = await createTestKitchen(
        {
          id: testId,
          name: 'Test Kitchen',
          subtitle: userLabel,
          image_url: normalizeString(avatarSrc),
        }
      )

      return normalizeString(result.id)
    },
  })

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    kitchens: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  }
}
