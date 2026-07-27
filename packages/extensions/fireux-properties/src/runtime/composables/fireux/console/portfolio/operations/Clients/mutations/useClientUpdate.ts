import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import {
  ClientStorage,
  type Client,
  type ClientUpdateInput,
} from '../../../../../../../models/client.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useClientUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ClientStorage.collection
  )

  async function updateClient(
    clientId: string,
    patch: ClientUpdateInput
  ): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-properties')

    const normalizedClientId = normalizeString(clientId)
    if (!normalizedClientId) {
      throw new Error('[fireux-properties] clientId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime client path is required.')
    }

    await updateDocument<Client>(collectionPath.value, normalizedClientId, patch)
  }

  return {
    updateClient,
  }
}
