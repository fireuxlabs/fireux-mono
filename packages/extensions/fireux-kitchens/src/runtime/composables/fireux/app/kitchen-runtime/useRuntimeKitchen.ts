import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRuntimeKitchenSelection } from './state'
import { useRuntimeKitchenDocument } from './useRuntimeKitchenDocument'
import { useRuntimeKitchenData } from './useRuntimeKitchenData'
import {
  resolveRuntimeKitchenDataCollectionPath,
  resolveRuntimeKitchenDocumentCollectionPath,
} from './shared'

export { useRuntimeKitchenSelection } from './state'
export type { RuntimeKitchenMode } from './shared'

/**
 * Canon kitchen console seam.
 *
 * Root kitchen identity stays at `/kitchens/<id>`.
 * Console-owned data lives under the app-hosted kitchen scope.
 */
export function useRuntimeKitchen() {
  const { appId } = useFireUXConfig()
  const selection = useRuntimeKitchenSelection()
  const id = selection.selectedId
  const mode = selection.mode
  const activity = computed<'static'>(() => 'static')
  const isDemo = computed(() => mode.value === 'demo')
  const documentCollectionPath = computed(() =>
    resolveRuntimeKitchenDocumentCollectionPath(mode.value)
  )
  const kitchenCollectionPath = computed(() =>
    resolveRuntimeKitchenDataCollectionPath(mode.value, appId)
  )

  const { doc, pending } = useRuntimeKitchenDocument({
    id,
    isDemo: isDemo,
    documentCollectionPath,
  })
  const data = useRuntimeKitchenData({
    id,
    isDemo: isDemo,
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
    activity,
    isDemo,
    collectionPath: kitchenCollectionPath,
    documentCollectionPath,
    kitchenCollectionPath,

    doc,
    pending,
    isLoading,
    isReady,
    data,

    kitchen: doc,
  }
}
