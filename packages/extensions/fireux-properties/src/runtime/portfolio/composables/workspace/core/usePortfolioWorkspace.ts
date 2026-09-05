import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { PortfolioStorage } from '../../../models/portfolio.model.ts'
import { usePortfolioCreate } from '../../firestore/mutations/usePortfolioCreate'
import { usePortfolioUpdate } from '../../firestore/mutations/usePortfolioUpdate'
import { usePortfolioFetch } from '../../firestore/fetch/usePortfolioFetch'

export function usePortfolioWorkspace() {
  const { selectedId: id } = useWorkspace('portfolio')
  const creation = usePortfolioCreate()
  const update = usePortfolioUpdate()
  const { deleteDocument } = useFirestoreDelete()
  const { portfolio: data, outcome } = usePortfolioFetch(id)
  return { data, id, outcome, crud: {
    create: creation.createPortfolioWorkspace,
    update: (changes: Parameters<typeof update.updatePortfolio>[0]['changes']) => update.updatePortfolio({ portfolioId: id.value, changes }),
    delete: () => deleteDocument(PortfolioStorage.rootCollection, id.value),
  } }
}
