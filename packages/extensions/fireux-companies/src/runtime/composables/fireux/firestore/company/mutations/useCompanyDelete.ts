import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

const COLLECTION_PATH = 'companies'

export function useCompanyDelete() {
  const { deleteDocument } = useFirestoreManager()

  const deleteCompany = async (companyId: string) => {
    const id = String(companyId ?? '').trim()
    if (!id) {
      throw new Error('[useCompanyDelete] companyId is required')
    }

    await deleteDocument(COLLECTION_PATH, id)
  }

  return { deleteCompany }
}
