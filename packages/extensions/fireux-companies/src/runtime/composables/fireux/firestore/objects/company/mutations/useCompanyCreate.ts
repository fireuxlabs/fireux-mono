import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import type { CompanyOverlay, CompanyCreateInput } from '../../../../../../models/objects/company.model'

export const CompanyPayload = {
  id: '',
  website: '',
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

    await setDocument<CompanyOverlay>('companies', payload.id, payload as CompanyOverlay, {
      creator: false,
    })

    return payload.id
  }

  return { createCompany }
}
