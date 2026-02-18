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
  const kitchenCollectionPath = computed(() => resolveRuntimeKitchenCollectionPath(mode.value))

  const kitchen = useRuntimeKitchenDocument({
    id,
    isReadOnly,
    kitchenCollectionPath,
  })
  const data = useRuntimeKitchenData({
    id,
    isReadOnly,
    kitchenCollectionPath,
  })

  return {
    id,
    mode,
    kitchen,
    kitchenCollectionPath,
    data,
  }
}
