import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import { CompanyStorage, type Company, type CompanyUpdateInput } from 'fireux-companies/runtime/models/company.model'

export function useCompanyUpdate() {
  const base = useDocumentUpdateBase<Company>(CompanyStorage.collection, { resolvePath: false })

  const updateCompany = async (companyId: string, patch: CompanyUpdateInput) => {
    await base.updateById(companyId, { ...patch })
  }

  return { updateCompany }
}
