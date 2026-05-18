import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'

const COLLECTION_PATH = 'companies'

export function useCompanyDelete() {
  const { deleteDocument } = useFirestoreManager()
  const { deleteSeoIndexDoc } = useSeoIndexWrite()

  const deleteCompany = async (companyId: string) => {
    const id = String(companyId ?? '').trim()
    if (!id) {
      throw new Error('[useCompanyDelete] companyId is required')
    }

    await deleteDocument(COLLECTION_PATH, id)
    await deleteSeoIndexDoc('seo_index_companies', id)
  }

  return { deleteCompany }
}
