// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require Portfolio operator access for compliance deletion.
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { ComplianceRecordStorage } from '../../../../../models/compliance-record.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useComplianceRecordDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  async function deleteComplianceRecord(
    complianceRecordId: string
  ): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-compliance')

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
