import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { PortfolioStorage } from '../../../../../models/portfolio.model'

const clean = (value: unknown) => String(value ?? '').trim()

export function usePortfolioDelete() {
  const { deleteDocument } = useFirestoreDelete()

  async function deletePortfolio(portfolioId: string) {
    const id = clean(portfolioId)
    if (!id) throw new Error('Portfolio id is required')

    await deleteDocument(PortfolioStorage.rootCollection, id)
  }

  return {
    deletePortfolio,
  }
}
