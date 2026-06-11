import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import {
  ComplianceRecordStorage,
  type ComplianceRecord,
  type ComplianceRecordCreateInput,
} from '../../../../../../../models/compliance-record.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useComplianceRecordCreate(runtimePortfolio = useActivePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  async function createComplianceRecord(
    input: ComplianceRecordCreateInput
  ): Promise<string> {
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-compliance] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-compliance] demo runtime does not allow writes.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-compliance] runtime compliance path is required.')
    }

    const payload: Partial<ComplianceRecord> = {
      ...input,
      portfolio_id: portfolioId,
    }

    return createDocument<Partial<ComplianceRecord>>(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createComplianceRecord,
  }
}
