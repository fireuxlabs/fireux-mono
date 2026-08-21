// Concurrent edit — 2026-07-20 22:40 CEST — Supplier/Portfolio Authority Hardening: pin single Portfolio reads to allowlisted root and App paths.
import { computed, isRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  PortfolioStorage,
  type Portfolio,
} from '../../../models/portfolio.model.ts'
import { usePortfolioInterface } from '../utils/view/usePortfolioInterface'

type PortfolioFetchDoc = Partial<Portfolio> & { id?: string }

const DEFAULT_COLLECTION_PATH = PortfolioStorage.rootCollection

export function usePortfolioFetch(id: string | Ref<string>) {
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
