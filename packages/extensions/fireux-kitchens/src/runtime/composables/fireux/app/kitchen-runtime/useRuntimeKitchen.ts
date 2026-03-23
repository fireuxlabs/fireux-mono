import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRuntimeKitchenSelection } from './state'
import { useRuntimeKitchenContext, type UseRuntimeKitchenParams } from './useRuntimeKitchenContext'
import { useRuntimeKitchenDocument } from './useRuntimeKitchenDocument'
import { useRuntimeKitchenData } from './useRuntimeKitchenData'
import {
  resolveRuntimeKitchenDataCollectionPath,
  resolveRuntimeKitchenDocumentCollectionPath,
} from './shared'

export { useRuntimeKitchenSelection } from './state'
export type { RuntimeKitchenMode } from './shared'

/**
 * Runtime kitchen resolver (composer)
 *
 * Priority:
 * - live      -> kitchens/{kitchenId}/...
 * - test      -> test-kitchens/{kitchenId}/...
 * - read-only -> scenario only (no Firestore)
 */
export function useRuntimeKitchen(params?: UseRuntimeKitchenParams) {
  const { appId } = useFireUXConfig()
  const selection = useRuntimeKitchenSelection()

  const { id, mode, isReadOnly } = useRuntimeKitchenContext(params, selection)
  const documentCollectionPath = computed(() =>
    resolveRuntimeKitchenDocumentCollectionPath(mode.value)
  )
  const kitchenCollectionPath = computed(() =>
    resolveRuntimeKitchenDataCollectionPath(mode.value, appId)
  )

  const { doc, pending } = useRuntimeKitchenDocument({
    id,
    isReadOnly,
    documentCollectionPath,
  })
  const data = useRuntimeKitchenData({
    id,
    isReadOnly,
    kitchenCollectionPath,
  })
  const isLoading = computed(() => Boolean(pending.value))
  const isReady = computed(() => {
    if (!id.value) return false
    if (isLoading.value) return false
    return Boolean(doc.value)
  })

  return {
    id,
    mode,
    isReadOnly,
    collectionPath: kitchenCollectionPath,
    documentCollectionPath,
    kitchenCollectionPath,

    // Canon runtime contract
    doc,
    pending,
    isLoading,
    isReady,
    data,

    // Backward-compatible aliases for existing kitchen usage
    kitchen: doc,
  }
}
