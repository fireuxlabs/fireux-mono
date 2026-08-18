// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Portfolio: pin identity updates to the canonical root collection.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type {
  Portfolio,
  PortfolioUpdateInput,
} from '../../../models/portfolio.model.ts'
import { PortfolioStorage } from '../../../models/portfolio.model.ts'

export function usePortfolioUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  const updatePortfolio = async (input: {
    portfolioId: string
    changes: PortfolioUpdateInput
  }) => {
    const id = String(input.portfolioId ?? '').trim()
    if (!id) throw new Error('Portfolio id is required')

    await updateDocument<Portfolio>(
      PortfolioStorage.rootCollection,
      id,
      input.changes
    )
  }

  return { updatePortfolio }
}
