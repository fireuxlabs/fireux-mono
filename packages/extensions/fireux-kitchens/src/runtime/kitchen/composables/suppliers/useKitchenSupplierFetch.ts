import { useFetch } from 'nuxt/app'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  SupplierStorage,
  type Supplier,
} from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { resolveKitchenChildCollectionBasePath } from '../../utils/kitchen-collection-path'

const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${SupplierStorage.collection}`

type SupplierDoc = Record<string, unknown>

type UseKitchenSupplierFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
  enabled?: boolean | Ref<boolean | null | undefined>
}

const normalizeString = (value: unknown): string => String(value ?? '').trim()

const firstNonEmpty = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = normalizeString(value)
    if (normalized) return normalized
  }
  return ''
}

const resolveSupplierReferenceId = (supplierLink: SupplierDoc): string =>
  // Canon key for Kitchen<->Supplier links is supplier_id.
  // Migration alias only — do not use aliases in new writes.
  firstNonEmpty(
    (supplierLink as any).supplier_id,
    (supplierLink as any).source_supplier_id,
    (supplierLink as any).supplier_profile_id,
    (supplierLink as any).drop_supplier_id,
    (supplierLink as any).profile_id,
    (supplierLink as any).id
  )

export function useKitchenSupplierFetch(
  kitchenId: Ref<string> | string,
  options: UseKitchenSupplierFetchOptions = {}
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const isEnabled = computed(() => unref(options.enabled) !== false)

  const resolvedKitchenId = computed(() =>
    normalizeString(typeof kitchenId === 'string' ? kitchenId : kitchenId.value)
  )

  const kitchenCollectionPath = computed(() =>
    resolveKitchenChildCollectionBasePath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      collectionName: SupplierStorage.collection,
      appId,
    })
  )

  const collectionPath = computed(() =>
    isEnabled.value && resolvedKitchenId.value
      ? resolveKitchenCollectionPath(
          kitchenCollectionPath.value,
          resolvedKitchenId.value
        )
      : ''
  )
  const supplierLinksRef = firestoreFetchCollection<SupplierDoc>(collectionPath)
  const supplierNetwork = useFetch<{
    suppliers: Supplier[]
    places: Place[]
  }>('/api/supply/suppliers', {
    key: 'bringli-suppliers',
    immediate: isEnabled.value,
  })

  const supplierLinks = computed<SupplierDoc[]>(
    () => supplierLinksRef.value ?? []
  )
  const networkSuppliers = computed<SupplierDoc[]>(() => {
    const places = new Map(
      (supplierNetwork.data.value?.places ?? []).map((place) => [
        place.id,
        place,
      ])
    )
    return (supplierNetwork.data.value?.suppliers ?? []).map((supplier) => ({
      ...supplier,
      company_place: places.get(String(supplier.company_id || '').trim()),
    })) as SupplierDoc[]
  })

  const canonicalSupplierById = computed(() => {
    const map = new Map<string, SupplierDoc>()

    const append = (entry: SupplierDoc) => {
      const refId = firstNonEmpty((entry as any).id, (entry as any).supplier_id)
      if (!refId) return

      map.set(refId, {
        ...(map.get(refId) ?? {}),
        ...entry,
        id: refId,
      })
    }

    for (const entry of networkSuppliers.value) append(entry)

    return map
  })

  const suppliers = computed<SupplierDoc[]>(() =>
    supplierLinks.value.map((entry) => {
      const overlay = entry as SupplierDoc
      const overlayId = normalizeString((overlay as any).id)
      const supplierRefId = resolveSupplierReferenceId(overlay)
      const canonical = supplierRefId
        ? (canonicalSupplierById.value.get(supplierRefId) ?? null)
        : null

      const merged: SupplierDoc = {
        ...(canonical ?? {}),
        ...overlay,
        id: overlayId || supplierRefId,
        kitchen_id: firstNonEmpty(
          (overlay as any).kitchen_id,
          resolvedKitchenId.value
        ),
      }

      if (supplierRefId) {
        merged.supplier_id = supplierRefId
        merged.source_supplier_id = supplierRefId
      }

      const companyPlace = (canonical as any)?.company_place
      const resolvedName = firstNonEmpty(
        (overlay as any).name,
        companyPlace?.short_name,
        companyPlace?.name,
        supplierRefId,
        overlayId
      )

      if (resolvedName) merged.name = resolvedName

      return merged
    })
  )

  const count = computed(() => suppliers.value.length)
  const pending = computed(
    () =>
      Boolean(collectionPath.value) &&
      (supplierLinksRef.pending.value ||
        (supplierLinks.value.length > 0 && supplierNetwork.pending.value))
  )
  const error = computed(() =>
    !collectionPath.value
      ? undefined
      : supplierLinksRef.error.value ||
        (supplierLinks.value.length > 0
          ? supplierNetwork.error.value
          : undefined)
  )
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(collectionPath.value)),
    count,
    pending,
    error,
  })

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    supplierLinks,
    suppliers,
    count,
    pending,
    error,
    outcome,
  }
}
