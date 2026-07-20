// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for compliance deletion.
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { ComplianceRecordStorage } from '../../../../../../../models/compliance-record.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useComplianceRecordDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  async function deleteComplianceRecord(
    complianceRecordId: string
  ): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-compliance')

    const normalizedComplianceRecordId = normalizeString(complianceRecordId)
    if (!normalizedComplianceRecordId) {
      throw new Error('[fireux-compliance] complianceRecordId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-compliance] runtime compliance path is required.')
    }

    await deleteDocument(collectionPath.value, normalizedComplianceRecordId)
  }

  return {
    deleteComplianceRecord,
  }
}
