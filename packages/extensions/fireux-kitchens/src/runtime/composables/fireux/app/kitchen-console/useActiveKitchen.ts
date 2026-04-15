import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { AppKitchen, Kitchen } from '../../../models/kitchen.model'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
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
  const { selectedId: id, mode } = useKitchenSelection()
  const isDemo = computed(() => mode.value === 'demo')
  const { kitchen: liveKitchen, pending: livePending } = useKitchenFetch(id)
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

  const scenario = computed(() => null)

  const entity = computed(() => {
    if (!id.value) return null

    const rootKitchen = liveKitchen.value ?? null
    if (!rootKitchen) return null

    return {
      ...rootKitchen,
      ...(overlay.value ?? {}),
      id: String(rootKitchen.id || id.value).trim(),
    } as Kitchen
  })

  const pending = computed(() => {
    if (!id.value) return false
    return livePending.value || overlayCollection.value?.value === undefined
  })

  return {
    id,
    mode,
    isDemo,
    entity,
    scenario,
    pending,
  }
}
