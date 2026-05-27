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
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())

  const source = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (!docId) return null
    return firestoreFetchDoc<PortfolioFetchDoc>(collectionPath, docId)
  })

  const portfolio = computed<PortfolioFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    const entry = source.value?.value
    if (!docId || !entry) return null
    return surface({
      portfolio: {
        ...entry,
        id: String(entry?.id || docId).trim(),
      },
    }) as PortfolioFetchDoc | null
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (!docId) return false
    return source.value?.value === undefined
  })

  return {
    portfolio,
    pending,
  }
}
