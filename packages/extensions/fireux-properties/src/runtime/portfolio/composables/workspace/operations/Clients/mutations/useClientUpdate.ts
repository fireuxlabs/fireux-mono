import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from '../../useActivePortfolio'
import {
  ClientStorage,
  type Client,
  type ClientUpdateInput,
} from '../../../../../models/client.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useClientUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    ClientStorage.collection
  )

  async function updateClient(input: {
    clientId: string
    changes: ClientUpdateInput
  }): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-properties')

    const normalizedClientId = normalizeString(input.clientId)
    if (!normalizedClientId) {
      throw new Error('[fireux-properties] clientId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime client path is required.')
    }

    await updateDocument<Client>(
      collectionPath.value,
      normalizedClientId,
      input.changes
    )
  }

  return {
    updateClient,
  }
}
