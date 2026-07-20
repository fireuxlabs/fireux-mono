// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for compliance creation.
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import {
  ComplianceRecordStorage,
  type ComplianceRecord,
  type ComplianceRecordCreateInput,
} from '../../../../../../../models/compliance-record.model'

export function useComplianceRecordCreate(runtimePortfolio = useActivePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ComplianceRecordStorage.collection
  )

  async function createComplianceRecord(
    input: ComplianceRecordCreateInput
  ): Promise<string> {
    const portfolioId = requirePortfolioConsoleWrite(
      runtimePortfolio,
      'fireux-compliance'
    )

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
