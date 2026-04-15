import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import type { AppKitchen, Kitchen } from '../../../models/kitchen.model'
import { resolveKitchenConsoleCollectionPath } from './shared'
import { useKitchenSelection } from './useKitchenSelection'

/**
 * Active kitchen loader.
 * Resolves the selected kitchen as the console uses it:
 * root kitchen + app-scoped overlay merged together.
 */
export function useActiveKitchen() {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { selectedId: id } = useKitchenSelection()
  const { kitchen: liveKitchen, pending } = useKitchenFetch(id)
  const overlayCollectionPath = computed(() => resolveKitchenConsoleCollectionPath(appId))
  const overlayCollection = computed(() => {
    const collectionPath = String(overlayCollectionPath.value || '').trim()
    if (!collectionPath) return null
    return firestoreFetchCollection<AppKitchen>(collectionPath)
  })
  const overlay = computed(() => {
    const docId = String(id.value || '').trim()
    if (!docId) return null
    return (
      overlayCollection.value?.value?.find(
        (entry) => String(entry?.id || '').trim() === docId
      ) ?? null
    )
  })

  const kitchen = computed(() => {
    if (!id.value) return null

    const rootKitchen = liveKitchen.value ?? null
    if (!rootKitchen) return null

    return {
      ...rootKitchen,
      ...(overlay.value ?? {}),
      id: String(rootKitchen.id || id.value).trim(),
    } as Kitchen
  })

  const activePending = computed(() => {
    if (!id.value) return false
    return pending.value || overlayCollection.value?.value === undefined
  })

  return {
    id,
    kitchen,
    pending: activePending,
  }
}
