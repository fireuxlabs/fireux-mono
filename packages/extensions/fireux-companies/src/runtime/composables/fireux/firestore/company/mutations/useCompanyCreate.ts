import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import type { Company, CompanyCreateInput } from 'fireux-companies/runtime/models/company.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'

export const CompanyPayload = {
  id: '',
}

export const CompanyStampOptions = {
  creator: false,
} as const

export function useCompanyCreate() {
  const { setDocument } = useFirestoreCreate()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  async function createCompany(
    input: CompanyCreateInput & { place?: PlaceUpsertInput }
  ): Promise<string> {
    if (!input?.id) {
      throw new Error('Company id is required')
    }

    const { place, ...payload } = input
    void place

    await setDocument<Company>('companies', payload.id, payload as Company, {
      creator: false,
    })
    await upsertSeoIndexDoc('seo_index_companies', payload.id, {
      path: `/companies/${payload.id}`,
      isPublic: true,
    })

    return payload.id
  }

  return { createCompany }
}
