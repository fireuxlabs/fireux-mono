import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import type { AppKitchen, Kitchen } from '../../../../models/kitchen.model'
import { useKitchenSelection } from './useKitchenSelection'
import { normalizeString, resolveKitchenConsoleCollectionPath } from './shared'

type KitchenConsoleRecord = Partial<Kitchen> & Partial<AppKitchen> & { id?: string }

/**
 * Live kitchen loader.
 * Composes the public root kitchen with the app-hosted kitchen overlay.
 */
export function useActiveKitchen() {
  const { selectedId: id } = useKitchenSelection()
  const { appId } = useFireUXConfig()
  const { firestoreFetchDoc } = useFirestoreRead()
  const { kitchen: liveKitchen, pending: rootPending } = useKitchenFetch(id)

  const overlayCollectionPath = computed(() =>
    resolveKitchenConsoleCollectionPath(appId)
  )

  const overlaySource = computed(() => {
    const kitchenId = normalizeString(id.value)
    const collectionPath = normalizeString(overlayCollectionPath.value)
    if (!kitchenId || !collectionPath) return null
    return firestoreFetchDoc<AppKitchen>(collectionPath, kitchenId)
  })

  const kitchen = computed(() => {
    if (!id.value) return null
    const rootKitchen = (liveKitchen.value ?? null) as KitchenConsoleRecord | null
    const overlayKitchen = (overlaySource.value?.value ?? null) as KitchenConsoleRecord | null

    if (!rootKitchen && !overlayKitchen) return null

    return {
      ...(rootKitchen ?? {}),
      ...(overlayKitchen ?? {}),
      id:
        normalizeString(overlayKitchen?.id) ||
        normalizeString(rootKitchen?.id) ||
        normalizeString(id.value),
    }
  })

  const pending = computed(() => {
    if (!id.value) return false
    return rootPending.value
  })

  return {
    id,
    kitchen,
    pending,
  }
}
