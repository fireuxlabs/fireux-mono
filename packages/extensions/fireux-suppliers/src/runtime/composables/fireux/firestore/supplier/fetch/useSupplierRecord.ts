import { doc } from 'firebase/firestore'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { computed, isRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { ConsoleSupplier, Supplier } from '../../../../../models/supplier/Supplier.model'

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

function normalizeConsoleSupplier(raw: ConsoleSupplier, fallbackId: string): ConsoleSupplier {
  const anyRaw = raw as any
  return {
    ...raw,
    id: raw.id ?? fallbackId,
    admin_ids: asStringArray(anyRaw.admin_ids),
    join_requests: asStringArray(anyRaw.join_requests),
    console_enabled:
      typeof anyRaw.console_enabled === 'boolean' ? anyRaw.console_enabled : false,
  }
}

export type SupplierRefs = {
  coreSupplier: Ref<Supplier | null | undefined>
  appSupplier: Ref<ConsoleSupplier | null | undefined>
}

export function useSupplierRecord(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const { appId } = useFireUXConfig()
  const supplierId = computed(() => (isRef(id) ? id.value : id))

  if (import.meta.server) {
    const supplier = computed<Supplier | null>(() => null)
    const coreSupplier = computed<Supplier | null | undefined>(() => null)
    const appSupplier = computed<ConsoleSupplier | null | undefined>(() => null)
    const pending = computed(() => false)
    return { supplier, coreSupplier, appSupplier, pending }
  }

  const db = useFirestore()

  const coreDoc = computed(() =>
    supplierId.value ? (doc(db, supplierCollection, supplierId.value) as any) : null
  )

  const appDoc = computed(() =>
    supplierId.value && appId
      ? (doc(db, 'apps', appId, supplierCollection, supplierId.value) as any)
      : null
  )

  const coreState = useDocument<Supplier | undefined>(coreDoc as any)
  const appState = useDocument<ConsoleSupplier | undefined>(appDoc as any)

  const coreSupplier = computed<Supplier | null | undefined>(() => {
    if (coreState.pending.value) return undefined

    const raw = coreState.data.value
    if (!raw) return null

    return normalizeSupplier(raw as Supplier, supplierId.value ?? '')
  })

  const appSupplier = computed<ConsoleSupplier | null | undefined>(() => {
    if (!appDoc.value) return null
    if (appState.pending.value) return undefined

    const raw = appState.data.value
    if (!raw) return null

    return normalizeConsoleSupplier(raw as ConsoleSupplier, supplierId.value ?? '')
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
