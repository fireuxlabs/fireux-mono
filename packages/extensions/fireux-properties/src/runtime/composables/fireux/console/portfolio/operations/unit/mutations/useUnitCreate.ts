import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import {
  UnitStorage,
  type Unit,
  type UnitCreateInput,
} from '../../../../../../../models/unit.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useUnitCreate(runtimePortfolio = useActivePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    UnitStorage.collection
  )

  async function createUnit(input: UnitCreateInput): Promise<string> {
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-properties] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-properties] demo runtime does not allow writes.')
    }

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

    return createDocument<Partial<Unit>>(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createUnit,
  }
}
