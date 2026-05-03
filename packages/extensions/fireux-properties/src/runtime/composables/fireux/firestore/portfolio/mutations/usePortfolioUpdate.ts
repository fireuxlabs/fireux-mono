import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type {
  Portfolio,
  PortfolioUpdateInput,
} from '../../../../../models/portfolio.model'

const COLLECTION_PATH = 'portfolios'

export function usePortfolioUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  const updatePortfolio = async (
    portfolioId: string,
    patch: PortfolioUpdateInput,
    collectionPath = COLLECTION_PATH
  ) => {
    await updateDocument<Portfolio>(collectionPath, portfolioId, patch)
  }

  return { updatePortfolio }
}
