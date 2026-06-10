import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/Operations/useActivePortfolio'
import {
  ComplianceRecordStorage,
  type ComplianceRecord,
  type ComplianceRecordUpdateInput,
} from '../../../../../../../models/compliance-record.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useComplianceRecordUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  async function updateComplianceRecord(
    complianceRecordId: string,
    patch: ComplianceRecordUpdateInput
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

    await updateDocument<ComplianceRecord>(
      collectionPath.value,
      normalizedComplianceRecordId,
      patch
    )
  }

  return {
    updateComplianceRecord,
  }
}
