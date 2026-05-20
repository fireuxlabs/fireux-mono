import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import type { Company, CompanyUpdateInput } from 'fireux-companies/runtime/models/company.model'

const COLLECTION_PATH = 'companies'

export function useCompanyUpdate() {
  const base = useDocumentUpdateBase<Company>(COLLECTION_PATH, { resolvePath: false })

  const updateCompany = async (companyId: string, patch: CompanyUpdateInput) => {
    await base.updateById(companyId, { ...patch })
  }

  return { updateCompany }
}
