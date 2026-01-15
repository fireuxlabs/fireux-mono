import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { Company, CompanyCreateInput } from '../../../../../../models/objects/company.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'

const COLLECTION_PATH = 'companies'

export function useCompanyCreate() {
  const { setDocument } = useFirestoreManager()

  const createCompany = async (
    input: CompanyCreateInput & { place: PlaceUpsertInput }
  ): Promise<string> => {
    const id = String(input?.id ?? '').trim()
    if (!id) throw new Error('[useCompanyCreate] placeId (id) is required')

    const name = String(input?.name ?? '').trim()
    if (!name) throw new Error('[useCompanyCreate] name is required')

    await setDocument<Company>(
      COLLECTION_PATH,
      id,
      {
        id,
        name,
        formatted_address: String(input.formatted_address ?? '').trim(),
        lat: Number(input.lat ?? 0),
        lng: Number(input.lng ?? 0),
        avatar: String(input.avatar ?? '').trim(),
        website: String(input.website ?? '').trim(),
      },
      { raw: false }
    )

    return id
  }

  return { createCompany }
}
