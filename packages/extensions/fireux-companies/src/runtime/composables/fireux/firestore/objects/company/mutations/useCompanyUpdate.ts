import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import type { CompanyOverlay, CompanyUpdateInput } from '../../../../../../models/objects/company.model'

const COLLECTION_PATH = 'companies'

export function useCompanyUpdate() {
  const base = useDocumentUpdateBase<CompanyOverlay>(COLLECTION_PATH, { resolvePath: false })

  const updateCompany = async (companyId: string, patch: CompanyUpdateInput) => {
    const next: CompanyUpdateInput = { ...patch }
    if (typeof next.website === 'string') next.website = base.cleanString(next.website)

    await base.updateById(companyId, next)
  }

  return { updateCompany }
}
