import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
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
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-compliance] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-compliance] demo runtime does not allow writes.')
    }

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
