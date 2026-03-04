// packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-app/useRuntimeApp.ts

import { computed } from 'vue'
import { resolveRuntimeAppCollectionPath } from './shared'
import { useRuntimeAppSelection } from './state'
import { useRuntimeAppContext, type UseRuntimeAppParams } from './useRuntimeAppContext'
import { useRuntimeAppData } from './useRuntimeAppData'
import { useRuntimeAppDocument } from './useRuntimeAppDocument'

export type { RuntimeAppMode } from './shared'
export { useRuntimeAppSelection } from './state'

export function useRuntimeApp(params?: UseRuntimeAppParams) {
  const selection = useRuntimeAppSelection()

  const { id, mode, isReadOnly } = useRuntimeAppContext(params, selection)

  const collectionPath = computed(() => resolveRuntimeAppCollectionPath(mode.value))

  const { doc, pending, publicDoc, privateDoc } = useRuntimeAppDocument({
    id,
    isReadOnly,
    collectionPath,
  })

  const data = useRuntimeAppData({
    id,
    isReadOnly,
    collectionPath,
    doc,
    pending,
  })
  const isLoading = computed(() => data.isLoading.value)
  const isReady = computed(() => data.isReady.value)

  return {
    id,
    mode,
    isReadOnly,
    collectionPath,

    // canon
    doc,
    pending,
    isLoading,
    isReady,

    // app extras (optional but harmless)
    publicDoc,
    privateDoc,

    // flattened data fields for direct runtime usage
    ecosystem: data.ecosystem,
    role: data.role,
    modules: data.modules,
    name: data.name,
    shortName: data.shortName,

    // app alias used by existing pages
    app: doc,

    data,
  }
}
