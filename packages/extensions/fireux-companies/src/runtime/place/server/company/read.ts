import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  type Place,
} from 'fireux-places/runtime/place/models/place.model'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import { CompanyStorage } from '../../models/company.entity.ts'
import { canonicalCompanyRole } from './canonical'

export async function readCompanyPlace(idValue: unknown): Promise<Place> {
  const id = requireFirestoreDocumentId(idValue, 'Company id')
  const db = getRuntimeFirestore()
  const [company, place] = await db.getAll(
    db.collection(CompanyStorage.collection).doc(id),
    db.collection('places').doc(id)
  )
  if (
    !company.exists ||
    !place.exists ||
    !canonicalCompanyRole(id, company.data() || {})
  ) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found.' })
  }
  const normalized = normalizePlace(id, place.data())
  if (!normalized) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found.' })
  }
  return normalized
}
