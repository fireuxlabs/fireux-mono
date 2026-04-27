import { doc } from 'firebase/firestore'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { computed, isRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { AppSupplier, Supplier } from '../../../../../models/supplier/Supplier.model'

const supplierCollection = 'suppliers'
function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function normalizeSupplier(raw: Supplier, fallbackId: string): Supplier {
  return {
    ...raw,
    id: raw.id ?? fallbackId,
  }
}

function normalizeAppSupplier(raw: AppSupplier, fallbackId: string): AppSupplier {
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    team_ids: asStringArray(raw.team_ids),
    join_requests: asStringArray(raw.join_requests),
  }
}

export type SupplierRefs = {
  coreSupplier: Ref<Supplier | null | undefined>
  appSupplier: Ref<AppSupplier | null | undefined>
}

export function useSupplierRecord(
  id: string | null | undefined | Ref<string | null | undefined>,
  options: {
    collectionPath?: string | Ref<string | null | undefined>
  } = {}
) {
  const { appId } = useFireUXConfig()
  const supplierId = computed(() => (isRef(id) ? id.value : id))
  const collectionPath = computed(() =>
    String(isRef(options.collectionPath) ? options.collectionPath.value : options.collectionPath || supplierCollection).trim() ||
    supplierCollection
  )

  if (import.meta.server) {
    const supplier = computed<Supplier | null>(() => null)
    const coreSupplier = computed<Supplier | null | undefined>(() => null)
    const appSupplier = computed<AppSupplier | null | undefined>(() => null)
    const pending = computed(() => false)
    return { supplier, coreSupplier, appSupplier, pending }
  }

  const db = useFirestore()

  const coreDoc = computed(() =>
    supplierId.value ? (doc(db, collectionPath.value, supplierId.value) as any) : null
  )

  const appDoc = computed(() =>
    supplierId.value && appId
      ? (doc(db, 'apps', appId, supplierCollection, supplierId.value) as any)
      : null
  )

  const coreState = useDocument<Supplier | undefined>(coreDoc as any)
  const appState = useDocument<AppSupplier | undefined>(appDoc as any)

  const coreSupplier = computed<Supplier | null | undefined>(() => {
    if (coreState.pending.value) return undefined

    const raw = coreState.data.value
    if (!raw) return null

    return normalizeSupplier(raw as Supplier, supplierId.value ?? '')
  })

  const appSupplier = computed<AppSupplier | null | undefined>(() => {
    if (!appDoc.value) return null
    if (appState.pending.value) return undefined

    const raw = appState.data.value
    if (!raw) return null

    return normalizeAppSupplier(raw as AppSupplier, supplierId.value ?? '')
  })

  const supplier = computed<Supplier | null>(() => coreSupplier.value ?? null)
  const pending = computed(
    () => Boolean(coreState.pending.value) || Boolean(appState.pending.value)
  )

  return {
    supplier,
    coreSupplier,
    appSupplier,
    pending,
  }
}
