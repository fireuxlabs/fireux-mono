import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  requirePortfolioWrite,
  usePortfolioScope,
  usePortfolioChildPath,
} from '../usePortfolioScope'
import {
  ClientStorage,
  type Client,
  type ClientCreateInput,
} from '../../models/client.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useClientCreate(
  runtimePortfolio: ReturnType<typeof usePortfolioScope>
) {
  const { createDocument: create } = useFirestoreCreate()
  const collectionPath = usePortfolioChildPath(
    runtimePortfolio,
    ClientStorage.collection
  )

  async function createClient(input: ClientCreateInput): Promise<string> {
    const portfolioId = requirePortfolioWrite(
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

    return create(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createClient,
  }
}
