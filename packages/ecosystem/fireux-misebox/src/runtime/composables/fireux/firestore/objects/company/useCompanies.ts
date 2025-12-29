import { computed } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import type { Company } from '../../../../../models/objects/company.model'
import {
  useCompanyInterface,
  type CompanyCell,
} from './utils/view/useCompanyInterface'

const COLLECTION_PATH = 'companies'

type CompanyFirestoreDoc = Partial<Company> & {
  id?: string
  place_id?: string
  appId?: string | null
}

function mapCompany(
  raw: CompanyFirestoreDoc,
  fallbackId?: string
): Company | null {
  const id = raw.id || raw.place_id || fallbackId
  if (!id) return null

  const resolvedAppId = raw.app_id ?? raw.appId ?? null

  return {
    id,
    name: raw.name ?? 'Untitled company',
    description: raw.description || undefined,
    app_id: resolvedAppId,
  }
}

export function useCompanies() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()
  const { toCell } = useCompanyInterface()

  const rawCollection =
    firestoreFetchCollection<CompanyFirestoreDoc>(COLLECTION_PATH)

  const companies = computed<Company[]>(() => {
    const values = rawCollection.value ?? []
    return values
      .map((entry) => mapCompany(entry))
      .filter((entry): entry is Company => entry !== null)
  })

  const companyCells = computed<CompanyCell[]>(() =>
    companies.value.map((company) => toCell(company))
  )

  function useCompanyDoc(id: string) {
    return firestoreFetchDoc<CompanyFirestoreDoc>(COLLECTION_PATH, id)
  }

  function useCompany(id: string) {
    const docRef = useCompanyDoc(id)
    return computed<Company | null>(() => {
      const value = docRef.value
      if (value === undefined || value === null) return null
      return mapCompany(value, id)
    })
  }

  const isLoaded = computed(() => rawCollection.value !== undefined)

  return {
    rawCollection,
    companies,
    companyCells,
    useCompany,
    useCompanyDoc,
    isLoaded,
  }
}
