// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep demo payloads outside the Firestore document seam.
// Concurrent edit — 2026-07-20 22:40 CEST — Supplier/Portfolio Authority Hardening: pin single Supplier reads to allowlisted root and App paths.
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import {
  AppSupplierStorage,
  SupplierStorage,
  type AppSupplier,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import { useSupplierInterface } from '../utils/view/useSupplierInterface'

type SupplierFetchDoc = Partial<Supplier> & {
  id?: string
  name?: string
  short_name?: string
}
export type SupplierFetchSource = 'live' | 'test' | 'demo'
export type SupplierFetchKey = 'id' | 'slug'

type UseSupplierFetchOptions = {
  source?: SupplierFetchSource | Ref<SupplierFetchSource>
  key?: SupplierFetchKey | Ref<SupplierFetchKey>
}

const DEFAULT_COLLECTION_PATH = SupplierStorage.rootCollection
const UNSUPPORTED_TEST_SOURCE_MESSAGE =
  '[fireux-suppliers] Supplier Test source is unsupported: no canonical simulation producer exists.'
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeIds = (value: unknown) =>
  Array.isArray(value)
    ? value.map(normalizeString).filter(Boolean)
    : []

export function useSupplierFetch(
  id: string | Ref<string>,
  options: UseSupplierFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { surface } = useSupplierInterface()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const sourceRef = isRef(options.source)
    ? options.source
    : computed<SupplierFetchSource>(() =>
        typeof options.source === 'string' ? options.source : 'live'
      )
  const documentPath = computed(() =>
    sourceRef.value === 'live' ? DEFAULT_COLLECTION_PATH : ''
  )
  const documentId = computed(() =>
    sourceRef.value !== 'live'
      ? ''
      : String(idRef.value || '').trim()
  )
  const source = firestoreFetchDoc<SupplierFetchDoc>(
    documentPath,
    documentId
  )
  const supplier = computed<SupplierFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'live') return null

    const entry = source.value
    if (!docId || !entry) return null
    return surface({
      supplier: {
        ...entry,
        id: String(entry?.id || docId).trim(),
      },
    }) as SupplierFetchDoc | null
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'live') return false
    if (!docId) return false
    return source.pending.value
  })
  const error = computed(() => {
    if (sourceRef.value === 'demo') return undefined
    if (sourceRef.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    return source.error.value
  })

  return {
    supplier,
    pending,
    error,
  }
}

export function useAppSupplierFetch(id: string | Ref<string>) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const idRef = computed(() =>
    String(isRef(id) ? id.value || '' : id || '').trim()
  )
  const collectionPath = computed(() => {
    const currentAppId = String(appId || '').trim()
    return currentAppId
      ? `${AppStorage.collection}/${currentAppId}/${AppSupplierStorage.collection}`
      : ''
  })
  const source = firestoreFetchDoc<AppSupplier>(collectionPath, idRef)
  const appSupplier = computed<AppSupplier | null>(() => {
    const value = source.value
    const storedId = normalizeString(value?.id)
    if (!value || !storedId || !value.created || !value.updated) return null

    return {
      id: storedId,
      operator_ids: normalizeIds(value.operator_ids),
      team_ids: normalizeIds(value.team_ids),
      join_requests: normalizeIds(value.join_requests),
      created: value.created,
      updated: value.updated,
    }
  })
  const schemaError = computed(() =>
    source.value && !appSupplier.value
      ? new Error(
          `[fireux-suppliers] invalid AppSupplier access record: ${idRef.value}`
        )
      : undefined
  )

  return {
    collectionPath,
    appSupplier,
    exists: computed(() => Boolean(appSupplier.value)),
    pending: source.pending,
    error: computed(() => source.error.value ?? schemaError.value),
    outcome: computed(() =>
      schemaError.value ? 'error' as const : source.outcome.value
    ),
  }
}
