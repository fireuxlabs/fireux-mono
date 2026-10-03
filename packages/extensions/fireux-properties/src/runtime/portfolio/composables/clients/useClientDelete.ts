import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from '../workspace/useActivePortfolio'
import { ClientStorage } from '../../models/client.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useClientDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    ClientStorage.collection
  )

  async function deleteClient(clientId: string): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-properties')

    const normalizedClientId = normalizeString(clientId)
    if (!normalizedClientId) {
      throw new Error('[fireux-properties] clientId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime client path is required.')
    }

    await deleteDocument(collectionPath.value, normalizedClientId)
  }

  return {
    deleteClient,
  }
}
