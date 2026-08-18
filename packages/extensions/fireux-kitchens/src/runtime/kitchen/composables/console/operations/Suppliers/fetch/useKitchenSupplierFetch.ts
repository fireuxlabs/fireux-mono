import { useFetch } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { SupplierStorage } from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import type { PublicSupplierIndex } from 'fireux-suppliers/runtime/supplier/models/supplier-public.model'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { resolveKitchenChildCollectionBasePath } from '../../../../firestore/utils/paths/useKitchenChildCollection'

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
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )
  const supplierLinksRef = firestoreFetchCollection<SupplierDoc>(collectionPath)
  const supplierNetwork = useFetch<PublicSupplierIndex>('/api/supply/suppliers', {
    key: 'bringli-public-suppliers',
    immediate: isEnabled.value,
  })

  const supplierLinks = computed<SupplierDoc[]>(() => supplierLinksRef.value ?? [])
  const networkSuppliers = computed<SupplierDoc[]>(() =>
    (supplierNetwork.data.value?.suppliers ?? []).map((entry: PublicSupplierIndex['suppliers'][number]) => ({
      ...entry,
      supplier_organization_name: entry.organization_name,
      supplier_headline: entry.headline,
      supplier_image: entry.image_url,
      supplier_item_categories: entry.categories,
      supplier_delivery_areas: entry.delivery_areas,
    }))
  )

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
      const canonical = supplierRefId ? canonicalSupplierById.value.get(supplierRefId) ?? null : null

      const merged: SupplierDoc = {
        ...(canonical ?? {}),
        ...overlay,
        id: overlayId || supplierRefId,
        kitchen_id: firstNonEmpty((overlay as any).kitchen_id, resolvedKitchenId.value),
      }

      if (supplierRefId) {
        merged.supplier_id = supplierRefId
        merged.source_supplier_id = supplierRefId
      }

      const resolvedName = firstNonEmpty(
        (overlay as any).name,
        (canonical as any)?.name,
        (canonical as any)?.supplier_organization_name,
        (canonical as any)?.supplier_headline,
        (canonical as any)?.title,
        supplierRefId,
        overlayId
      )

      if (resolvedName) merged.name = resolvedName

      return merged
    })
  )

  const count = computed(() => suppliers.value.length)
  const pending = computed(() => {
    if (!isEnabled.value || !resolvedKitchenId.value) return false

    return (
      supplierLinksRef.value === undefined || supplierNetwork.pending.value
    )
  })

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    supplierLinks,
    suppliers,
    count,
    pending,
    error: computed(() => supplierNetwork.error.value ?? null),
  }
}
