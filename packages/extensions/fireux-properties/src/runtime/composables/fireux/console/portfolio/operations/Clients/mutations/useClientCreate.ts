import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import {
  ClientStorage,
  type Client,
  type ClientCreateInput,
} from '../../../../../../../models/client.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useClientCreate(runtimePortfolio = useActivePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ClientStorage.collection
  )

  async function createClient(input: ClientCreateInput): Promise<string> {
    const portfolioId = requirePortfolioConsoleWrite(
      runtimePortfolio,
      'fireux-properties'
    )

    const displayName = normalizeString(input.display_name)
    if (!displayName) {
      throw new Error('[fireux-properties] client display_name is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime client path is required.')
    }

    const payload: Partial<Client> = {
      ...input,
      portfolio_id: portfolioId,
      display_name: displayName,
    }

    return createDocument<Partial<Client>>(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createClient,
  }
}
