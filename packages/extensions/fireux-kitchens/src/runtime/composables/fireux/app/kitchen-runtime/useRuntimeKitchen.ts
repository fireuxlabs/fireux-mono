import { computed } from 'vue'
import { useRuntimeKitchenSelection } from './state'
import { useRuntimeKitchenContext, type UseRuntimeKitchenParams } from './useRuntimeKitchenContext'
import { useRuntimeKitchenDocument } from './useRuntimeKitchenDocument'
import { useRuntimeKitchenData } from './useRuntimeKitchenData'
import { resolveRuntimeKitchenCollectionPath } from './shared'

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
  const selection = useRuntimeKitchenSelection()

  const { id, mode, isReadOnly } = useRuntimeKitchenContext(params, selection)
  const collectionPath = computed(() => resolveRuntimeKitchenCollectionPath(mode.value))

  const { doc, pending } = useRuntimeKitchenDocument({
    id,
    isReadOnly,
    collectionPath,
  })
  const data = useRuntimeKitchenData({
    id,
    isReadOnly,
    collectionPath,
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
    collectionPath,

    // Canon runtime contract
    doc,
    pending,
    isLoading,
    isReady,
    data,

    // Backward-compatible aliases for existing kitchen usage
    kitchen: doc,
    kitchenCollectionPath: collectionPath,
  }
}
