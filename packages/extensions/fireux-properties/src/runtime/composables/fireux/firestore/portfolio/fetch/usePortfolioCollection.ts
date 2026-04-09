import { computed, isRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Portfolio } from '../../../../../models/portfolio.model'

type PortfolioCollectionDoc = Partial<Portfolio> & { id?: string }

type UsePortfolioCollectionOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'portfolios'

export function usePortfolioCollection(options: UsePortfolioCollectionOptions = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())

  const source = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    return firestoreFetchCollection<PortfolioCollectionDoc>(collectionPath)
  })

  const portfolios = computed(() =>
    (source.value?.value ?? [])
      .map((portfolio) => ({
        ...portfolio,
        id: String(portfolio?.id || '').trim(),
      }))
      .filter((portfolio) => Boolean(portfolio.id))
  )

  const count = computed(() => portfolios.value.length)
  const pending = computed(() => source.value?.value === undefined)

  return {
    portfolios,
    count,
    pending,
  }
}
