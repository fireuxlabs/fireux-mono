import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { getDemoKitchens } from '../utils/kitchen-demo-scenarios'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenCreate } from '../../firestore/kitchen/mutations/useKitchenCreate'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from './useKitchenConsole'

type DemoKitchenListItem = ReturnType<typeof getDemoKitchens>[number]

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleIndex() {
  const { kitchens: liveKitchenSource } = useKitchenCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { kitchen: testKitchenSource, pending: testKitchenPending } = useKitchenFetch(uid, {
    collectionPath: 'test-kitchens',
  })
  const { createTestKitchen } = useKitchenCreate()
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
