import { computed, isRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  PortfolioStorage,
  type Portfolio,
} from '../../../../../models/portfolio.model'
import { usePortfolioInterface } from '../utils/view/usePortfolioInterface'

type PortfolioFetchDoc = Partial<Portfolio> & { id?: string }

type UsePortfolioFetchOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = PortfolioStorage.rootCollection

export function usePortfolioFetch(
  id: string | Ref<string>,
  options: UsePortfolioFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { surface } = usePortfolioInterface()
  const idRef = computed(() =>
    String(isRef(id) ? id.value || '' : id || '').trim()
  )
  const collectionPath = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    return String(configuredPath || '').trim() || DEFAULT_COLLECTION_PATH
  })
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
