import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Supplier } from '../../../../../models/supplier/Supplier.model'

type SupplierCollectionDoc = Partial<Supplier> & {
  id?: string
  supplier_id?: string
  source_supplier_id?: string
}

type AppSupplierOverlay = SupplierCollectionDoc & {
  team_ids?: string[]
  admin_ids?: string[]
  console_enabled?: boolean
}

const DEFAULT_COLLECTION_PATH = 'suppliers'
const TEST_COLLECTION_PATH = 'test-suppliers'

export type SupplierCollectionFilterValue = string | number | null | undefined
export type SupplierCollectionFilter = {
  ids?: SupplierCollectionFilterValue[] | null | undefined
}
export type SupplierCollectionSource = 'live' | 'demo' | 'test'

type UseSupplierCollectionOptions = {
  source?:
    | SupplierCollectionSource
    | Ref<SupplierCollectionSource | null | undefined>
    | null
  filter?:
    | SupplierCollectionFilter
    | Ref<SupplierCollectionFilter | null | undefined>
    | null
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function resolveSupplierId(supplier: Partial<SupplierCollectionDoc> | null | undefined) {
  return normalizeString(
    supplier?.id || supplier?.supplier_id || supplier?.source_supplier_id || ''
  )
}

export function useSupplierCollection(
  options: UseSupplierCollectionOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const sourceMode = computed<SupplierCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const liveSource = firestoreFetchCollection<SupplierCollectionDoc>(
    DEFAULT_COLLECTION_PATH
  )
  const testSource = firestoreFetchCollection<SupplierCollectionDoc>(
    TEST_COLLECTION_PATH
  )
  const resolvedAppId = normalizeString(appId)
  const overlaySource = resolvedAppId
    ? firestoreFetchCollection<AppSupplierOverlay>(
        `apps/${resolvedAppId}/${DEFAULT_COLLECTION_PATH}`
      )
    : null
  const resolvedFilter = computed<SupplierCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => normalizeString(value))
          .filter(Boolean)
      )
  )

  const liveItems = computed<SupplierCollectionDoc[]>(() => {
    const rootById = new Map<string, SupplierCollectionDoc>()
    const overlayById = new Map<string, AppSupplierOverlay>()

    for (const supplier of liveSource.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id) continue
      rootById.set(id, {
        ...supplier,
        id,
      })
    }

    for (const overlay of overlaySource?.value ?? []) {
      const id = resolveSupplierId(overlay)
      if (!id) continue
      overlayById.set(id, {
        ...overlay,
        id,
      })
    }

    const merged: SupplierCollectionDoc[] = []
    const seen = new Set<string>()

    for (const supplier of liveSource.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id || seen.has(id)) continue
      seen.add(id)

      merged.push({
        ...(rootById.get(id) ?? {}),
        ...(overlayById.get(id) ?? {}),
        id,
      })
    }

    for (const overlay of overlaySource?.value ?? []) {
      const id = resolveSupplierId(overlay)
      if (!id || seen.has(id)) continue
      seen.add(id)

      merged.push({
        ...(rootById.get(id) ?? {}),
        ...(overlayById.get(id) ?? {}),
        id,
      })
    }

    return merged
  })

  const collectionItems = computed<SupplierCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') return testSource.value ?? []
    return liveItems.value
  })

  const suppliers = computed<SupplierCollectionDoc[]>(() =>
    collectionItems.value.reduce<SupplierCollectionDoc[]>((acc, supplier) => {
      const id = resolveSupplierId(supplier)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc

      acc.push({
        ...supplier,
        id,
      })

      return acc
    }, [])
  )

  const count = computed(() => suppliers.value.length)
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (sourceMode.value === 'test') return testSource.value === undefined
    return (
      liveSource.value === undefined ||
      (overlaySource ? overlaySource.value === undefined : false)
    )
  })

  return {
    suppliers,
    count,
    pending,
  }
}
