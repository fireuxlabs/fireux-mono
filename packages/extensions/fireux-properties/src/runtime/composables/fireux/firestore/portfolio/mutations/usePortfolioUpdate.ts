import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type {
  Portfolio,
  PortfolioUpdateInput,
} from '../../../../../models/portfolio.model'
import { PortfolioStorage } from '../../../../../models/portfolio.model'

const COLLECTION_PATH = PortfolioStorage.rootCollection

export function usePortfolioUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  const updatePortfolio = async (
    portfolioId: string,
    patch: PortfolioUpdateInput,
    collectionPath: string = COLLECTION_PATH
  ) => {
    const id = String(portfolioId ?? '').trim()
    if (!id) throw new Error('Portfolio id is required')

    await updateDocument<Portfolio>(collectionPath, id, patch)
  }

  return { updatePortfolio }
}
