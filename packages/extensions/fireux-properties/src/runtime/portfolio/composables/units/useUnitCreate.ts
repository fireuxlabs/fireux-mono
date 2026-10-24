import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  requirePortfolioWrite,
  usePortfolioScope,
  usePortfolioChildPath,
} from '../usePortfolioScope'
import {
  UnitStorage,
  type Unit,
  type UnitCreateInput,
} from '../../../property/models/unit.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useUnitCreate(
  runtimePortfolio: ReturnType<typeof usePortfolioScope>
) {
  const { createDocument: create } = useFirestoreCreate()
  const collectionPath = usePortfolioChildPath(
    runtimePortfolio,
    UnitStorage.collection
  )

  async function createUnit(input: UnitCreateInput): Promise<string> {
    const portfolioId = requirePortfolioWrite(
      runtimePortfolio,
      'fireux-properties'
    )

    const propertyId = normalizeString(input.property_id)
    const label = normalizeString(input.label)
    if (!propertyId) {
      throw new Error('[fireux-properties] property_id is required.')
    }
    if (!label) {
      throw new Error('[fireux-properties] unit label is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime unit path is required.')
    }

    const payload: Partial<Unit> = {
      ...input,
      portfolio_id: portfolioId,
      property_id: propertyId,
      label,
    }

    return create(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createUnit,
  }
}
