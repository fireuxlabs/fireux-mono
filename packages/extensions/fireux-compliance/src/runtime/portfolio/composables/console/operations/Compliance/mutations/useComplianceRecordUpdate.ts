// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for compliance updates.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/portfolio/composables/console/operations/useActivePortfolio'
import {
  ComplianceRecordStorage,
  type ComplianceRecord,
  type ComplianceRecordUpdateInput,
} from '../../../../../models/compliance-record.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useComplianceRecordUpdate(
  runtimePortfolio = useActivePortfolio()
) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  async function updateComplianceRecord(input: {
    complianceRecordId: string
    changes: ComplianceRecordUpdateInput
  }): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-compliance')

    const normalizedComplianceRecordId = normalizeString(
      input.complianceRecordId
    )
    if (!normalizedComplianceRecordId) {
      throw new Error('[fireux-compliance] complianceRecordId is required.')
    }

    if (!collectionPath.value) {
      throw new Error(
        '[fireux-compliance] runtime compliance path is required.'
      )
    }

    await updateDocument<ComplianceRecord>(
      collectionPath.value,
      normalizedComplianceRecordId,
      input.changes
    )
  }

  return {
    updateComplianceRecord,
  }
}
