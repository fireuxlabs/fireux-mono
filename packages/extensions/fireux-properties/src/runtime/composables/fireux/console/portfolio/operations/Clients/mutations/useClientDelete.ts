import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import { ClientStorage } from '../../../../../../../models/client.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useClientDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ClientStorage.collection
  )

  async function deleteClient(clientId: string): Promise<void> {
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-properties] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-properties] demo runtime does not allow writes.')
    }

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
