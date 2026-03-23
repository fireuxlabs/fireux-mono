import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useSupplierRecord } from '../../../supplier/useSupplierRecord'
import { SUPPLIER_COLLECTION } from '../../../supplier/constants'

const normalize = (value: unknown) => String(value || '').trim()

export function useRuntimeSupplier() {
  const { uid } = useAuth()
  const { appId } = useFireUXConfig()
  const supplierId = computed(() => normalize(uid.value))
  const documentCollectionPath = computed(() => SUPPLIER_COLLECTION)
  const supplierCollectionPath = computed(() => {
    const resolvedAppId = normalize(appId)
    return resolvedAppId ? `apps/${resolvedAppId}/${SUPPLIER_COLLECTION}` : SUPPLIER_COLLECTION
  })
  const { supplier, coreSupplier, appSupplier, pending } = useSupplierRecord(supplierId)

  const mode = computed<'live'>(() => 'live')
  const isReadOnly = computed(() => false)
  const isLoading = computed(() => Boolean(pending.value))
  const isReady = computed(() => {
    if (!supplierId.value) return false
    if (isLoading.value) return false
    return Boolean(coreSupplier.value)
  })

  return {
    id: supplierId,
    mode,
    isReadOnly,
    collectionPath: supplierCollectionPath,
    documentCollectionPath,
    supplierCollectionPath,

    doc: coreSupplier,
    supplier,
    coreSupplier,
    appSupplier,
    pending,
    isLoading,
    isReady,

    data: computed(() => ({
      coreSupplier: coreSupplier.value,
      appSupplier: appSupplier.value,
    })),
  }
}
