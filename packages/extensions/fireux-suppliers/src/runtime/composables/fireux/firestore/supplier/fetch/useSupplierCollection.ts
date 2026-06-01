import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  SupplierStorage,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import { getDemoSuppliers } from '../../../app/utils/supplier-demo-scenarios'
import { useSupplierInterface } from '../utils/view/useSupplierInterface'

type SupplierCollectionDoc = Partial<Supplier> & {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

type AppSupplierOverlay = SupplierCollectionDoc & {
  operator_ids?: string[]
  team_ids?: string[]
}

const DEFAULT_COLLECTION_PATH = SupplierStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-suppliers'

export type SupplierCollectionFilterValue = string | number | null | undefined
export type SupplierCollectionFilter = {
  ids?: SupplierCollectionFilterValue[] | null | undefined
  operatorId?: SupplierCollectionFilterValue
  teamId?: SupplierCollectionFilterValue
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
  return normalizeString(supplier?.id)
}

function toDemoSupplierSurface(
  supplier: ReturnType<typeof getDemoSuppliers>[number]
): SupplierCollectionDoc {
  const id = resolveSupplierId(supplier)

  return {
    ...supplier,
    id,
    supplier_organization_name: normalizeString(supplier.supplier_organization_name),
    supplier_headline: normalizeString(supplier.supplier_headline),
    supplier_image: normalizeString(supplier.supplier_image),
  }
}

export function useSupplierCollection(
  options: UseSupplierCollectionOptions = {}
) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const { surface } = useSupplierInterface()
  const sourceMode = computed<SupplierCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const testSource = firestoreFetchCollection<SupplierCollectionDoc>(TEST_COLLECTION_PATH)
  const resolvedAppId = computed(() => normalizeString(appId))
  const overlayQuery = computed<Query<AppSupplierOverlay> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, SupplierStorage.overlayCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppSupplierOverlay>
  })
  const overlaySource = firestoreQuery<AppSupplierOverlay>(
    overlayQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${SupplierStorage.overlayCollection}`
        : ''
    )
  )
  const resolvedFilter = computed<SupplierCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterOperatorId = computed(() =>
    normalizeString(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId)
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => normalizeString(value))
          .filter(Boolean)
      )
  )
  const demoItems = computed<SupplierCollectionDoc[]>(() =>
    getDemoSuppliers().map(toDemoSupplierSurface)
  )
  const liveRootSource = firestoreFetchCollection<SupplierCollectionDoc>(
    DEFAULT_COLLECTION_PATH
  )
  const allowedSupplierIds = computed(() =>
    (overlaySource.value ?? [])
      .map((supplier) => resolveSupplierId(supplier))
      .filter(Boolean)
  )
  const liveRootDocs = firestoreLoadDocsByIds<SupplierCollectionDoc>({
    collectionPath: DEFAULT_COLLECTION_PATH,
    ids: allowedSupplierIds,
  })

  const liveItems = computed<SupplierCollectionDoc[]>(() => {
    const rootById = new Map<string, SupplierCollectionDoc>()
    const overlayById = new Map<string, AppSupplierOverlay>()

    for (const supplier of liveRootDocs.docs.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id) continue
      rootById.set(id, {
        ...supplier,
        id,
      })
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolveSupplierId(overlay)
      if (!id) continue
      overlayById.set(id, {
        ...overlay,
        id,
      })
    }

    const merged: SupplierCollectionDoc[] = []
    const seen = new Set<string>()

    for (const supplier of liveRootDocs.docs.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const item = surface({
        supplier: {
          ...(rootById.get(id) ?? {}),
          id,
        },
        overlay: overlayById.get(id) ?? {},
      })
      if (item) merged.push(item)
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolveSupplierId(overlay)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const item = surface({
        supplier: {
          ...(rootById.get(id) ?? {}),
          id,
        },
        overlay: overlayById.get(id) ?? {},
      })
      if (item) merged.push(item)
    }

    return merged
  })

  const collectionItems = computed<SupplierCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return demoItems.value
    if (sourceMode.value === 'test') return testSource.value ?? []
    if (!hasOperatorFilter.value) return liveRootSource.value ?? []
    return liveItems.value
  })

  const suppliers = computed<SupplierCollectionDoc[]>(() =>
    collectionItems.value.reduce<SupplierCollectionDoc[]>((acc, supplier) => {
      const id = resolveSupplierId(supplier)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        const operatorIds = Array.isArray(supplier?.operator_ids)
          ? supplier.operator_ids.map((value) => normalizeString(value))
          : []
        if (!operatorIds.includes(filterOperatorId.value)) return acc
      }

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
    if (!hasOperatorFilter.value) return liveRootSource.value === undefined
    return (
      liveRootDocs.docs.value === undefined ||
      liveRootDocs.pending.value ||
      overlaySource.value === undefined
    )
  })

  return {
    suppliers,
    count,
    pending,
  }
}
