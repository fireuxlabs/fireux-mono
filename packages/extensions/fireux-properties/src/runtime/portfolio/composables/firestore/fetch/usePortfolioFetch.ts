// Concurrent edit — 2026-07-20 22:40 CEST — Supplier/Portfolio Authority Hardening: pin single Portfolio reads to allowlisted root and App paths.
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import {
  AppPortfolioStorage,
  PortfolioStorage,
  type AppPortfolio,
  type Portfolio,
} from '../../../models/portfolio.model.ts'
import { usePortfolioInterface } from '../utils/view/usePortfolioInterface'

type PortfolioFetchDoc = Partial<Portfolio> & { id?: string }

const DEFAULT_COLLECTION_PATH = PortfolioStorage.rootCollection
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeIds = (value: unknown) =>
  Array.isArray(value)
    ? value.map(normalizeString).filter(Boolean)
    : []

export function usePortfolioFetch(
  id: string | Ref<string>
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { surface } = usePortfolioInterface()
  const idRef = computed(() =>
    String(isRef(id) ? id.value || '' : id || '').trim()
  )
  const collectionPath = computed(() => DEFAULT_COLLECTION_PATH)
  const source = firestoreFetchDoc<PortfolioFetchDoc>(collectionPath, idRef)

  const portfolio = computed<PortfolioFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    const entry = source.value
    if (!docId || !entry) return null
    return surface({
      portfolio: {
        ...entry,
        id: String(entry?.id || docId).trim(),
      },
    }) as PortfolioFetchDoc | null
  })

  const pending = computed(() => source.pending.value)

  return {
    portfolio,
    pending,
    error: source.error,
    outcome: source.outcome,
  }
}

export function useAppPortfolioFetch(id: string | Ref<string>) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const idRef = computed(() =>
    String(isRef(id) ? id.value || '' : id || '').trim()
  )
  const collectionPath = computed(() => {
    const currentAppId = String(appId || '').trim()
    return currentAppId
      ? `${AppStorage.collection}/${currentAppId}/${AppPortfolioStorage.collection}`
      : ''
  })
  const source = firestoreFetchDoc<AppPortfolio>(collectionPath, idRef)
  const appPortfolio = computed<AppPortfolio | null>(() => {
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
    source.value && !appPortfolio.value
      ? new Error(
          `[fireux-properties] invalid AppPortfolio access record: ${idRef.value}`
        )
      : undefined
  )

  return {
    collectionPath,
    appPortfolio,
    exists: computed(() => Boolean(appPortfolio.value)),
    pending: source.pending,
    error: computed(() => source.error.value ?? schemaError.value),
    outcome: computed(() =>
      schemaError.value ? 'error' as const : source.outcome.value
    ),
  }
}
