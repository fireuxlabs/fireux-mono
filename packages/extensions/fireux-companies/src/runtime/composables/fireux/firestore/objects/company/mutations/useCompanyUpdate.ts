import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { CompanyOverlay, CompanyUpdateInput } from '../../../../../../models/objects/company.model'

const COLLECTION_PATH = 'companies'

export function useCompanyUpdate() {
  const { updateDocument } = useFirestoreManager()

  const updateCompany = async (companyId: string, patch: CompanyUpdateInput) => {
    const id = String(companyId ?? '').trim()
    if (!id) throw new Error('[useCompanyUpdate] companyId is required')

    const next: CompanyUpdateInput = { ...patch }
    if (typeof next.website === 'string') next.website = next.website.trim()

    await updateDocument<CompanyOverlay>(COLLECTION_PATH, id, next)
  }

  return { updateCompany }
}
