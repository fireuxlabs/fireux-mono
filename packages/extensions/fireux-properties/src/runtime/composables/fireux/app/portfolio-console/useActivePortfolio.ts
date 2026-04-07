import { doc as firestoreDoc, type DocumentSnapshot } from 'firebase/firestore'
import { computed, ref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioSelection } from './usePortfolioSelection'
import {
  ROOT_PORTFOLIO_COLLECTION_PATH,
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from './shared'

type ActivePortfolioRecord = Partial<Portfolio> & Record<string, unknown> & {
  id?: string
}

export { usePortfolioSelection } from './usePortfolioSelection'

/**
 * Live portfolio loader.
 * Loads the selected portfolio document from `portfolios/<id>`.
 * Keeps the app-scoped collection path because portfolio child data depends on it.
 */
export function useActivePortfolio() {
  const { appId } = useFireUXConfig()
  const { selectedId: id } = usePortfolioSelection()
  const db = import.meta.server ? null : useFirestore()

  const portfolioRef = computed(() => {
    if (!db || !id.value) return null
    return firestoreDoc(db, ROOT_PORTFOLIO_COLLECTION_PATH, id.value)
  })

  const livePortfolio =
    import.meta.server || !db
      ? {
          data: ref<ActivePortfolioRecord | null>(null),
          pending: ref(false),
        }
      : useDocument<ActivePortfolioRecord | null>(portfolioRef as any, {
          transform: (docSnap: DocumentSnapshot<ActivePortfolioRecord>) => {
            const raw = docSnap.data()
            if (!raw) return null
            return { ...(raw as any), id: docSnap.id } as ActivePortfolioRecord
          },
        } as any)

  const portfolio = computed<ActivePortfolioRecord | null>(() => {
    if (!id.value) return null
    return livePortfolio.data?.value ?? null
  })

  const pending = computed(() => Boolean(livePortfolio.pending?.value))
  const collectionPath = computed(() => resolvePortfolioConsoleCollectionPath(appId))

  return {
    id,
    portfolio,
    pending,
    collectionPath,
  }
}

export type RuntimePortfolioRef = ReturnType<typeof useActivePortfolio>

export function useRuntimePortfolioPath(
  portfolioConsole: RuntimePortfolioRef,
  suffix: string
): Ref<string> {
  return computed(() => {
    const portfolioId = String(portfolioConsole.id.value || '').trim()
    if (!portfolioId) return ''
    return resolveRuntimePortfolioPath(
      portfolioConsole.collectionPath.value,
      portfolioId,
      suffix
    )
  })
}
