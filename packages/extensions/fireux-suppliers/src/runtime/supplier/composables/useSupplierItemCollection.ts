import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed, isRef, type Ref } from 'vue'
import {
  SupplierItemStorage,
  SupplierStorage,
  type SupplierItem,
} from '../models/Supplier.model.ts'

const DEFAULT_SUPPLIER_COLLECTION_PATH: string = SupplierStorage.collection

const normalizeString = (value: unknown) => String(value ?? '').trim()

export const resolveSupplierItemCollectionPath = (
  supplierId?: string | null | undefined,
  supplierCollectionPath = DEFAULT_SUPPLIER_COLLECTION_PATH
) => {
  const resolvedSupplierId = normalizeString(supplierId)
  const resolvedCollectionPath =
    normalizeString(supplierCollectionPath) || DEFAULT_SUPPLIER_COLLECTION_PATH

  if (!resolvedSupplierId) return ''

  return `${resolvedCollectionPath}/${resolvedSupplierId}/${SupplierItemStorage.collection}`
}

export function useSupplierItemCollection(
  supplierId: string | null | undefined | Ref<string | null | undefined>,
  options: {
    enabled?: boolean | Ref<boolean>
    supplierCollectionPath?: string | Ref<string | null | undefined>
  } = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const resolvedSupplierId = computed(() =>
    normalizeString(isRef(supplierId) ? supplierId.value : supplierId)
  )
  const enabled = computed(() =>
    isRef(options.enabled)
      ? options.enabled.value !== false
      : options.enabled !== false
  )
  const supplierCollectionPath = computed(
    () =>
      normalizeString(
        isRef(options.supplierCollectionPath)
          ? options.supplierCollectionPath.value
          : options.supplierCollectionPath
      ) || DEFAULT_SUPPLIER_COLLECTION_PATH
  )
  const collectionPath = computed(() => {
    if (!enabled.value) return ''

    return resolveSupplierItemCollectionPath(
      resolvedSupplierId.value,
      supplierCollectionPath.value
    )
  })
  const sourceRef = firestoreFetchCollection<SupplierItem>(collectionPath)

  const supplierItems = computed<SupplierItem[]>(() => sourceRef.value ?? [])
  const { byId: supplierItem } = useCollectionById(supplierItems)

  const count = computed(() => supplierItems.value.length)
  const pending = sourceRef.pending
  const error = sourceRef.error
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending,
    error,
  })

  return {
    count,
    pending,
    error,
    outcome,
    collectionPath,
    supplierItems,
    supplierItem,
  }
}
