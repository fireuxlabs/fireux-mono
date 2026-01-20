import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import type { Company, CompanyCreateInput } from '../../../../../../models/objects/company.model'

export const CompanyPayload = {
  id: '',
  name: '',
  formatted_address: '',
  lat: 0,
  lng: 0,
  place_image: '',
  website: '',
  search_term: '',
  search_term_normalized: '',
}

export const CompanyStampOptions = {
  creator: true,
} as const

export function useCompanyCreate() {
  const { setDocument } = useFirestoreCreate()

  async function createCompany(
    input: CompanyCreateInput & { place?: PlaceUpsertInput }
  ): Promise<string> {
    if (!input?.id) {
      throw new Error('Company id is required')
    }

    const { place, ...payload } = input
    void place

    await setDocument<Company>('companies', payload.id, payload as Company, {
      creator: true,
    })

    return payload.id
  }

  return { createCompany }
}
