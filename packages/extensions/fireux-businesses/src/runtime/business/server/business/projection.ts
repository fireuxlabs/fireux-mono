import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type { BusinessDetailResponse } from '../../models/business-collection.model'
import { normalizeBusiness } from '../../utils/normalize-business'
export const projectBusiness = normalizeBusiness
export async function readBusinessDetail(idValue: unknown): Promise<BusinessDetailResponse> {
  const id = requireFirestoreDocumentId(idValue, 'Business id')
  const db = getRuntimeFirestore()
  const root = await db.collection('businesses').doc(id).get()
  const business = root.exists ? normalizeBusiness(id, root.data()) : null
  if (!business) throw createError({ statusCode: 404, statusMessage: 'Business not found.' })
  const placeId = business.place_ids[0]
  const location = placeId ? await db.collection('places').doc(placeId).get() : null
  const place = location?.exists ? normalizePlace(location.id, location.data()) : null
  return { business, place }
}
