import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, isRef, type Ref } from 'vue'
import {
  SupplierProductStorage,
  SupplierStorage,
  type SupplierProduct,
} from '../../../../../models/supplier/Supplier.model'

const DEFAULT_SUPPLIER_COLLECTION_PATH: string = SupplierStorage.rootCollection

const normalizeString = (value: unknown) => String(value ?? '').trim()

export const resolveSupplierProductCollectionPath = (
  supplierId?: string | null | undefined,
  supplierCollectionPath = DEFAULT_SUPPLIER_COLLECTION_PATH
) => {
  const resolvedSupplierId = normalizeString(supplierId)
  const resolvedCollectionPath =
    normalizeString(supplierCollectionPath) || DEFAULT_SUPPLIER_COLLECTION_PATH

  if (!resolvedSupplierId) return ''

  return `${resolvedCollectionPath}/${resolvedSupplierId}/${SupplierProductStorage.collection}`
}

export function useSupplierProductCollection(
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
  const supplierCollectionPath = computed(() =>
    normalizeString(
      isRef(options.supplierCollectionPath)
        ? options.supplierCollectionPath.value
        : options.supplierCollectionPath
    ) || DEFAULT_SUPPLIER_COLLECTION_PATH
  )
  const collectionPath = computed(() => {
    if (!enabled.value) return ''

    return resolveSupplierProductCollectionPath(
      resolvedSupplierId.value,
      supplierCollectionPath.value
    )
  })
  const sourceRef = firestoreFetchCollection<SupplierProduct>(collectionPath)

  const supplierProducts = computed<SupplierProduct[]>(() =>
    sourceRef.value ?? []
  )
  const pending = computed(
    () => Boolean(collectionPath.value) && sourceRef.value === undefined
  )

  return {
    collectionPath,
    supplierProducts,
    pending,
  }
}
