import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useSupplierRecord } from '../../firestore/supplier/fetch/useSupplierRecord'
import { useRuntimeSupplierSelection } from './state'
import {
  useRuntimeSupplierContext,
  type UseRuntimeSupplierParams,
} from './useRuntimeSupplierContext'
import {
  getReadOnlySupplierScenario,
  type ReadOnlySupplierScenario,
} from './read-only-scenarios'

const normalize = (value: unknown) => String(value || '').trim()
const supplierCollection = 'suppliers'
export { useRuntimeSupplierSelection } from './state'
export type { RuntimeSupplierMode } from './state'

/**
 * Canon supplier console seam.
 *
 * Root supplier identity stays at `/suppliers/<id>`.
 * App-hosted supplier console state lives at `/apps/<appId>/suppliers/<id>`.
 */
export function useRuntimeSupplier(params?: UseRuntimeSupplierParams) {
  const { appId } = useFireUXConfig()
  const selection = useRuntimeSupplierSelection()
  const { id, mode, isReadOnly } = useRuntimeSupplierContext(params, selection)
  const firestoreSupplierId = computed(() => (isReadOnly.value ? '' : id.value))
  const documentCollectionPath = computed(() => supplierCollection)
  const supplierCollectionPath = computed(() => {
    const resolvedAppId = normalize(appId)
    return resolvedAppId ? `apps/${resolvedAppId}/${supplierCollection}` : supplierCollection
  })
  const {
    supplier: liveSupplier,
    coreSupplier: liveCoreSupplier,
    appSupplier: liveAppSupplier,
    pending: livePending,
  } = useSupplierRecord(firestoreSupplierId)

  const readOnlyScenario = computed<ReadOnlySupplierScenario | null>(() => {
    if (!isReadOnly.value || !id.value) return null
    return getReadOnlySupplierScenario(id.value)
  })

  const coreSupplier = computed(() =>
    isReadOnly.value ? readOnlyScenario.value?.supplier ?? null : liveCoreSupplier.value ?? null
  )

  const appSupplier = computed(() =>
    isReadOnly.value ? readOnlyScenario.value?.consoleSupplier ?? null : liveAppSupplier.value ?? null
  )

  const supplier = computed(() =>
    isReadOnly.value ? readOnlyScenario.value?.supplier ?? null : liveSupplier.value ?? null
  )

  const pending = computed(() => (isReadOnly.value ? false : Boolean(livePending.value)))

  const isLoading = computed(() => Boolean(pending.value))
  const isReady = computed(() => {
    if (!id.value) return false
    if (isLoading.value) return false
    return Boolean(coreSupplier.value)
  })

  return {
    id,
    mode,
    isReadOnly,
    collectionPath: supplierCollectionPath,
    documentCollectionPath,
    supplierCollectionPath,

    doc: coreSupplier,
    pending,
    isLoading,
    isReady,

    data: computed(() => ({
      coreSupplier: coreSupplier.value,
      appSupplier: appSupplier.value,
      readOnlyScenario: readOnlyScenario.value,
    })),

    readOnlyScenario,
    supplier,
    coreSupplier,
    appSupplier,
  }
}
