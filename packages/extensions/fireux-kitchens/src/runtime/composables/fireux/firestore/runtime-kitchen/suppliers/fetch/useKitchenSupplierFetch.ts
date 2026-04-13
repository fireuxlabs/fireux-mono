import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, unref, watch } from 'vue'
import { resolveKitchenConsoleCollectionPath } from '../../../../app/kitchen-console/shared'

const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/suppliers`

type SupplierRecord = Record<string, unknown>

type UseKitchenSupplierFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
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

const resolveSupplierReferenceId = (supplierLink: SupplierRecord): string =>
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
  const { firestoreFetchCollection } = useFirestoreRead()
  const { appId } = useFireUXConfig()

  const isEnabled = computed(() => unref(options.enabled) !== false)

  const resolvedKitchenId = computed(() =>
    normalizeString(typeof kitchenId === 'string' ? kitchenId : kitchenId.value)
  )

  const kitchenCollectionPath = computed(() =>
    normalizeString(unref(options.kitchenCollectionPath) || '') ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const collectionPath = computed(() =>
    isEnabled.value && resolvedKitchenId.value
      ? resolveKitchenCollectionPath(kitchenCollectionPath.value, resolvedKitchenId.value)
      : ''
  )

  const canonicalCorePath = computed(() => (isEnabled.value ? 'suppliers' : ''))

  const canonicalAppPath = computed(() =>
    isEnabled.value && appId ? `apps/${appId}/suppliers` : ''
  )

  const supplierLinksRef = shallowRef(null) as ShallowRef<Ref<SupplierRecord[] | undefined> | null>
  const coreSuppliersRef = shallowRef(null) as ShallowRef<Ref<SupplierRecord[] | undefined> | null>
  const appSuppliersRef = shallowRef(null) as ShallowRef<Ref<SupplierRecord[] | undefined> | null>

  watch(
    collectionPath,
    (nextPath) => {
      supplierLinksRef.value = nextPath ? firestoreFetchCollection<SupplierRecord>(nextPath) : null
    },
    { immediate: true }
  )

  watch(
    canonicalCorePath,
    (nextPath) => {
      coreSuppliersRef.value = nextPath ? firestoreFetchCollection<SupplierRecord>(nextPath) : null
    },
    { immediate: true }
  )

  watch(
    canonicalAppPath,
    (nextPath) => {
      appSuppliersRef.value = nextPath ? firestoreFetchCollection<SupplierRecord>(nextPath) : null
    },
    { immediate: true }
  )

  const supplierLinks = computed<SupplierRecord[]>(() => supplierLinksRef.value?.value ?? [])
  const coreSuppliers = computed<SupplierRecord[]>(() => coreSuppliersRef.value?.value ?? [])
  const appSuppliers = computed<SupplierRecord[]>(() => appSuppliersRef.value?.value ?? [])

  const canonicalSupplierById = computed(() => {
    const map = new Map<string, SupplierRecord>()

    const append = (entry: SupplierRecord) => {
      const refId = firstNonEmpty((entry as any).id, (entry as any).supplier_id)
      if (!refId) return

      map.set(refId, {
        ...(map.get(refId) ?? {}),
        ...entry,
        id: refId,
      })
    }

    for (const entry of coreSuppliers.value) append(entry)
    for (const entry of appSuppliers.value) append(entry)

    return map
  })

  const suppliers = computed<SupplierRecord[]>(() =>
    supplierLinks.value.map((entry) => {
      const overlay = entry as SupplierRecord
      const overlayId = normalizeString((overlay as any).id)
      const supplierRefId = resolveSupplierReferenceId(overlay)
      const canonical = supplierRefId ? canonicalSupplierById.value.get(supplierRefId) ?? null : null

      const merged: SupplierRecord = {
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

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    supplierLinks,
    suppliers,
    count,
  }
}
