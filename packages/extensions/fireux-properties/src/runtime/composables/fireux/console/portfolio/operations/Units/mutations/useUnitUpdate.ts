import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import {
  UnitStorage,
  type Unit,
  type UnitUpdateInput,
} from '../../../../../../../models/unit.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useUnitUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    UnitStorage.collection
  )

  async function updateUnit(unitId: string, patch: UnitUpdateInput): Promise<void> {
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-properties] portfolio id is required.')
    }

    const normalizedUnitId = normalizeString(unitId)
    if (!normalizedUnitId) {
      throw new Error('[fireux-properties] unitId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime unit path is required.')
    }

    await updateDocument<Unit>(collectionPath.value, normalizedUnitId, patch)
  }

  return {
    updateUnit,
  }
}
