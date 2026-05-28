import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { CompanyStorage } from 'fireux-companies/runtime/models/company.model'

export function useCompanyDelete() {
  const { deleteDocument } = useFirestoreManager()

  const deleteCompany = async (companyId: string) => {
    const id = String(companyId ?? '').trim()
    if (!id) {
      throw new Error('[useCompanyDelete] companyId is required')
    }

    await deleteDocument(CompanyStorage.collection, id)
  }

  return { deleteCompany }
}
