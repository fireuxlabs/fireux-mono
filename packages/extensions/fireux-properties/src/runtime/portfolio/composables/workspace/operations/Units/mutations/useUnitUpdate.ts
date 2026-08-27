import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from '../../../useActivePortfolio'
import {
  UnitStorage,
  type Unit,
  type UnitUpdateInput,
} from '../../../../../../property/models/unit.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useUnitUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    UnitStorage.collection
  )

  async function updateUnit(input: {
    unitId: string
    changes: UnitUpdateInput
  }): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-properties')

    const normalizedUnitId = normalizeString(input.unitId)
    if (!normalizedUnitId) {
      throw new Error('[fireux-properties] unitId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-properties] runtime unit path is required.')
    }

    await updateDocument<Unit>(
      collectionPath.value,
      normalizedUnitId,
      input.changes
    )
  }

  return {
    updateUnit,
  }
}
