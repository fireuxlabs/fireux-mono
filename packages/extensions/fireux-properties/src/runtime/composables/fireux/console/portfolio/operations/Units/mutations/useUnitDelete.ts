import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import { UnitStorage } from '../../../../../../../models/unit.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useUnitDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    UnitStorage.collection
  )

  async function deleteUnit(unitId: string): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-properties')

    const normalizedUnitId = normalizeString(unitId)
    if (!normalizedUnitId) {
      throw new Error('[fireux-properties] unitId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime unit path is required.')
    }

    await deleteDocument(collectionPath.value, normalizedUnitId)
  }

  return {
    deleteUnit,
  }
}
