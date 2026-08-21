import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed, isRef, type Ref } from 'vue'
import {
  SupplierCatalogueStorage,
  SupplierStorage,
  type SupplierCatalogue,
} from '../../../models/Supplier.model.ts'

const DEFAULT_SUPPLIER_COLLECTION_PATH: string = SupplierStorage.collection

const normalizeString = (value: unknown) => String(value ?? '').trim()

export const resolveSupplierCatalogueCollectionPath = (
  supplierId?: string | null | undefined,
  supplierCollectionPath = DEFAULT_SUPPLIER_COLLECTION_PATH
) => {
  const resolvedSupplierId = normalizeString(supplierId)
  const resolvedCollectionPath =
    normalizeString(supplierCollectionPath) || DEFAULT_SUPPLIER_COLLECTION_PATH

  if (!resolvedSupplierId) return ''

  return `${resolvedCollectionPath}/${resolvedSupplierId}/${SupplierCatalogueStorage.collection}`
}

export function useSupplierCatalogueCollection(
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

    return resolveSupplierCatalogueCollectionPath(
      resolvedSupplierId.value,
      supplierCollectionPath.value
    )
  })
  const sourceRef = firestoreFetchCollection<SupplierCatalogue>(collectionPath)

  const supplierCatalogues = computed<SupplierCatalogue[]>(
    () => sourceRef.value ?? []
  )
  const pending = computed(
    () => Boolean(collectionPath.value) && sourceRef.value === undefined
  )
  const { byId: supplierCatalogue } = useCollectionById(supplierCatalogues)

  return {
    collectionPath,
    supplierCatalogues,
    supplierCatalogue,
    pending,
  }
}
