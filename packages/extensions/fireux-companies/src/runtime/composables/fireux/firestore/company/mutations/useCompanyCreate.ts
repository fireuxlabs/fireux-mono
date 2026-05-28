import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { CompanyStorage, type Company, type CompanyCreateInput } from 'fireux-companies/runtime/models/company.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'

export const CompanyPayload = {
  id: '',
}

export const CompanyStampOptions = {
  creator: false,
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

    await setDocument<Company>(CompanyStorage.collection, payload.id, payload as Company, {
      creator: false,
    })

    return payload.id
  }

  return { createCompany }
}
