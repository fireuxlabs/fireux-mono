import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenTestCreate } from '../../firestore/kitchen/mutations/useKitchenTestCreate'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenListFilter } from '../../firestore/kitchen/fetch/useKitchenList'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'
import type { Ref } from 'vue'

type UseKitchenConsoleIndexOptions = {
  filter?: KitchenListFilter | Ref<KitchenListFilter | null | undefined> | null
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const { kitchen: testKitchenSource, pending: testKitchenPending } = useKitchenFetch(userId, { source: 'test' })
  const { createTestKitchen } = useKitchenTestCreate()
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
    autoCreateTest: false,
    testPending: testKitchenPending,
    testCreateKey: userId,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = userId.value
      if (!testId) return null

      const result = await createTestKitchen(
        {
          id: testId,
          displayName,
          display_image_url: normalizeString(avatarSrc),
        }
      )

      return normalizeString(result.id)
    },
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedKitchen: selectedKitchen.value,
    counts: {
      live: consoleIndex.entities.value.live.length,
      demo: consoleIndex.entities.value.demo.length,
      test: consoleIndex.entities.value.test ? 1 : 0,
    },
  }))

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
    debug,
    clearSelectedKitchen,
  }
}
