import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenCreate } from '../../firestore/kitchen/mutations/useKitchenCreate'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenCollectionFilter } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'
import type { Ref } from 'vue'

const normalizeString = (value: unknown) => String(value ?? '').trim()

type UseKitchenConsoleIndexOptions = {
  filter?: KitchenCollectionFilter | Ref<KitchenCollectionFilter | null | undefined> | null
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const { kitchen: testKitchenSource, pending: testKitchenPending } = useKitchenFetch(uid, { source: 'test' })
  const { createTestKitchen } = useKitchenCreate()
  const { liveKitchens, demoKitchens, selectKitchen } = useKitchenConsole({
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
    getTestId: (kitchen) => String(kitchen.id ?? '').trim(),
    autoCreateTest: true,
    testPending: testKitchenPending,
    testCreateKey: uid,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = normalizeString(uid.value)
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
  }
}
